# Templates Guide

This document provides an overview of all available design document templates, when to use each one, and how to fill them in effectively.

## Available Templates

### 1. Microservice Design Document
**File**: `templates/en/microservice-design.md` | `templates/ja/microservice-design.md`

**When to use**: When designing a new microservice or documenting an existing one. This template covers the full lifecycle of a microservice from API design to deployment and observability.

**Key sections**:
- Architecture Overview & Service Boundaries
- API Design (REST/gRPC/GraphQL contracts)
- Data Design (schema, migrations, retention)
- Event-Driven Communication
- Resilience & Reliability (circuit breakers, retries, SLAs)
- Security, Observability, Deployment
- Testing Strategy & Rollout Plan

**Best for**: Backend engineers, platform teams, and architects defining service boundaries and contracts.

---

### 2. Clean Architecture Design Document
**File**: `templates/en/clean-architecture-design.md` | `templates/ja/clean-architecture-design.md`

**When to use**: When designing the internal architecture of a module or service using Clean Architecture principles. This template focuses on layer separation, dependency rules, and testability.

**Key sections**:
- Layer Architecture (Entities, Use Cases, Adapters, Infrastructure)
- Domain Models & Value Objects
- Use Case Inventory & Detail
- Repository & Service Interfaces (Ports/Adapters)
- Directory Structure
- Dependency Rules & Boundary Enforcement
- Testing Strategy per Layer

**Best for**: Development teams implementing domain-driven design with strict layer separation.

---

## How to Use Templates

1. **Copy** the template file for your language (English or Japanese)
2. **Replace** all `[bracketed placeholders]` with your actual content
3. **Remove** sections that do not apply to your service (mark as "N/A" if you want to keep the structure)
4. **Add** diagrams using Mermaid, PlantUML, or embedded images
5. **Review** with your team before marking as "Approved"

## Samples

Filled-in examples using the the service are available in `samples/`. See [Sample.md](Sample.md) for details.

## Word Document Versions

`.docx` versions of all templates and samples are available in `docx/` for formal review workflows and offline editing.
