# KeyShard Privacy Policy

**Last Updated: [DATE]**

## Introduction

KeyShard ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our password manager application.

## Zero-Knowledge Architecture

KeyShard is built with a **zero-knowledge architecture**, which means:

- Your master password **never leaves your device**
- Your passwords are encrypted **on your device** before being sent to our servers
- We **cannot** access, read, or decrypt your stored passwords
- Only you can unlock your vault with your master password

## Information We Collect

### Information You Provide
- **Email Address**: Used for account identification and recovery purposes
- **Encrypted Vault Data**: Your passwords are encrypted on your device using AES-256-GCM encryption before being stored on our servers

### Information We Do Not Collect
- Your master password
- Your decrypted passwords
- Your browsing history
- Your location data

### Automatically Collected Information
- **IP Address**: Temporarily used for rate limiting and security purposes
- **Device Information**: Basic device identifiers for app functionality

## How We Use Your Information

We use the collected information to:
- Provide and maintain the KeyShard service
- Store your encrypted vault data securely
- Implement security measures (rate limiting, challenge-response authentication)
- Improve our service

## Data Security

We implement industry-standard security measures:
- **Argon2id**: Password-based key derivation
- **AES-256-GCM**: Authenticated encryption for vault data
- **Ed25519**: Digital signatures for authentication
- **TLS/HTTPS**: All data transmitted is encrypted in transit
- **Rate Limiting**: Protection against brute-force attacks

## Data Storage

Your encrypted data is stored on secure servers. Because of our zero-knowledge design, even if our servers were compromised, your passwords would remain encrypted and unreadable.

## Data Retention

- Your encrypted vault data is stored as long as your account is active
- You can delete your account and all associated data at any time
- We do not retain your data after account deletion

## Third-Party Services

We may use third-party services for:
- Cloud infrastructure (hosting)
- Database services (MongoDB)
- Caching services (Redis)

These services do not have access to your decrypted passwords.

## Your Rights

You have the right to:
- Access your data
- Delete your account and data
- Export your data (encrypted vault)

## Children's Privacy

KeyShard is not intended for children under 13 years of age. We do not knowingly collect personal information from children.

## Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.

## Contact Us

If you have questions about this Privacy Policy, please contact us at:
- Email: [YOUR EMAIL]
- GitHub: [YOUR GITHUB REPO]

---

## Data Safety Questionnaire (For Google Play)

When publishing to Google Play, you'll need to answer the Data Safety questionnaire. Here's what to report:

### Data Collected
| Data Type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| Email address | Yes | No | Account management |
| Encrypted passwords | Yes | No | App functionality |
| IP address | Yes (temporarily) | No | Security/fraud prevention |

### Security Practices
- Data is encrypted in transit (HTTPS)
- Data is encrypted at rest (AES-256-GCM)
- Users can request data deletion
- Zero-knowledge architecture - we cannot read user passwords
