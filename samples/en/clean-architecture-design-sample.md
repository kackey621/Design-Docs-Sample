# Clean Architecture Design Document

| Field | Value |
|-------|-------|
| **Module/Service Name** | Memory Sharing Module |
| **Author** | Akira Kusama |
| **Date** | 2026-04-12 |
| **Status** | In Review |
| **Version** | 1.0 |

---

## 1. Overview

### 1.1 Purpose
The Memory Sharing Module handles the creation, storage, and sharing of memories (photos, stories, and moments) within SampleApp friend groups. It is the emotional core of SampleApp, enabling users to share nostalgic content with the people who matter most.

### 1.2 Business Context
SampleApp differentiates itself from mainstream social media by focusing on shared memories among close-knit groups rather than public broadcasting. This module powers the primary engagement loop: users create memories, share them with specific groups, and receive reactions from old friends — reinforcing emotional bonds.

### 1.3 Architecture Principles
This document follows **Clean Architecture** (Robert C. Martin) principles:
- **Independence of frameworks**: Memory business logic has zero dependency on Express, TypeORM, or AWS SDK
- **Testability**: All use cases are testable with simple mocks — no database or S3 required
- **Independence of UI**: The same use cases serve both the mobile REST API and future web interface
- **Independence of database**: Switching from PostgreSQL to another store requires only adapter changes
- **Independence of external agencies**: Cloud storage (S3) is abstracted behind a port interface

---

## 2. Layer Architecture

### 2.1 Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│  Infrastructure: Express, PostgreSQL, S3, Kafka, Redis          │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Adapters: MemoryController, PostgresMemoryRepo, S3Storage │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  Use Cases: CreateMemory, ShareWithGroup, AddReaction   │ │ │
│  │  │  ┌─────────────────────────────────────────────────────┐ │ │ │
│  │  │  │  Entities: Memory, SharedMemory, MemoryReaction     │ │ │ │
│  │  │  └─────────────────────────────────────────────────────┘ │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Dependency Rule
> Source code dependencies point **inward only**. The Memory entity knows nothing about PostgreSQL, S3, or Express. Use cases depend only on entities and port interfaces.

---

## 3. Entities Layer (Domain)

### 3.1 Domain Models

| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| Memory | A user's memory (photo, story, or moment) | id, authorId, type, content, mediaUrls, createdAt |
| SharedMemory | A memory shared with a specific group | id, memoryId, groupId, sharedBy, sharedAt, visibility |
| MemoryReaction | A reaction to a shared memory | id, sharedMemoryId, userId, reactionType, createdAt |

### 3.2 Value Objects

| Value Object | Description | Validation Rules |
|-------------|-------------|-----------------|
| MemoryId | Unique memory identifier | UUID format, non-empty |
| MediaUrl | URL to uploaded media | Valid URL format, allowed extensions (jpg, png, mp4, webp) |
| ReactionType | Type of emotional reaction | Enum: "love", "laugh", "cry", "nostalgia", "surprise" |
| MemoryContent | Text content of a memory | Max 5,000 characters, no banned words |
| Visibility | Sharing visibility level | Enum: "group_only", "mutual_friends", "private" |

### 3.3 Domain Rules / Invariants
- A memory must have at least one of: text content or media URL (cannot be completely empty)
- A memory can only be shared with groups where the author is a member
- A user can have only one reaction per shared memory (updating replaces the previous reaction)
- Media URLs must be from the approved storage domain (no external hotlinking)
- Memories cannot be edited after being shared (immutability preserves authenticity)

### 3.4 Domain Events

| Event | Trigger | Payload |
|-------|---------|---------|
| MemoryCreated | New memory saved | memoryId, authorId, type |
| MemoryShared | Memory shared with group | sharedMemoryId, memoryId, groupId |
| ReactionAdded | User reacts to shared memory | reactionId, sharedMemoryId, userId, reactionType |
| MemoryDeleted | Author deletes a memory | memoryId, authorId |

### 3.5 Entity Definition
```typescript
// domain/entities/Memory.ts
export class Memory {
  readonly id: MemoryId;
  readonly authorId: string;
  readonly type: 'photo' | 'story' | 'moment';
  readonly content: MemoryContent | null;
  readonly mediaUrls: MediaUrl[];
  readonly createdAt: Date;

  private constructor(props: MemoryProps) {
    this.validate(props);
    Object.assign(this, props);
  }

  static create(props: CreateMemoryProps): Memory {
    if (!props.content && props.mediaUrls.length === 0) {
      throw new EmptyMemoryError();
    }
    return new Memory({
      id: MemoryId.generate(),
      ...props,
      createdAt: new Date(),
    });
  }

  private validate(props: MemoryProps): void {
    if (props.mediaUrls.length > 10) {
      throw new TooManyMediaError(props.mediaUrls.length);
    }
  }

  canBeSharedBy(userId: string): boolean {
    return this.authorId === userId;
  }
}
```

