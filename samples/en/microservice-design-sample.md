# Microservice Design Document

| Field | Value |
|-------|-------|
| **Service Name** | User Relationship Service |
| **Author** | Akira Kusama |
| **Date** | 2026-04-12 |
| **Status** | In Review |
| **Version** | 1.0 |

---

## 1. Overview

### 1.1 Purpose
The User Relationship Service manages all friend connections, group memberships, and relationship history within Recerdo. It is the core social graph engine that powers the Viejo App's ability to help users reconnect with old friends and maintain close-knit groups.

### 1.2 Business Context
Recerdo's primary value proposition is helping users rediscover and strengthen relationships from their past. This service enables friend request workflows, group creation/management, and tracks how relationships evolve over time — a key differentiator from conventional social media platforms.

### 1.3 Scope
**In scope**: Friend requests, friend list management, group CRUD, group membership, relationship history timeline, mutual friend discovery, friend suggestions based on shared groups.

**Out of scope**: User profile management (Profile Service), messaging (Chat Service), content/memory sharing (Memory Service), push notifications (Notification Service).

---

## 2. Architecture Overview

### 2.1 System Context Diagram
```
┌──────────┐     REST      ┌──────────────────────┐     Kafka      ┌──────────────┐
│  Mobile  │──────────────▶│  User Relationship   │──────────────▶│ Notification │
│   App    │◀──────────────│      Service         │               │   Service    │
└──────────┘               └──────────────────────┘               └──────────────┘
                                   │        │
                              PostgreSQL   Redis
                              (primary)   (cache)
```

### 2.2 Service Boundaries
This service owns the **Social Graph** bounded context:
- Friend relationships (bidirectional connections)
- Group entities and memberships
- Relationship metadata (how/when users first connected, shared history markers)
- Friend request lifecycle (pending, accepted, declined, blocked)

### 2.3 Dependencies

| Dependency | Type | Purpose |
|-----------|------|---------|
| Profile Service | Sync (REST) | Fetch user display names and avatars for friend lists |
| Auth Service | Sync (REST) | Validate JWT tokens and user permissions |
| Redis | Sync | Cache frequently accessed friend lists and group memberships |

### 2.4 Downstream Consumers

| Consumer | Communication | Purpose |
|----------|--------------|---------|
| Memory Service | Event (Kafka) | Receives group membership changes to update sharing permissions |
| Notification Service | Event (Kafka) | Receives friend request events to send push notifications |
| Feed Service | Event (Kafka) | Receives new connection events to generate feed items |
| Mobile App | REST | Displays friend lists, groups, and relationship timelines |

---

## 3. API Design

### 3.1 API Style
REST over HTTPS. Chosen for simplicity, broad client compatibility (iOS/Android), and straightforward caching with HTTP semantics. gRPC considered but deferred — the request volume and payload complexity do not yet justify it.

### 3.2 Endpoints

#### `POST /api/v1/friends/requests`
- **Description**: Send a friend request to another user
- **Request**:
  ```json
  {
    "target_user_id": "string — UUID of the user to send request to",
    "message": "string (optional) — personal message with the request"
  }
  ```
- **Response** (`201`):
  ```json
  {
    "request_id": "string — UUID",
    "status": "pending",
    "created_at": "string — ISO 8601"
  }
  ```
- **Error Responses**: `400` (self-request), `404` (user not found), `409` (already friends or pending request)

#### `PUT /api/v1/friends/requests/{request_id}`
- **Description**: Accept or decline a friend request
- **Request**:
  ```json
  {
    "action": "accept | decline"
  }
  ```
- **Response** (`200`):
  ```json
  {
    "request_id": "string",
    "status": "accepted | declined",
    "updated_at": "string — ISO 8601"
  }
  ```

