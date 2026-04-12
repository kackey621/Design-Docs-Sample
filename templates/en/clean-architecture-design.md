# Clean Architecture Design Document

| Field | Value |
|-------|-------|
| **Module/Service Name** | [Module or service name] |
| **Author** | [Author name] |
| **Date** | [YYYY-MM-DD] |
| **Status** | [Draft / In Review / Approved] |
| **Version** | [1.0] |

---

## 1. Overview

### 1.1 Purpose
[What does this module/service do? Why does it exist?]

### 1.2 Business Context
[Business problem being solved. User stories or product requirements.]

### 1.3 Architecture Principles
This document follows **Clean Architecture** (Robert C. Martin) principles:
- **Independence of frameworks**: Business logic does not depend on frameworks
- **Testability**: Business rules can be tested without UI, database, or external services
- **Independence of UI**: The UI can change without affecting business rules
- **Independence of database**: Business rules are not bound to a specific database
- **Independence of external agencies**: Business rules do not depend on external systems

---

## 2. Layer Architecture

### 2.1 Architecture Diagram
[Insert concentric circles diagram showing the four layers]

```
┌─────────────────────────────────────────────┐
│  Frameworks & Drivers (Infrastructure)       │
│  ┌─────────────────────────────────────────┐ │
│  │  Interface Adapters                      │ │
│  │  ┌─────────────────────────────────────┐ │ │
│  │  │  Use Cases (Application)             │ │ │
│  │  │  ┌─────────────────────────────────┐ │ │ │
│  │  │  │  Entities (Domain)               │ │ │ │
│  │  │  └─────────────────────────────────┘ │ │ │
│  │  └─────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 2.2 Dependency Rule
> Source code dependencies must point **inward only**. Nothing in an inner circle can know about anything in an outer circle.

---

## 3. Entities Layer (Domain)

### 3.1 Domain Models

| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| [Entity name] | [What it represents] | [Key fields] |

### 3.2 Value Objects

| Value Object | Description | Validation Rules |
|-------------|-------------|-----------------|
| [Value object name] | [Purpose] | [Constraints] |

### 3.3 Domain Rules / Invariants
[List business rules that entities must always satisfy.]

- [Rule 1: Description]
- [Rule 2: Description]

### 3.4 Domain Events

| Event | Trigger | Payload |
|-------|---------|---------|
| [Event name] | [When it occurs] | [Key data] |

### 3.5 Entity Definition
```
[Pseudocode or language-specific class definition]
```

---

## 4. Use Cases Layer (Application)

### 4.1 Use Case Inventory

| Use Case | Input | Output | Description |
|----------|-------|--------|-------------|
| [Use case name] | [Input DTO] | [Output DTO] | [What it does] |

### 4.2 Use Case Detail

#### [Use Case Name]
- **Actor**: [Who triggers this]
- **Preconditions**: [What must be true before execution]
- **Flow**:
  1. [Step 1]
  2. [Step 2]
  3. [Step 3]
- **Postconditions**: [What is true after execution]
- **Error Cases**:
  - [Error case 1 → handling]
  - [Error case 2 → handling]

### 4.3 Input/Output DTOs
```
[DTO definitions — request and response data structures]
```

### 4.4 Repository Interfaces (Ports)
```
[Interface definitions for data access — these are defined in this layer but implemented in the outer layer]
```

### 4.5 External Service Interfaces (Ports)
```
[Interface definitions for external service calls]
```

---

## 5. Interface Adapters Layer

### 5.1 Controllers / Handlers

| Controller | Route/Trigger | Use Case |
|-----------|--------------|----------|
| [Controller name] | [HTTP route or event] | [Which use case it invokes] |

### 5.2 Presenters / Response Mappers
[How domain objects are transformed into API responses or view models.]

### 5.3 Repository Implementations (Adapters)

| Repository Interface | Implementation | Data Store |
|---------------------|---------------|-----------|
| [Interface name] | [Implementation class] | [DB/Cache/etc.] |

### 5.4 External Service Adapters

| Service Interface | Implementation | External System |
|------------------|---------------|----------------|
| [Interface name] | [Adapter class] | [Third-party API/Service] |

### 5.5 Mappers
[How data is mapped between layers: Domain ↔ DTO ↔ Persistence Model]

---

## 6. Frameworks & Drivers Layer (Infrastructure)

### 6.1 Web Framework
[Framework choice and configuration: Express, Gin, Spring Boot, etc.]

### 6.2 Database
[Database technology, connection management, ORM/query builder.]

### 6.3 Message Broker
[Event bus, message queue configuration.]

### 6.4 External Libraries & SDKs

| Library | Purpose | Layer |
|---------|---------|-------|
| [Library name] | [What it's used for] | [Which layer uses it] |

### 6.5 Dependency Injection
[DI framework/container and wiring strategy.]

---

## 7. Directory Structure

```
src/
├── domain/                    # Entities Layer
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── errors/
├── application/               # Use Cases Layer
│   ├── use-cases/
│   ├── dtos/
│   ├── ports/                 # Repository & service interfaces
│   └── errors/
├── adapters/                  # Interface Adapters Layer
│   ├── controllers/
│   ├── presenters/
│   ├── repositories/          # Adapter implementations
│   ├── services/              # External service adapters
│   └── mappers/
└── infrastructure/            # Frameworks & Drivers Layer
    ├── config/
    ├── database/
    ├── messaging/
    ├── di/                    # Dependency injection wiring
    └── server/