---

## 4. Use Cases Layer (Application)

### 4.1 Use Case Inventory

| Use Case | Input | Output | Description |
|----------|-------|--------|-------------|
| CreateMemory | CreateMemoryDTO | MemoryResponseDTO | Creates a new memory with optional media |
| ShareWithGroup | ShareMemoryDTO | SharedMemoryResponseDTO | Shares an existing memory with a friend group |
| AddReaction | AddReactionDTO | ReactionResponseDTO | Adds or updates a reaction to a shared memory |
| GetGroupMemories | GetGroupMemoriesDTO | PaginatedMemoriesDTO | Retrieves shared memories for a group |
| DeleteMemory | DeleteMemoryDTO | void | Soft-deletes a memory and all shares |

### 4.2 Use Case Detail

#### CreateMemory
- **Actor**: Authenticated SampleApp user
- **Preconditions**: User is authenticated; media files (if any) are already uploaded to temporary storage
- **Flow**:
  1. Validate input DTO (content length, media URL formats)
  2. Create Memory entity via `Memory.create()`
  3. Move media from temporary to permanent storage via `StoragePort`
  4. Save memory via `MemoryRepositoryPort`
  5. Emit `MemoryCreated` domain event
  6. Return MemoryResponseDTO
- **Postconditions**: Memory is persisted, media is in permanent storage
- **Error Cases**:
  - Empty memory (no content or media) → `EmptyMemoryError`
  - Too many media files (> 10) → `TooManyMediaError`
  - Storage failure → `StorageError` (media cleanup attempted)

#### ShareWithGroup
- **Actor**: Authenticated SampleApp user (must be memory author)
- **Preconditions**: Memory exists; user is the author; user is a member of the target group
- **Flow**:
  1. Load memory via `MemoryRepositoryPort`
  2. Verify ownership via `memory.canBeSharedBy(userId)`
  3. Verify group membership via `GroupMembershipPort`
  4. Create SharedMemory entity
  5. Save via `SharedMemoryRepositoryPort`
  6. Emit `MemoryShared` domain event
  7. Return SharedMemoryResponseDTO
- **Postconditions**: Memory is visible to group members
- **Error Cases**:
  - Not the author → `UnauthorizedShareError`
  - Not a group member → `NotGroupMemberError`
  - Memory not found → `MemoryNotFoundError`

### 4.3 Input/Output DTOs
```typescript
// application/dtos/CreateMemoryDTO.ts
export interface CreateMemoryDTO {
  authorId: string;
  type: 'photo' | 'story' | 'moment';
  content?: string;
  mediaUrls?: string[];
}

// application/dtos/MemoryResponseDTO.ts
export interface MemoryResponseDTO {
  id: string;
  authorId: string;
  type: string;
  content: string | null;
  mediaUrls: string[];
  createdAt: string;
}

// application/dtos/ShareMemoryDTO.ts
export interface ShareMemoryDTO {
  memoryId: string;
  groupId: string;
  sharedBy: string;
  visibility: 'group_only' | 'mutual_friends' | 'private';
}
```

### 4.4 Repository Interfaces (Ports)
```typescript
// application/ports/MemoryRepositoryPort.ts
export interface MemoryRepositoryPort {
  save(memory: Memory): Promise<void>;
  findById(id: MemoryId): Promise<Memory | null>;
  findByAuthor(authorId: string, pagination: Pagination): Promise<Memory[]>;
  softDelete(id: MemoryId): Promise<void>;
}

// application/ports/SharedMemoryRepositoryPort.ts
export interface SharedMemoryRepositoryPort {
  save(sharedMemory: SharedMemory): Promise<void>;
  findByGroup(groupId: string, pagination: Pagination): Promise<SharedMemory[]>;
  findByMemoryId(memoryId: MemoryId): Promise<SharedMemory[]>;
}
```