#### `GET /api/v1/friends`
- **Description**: Get the authenticated user's friend list
- **Query Parameters**: `page`, `limit`, `search` (name filter)
- **Response** (`200`):
  ```json
  {
    "friends": [
      {
        "user_id": "string",
        "display_name": "string",
        "avatar_url": "string",
        "connected_since": "string — ISO 8601",
        "mutual_friends_count": "number"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 150 }
  }
  ```

#### `POST /api/v1/groups`
- **Description**: Create a new friend group
- **Request**:
  ```json
  {
    "name": "string — group name (max 100 chars)",
    "description": "string (optional)",
    "member_ids": ["string — UUIDs of initial members"]
  }
  ```
- **Response** (`201`):
  ```json
  {
    "group_id": "string",
    "name": "string",
    "created_at": "string — ISO 8601",
    "member_count": "number"
  }
  ```

#### `GET /api/v1/groups/{group_id}/members`
- **Description**: List members of a group
- **Response** (`200`):
  ```json
  {
    "members": [
      {
        "user_id": "string",
        "display_name": "string",
        "role": "owner | admin | member",
        "joined_at": "string — ISO 8601"
      }
    ]
  }
  ```

### 3.3 Authentication & Authorization
All endpoints require a valid JWT in the `Authorization: Bearer <token>` header. The Auth Service validates tokens. Group admin operations (delete group, remove member) require `owner` or `admin` role within the group.

### 3.4 Rate Limiting
- Friend requests: 50 per hour per user (prevents spam)
- Read endpoints: 300 requests per minute per user
- Group creation: 10 per day per user

### 3.5 Versioning Strategy
URL path versioning (`/api/v1/`). Major version bumps for breaking changes; minor/patch changes are backward-compatible.

---

## 4. Data Design

### 4.1 Data Store
**PostgreSQL 15** — chosen for strong relational integrity (friend relationships are inherently relational), ACID compliance, and excellent support for complex queries (mutual friends, group intersections). Redis for caching hot friend lists.

### 4.2 Data Model

| Entity | Fields | Description |
|--------|--------|-------------|
| friendship | id, user_id_a, user_id_b, status, created_at, updated_at | Bidirectional friend connection |
| friend_request | id, sender_id, receiver_id, status, message, created_at | Friend request lifecycle |
| group | id, name, description, owner_id, created_at | Friend group |
| group_membership | id, group_id, user_id, role, joined_at | Group membership with role |
| relationship_event | id, user_id_a, user_id_b, event_type, metadata, created_at | Relationship history timeline |

### 4.3 Schema Definition
```sql
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_a UUID NOT NULL,
    user_id_b UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id_a, user_id_b),
    CHECK (user_id_a < user_id_b)  -- Canonical ordering to prevent duplicates
);

CREATE TABLE friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (sender_id != receiver_id)
);

CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE group_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

CREATE TABLE relationship_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_a UUID NOT NULL,
    user_id_b UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_friendships_user_a ON friendships(user_id_a);
CREATE INDEX idx_friendships_user_b ON friendships(user_id_b);
CREATE INDEX idx_friend_requests_receiver ON friend_requests(receiver_id, status);
CREATE INDEX idx_group_memberships_user ON group_memberships(user_id);
```

### 4.4 Data Migration Strategy
**Flyway** for versioned SQL migrations. All migrations are forward-only and backward-compatible. Schema changes go through a PR review process before deployment.

### 4.5 Data Retention & Archival
- Active friendships: retained indefinitely
- Declined friend requests: soft-deleted after 90 days
- Relationship events: retained for 3 years, then archived to cold storage (S3)
- GDPR: full user data export and deletion endpoints available via Admin API

---

## 5. Event-Driven Communication

### 5.1 Events Published

| Event Name | Topic | Payload Summary | Trigger |
|-----------|-------|-----------------|---------|
| `friend.request.sent` | `relationship-events` | sender_id, receiver_id, request_id | User sends friend request |
| `friend.request.accepted` | `relationship-events` | sender_id, receiver_id, friendship_id | Friend request accepted |
| `friend.removed` | `relationship-events` | user_id_a, user_id_b | User unfriends someone |
| `group.member.added` | `group-events` | group_id, user_id, role | Member added to group |
| `group.member.removed` | `group-events` | group_id, user_id | Member removed from group |

