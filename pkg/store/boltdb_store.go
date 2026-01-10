package store

import (
	"fmt"
	"os"

	bolt "go.etcd.io/bbolt"
)

var defaultBucket = []byte("default")

// Database is an open bolt database.
type Database struct {
	db *bolt.DB
}

// Ensure Database implements store.Store
var _ Store = (*Database)(nil)

// NewDatabase returns an instance of a database that we can work with.
func NewDatabase(dbPath string) (db *Database, closeFunc func() error, err error) {
	boltDb, err := bolt.Open(dbPath, 0600, nil)
	if err != nil {
		return nil, nil, err
	}

	db = &Database{db: boltDb}
	closeFunc = boltDb.Close

	if err := db.createDefaultBucket(); err != nil {
		closeFunc()
		return nil, nil, fmt.Errorf("creating default bucket: %w", err)
	}

	return db, closeFunc, nil
}

func (d *Database) createDefaultBucket() error {
	return d.db.Update(func(tx *bolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists(defaultBucket)
		return err
	})
}

// ----------------- BoltDB methods (unchanged) -----------------

func (d *Database) SetKey(key string, value []byte) error {
	return d.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket(defaultBucket)
		return b.Put([]byte(key), value)
	})
}

func (d *Database) GetKey(key string) ([]byte, error) {
	var result []byte
	err := d.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket(defaultBucket)
		result = b.Get([]byte(key))
		return nil
	})

	if err == nil {
		return result, nil
	}
	return nil, err
}

func (d *Database) DeleteKey(key string) error {
	return d.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket(defaultBucket)
		if b == nil {
			return fmt.Errorf("bucket %q not found", defaultBucket)
		}
		return b.Delete([]byte(key))
	})
}

func (d *Database) UpdateKey(key string, value []byte) error {
	return d.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket(defaultBucket)
		if b == nil {
			return fmt.Errorf("bucket %q not found", defaultBucket)
		}

		if b.Get([]byte(key)) == nil {
			return fmt.Errorf("key %q does not exist", key)
		}

		return b.Put([]byte(key), value)
	})
}

func EnsureDir(path string) error {
	return os.MkdirAll(path, 0755)
}

func (d *Database) ListKeys() ([]string, error) {
	var keys []string

	err := d.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket(defaultBucket)
		if b == nil {
			return fmt.Errorf("bucket %q not found", defaultBucket)
		}

		return b.ForEach(func(k, v []byte) error {
			keys = append(keys, string(k))
			return nil
		})
	})

	return keys, err
}

// ----------------- Wrapper to implement store.Store -----------------

func (d *Database) Put(e *Entry) error {
	if e == nil || e.Key == "" {
		return fmt.Errorf("invalid entry")
	}
	return d.SetKey(e.Key, e.Value)
}

func (d *Database) Get(key string) (*Entry, error) {
	v, err := d.GetKey(key)
	if err != nil {
		return nil, err
	}
	if v == nil {
		return nil, fmt.Errorf("key not found")
	}
	return &Entry{
		Key:   key,
		Value: v,
	}, nil
}

func (d *Database) Delete(key string) error {
	return d.DeleteKey(key)
}
