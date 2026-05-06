# Data Flow Diagram (DFD)

## Description

A Data Flow Diagram (DFD) is a visual representation of how data moves through a system. It shows the flow of information between different processes, data stores, and external entities. The DFD helps in understanding the system architecture, identifying data dependencies, and ensuring all data transformations are properly documented. In the context of KeyShard, the DFD illustrates how encryption keys, user data, and vault information flow through the various components of the system including the blockchain nodes, backend services, and storage layers.

---

## DFD Level 0 - System Context Diagram

![DFD Level 0](Images/DFD_0.png)

### Explanation

DFD Level 0 provides a high-level overview of the entire KeyShard system as a single process. This context diagram shows:

- **External Entities**: Users, administrators, and external systems that interact with the KeyShard platform
- **Main System Process**: The complete KeyShard application as a unified black box
- **Data Flows**: The primary data inputs and outputs between external entities and the system
- **Data Stores**: Key storage repositories accessed by the system (e.g., User Database, Vault Storage)

This level gives stakeholders a bird's-eye view of what the system does and how it interfaces with the outside world, without delving into internal implementation details.

---

## DFD Level 1 - System Decomposition

![DFD Level 1](Images/DFD_1.png)

### Explanation

DFD Level 1 breaks down the main system process into major subsystems and components:

- **Key Components**: Displays the major functional areas such as:
  - User Management & Authentication
  - Vault Management & Operations
  - Blockchain Consensus Layer (Raft-based distributed consensus)
  - Encryption/Decryption Engine
  - Audit Logging & Monitoring

- **Data Flows**: Shows how data moves between these components:
  - User credentials flow to authentication services
  - Encrypted keys flow to vault storage
  - Transactions flow through blockchain nodes for consensus
  - Audit events flow to logging services

- **Data Stores**: Illustrates persistent storage points:
  - User database
  - Encrypted vault storage
  - Blockchain ledger (across distributed nodes)
  - Audit logs

This level of detail helps developers understand the main building blocks of the system and how they interact with each other.