### 4.5 External Service Interfaces (Ports)
```typescript
// application/ports/StoragePort.ts
export interface StoragePort {
  moveToPermament(tempUrl: string): Promise<string>;  // returns permanent URL
  delete(url: string): Promise<void>;
  generateUploadUrl(fileName: string, contentType: string): Promise<string>;
}

// application/ports/GroupMembershipPort.ts
export interface GroupMembershipPort {
  isMember(userId: string, groupId: string): Promise<boolean>;
  getGroupMembers(groupId: string): Promise<string[]>;
}

// application/ports/EventPublisherPort.ts
export interface EventPublisherPort {
  publish(event: DomainEvent): Promise<void>;
}
```

---

## 5. Interface Adapters Layer

### 5.1 Controllers / Handlers

| Controller | Route/Trigger | Use Case |
|-----------|--------------|----------|
| MemoryController | `POST /api/v1/memories` | CreateMemory |
| MemoryController | `POST /api/v1/memories/{id}/share` | ShareWithGroup |
| MemoryController | `GET /api/v1/groups/{groupId}/memories` | GetGroupMemories |
| ReactionController | `POST /api/v1/shared-memories/{id}/reactions` | AddReaction |
| MemoryController | `DELETE /api/v1/memories/{id}` | DeleteMemory |

### 5.2 Presenters / Response Mappers
```typescript
// adapters/presenters/MemoryPresenter.ts
export class MemoryPresenter {
  static toResponse(memory: Memory): MemoryResponseDTO {
    return {
      id: memory.id.value,
      authorId: memory.authorId,
      type: memory.type,
      content: memory.content?.value ?? null,
      mediaUrls: memory.mediaUrls.map(url => url.value),
      createdAt: memory.createdAt.toISOString(),
    };
  }
}
```

### 5.3 Repository Implementations (Adapters)

| Repository Interface | Implementation | Data Store |
|---------------------|---------------|-----------|
| MemoryRepositoryPort | PostgresMemoryRepository | PostgreSQL |
| SharedMemoryRepositoryPort | PostgresSharedMemoryRepository | PostgreSQL |
| (Cache layer) | RedisMemoryCacheRepository | Redis |

### 5.4 External Service Adapters

| Service Interface | Implementation | External System |
|------------------|---------------|----------------|
| StoragePort | S3StorageAdapter | AWS S3 |
| GroupMembershipPort | RelationshipServiceAdapter | User Relationship Service (REST) |
| EventPublisherPort | KafkaEventPublisher | Apache Kafka |

### 5.5 Mappers
```typescript
// adapters/mappers/MemoryMapper.ts
export class MemoryMapper {
  // Domain → Persistence
  static toPersistence(memory: Memory): MemoryRecord {
    return {
      id: memory.id.value,
      author_id: memory.authorId,
      type: memory.type,
      content: memory.content?.value,
      media_urls: JSON.stringify(memory.mediaUrls.map(u => u.value)),
      created_at: memory.createdAt,
    };
  }

  // Persistence → Domain
  static toDomain(record: MemoryRecord): Memory {
    return Memory.reconstitute({
      id: new MemoryId(record.id),
      authorId: record.author_id,
      type: record.type,
      content: record.content ? new MemoryContent(record.content) : null,
      mediaUrls: JSON.parse(record.media_urls).map((u: string) => new MediaUrl(u)),
      createdAt: record.created_at,
    });
  }
}
```

---

## 6. Frameworks & Drivers Layer (Infrastructure)

### 6.1 Web Framework
**Express.js** (Node.js 20 LTS) — lightweight, well-known by the team, sufficient for REST APIs. Middleware: helmet (security headers), cors, express-rate-limit.

### 6.2 Database
**PostgreSQL 15** via `pg` driver with connection pooling (pg-pool, max 20 connections). No ORM — raw SQL with parameterized queries for performance and control. Migrations via Flyway.

### 6.3 Message Broker
**Apache Kafka** via `kafkajs`. Produces domain events to `memory-events` topic. Consumer group for processing reactions and generating notifications.

### 6.4 External Libraries & SDKs

| Library | Purpose | Layer |
|---------|---------|-------|
| `@aws-sdk/client-s3` | Media file storage | Infrastructure |
| `kafkajs` | Event publishing and consuming | Infrastructure |
| `pg` / `pg-pool` | Database access | Infrastructure |
| `ioredis` | Caching | Infrastructure |
| `joi` | Input validation | Adapters (controllers) |
| `pino` | Structured logging | Cross-cutting (infrastructure) |

### 6.5 Dependency Injection
**tsyringe** — lightweight TypeScript DI container. All ports are registered as interfaces and resolved at application startup.