### 5.2 Events Consumed

| Event Name | Source | Handler | Side Effects |
|-----------|--------|---------|--------------|
| `user.deleted` | Profile Service | UserDeletionHandler | Removes all friendships, group memberships, and requests for deleted user |
| `user.profile.updated` | Profile Service | ProfileCacheInvalidator | Invalidates cached display names in friend lists |

### 5.3 Message Broker
**Apache Kafka** — chosen for durability, replay capability, and high throughput. Relationship events are critical for downstream services and must not be lost. Kafka's log retention allows reprocessing if a consumer falls behind.

### 5.4 Idempotency & Ordering
- Each event includes an `event_id` (UUID) and `idempotency_key`. Consumers deduplicate by `event_id`.
- Events are partitioned by `user_id` to guarantee per-user ordering.
- Consumers maintain an offset checkpoint in their own data store.

---

## 6. Resilience & Reliability

### 6.1 Failure Modes

| Failure | Impact | Mitigation |
|---------|--------|-----------|
| PostgreSQL down | Cannot read/write relationships | Circuit breaker, cached friend lists in Redis (stale reads) |
| Redis down | Slower response times | Graceful degradation — query PostgreSQL directly |
| Profile Service unavailable | Cannot enrich friend list with display names | Return friend list with user IDs only; client retries enrichment |
| Kafka broker down | Events not published | Outbox pattern with retry; events stored in DB and replayed |

### 6.2 Circuit Breaker
Resilience4j circuit breaker on Profile Service calls. Opens after 5 consecutive failures, half-open after 30 seconds. Fallback returns cached or partial data.

### 6.3 Retry Strategy
- Transient failures: exponential backoff (100ms, 200ms, 400ms), max 3 retries
- Kafka publish failures: outbox pattern with background retry every 5 seconds
- Dead letter queue for events that fail after 10 attempts

### 6.4 Health Checks
- **Liveness**: `GET /health/live` — returns 200 if the JVM is running
- **Readiness**: `GET /health/ready` — checks PostgreSQL and Redis connectivity

### 6.5 SLA / SLO

| Metric | Target |
|--------|--------|
| Availability | 99.95% |
| Latency (p99) | < 150ms (read), < 300ms (write) |
| Error Rate | < 0.05% |

---

## 7. Security

### 7.1 Authentication
Service-to-service: mTLS within Kubernetes cluster. External: JWT validation via Auth Service.

### 7.2 Data Encryption
- **At rest**: AES-256 via PostgreSQL TDE (Transparent Data Encryption)
- **In transit**: TLS 1.3

### 7.3 Secrets Management
AWS Secrets Manager for database credentials and API keys. Kubernetes ExternalSecrets operator syncs secrets to pods.

### 7.4 Input Validation
All inputs validated with Joi (Node.js). UUIDs checked for format. String lengths enforced. SQL injection prevented by parameterized queries.

---

## 8. Observability

### 8.1 Logging
Structured JSON logging via Pino. Every request includes `correlation_id`, `user_id`, `request_path`. Log levels: ERROR for failures, WARN for degraded states, INFO for request lifecycle.

### 8.2 Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `relationship_friend_requests_total` | Counter | Total friend requests sent |
| `relationship_active_friendships_gauge` | Gauge | Current number of active friendships |
| `relationship_api_latency_seconds` | Histogram | API response time by endpoint |
| `relationship_cache_hit_ratio` | Gauge | Redis cache hit rate |

### 8.3 Tracing
OpenTelemetry with Jaeger backend. All inter-service calls are traced. Trace context propagated via W3C Trace Context headers.

### 8.4 Alerting

