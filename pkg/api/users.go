package api

import (
	"Keyshard/pkg/models"
	"Keyshard/pkg/store"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

/*
	func (s *Server) CreateUserHandler(w http.ResponseWriter, r *http.Request) {
		if !strings.HasPrefix(r.Header.Get("Content-Type"), "application/json") {
			http.Error(w, "Content-Type must be application/json", http.StatusUnsupportedMediaType)
			return
		}

		bodyBytes, err := readAndRestoreBody(r)
		if err != nil || len(bodyBytes) == 0 {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}

		var user models.User
		decoder := json.NewDecoder(bytes.NewReader(bodyBytes))
		decoder.DisallowUnknownFields()

		if err := decoder.Decode(&user); err != nil || decoder.More() {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}

		if user.Email == "" || user.UserHash == "" || user.EncryptedVault == "" {
			http.Error(w, "missing required fields", http.StatusBadRequest)
			return
		}

		user.CreatedAt = time.Now()
		data, _ := json.Marshal(user)

		// Email is now the primary key for sharding
		keyEmail := "user:" + user.Email

		// Store the user object on the node that owns this email
		s.routeOrHandle(w, r, keyEmail, bodyBytes, func() error {
			fmt.Println("[INFO] Storing user key:", keyEmail, "on node:", s.nodeID)
			return s.db.Put(&store.Entry{Key: keyEmail, Value: data})
		})
	}

	func (s *Server) GetUserHandler(w http.ResponseWriter, r *http.Request) {
		email := r.URL.Query().Get("email")
		if email == "" {
			http.Error(w, "email is required", http.StatusBadRequest)
			return
		}

		keyEmail := "user:" + email
		bodyBytes := []byte{}

		s.routeOrHandle(w, r, keyEmail, bodyBytes, func() error {
			entry, err := s.db.Get(keyEmail)
			if err != nil {
				return fmt.Errorf("user not found")
			}
			w.Header().Set("Content-Type", "application/json")
			w.Write(entry.Value)
			return nil
		})
	}
*/
func (s *Server) CreateUserHandler(w http.ResponseWriter, r *http.Request) {
	if !strings.HasPrefix(r.Header.Get("Content-Type"), "application/json") {
		http.Error(w, "Content-Type must be application/json", http.StatusUnsupportedMediaType)
		return
	}

	bodyBytes, err := readAndRestoreBody(r)
	if err != nil || len(bodyBytes) == 0 {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	var user models.User
	decoder := json.NewDecoder(bytes.NewReader(bodyBytes))
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&user); err != nil || decoder.More() {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	if user.Email == "" || user.UserHash == "" || user.EncryptedVault == "" {
		http.Error(w, "missing required fields", http.StatusBadRequest)
		return
	}

	user.CreatedAt = time.Now()
	data, _ := json.Marshal(user)

	// Store both keys locally
	if err := s.db.Put(&store.Entry{Key: "user:" + user.UserHash, Value: data}); err != nil {
		http.Error(w, "failed to store userHash key", http.StatusInternalServerError)
		return
	}

	if err := s.db.Put(&store.Entry{Key: "email:" + user.Email, Value: data}); err != nil {
		http.Error(w, "failed to store email key", http.StatusInternalServerError)
		return
	}
	// Replicate to other nodes
	nodes := s.ring.AllMembers()
	for _, node := range nodes {
		// Skip self
		if node.Name == s.nodeID {
			continue
		}

		go func(nodeAddr string) {
			client := &http.Client{Timeout: 2 * time.Second}

			// Replicate userHash key
			req1, _ := http.NewRequest(
				http.MethodPost,
				fmt.Sprintf("http://%s/replicate", nodeAddr),
				bytes.NewReader(data),
			)
			req1.Header.Set("X-Key", "user:"+user.UserHash)
			req1.Header.Set("Content-Type", "application/json")
			client.Do(req1)

			// Replicate email key
			req2, _ := http.NewRequest(
				http.MethodPost,
				fmt.Sprintf("http://%s/replicate", nodeAddr),
				bytes.NewReader(data),
			)
			req2.Header.Set("X-Key", "email:"+user.Email)
			req2.Header.Set("Content-Type", "application/json")
			client.Do(req2)
		}(node.Address)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "success",
	})
}
func (s *Server) GetUserHandler(w http.ResponseWriter, r *http.Request) {
	userHash := r.URL.Query().Get("userHash")
	email := r.URL.Query().Get("email")

	var key string
	if userHash != "" {
		key = "user:" + userHash
	} else if email != "" {
		key = "email:" + email
	} else {
		http.Error(w, "userHash or email required", http.StatusBadRequest)
		return
	}

	entry, err := s.db.Get(key)
	if err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(entry.Value)
}

func (s *Server) ReplicateHandler(w http.ResponseWriter, r *http.Request) {
	key := r.Header.Get("X-Key")
	if key == "" {
		http.Error(w, "missing key header", http.StatusBadRequest)
		return
	}

	bodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	if err := s.db.Put(&store.Entry{Key: key, Value: bodyBytes}); err != nil {
		http.Error(w, "failed to replicate", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
