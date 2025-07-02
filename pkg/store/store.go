package store

// Entry is one vault record
type Entry struct {
	Key      string            // e.g. "user123:entry456"
	Value    []byte            // encrypted payload
	Metadata map[string]string // optional JSON metadata
}

// Store represents the KV interface
type Store interface {
	Put(e *Entry) error
	Get(key string) (*Entry, error)
	Delete(key string) error
}
