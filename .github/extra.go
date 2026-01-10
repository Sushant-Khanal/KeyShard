package main

import (
	//"flag"
	"log"
	"net/http"

	//"os"
	"Keyshard/internal/utils"
	"Keyshard/pkg/api"
	"Keyshard/pkg/store"
)

func main() {
	// Load YAML config
	config, err := utils.LoadConfig("cmd/keyshard-node/config.yaml")
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	} // error handling for config loading

	if config.DBLocation == "" {
		log.Fatal("db_location is required in config.yaml")
	} // error handling for db_location

	if config.TLSCert == "" || config.TLSKey == "" {
		log.Fatal("TLS cert and key must be provided in config.yaml")
	} // error handling for TLS cert and key

	// Initialize database using a custom function
	database, closeFunc, err := store.NewDatabase(config.DBLocation)
	if err != nil {
		log.Fatalf("NewDatabase(%q): %v", config.DBLocation, err)
	}
	defer closeFunc()
	// the above function a database object , a close() to close db properly or an error

	// CREATE A NEW SERVER INSTANCE USING CONSTRUCTOR
	srv := api.NewServer(database)
	//HTTPS requests to handle process like get for fetching data,set for writing in database and so on

	http.HandleFunc("/get", srv.GetHandler)
	http.HandleFunc("/set", srv.SetHandler)
	http.HandleFunc("/delete", srv.DeleteHandler)
	http.HandleFunc("/list", srv.ListHandler)
	// http.HandleFunc("/health", srv.HealthHandler)
	http.HandleFunc("/update", srv.UpdateHandler)
	// http.HandleFunc("/login", srv.LoginHandler)
	// http.HandleFunc("/logout", srv.LogoutHandler)

	// Register a default homepage
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Welcome to the KeyShard API.\nAvailable endpoints:\n - /get\n - /set\n"))
	})
	//indicate server starting message
	log.Printf("Server listening on %s...\n", config.HTTPAddr)
	//starts a https server

	//log.Fatal(http.ListenAndServeTLS(*httpAddr, *certFile, *keyFile, nil))

	log.Fatal(http.ListenAndServe(config.HTTPAddr, nil))
}
