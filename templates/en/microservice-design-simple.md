# Microservice Design Document (Simple Version)

| Field | Value |
|-------|-------|
| **Service Name** | [Service name] |
| **Author** | [Author name] |
| **Date** | [YYYY-MM-DD] |
| **Status** | [Draft / In Review / Approved] |

---

## 1. Overview

### 1.1 Purpose
[What does this service do? Why does it exist?]

### 1.2 Scope

**In scope**: [List what this service handles]

**Out of scope**: [List what is explicitly excluded]

---

## 2. API Design

### 2.1 API Style
[REST / gRPC / GraphQL]

### 2.2 Endpoints

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | /api/v1/[resource] | [Description] | Yes / No |
| POST | /api/v1/[resource] | [Description] | Yes / No |

---

## 3. Data Design

### 3.1 Data Store
[Database name and type — e.g. PostgreSQL, MongoDB, Redis]

### 3.2 Main Entities

| Entity | Key Fields | Description |
|--------|-----------|-------------|
| [Entity name] | [field1, field2] | [Purpose] |

---

## 4. Deployment

### 4.1 Environment
[e.g. Kubernetes (EKS), AWS Lambda, GCP Cloud Run]

### 4.2 Infrastructure Notes
[Resource limits, scaling strategy, CI/CD pipeline summary]

---

## 5. Notes & Open Questions

### Notes
[Any relevant decisions, risks, or context]

### Open Questions

| # | Question | Status | Decision |
|---|----------|--------|----------|
| 1 | [Question] | Open | — |
