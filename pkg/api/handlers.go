package api

import (
	"Keyshard/pkg/shard"
	"Keyshard/pkg/store"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type Server struct {
	db     store.Store // 🔥 use interface, not concrete Database
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

// Timeout for forwarding requests
const forwardTimeout = 3 * time.Second

/* ------------------ helpers ------------------ */

func (s *Server) routeOrHandle(
	w http.ResponseWriter,
	r *http.Request,
	key string,
	localHandler func() error,
) {
	if key == "" {
		http.Error(w, "key required", http.StatusBadRequest)
		return
	}

	// Lookup owner of the key
	owner, err := s.ring.Lookup(key)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// If current node owns the key, handle locally
	if owner.Name == s.nodeID {
		err := localHandler()
		fmt.Fprintf(w, "Node=%s Error=%v", s.nodeID, err)
		return
	}

	// Forward with failover
	nodes := s.ring.AllMembers() // all nodes in the ring
	tried := map[string]bool{}
	current := owner

	client := &http.Client{
		Timeout: forwardTimeout,
	}

	for len(tried) < len(nodes) {
		if tried[current.Name] {
			current = s.ring.NextNode(current)
			continue
		}

		tried[current.Name] = true

		// build request
		target := fmt.Sprintf("http://%s%s?%s", current.Address, r.URL.Path, r.URL.RawQuery)
		req, err := http.NewRequest(r.Method, target, r.Body)
		if err != nil {
			current = s.ring.NextNode(current)
			continue
		}
		req.Header = r.Header

		resp, err := client.Do(req)
		if err == nil {
			defer resp.Body.Close()
			body, _ := io.ReadAll(resp.Body)
			w.WriteHeader(resp.StatusCode)
			w.Write(body)
			return
		}

		// Node down → try next
		current = s.ring.NextNode(current)
	}

	// If we reach here, truly all nodes failed
	http.Error(w, "All nodes unreachable for key "+key, http.StatusBadGateway)
}

/* ------------------ handlers ------------------ */

func (s *Server) GetHandler(w http.ResponseWriter, r *http.Request) {
	key := r.URL.Query().Get("key")

	entry, err := s.db.Get(key)

	w.Header().Set("Content-Type", "application/json")

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "key not found",
		})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"key":   key,
		"value": string(entry.Value),
	})
}

func (s *Server) SetHandler(w http.ResponseWriter, r *http.Request) {
	key := r.URL.Query().Get("key")
	value := r.URL.Query().Get("value")

	err := s.db.Put(&store.Entry{
		Key:   key,
		Value: []byte(value),
	})

	w.Header().Set("Content-Type", "application/json")

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"status": "error",
			"error":  err.Error(),
		})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"status": "success",
		"node":   s.nodeID,
	})
}

func (s *Server) UpdateHandler(w http.ResponseWriter, r *http.Request) {
	// Update == Put (KV semantics)
	s.SetHandler(w, r)
}

func (s *Server) DeleteHandler(w http.ResponseWriter, r *http.Request) {
	key := r.URL.Query().Get("key")

	s.routeOrHandle(w, r, key, func() error {
		return s.db.Delete(key)
	})
}
