package main

import (
	"flag"
	"log"
	"net/http"
	"os"

	"Keyshard/internal/utils"
	"Keyshard/pkg/api"
	"Keyshard/pkg/shard"
	"Keyshard/pkg/store"
)

func main() {
	// Read config file path
	configPath := flag.String("config", "", "Path to node config YAML")
	flag.Parse()

	if *configPath == "" {
		log.Fatal("config file path is required")
	}

	// Load YAML config
	cfg, err := utils.LoadConfig(*configPath)
	if err != nil {
		log.Fatal("failed to load config:", err)
	}

	// Override with Docker environment variables if present
	if envNodeID := os.Getenv("NODE_ID"); envNodeID != "" {
		cfg.NodeID = envNodeID
	}
	if envNodeAddr := os.Getenv("NODE_ADDR"); envNodeAddr != "" {
		cfg.HTTPAddr = envNodeAddr
	}

	// Build shard members from peers
	var members []shard.Member
	for _, peer := range cfg.Peers {
		members = append(members, shard.Member{
			Name:    peer.ID,
			Address: peer.Address,
		})
	}

	// Create consistent hash ring
	ring := shard.NewRing(members)

	// Open local BoltDB
	db, closeFn, err := store.NewDatabase(cfg.DBLocation)
	if err != nil {
		log.Fatal(err)
	}
	defer closeFn()

	// Create API server
	server := api.NewServer(db, ring, cfg.NodeID)

	// Routes
	http.HandleFunc("/get", server.GetHandler)
	http.HandleFunc("/set", server.SetHandler)
	http.HandleFunc("/delete", server.DeleteHandler)
	http.HandleFunc("/update", server.UpdateHandler)
	http.HandleFunc("/user", server.CreateUserHandler)
	http.HandleFunc("/user/get", server.GetUserHandler)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Keyshard server is running"))
	})
	http.HandleFunc("/replicate", server.ReplicateHandler)
	http.HandleFunc("/simplereplicate", server.SimpleReplicateHandler)
	http.HandleFunc("/simplereplicate/delete", server.SimpleReplicaDeleteHandler)

	log.Printf("Node %s listening on %s", cfg.NodeID, cfg.HTTPAddr)
	log.Fatal(http.ListenAndServe(cfg.HTTPAddr, nil))
}
