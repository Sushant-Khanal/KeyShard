package shard

import (
	"fmt"

	"github.com/buraksezer/consistent"
	"github.com/cespare/xxhash/v2"
)

// Member defines a shard node that participates in the ring
type Member struct {
	Name    string
	Address string
}

func (m Member) String() string {
	return m.Name
}

// Ring wraps the consistent hashing implementation
type Ring struct {
	c       *consistent.Consistent
	members []Member // cache of members
}

// NewRing creates a new consistent hash ring with given members
func NewRing(nodes []Member) *Ring {
	cfg := consistent.Config{
		PartitionCount:    271,  // number of virtual nodes
		ReplicationFactor: 20,   // redundancy factor
		Load:              1.25, // balancing factor
		Hasher:            hasher{},
	}

	members := make([]consistent.Member, len(nodes))
	for i, n := range nodes {
		members[i] = n
	}

	c := consistent.New(members, cfg)
	return &Ring{c: c,
		members: nodes, // stores original members separately
	}
}

// Helper to get all nodes
func (r *Ring) AllMembers() []Member {
	return r.members
}

// Find which node owns a key
func (r *Ring) Lookup(key string) (*Member, error) {
	m := r.c.LocateKey([]byte(key))
	mem, ok := m.(Member)
	if !ok {
		return nil, fmt.Errorf("invalid member type")
	}
	return &mem, nil
}

// AddNode dynamically adds a new shard node
func (r *Ring) AddNode(m Member) {
	r.c.Add(m)
}

// RemoveNode removes a shard node
func (r *Ring) RemoveNode(name string) {
	r.c.Remove(name)
}

// NextNode returns the next node in a circular manner for failover
func (r *Ring) NextNode(current *Member) *Member {
	for i, m := range r.members {
		if m.Name == current.Name {
			// return next node in a circular ring
			return &r.members[(i+1)%len(r.members)]
		}
	}
	// fallback: return first node if current not found
	if len(r.members) > 0 {
		return &r.members[0]
	}
	return nil
}

// hasher defines a fast 64-bit xxhash hasher
type hasher struct{}

func (h hasher) Sum64(data []byte) uint64 {
	return xxhash.Sum64(data)
}
