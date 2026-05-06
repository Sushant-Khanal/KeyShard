# System Design Artifacts

## Description

This document presents three core design diagrams for KeyShard: Process Model, System Block Diagram, and Flowchart. Together, they describe how the system is structured, how it executes requests, and how control moves across components during secure operations.

---

## 1. Process Model

![Process Model](Images/model.png)

### Explanation

The Process Model represents the incremental development lifecycle used to build KeyShard. Instead of runtime request steps, it documents project implementation phases executed in planned increments.

The development phases are organized as increment cycles, with each phase taking 2 increments:

- **Increments 1-2: Client-Side Designing**: UI/UX structure, user interaction flow, and frontend screens for core features.
- **Increments 3-4: Encryption Module Development**: Cryptographic workflows, secure key handling, and protection logic integration.
- **Increments 5-6: Database Design**: Data modeling, schema definition, and persistence setup for users, vaults, and related records.
- **Increments 7-8: Distributed System Integration**: Node-level architecture, distributed storage/coordination, and multi-node operation setup.
- **Increments 9-10: AI/ML Integration**: Model integration for intelligent analysis/recommendation features and final pipeline linkage.

This phased model explains how the project was delivered progressively from foundational client design to advanced AI/ML capabilities.

---

## 2. System Block Diagram

![System Block Diagram](Images/system_block_diagram.png)

### Explanation

The System Block Diagram provides the high-level architecture of KeyShard by dividing the platform into major functional blocks and their interfaces. It highlights:

- **Client Layer**: Mobile/web entry points for user operations.
- **Application Layer**: API routes and backend services handling authentication, vault, and key workflows.
- **Security Middleware Layer**: Challenge, signature verification, and request-control mechanisms.
- **Data Layer**: User/vault persistence and node-level storage structures.
- **Distributed Layer**: Multi-node services and coordination logic for reliable data handling.

This diagram is used to communicate module boundaries, integration paths, and separation of concerns across the full project architecture.

---

## 3. Flowchart

![Flowchart](Images/flowchart.drawio.png)

### Explanation

The Flowchart represents the control flow of KeyShard operations using sequential steps and decision nodes. It shows how execution branches based on validation and processing outcomes.

Typical flow elements include:

- request received
- validate/authenticate
- pass/fail decision branch
- secure operation execution
- data store interaction
- final response and logging

This diagram helps developers and reviewers quickly trace runtime behavior, identify failure paths, and understand transition logic between operational steps.
