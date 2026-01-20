package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"Keyshard/pkg/shard"
	"Keyshard/pkg/store"
)

type Server struct {
	db     store.Store
	ring   *shard.Ring
	nodeID string
}

func NewServer(db store.Store, ring *shard.Ring, nodeID string) *Server {
	return &Server{
		db:     db,
		ring:   ring,
		nodeID: nodeID,
	}
}

const forwardTimeout = 3 * time.Second

/* ===================== HELPERS ===================== */

func readAndRestoreBody(r *http.Request) ([]byte, error) {
	bodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		return nil, err
	}
	r.Body.Close()
	r.Body = io.NopCloser(bytes.NewReader(bodyBytes))
	return bodyBytes, nil
}

/* ===================== ROUTING ===================== */

func (s *Server) routeOrHandle(
	w http.ResponseWriter,
	r *http.Request,
	key string,
	bodyBytes []byte,
	localHandler func() error,
) {
	if key == "" {
		http.Error(w, "key required", http.StatusBadRequest)
		return
	}

	owner, err := s.ring.Lookup(key)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Handle locally
	if owner.Name == s.nodeID {
		if err := localHandler(); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	client := &http.Client{Timeout: forwardTimeout}
	nodes := s.ring.AllMembers()
	tried := map[string]bool{}
	current := owner

	for len(tried) < len(nodes) {
		if tried[current.Name] {
			current = s.ring.NextNode(current)
			continue
		}
		tried[current.Name] = true

		target := fmt.Sprintf(
			"http://%s%s?%s",
			current.Address,
			r.URL.Path,
			r.URL.RawQuery,
		)

		req, err := http.NewRequest(
			r.Method,
			target,
			io.NopCloser(bytes.NewReader(bodyBytes)),
		)
		if err != nil {
			current = s.ring.NextNode(current)
			continue
		}

		req.Header = r.Header.Clone()

		resp, err := client.Do(req)
		if err == nil {
			defer resp.Body.Close()
			body, _ := io.ReadAll(resp.Body)
			w.WriteHeader(resp.StatusCode)
			w.Write(body)
			return
		}

		current = s.ring.NextNode(current)
	}

	http.Error(w, "all nodes unreachable", http.StatusBadGateway)
}

/* ===================== KV HANDLERS ===================== */

func (s *Server) GetHandler(w http.ResponseWriter, r *http.Request) {
	key := r.URL.Query().Get("key")
	if key == "" {
		http.Error(w, "key required", http.StatusBadRequest)
		return
	}

	bodyBytes, _ := readAndRestoreBody(r)

	s.routeOrHandle(w, r, key, bodyBytes, func() error {
		entry, err := s.db.Get(key)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "key not found",
			})
			return nil
		}

		w.Header().Set("Content-Type", "application/json")
		// entry.Value already contains JSON
		w.Write(entry.Value)
		return nil
	})
}

func (s *Server) SetHandler(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Key   string `json:"key"`
		Value string `json:"value"`
	}

	bodyBytes, err := readAndRestoreBody(r)
	if err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	if err := json.Unmarshal(bodyBytes, &payload); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	if payload.Key == "" {
		http.Error(w, "key required", http.StatusBadRequest)
		return
	}

	data, _ := json.Marshal(payload)

	// Lookup primary node for sharding
	primary, err := s.ring.Lookup(payload.Key)
	if err != nil {
		http.Error(w, "failed to lookup shard", http.StatusInternalServerError)
		return
	}

	allnodes := s.ring.AllMembers()
	replicas := []*shard.Member{primary}

	// Get next 2 nodes for replication
	current := primary
	for i := 0; i < 2; i++ {
		current = s.ring.NextNode(current)
		replicas = append(replicas, current)
	}

	// Send data to primary + replicas
	for _, node := range replicas {
		if node.Name == s.nodeID {
			// store locally
			s.db.Put(&store.Entry{Key: payload.Key, Value: data})
		} else {
			// send to other node
			go func(addr string) {
				client := &http.Client{Timeout: 2 * time.Second}
				req, _ := http.NewRequest(http.MethodPost,
					fmt.Sprintf("http://%s/simplereplicate", addr),
					bytes.NewReader(data),
				)
				req.Header.Set("X-Key", payload.Key)
				req.Header.Set("Content-Type", "application/json")
				client.Do(req)
			}(node.Address)
		}
	}
	// Return primary + replica nodes for info
	replicaNames := []string{}
	for _, r := range replicas[1:] { // skip primary
		replicaNames = append(replicaNames, r.Name)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":   "success",
		"primary":  primary.Name,
		"replicas": replicaNames,
		"allNodes": func() []string { // now `allNodes` is actually used
			names := []string{}
			for _, n := range allnodes {
				names = append(names, n.Name)
			}
			return names
		}(),
	})
}

func (s *Server) UpdateHandler(w http.ResponseWriter, r *http.Request) {
	s.SetHandler(w, r)
}

func (s *Server) DeleteHandler(w http.ResponseWriter, r *http.Request) {
	key := r.URL.Query().Get("key")
	if key == "" {
		http.Error(w, "key required", http.StatusBadRequest)
		return
	}

	// Lookup primary
	primary, err := s.ring.Lookup(key)
	if err != nil {
		http.Error(w, "failed to lookup shard", http.StatusInternalServerError)
		return
	}

	// Build replica list (primary + next 2)
	replicas := []*shard.Member{primary}
	current := primary
	for i := 0; i < 2; i++ {
		current = s.ring.NextNode(current)
		replicas = append(replicas, current)
	}

	// Delete from all replicas
	for _, node := range replicas {
		if node.Name == s.nodeID {
			// local delete
			_ = s.db.Delete(key)
		} else {
			go func(addr string) {
				client := &http.Client{Timeout: 2 * time.Second}
				req, _ := http.NewRequest(
					http.MethodDelete,
					fmt.Sprintf("http://%s/simplereplicate/delete", addr),
					nil,
				)
				req.Header.Set("X-Key", key)
				client.Do(req)
			}(node.Address)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":   "deleted",
		"primary":  primary.Name,
		"replicas": []string{replicas[1].Name, replicas[2].Name},
	})
}

func (s *Server) SimpleReplicateHandler(w http.ResponseWriter, r *http.Request) {
	key := r.Header.Get("X-Key")
	if key == "" {
		http.Error(w, "missing key header", http.StatusBadRequest)
		return
	}

	bodyBytes, _ := io.ReadAll(r.Body)
	if err := s.db.Put(&store.Entry{Key: key, Value: bodyBytes}); err != nil {
		http.Error(w, "failed to replicate", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
func (s *Server) SimpleReplicaDeleteHandler(w http.ResponseWriter, r *http.Request) {
	key := r.Header.Get("X-Key")
	if key == "" {
		http.Error(w, "missing key header", http.StatusBadRequest)
		return
	}

	if err := s.db.Delete(key); err != nil {
		// idempotent delete — not an error if missing
		w.WriteHeader(http.StatusOK)
		return
	}

	w.WriteHeader(http.StatusOK)
}
