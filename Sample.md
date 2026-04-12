# Samples Guide

This document describes the sample design documents provided as reference examples. All samples are based on the service (Viejo App) — a social media platform for reconnecting with old friends and close-knit groups.

## Available Samples

### 1. Microservice Design Sample — User Relationship Service
**File**: `samples/en/microservice-design-sample.md` | `samples/ja/microservice-design-sample.md`

This sample documents the **User Relationship Service**, a core microservice in [Project Name] that manages friend connections, group memberships, and relationship history. It demonstrates how to fill in every section of the microservice template with realistic content including API endpoints, data schemas, event definitions, and deployment configuration.

**Highlights**:
- REST API design for friend requests and group management
- PostgreSQL schema with relationship history tracking
- Kafka event-driven communication for real-time notifications
- Kubernetes deployment with auto-scaling
- Comprehensive observability setup

---

### 2. Clean Architecture Design Sample — Memory Sharing Module
**File**: `samples/en/clean-architecture-design-sample.md` | `samples/ja/clean-architecture-design-sample.md`

This sample documents the **Memory Sharing Module**, which allows [Project Name] users to share photos, stories, and memories within their friend groups. It demonstrates clean architecture layer separation with concrete code examples.

**Highlights**:
- Domain entities: Memory, SharedMemory, MemoryReaction
- Use cases: CreateMemory, ShareWithGroup, AddReaction
- Port/Adapter pattern for storage and notification services
- Complete directory structure with TypeScript examples
- Testing strategy per architectural layer

---

## How to Read Samples

Each sample follows the same structure as its corresponding template. Sections that would be `[placeholder]` in the template are filled with [Project Name]-specific content to show:

- **What level of detail** is expected in each section
- **How to describe** technical decisions with justifications
- **How to format** API contracts, schemas, and diagrams
- **How to document** trade-offs and open questions realistically

## Word Document Versions

`.docx` versions of all samples are available in `docx/` for offline review.
