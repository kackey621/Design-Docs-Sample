# Clean Architecture Design Document (Simple Version)

| Field | Value |
|-------|-------|
| **Module Name** | [Module / service name] |
| **Author** | [Author name] |
| **Date** | [YYYY-MM-DD] |
| **Status** | [Draft / In Review / Approved] |

---

## 1. Overview

### 1.1 Purpose
[What does this module do? Why does it exist?]

---

## 2. Entities (Domain Layer)

### 2.1 Entities

| Name | Key Attributes | Key Invariants |
|------|---------------|----------------|
| [Entity name] | [attr1, attr2] | [Business rule that must always be true] |

### 2.2 Value Objects

| Name | Description | Validation |
|------|-------------|-----------|
| [Value object name] | [Purpose] | [Constraints / rules] |

---

## 3. Use Cases (Application Layer)

| Use Case | Actor | Input | Output | Description |
|----------|-------|-------|--------|-------------|
| [UseCase name] | [Who triggers it] | [Input DTO] | [Output DTO] | [What it does] |

---

## 4. Adapters

| Type | Name | Port Interface | Implementation | Storage / External |
|------|------|---------------|----------------|-------------------|
| Controller | [Name] | — | [Class] | HTTP |
| Repository | [Name] | [IRepoPort] | [Class] | [DB] |
| Service | [Name] | [IServicePort] | [Class] | [External API] |

---

## 5. Notes & Open Questions

### Notes
[Directory structure, key decisions, dependency rules summary]

### Open Questions

| # | Question | Status | Decision |
|---|----------|--------|----------|
| 1 | [Question] | Open | — |
