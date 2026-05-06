# UML Diagrams - KeyShard

This section summarizes the three core UML diagrams used in the KeyShard project.

## 1. Use Case Diagram

![Use Case Diagram](Images/use_case.drawio.png)

The Use Case diagram shows how external actors interact with KeyShard at a functional level. The main actors are User and Admin. Key use cases include sign up, login, vault/key operations, and system monitoring. This diagram defines the project scope from a user-goal perspective and clarifies which features are exposed by the system boundary.

## 2. Sequence Diagram

![Sequence Diagram](Images/sequence.png)

The Sequence diagram shows the time-ordered flow for a typical KeyShard operation, such as authentication and secure data access. It captures message exchange between client/mobile app, backend services, middleware (challenge/signature verification and rate limiting), storage, and distributed node services. This diagram explains execution order, request/response dependency, and where validation and consensus-related steps occur.

## 3. Class Diagram

![Class Diagram](Images/Class Diagram.drawio.png)

The Class diagram presents the static structure of KeyShard. It models core entities such as User and Vault from the backend schema, along with node/store-side data objects used by distributed services. It highlights attributes, operations, and relationships needed for authentication, vault ownership, and persistent key/data handling. This diagram is used as the structural reference for implementation and maintenance.
