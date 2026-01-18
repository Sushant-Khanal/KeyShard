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
	entry, err := s.db.Get(key)

	w.Header().Set("Content-Type", "application/json")

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "key not found"})
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
		json.NewEncoder(w).Encode(map[string]string{"status": "error"})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"status": "success",
		"node":   s.nodeID,
	})
}

func (s *Server) UpdateHandler(w http.ResponseWriter, r *http.Request) {
	s.SetHandler(w, r)
}

func (s *Server) DeleteHandler(w http.ResponseWriter, r *http.Request) {
	key := r.URL.Query().Get("key")

	bodyBytes, _ := readAndRestoreBody(r)

	s.routeOrHandle(w, r, key, bodyBytes, func() error {
		return s.db.Delete(key)
	})
}
