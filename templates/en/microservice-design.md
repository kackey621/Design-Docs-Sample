# Microservice Design Document

| Field | Value |
|-------|-------|
| **Service Name** | [Service name] |
| **Author** | [Author name] |
| **Date** | [YYYY-MM-DD] |
| **Status** | [Draft / In Review / Approved] |
| **Version** | [1.0] |

---

## 1. Overview

### 1.1 Purpose
[Brief description of what this microservice does and why it exists.]

### 1.2 Business Context
[What business problem does this service solve? Which user stories or product requirements does it fulfill?]

### 1.3 Scope
[What is in scope and out of scope for this service.]

---

## 2. Architecture Overview

### 2.1 System Context Diagram
[Insert or describe a C4 Level 1 diagram showing how this service fits within the overall system.]

### 2.2 Service Boundaries
[Define the bounded context for this service. What domain concepts does it own?]

### 2.3 Dependencies

| Dependency | Type | Purpose |
|-----------|------|---------|
| [Service/System name] | [Sync/Async] | [Why this dependency exists] |

### 2.4 Downstream Consumers

| Consumer | Communication | Purpose |
|----------|--------------|---------|
| [Service/Client name] | [REST/gRPC/Event] | [What they consume] |

---

## 3. API Design

### 3.1 API Style
[REST / gRPC / GraphQL — justify the choice.]

### 3.2 Endpoints

#### `[METHOD] /api/v1/[resource]`
- **Description**: [What this endpoint does]
- **Request**:
  ```json
  {
    "field": "type — description"
  }
  ```
- **Response** (`200`):
  ```json
  {
    "field": "type — description"
  }
  ```
- **Error Responses**: `400`, `401`, `404`, `500`

### 3.3 Authentication & Authorization
[How is access controlled? JWT, API keys, OAuth2, etc.]

### 3.4 Rate Limiting
[Rate limit strategy and thresholds.]

### 3.5 Versioning Strategy
[URL path versioning, header versioning, etc.]

---

## 4. Data Design

### 4.1 Data Store
[Database type and justification: PostgreSQL, MongoDB, Redis, etc.]

### 4.2 Data Model

| Entity | Fields | Description |
|--------|--------|-------------|
| [Entity name] | [Key fields] | [Purpose] |

### 4.3 Schema Definition
```sql
-- [Table/Collection definition]
```

### 4.4 Data Migration Strategy
[How will schema changes be managed? Flyway, Alembic, etc.]

### 4.5 Data Retention & Archival
[Retention policies, archival strategy, GDPR considerations.]

---

## 5. Event-Driven Communication

### 5.1 Events Published

| Event Name | Topic/Queue | Payload Summary | Trigger |
|-----------|-------------|-----------------|---------|
| [Event name] | [Topic] | [Key fields] | [When emitted] |

### 5.2 Events Consumed

| Event Name | Source | Handler | Side Effects |
|-----------|--------|---------|--------------|
| [Event name] | [Source service] | [Handler description] | [What happens] |

### 5.3 Message Broker
[Kafka, RabbitMQ, AWS SNS/SQS, etc. — justify the choice.]

### 5.4 Idempotency & Ordering
[How are duplicate messages handled? Is ordering guaranteed?]

---

## 6. Resilience & Reliability

### 6.1 Failure Modes

| Failure | Impact | Mitigation |
|---------|--------|-----------|
| [Failure scenario] | [Impact description] | [Mitigation strategy] |

### 6.2 Circuit Breaker
[Circuit breaker configuration and fallback behavior.]

### 6.3 Retry Strategy
[Retry policies: exponential backoff, max retries, dead letter queue.]

### 6.4 Health Checks
- **Liveness**: `GET /health/live`
- **Readiness**: `GET /health/ready`

### 6.5 SLA / SLO

| Metric | Target |
|--------|--------|
| Availability | [e.g., 99.9%] |
| Latency (p99) | [e.g., < 200ms] |
| Error Rate | [e.g., < 0.1%] |

---

## 7. Security

### 7.1 Authentication
[Service-to-service auth: mTLS, service mesh, API gateway.]

### 7.2 Data Encryption
- **At rest**: [Encryption method]
- **In transit**: [TLS version]

### 7.3 Secrets Management
[Vault, AWS Secrets Manager, K8s secrets, etc.]

### 7.4 Input Validation
[Validation strategy and libraries used.]

---

## 8. Observability

### 8.1 Logging
[Structured logging format, log levels, correlation IDs.]

### 8.2 Metrics

| Metric | Type | Description |
|--------|------|-------------|
| [Metric name] | [Counter/Gauge/Histogram] | [What it measures] |

### 8.3 Tracing
[Distributed tracing: OpenTelemetry, Jaeger, etc.]

### 8.4 Alerting

| Alert | Condition | Severity | Runbook |
|-------|-----------|----------|---------|
| [Alert name] | [Trigger condition] | [Critical/Warning] | [Link to runbook] |

---

## 9. Deployment

### 9.1 Infrastructure
[Kubernetes, ECS, Lambda — describe the runtime environment.]

### 9.2 CI/CD Pipeline
[Build, test, deploy stages. Tools used: GitHub Actions, ArgoCD, etc.]

### 9.3 Configuration Management
[Environment variables, ConfigMaps, feature flags.]

### 9.4 Scaling Strategy

| Dimension | Strategy | Threshold |
|-----------|----------|-----------|
| Horizontal | [Auto-scaling policy] | [CPU/Memory/Custom metric] |
| Vertical | [Resource limits] | [When to scale up] |

### 9.5 Rollback Plan
[How to roll back a failed deployment.]

---

## 10. Testing Strategy

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | [Business logic] | [Testing framework] |
| Integration | [DB, external APIs] | [Tools] |
| Contract | [API contracts] | [Pact, etc.] |
| E2E | [Full flow] | [Tools] |
| Load | [Performance] | [k6, Locust, etc.] |

---

## 11. Migration & Rollout Plan

### 11.1 Migration Steps
[Step-by-step plan for deploying this service for the first time or migrating from an existing system.]

### 11.2 Feature Flags
[Which features are behind flags? Rollout percentages.]

### 11.3 Rollout Phases
| Phase | Description | Success Criteria |
|-------|-------------|-----------------|
| [Phase 1] | [Description] | [Criteria] |

---

## 12. Open Questions & Decisions

| # | Question | Status | Decision | Date |
|---|----------|--------|----------|------|
| 1 | [Question] | [Open/Resolved] | [Decision if resolved] | [Date] |

---

## 13. References

- [Link to related design docs]
- [Link to API specification (OpenAPI/Swagger)]
- [Link to architecture diagrams]