| Alert | Condition | Severity | Runbook |
|-------|-----------|----------|---------|
| High Error Rate | Error rate > 1% for 5 min | Critical | `/runbooks/relationship-high-errors.md` |
| Database Connection Pool Exhausted | Available connections < 5 | Critical | `/runbooks/relationship-db-pool.md` |
| Cache Miss Rate High | Miss rate > 50% for 10 min | Warning | `/runbooks/relationship-cache.md` |
| Kafka Lag Increasing | Consumer lag > 10,000 | Warning | `/runbooks/relationship-kafka-lag.md` |

---

## 9. Deployment

### 9.1 Infrastructure
Kubernetes (EKS) with 3 replicas minimum. Each pod: 512MB RAM, 0.5 vCPU request; 1GB RAM, 1 vCPU limit.

### 9.2 CI/CD Pipeline
GitHub Actions → Build Docker image → Run tests → Push to ECR → ArgoCD syncs to EKS. Canary deployment with 10% traffic for 15 minutes before full rollout.

### 9.3 Configuration Management
- Environment-specific: Kubernetes ConfigMaps
- Feature flags: LaunchDarkly (friend suggestions feature, group size limits)
- Secrets: AWS Secrets Manager via ExternalSecrets

### 9.4 Scaling Strategy

| Dimension | Strategy | Threshold |
|-----------|----------|-----------|
| Horizontal | HPA (Horizontal Pod Autoscaler) | CPU > 70% or custom metric: requests/sec > 500 |
| Vertical | VPA recommendations reviewed monthly | Memory consistently > 80% |

### 9.5 Rollback Plan
ArgoCD automatic rollback if health checks fail within 5 minutes of deployment. Manual rollback: `argocd app rollback relationship-service`.

---

## 10. Testing Strategy

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | Business logic, domain rules | Jest |
| Integration | PostgreSQL queries, Redis caching | Testcontainers + Jest |
| Contract | API contracts with Mobile App | Pact |
| E2E | Friend request → accept → group creation flow | Playwright (API mode) |
| Load | 1000 concurrent users, peak friend list reads | k6 |

---

## 11. Migration & Rollout Plan

### 11.1 Migration Steps
1. Deploy database schema via Flyway
2. Deploy service with feature flags OFF
3. Enable friend request endpoints (flag: `enable-friend-requests`)
4. Enable group management endpoints (flag: `enable-groups`)
5. Enable relationship history tracking (flag: `enable-relationship-events`)

### 11.2 Feature Flags
| Flag | Default | Description |
|------|---------|-------------|
| `enable-friend-requests` | OFF | Friend request workflow |
| `enable-groups` | OFF | Group creation and management |
| `enable-friend-suggestions` | OFF | ML-based friend suggestions |

### 11.3 Rollout Phases
| Phase | Description | Success Criteria |
|-------|-------------|-----------------|
| Phase 1 (Week 1) | Internal team testing | Zero critical bugs, p99 < 150ms |
| Phase 2 (Week 2) | 5% of users | Error rate < 0.1%, no data inconsistencies |
| Phase 3 (Week 3) | 50% of users | Stable metrics, positive user feedback |
| Phase 4 (Week 4) | 100% rollout | All SLOs met for 48 hours |

---

## 12. Open Questions & Decisions

| # | Question | Status | Decision | Date |
|---|----------|--------|----------|------|
| 1 | Should we support "close friends" tiers? | Open | — | — |
| 2 | Max group size limit? | Resolved | 150 members (Dunbar's number) | 2026-04-10 |
| 3 | Should blocked users be visible in mutual friend counts? | Resolved | No — blocked users excluded from all queries | 2026-04-08 |

---

## 13. References

- [Recerdo System Architecture Overview](../architecture-overview.md)
- [Profile Service Design Doc](../profile-service-design.md)
- [OpenAPI Spec — User Relationship Service](../api-specs/relationship-service.yaml)
- [Kafka Topic Registry](../infrastructure/kafka-topics.md)