```

---

## 8. Dependency Rules & Boundaries

### 8.1 Allowed Dependencies

| Layer | Can Depend On | Must NOT Depend On |
|-------|--------------|-------------------|
| Entities | Nothing (pure domain) | Application, Adapters, Infrastructure |
| Use Cases | Entities | Adapters, Infrastructure |
| Adapters | Use Cases, Entities | Infrastructure (except through DI) |
| Infrastructure | All inner layers | — |

### 8.2 Boundary Crossing
[How data crosses layer boundaries: DTOs, interfaces, dependency inversion.]

### 8.3 Enforcement
[How dependency rules are enforced: linting rules, architecture tests, module boundaries.]

---

## 9. Testing Strategy

### 9.1 Test Pyramid

| Layer | Test Type | Mocking Strategy |
|-------|-----------|-----------------|
| Entities | Unit tests | No mocks needed |
| Use Cases | Unit tests | Mock repository/service ports |
| Adapters | Integration tests | Real DB (test container) |
| Infrastructure | E2E tests | Full stack |

### 9.2 Test Examples
```
[Example test structure for each layer]
```

---

## 10. Error Handling

### 10.1 Domain Errors
[Custom error types for business rule violations.]

### 10.2 Application Errors
[Use case specific errors: not found, validation failure, etc.]

### 10.3 Error Translation
[How domain errors are translated into HTTP status codes or user-facing messages at the adapter layer.]

| Domain Error | HTTP Status | User Message |
|-------------|------------|-------------|
| [Error type] | [Status code] | [Message] |

---

## 11. Cross-Cutting Concerns

### 11.1 Logging
[Where and how logging is implemented without violating layer boundaries.]

### 11.2 Authentication & Authorization
[How auth is handled in the adapter layer and passed to use cases.]

### 11.3 Validation
[Input validation at adapter layer vs. domain validation in entities.]

### 11.4 Caching
[Caching strategy and where it lives in the architecture.]

---

## 12. Migration Plan

### 12.1 Current State
[Describe current architecture if migrating from an existing system.]

### 12.2 Target State
[Describe the clean architecture target.]

### 12.3 Migration Steps
| Step | Description | Risk | Rollback |
|------|-------------|------|----------|
| [Step 1] | [Description] | [Risk level] | [How to rollback] |

---

## 13. Open Questions & Decisions

| # | Question | Status | Decision | Date |
|---|----------|--------|----------|------|
| 1 | [Question] | [Open/Resolved] | [Decision if resolved] | [Date] |

---

## 14. References

- [Clean Architecture — Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Related design documents]
- [API specifications]
