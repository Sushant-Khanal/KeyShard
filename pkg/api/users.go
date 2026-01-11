package api

import (
	"Keyshard/pkg/models"
	"Keyshard/pkg/store"
	"encoding/json"
	"net/http"
	"time"
)

// CreateUserHandler handles the creation of a new user.
func (s *Server) CreateUserHandler(w http.ResponseWriter, r *http.Request) {
	var user models.User

	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	user.CreatedAt = time.Now()

	data, err := json.Marshal(user)
	if err != nil {
		http.Error(w, "serialization failed", http.StatusInternalServerError)
		return
	}

	key := "user:" + user.UserHash

	err = s.db.Put(&store.Entry{
		Key:   key,
		Value: data,
	})

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"status": "user stored",
		"node":   s.nodeID,
	})
}

func (s *Server) GetUserHandler(w http.ResponseWriter, r *http.Request) {
	userHash := r.URL.Query().Get("userHash")
	key := "user:" + userHash

	entry, err := s.db.Get(key)
	if err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(entry.Value)
}
