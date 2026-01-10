package api

import (
	"fmt"
	"io"
	"net/http"

	"Keyshard/pkg/shard"
	"Keyshard/pkg/store"
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

	owner, err := s.ring.Lookup(key)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if owner.Name == s.nodeID {
		err := localHandler()
		fmt.Fprintf(w, "Node=%s Error=%v", s.nodeID, err)
		return
	}

	target := fmt.Sprintf("http://%s%s?%s",
		owner.Address,
		r.URL.Path,
		r.URL.RawQuery,
	)

	resp, err := http.Get(target)
	if err != nil {
		http.Error(w, "Forward failed: "+err.Error(), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	w.WriteHeader(resp.StatusCode)
	w.Write(body)
}

/* ------------------ handlers ------------------ */

func (s *Server) GetHandler(w http.ResponseWriter, r *http.Request) {
	key := r.URL.Query().Get("key")

	s.routeOrHandle(w, r, key, func() error {
		entry, err := s.db.Get(key)
		if err != nil {
			return err
		}
		w.Write(entry.Value)
		return nil
	})
}

func (s *Server) SetHandler(w http.ResponseWriter, r *http.Request) {
	key := r.URL.Query().Get("key")
	value := r.URL.Query().Get("value")

	s.routeOrHandle(w, r, key, func() error {
		return s.db.Put(&store.Entry{
			Key:   key,
			Value: []byte(value),
		})
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