```typescript
// infrastructure/di/container.ts
container.register<MemoryRepositoryPort>(
  'MemoryRepositoryPort',
  { useClass: PostgresMemoryRepository }
);
container.register<StoragePort>(
  'StoragePort',
  { useClass: S3StorageAdapter }
);
container.register<EventPublisherPort>(
  'EventPublisherPort',
  { useClass: KafkaEventPublisher }
);
```

---

## 7. Directory Structure

```
src/
├── domain/
│   ├── entities/
│   │   ├── Memory.ts
│   │   ├── SharedMemory.ts
│   │   └── MemoryReaction.ts
│   ├── value-objects/
│   │   ├── MemoryId.ts
│   │   ├── MediaUrl.ts
│   │   ├── MemoryContent.ts
│   │   ├── ReactionType.ts
│   │   └── Visibility.ts
│   ├── events/
│   │   ├── MemoryCreated.ts
│   │   ├── MemoryShared.ts
│   │   └── ReactionAdded.ts
│   └── errors/
│       ├── EmptyMemoryError.ts
│       └── TooManyMediaError.ts
├── application/
│   ├── use-cases/
│   │   ├── CreateMemory.ts
│   │   ├── ShareWithGroup.ts
│   │   ├── AddReaction.ts
│   │   ├── GetGroupMemories.ts
│   │   └── DeleteMemory.ts
│   ├── dtos/
│   │   ├── CreateMemoryDTO.ts
│   │   ├── ShareMemoryDTO.ts
│   │   └── MemoryResponseDTO.ts
│   ├── ports/
│   │   ├── MemoryRepositoryPort.ts
│   │   ├── SharedMemoryRepositoryPort.ts
│   │   ├── StoragePort.ts
│   │   ├── GroupMembershipPort.ts
│   │   └── EventPublisherPort.ts
│   └── errors/
│       ├── MemoryNotFoundError.ts
│       └── UnauthorizedShareError.ts
├── adapters/
│   ├── controllers/
│   │   ├── MemoryController.ts
│   │   └── ReactionController.ts
│   ├── presenters/
│   │   └── MemoryPresenter.ts
│   ├── repositories/
│   │   ├── PostgresMemoryRepository.ts
│   │   └── PostgresSharedMemoryRepository.ts
│   ├── services/
│   │   ├── S3StorageAdapter.ts
│   │   ├── RelationshipServiceAdapter.ts
│   │   └── KafkaEventPublisher.ts
│   └── mappers/
│       ├── MemoryMapper.ts
│       └── SharedMemoryMapper.ts
└── infrastructure/
    ├── config/
    │   └── env.ts
    ├── database/
    │   ├── connection.ts
    │   └── migrations/
    ├── messaging/
    │   └── kafka.ts
    ├── di/
    │   └── container.ts
    └── server/
        └── app.ts
```

---

## 8. Dependency Rules & Boundaries

### 8.1 Allowed Dependencies

| Layer | Can Depend On | Must NOT Depend On |
|-------|--------------|-------------------|
| Entities | Nothing (pure domain) | Application, Adapters, Infrastructure |
| Use Cases | Entities, Port interfaces | Adapters, Infrastructure, Express, pg, AWS SDK |
| Adapters | Use Cases, Entities | Infrastructure config details |
| Infrastructure | All inner layers | — |

### 8.2 Boundary Crossing
Data crosses boundaries via DTOs. Controllers receive HTTP request bodies, validate with Joi, and construct `CreateMemoryDTO` objects. Use cases return response DTOs. Presenters format DTOs for HTTP responses. Domain entities never leave the use case layer.

### 8.3 Enforcement
- **ESLint import rules**: `eslint-plugin-boundaries` configured to forbid inner→outer imports
- **Architecture tests**: Custom Jest tests that scan import statements in each layer
- **CI check**: Architecture test suite runs on every PR; violations block merge

---

## 9. Testing Strategy

### 9.1 Test Pyramid

| Layer | Test Type | Mocking Strategy |
|-------|-----------|-----------------|
| Entities | Unit tests | No mocks — pure logic | 
| Use Cases | Unit tests | In-memory implementations of ports |
| Adapters | Integration tests | Testcontainers (PostgreSQL, Redis) |
| Infrastructure | E2E tests | Full stack with Docker Compose |

