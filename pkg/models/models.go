package models

import "time"

type User struct {
	Email           string    `json:"email"`
	EncryptedVault  string    `json:"encryptedVault"`
	IV              string    `json:"iv"`
	Tag             string    `json:"tag"`
	Salt            string    `json:"salt"`
	UserHash        string    `json:"userHash"`
	PublicKeyBase64 string    `json:"publicKeyBase64"`
	CreatedAt       time.Time `json:"createdAt"`
}