### 9.2 Test Examples
```typescript
// Unit test — Domain Entity
describe('Memory', () => {
  it('should reject empty memories', () => {
    expect(() => Memory.create({
      authorId: 'user-1',
      type: 'story',
      // no content, no media
    })).toThrow(EmptyMemoryError);
  });

  it('should create memory with content only', () => {
    const memory = Memory.create({
      authorId: 'user-1',
      type: 'story',
      content: 'Remember that summer trip?',
      mediaUrls: [],
    });
    expect(memory.id).toBeDefined();
    expect(memory.content?.value).toBe('Remember that summer trip?');
  });
});

// Unit test — Use Case
describe('CreateMemory', () => {
  it('should save memory and publish event', async () => {
    const mockRepo = new InMemoryMemoryRepository();
    const mockStorage = new InMemoryStorage();
    const mockPublisher = new InMemoryEventPublisher();
    const useCase = new CreateMemory(mockRepo, mockStorage, mockPublisher);

    const result = await useCase.execute({
      authorId: 'user-1',
      type: 'photo',
      content: 'Beach day!',
      mediaUrls: ['temp://photo1.jpg'],
    });

    expect(result.id).toBeDefined();
    expect(mockRepo.memories).toHaveLength(1);
    expect(mockPublisher.events).toHaveLength(1);
    expect(mockPublisher.events[0]).toBeInstanceOf(MemoryCreated);
  });
});
```

---

## 10. Error Handling

### 10.1 Domain Errors
- `EmptyMemoryError`: Memory has no content and no media
- `TooManyMediaError`: More than 10 media files attached
- `InvalidMediaUrlError`: Media URL is not from approved storage domain

### 10.2 Application Errors
- `MemoryNotFoundError`: Referenced memory does not exist
- `UnauthorizedShareError`: User is not the memory's author
- `NotGroupMemberError`: User is not a member of the target group
- `DuplicateReactionError`: User already reacted (handled by upsert)

### 10.3 Error Translation

| Domain Error | HTTP Status | User Message |
|-------------|------------|-------------|
| EmptyMemoryError | 400 | "A memory must include text or at least one photo." |
| TooManyMediaError | 400 | "You can attach up to 10 photos per memory." |
| MemoryNotFoundError | 404 | "This memory could not be found." |
| UnauthorizedShareError | 403 | "Only the memory's author can share it." |
| NotGroupMemberError | 403 | "You must be a group member to share here." |

---

## 11. Cross-Cutting Concerns

### 11.1 Logging
Pino logger injected via DI. Controllers log request/response metadata. Use cases log business events. Adapters log external call durations. Domain layer has no logging — it raises errors that upper layers log.

### 11.2 Authentication & Authorization
Express middleware validates JWT, extracts `userId`, and passes it into controller methods. Controllers include `userId` in all DTOs. Authorization logic lives in use cases (e.g., "only the author can share").

### 11.3 Validation
Two levels: (1) Adapter layer: Joi validates HTTP input shape, types, and lengths. (2) Domain layer: Entity constructors enforce business invariants. This separation means the domain stays clean even if the API framework changes.

### 11.4 Caching
Redis caches group memory lists (TTL: 5 minutes). Cache invalidation on new share or reaction. Cache logic lives in an adapter decorator (`CachedMemoryRepository`) that wraps the PostgreSQL adapter — use cases are unaware of caching.

---

## 12. Migration Plan

### 12.1 Current State
No existing memory system — this is a greenfield module within the SampleApp platform.

### 12.2 Target State
Fully operational Memory Sharing Module with all five use cases, integrated with User Relationship Service and deployed on Kubernetes.

### 12.3 Migration Steps
| Step | Description | Risk | Rollback |
|------|-------------|------|----------|
| 1 | Deploy database schema | Low | Drop tables |
| 2 | Deploy service with CreateMemory only | Low | Remove deployment |
| 3 | Enable ShareWithGroup + GetGroupMemories | Medium | Feature flag OFF |
| 4 | Enable AddReaction | Low | Feature flag OFF |
| 5 | Enable DeleteMemory + cleanup jobs | Low | Feature flag OFF |

---

## 13. Open Questions & Decisions

| # | Question | Status | Decision | Date |
|---|----------|--------|----------|------|
| 1 | Should memories support video > 60 seconds? | Open | — | — |
| 2 | Should we add "memory albums" (collections)? | Open | — | — |
| 3 | Max media file size? | Resolved | 50MB per file, 200MB total per memory | 2026-04-05 |
| 4 | Should reactions include custom emoji? | Resolved | No — fixed set of 5 reaction types for v1 | 2026-04-08 |

---

## 14. References

- [Clean Architecture — Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [User Relationship Service Design Doc](../microservice-design-sample.md)
- [SampleApp System Architecture Overview](../../architecture-overview.md)
- [Memory Service OpenAPI Spec](../../api-specs/memory-service.yaml)
