---
title: "Production-Grade Agentic Framework"
date: 2026-02-23
status: reference
keywords: [agentic-engineering, production, reference-architecture, documentation-chain]
lastUpdated: 2026-02-23
---

# Production-Grade Agentic Framework

**Purpose:** Reference architecture that the CRE curriculum series builds toward. This document describes the full production stack for agentic systems. It is NOT taught directly at any single course level — instead, specific concepts are introduced at the appropriate level:

| Concept | 201 | 301 | 401+ |
|---------|-----|-----|------|
| OFD (Objective Function Document) | Embedded in PRD (3 fields) | Standalone with metric hierarchy | Full metric stack + cost budgets |
| Evals Spec / EDD | — | Evolution of TDD | CI/CD gating |
| Tool/Model Policy | Component selection awareness | Explicit policy document | Allowlists, sandboxing, routing |
| Output Contracts | — | Introduced | Full validation stack |
| Data Contracts | — | Part of DDD | Schema enforcement |
| Reference Architecture | — | — | Full implementation |
| Observability | — | — | Full implementation |
| Security/Compliance | — | — | Full implementation |
| Cost Engineering | — | Awareness-level | Full implementation |

---

## 0) System Definition

**Agentic system** = an orchestrated control loop that (1) observes inputs, (2) plans, (3) uses tools, (4) produces artifacts, (5) validates outputs, (6) escalates/abstains when needed, and (7) is continuously evaluated and monitored.

---

## 1) The Required Artifact Stack

### 1.1 PRD (Optional but common)

Purpose: intent, user experience, stakeholder alignment, rollout constraints.

### 1.2 OFD (Mandatory)

Purpose: scoreboard and guardrails.
Contents:

* Primary objective (maximize X)
* Metric hierarchy (north star, leading, quality, cost)
* Hard constraints (safety/legal/privacy/budget)
* Penalties (critical failures)
* Acceptance thresholds
* Abstain/escalate policy

### 1.3 Domain Data Dictionary + Data Contracts (Mandatory)

Purpose: semantic truth + enforcement.
Contents:

* Canonical field definitions, units, null semantics, ranges
* PII classification, retention
* Source-of-truth and lineage
* Schemas (JSON Schema / Protobuf / OpenAPI), validation rules
* Examples + counterexamples

### 1.4 ADR Log (Mandatory)

Purpose: irreversible memory for architecture.
Rules:

* Link every ADR to OFD metrics and eval impacts
* Include reversibility + rollback
* Include failure modes introduced

### 1.5 Evals Spec (Mandatory)

Purpose: formalize evaluation-driven development.
Contents:

* Task distribution + weighting
* Datasets (golden, adversarial, regression)
* Graders (human rubric, deterministic checks, model-judge policy if used)
* Thresholds + gating policy
* Versioning + anti-contamination rules

### 1.6 Tool Policy + Model Policy (Mandatory)

Purpose: define what the system is allowed to do.
Contents:

* Allowed tools, forbidden tools/actions
* Tool call limits, retry/timeouts, idempotency rules
* Model routing rules (cheap/default, escalate on complexity/uncertainty)
* Refusal rules and safety boundaries

### 1.7 Runbooks (Mandatory)

Purpose: operational control.
Contents:

* On-call procedures
* Incident severity definitions
* Rollback triggers
* Data exposure procedures
* Known failure modes + mitigations

---

## 2) Reference Architecture (Control Plane + Data Plane)

### 2.1 Control Plane (Orchestration)

Implement as a deterministic state machine/graph:

* Intake -> Normalize -> Retrieve -> Plan -> Act(tool calls) -> Synthesize -> Validate -> Deliver -> Log

Hard requirements:

* Bounded steps (no infinite loops)
* Budget enforcement (tokens/time/tool calls)
* Deterministic guardrails (validators, policy checks)

### 2.2 Data Plane (Knowledge and Memory)

* Retrieval layer (hybrid BM25 + embeddings + reranker when needed)
* Source-of-truth hierarchy (which sources outrank which)
* Caching layer (retrieval + tool results + partial generations where safe)
* Memory:
  * Session memory (ephemeral)
  * Long-term memory only with explicit policy, TTL, redaction, user consent rules
  * "Memory" must be auditable and deletable

---

## 3) Core Components You Actually Ship

### 3.1 Orchestrator

* Graph execution engine (LangGraph-style or custom)
* Step-level tracing
* Budget manager (token/time/tool-call ceilings)
* Retry controller (bounded, with backoff and circuit breakers)

### 3.2 Tooling Layer

* Strict tool interfaces (typed I/O)
* Tool sandboxing (network egress controls, allowlists)
* Idempotency keys for side-effecting actions
* Tool result validation (schema + plausibility checks)

### 3.3 Retrieval + Grounding

* Query rewriting
* Hybrid retrieval
* Reranking
* Citation extraction and enforcement (claims must map to sources)
* Contradiction handling (ranked sources + conflict report)

### 3.4 Output Contracts

* Output as structured artifacts first (JSON), then render to human text
* Contract validators (schema validation, unit validation, numeric sanity checks)
* Policy filters (PII redaction, forbidden content, compliance constraints)

### 3.5 Safety + Abstention

* "Abstain" as a first-class output
* Escalation triggers:
  * Low evidence density
  * Policy risk
  * High uncertainty + high-stakes domain
  * Contract violations that can't be repaired
* Human-in-the-loop queue with audit trails

---

## 4) Evaluation-Driven Development Pipeline (CI/CD)

### 4.1 Evals as Gates

Every change runs:

* Deterministic tests (unit/integration for code + tools)
* Contract tests (schema, units, invariants)
* Retrieval tests (known queries -> expected documents)
* Agent regression suite (task success + critical error rate + cost/latency)
* Adversarial suite (prompt injection, tool misuse, data exfil attempts)

### 4.2 Grading Strategy (Production-Grade)

Use a layered oracle:

1. Deterministic checks (schema, invariants, citations present, math verification)
2. Labeled gold answers where possible
3. Human rubric for ambiguous tasks
4. Model-judge only with:
   * calibration checks
   * disagreement sampling
   * periodic human audits
   * judge model version pinning

### 4.3 Thresholding

* Ship only if quality metrics improve or remain stable and critical failures do not increase
* Separate "critical" vs "non-critical" regressions
* Use statistical thresholds where variance exists (confidence intervals)

---

## 5) Observability and Operations

### 5.1 Tracing (Mandatory)

Log per step:

* Inputs (redacted)
* Retrieved sources and ranks
* Tool calls + results (redacted)
* Model outputs (redacted)
* Validation outcomes
* Budget consumption

### 5.2 Metrics (Mandatory)

Track:

* Task success rate (by task type)
* Critical error rate (hallucination, contract violation, policy violation)
* Abstention rate (and whether it correlates with correctness)
* Cost per task (tokens, tool calls, human minutes)
* Latency distribution (P50/P95/P99)
* Retrieval quality (hit rate, source diversity, citation coverage)
* Drift signals (input distribution shifts, rising uncertainty, rising abstention)

### 5.3 Incident Response

* Severity ladder
* Automatic kill-switches:
  * disable tools
  * force retrieval-only mode
  * force abstain on certain domains
  * route to human review
* Rollback:
  * model version rollback
  * prompt/config rollback
  * tool version rollback
  * retrieval index rollback

---

## 6) Security, Privacy, and Compliance

### 6.1 Data Handling

* PII classification in the data dictionary
* Redaction at ingress and egress
* Encryption at rest and in transit
* Retention/TTL policies per data class
* Audit logs for access and generation

### 6.2 Prompt Injection and Tool Exfil Defense

* Treat all external text as hostile
* Separate "instructions" from "data"
* Tool allowlists and egress restrictions
* Retrieval source allowlists for sensitive domains
* Never allow secrets in prompt context

### 6.3 Access Control

* Least privilege for tools
* Per-tenant isolation
* Signed tool calls (where feasible)
* Scoped API keys with rotation

---

## 7) Cost and Performance Engineering

### 7.1 Budget Architecture

* Hard ceilings per request
* Model routing:
  * small model for classification/routing
  * mid model for synthesis
  * large model only on escalation
* Caching:
  * retrieval cache
  * tool result cache
  * response cache only when safe and deterministic enough

### 7.2 Latency Controls

* Parallelize retrieval and non-dependent tool calls
* Streaming responses only after minimum validation gates
* Precompute embeddings and indexes

---

## 8) Governance and Change Management

### 8.1 Decision Discipline

* ADR required for:
  * new tools
  * new memory mechanisms
  * new source-of-truth classes
  * new judge/grader approach
  * policy boundary changes

### 8.2 Release Discipline

* Canary deploy
* Shadow mode evaluation (run agent without user impact, compare outputs)
* Progressive rollout tied to metric stability

### 8.3 Continuous Improvement

* Failure taxonomy with labels
* Active learning loop:
  * sample failures
  * label
  * add to regression set
  * retune policies/prompts/routers
  * re-run gates

---

## 9) Minimum Production Checklist (Non-Negotiable)

* OFD with explicit thresholds and cost budgets
* Evals suite gated in CI
* Data contracts + validators enforced at boundaries
* Tool policy with allowlists, limits, timeouts, idempotency
* Step-level tracing + redaction
* Incident kill-switch + rollback path
* Prompt injection defenses (instruction/data separation + tool sandbox)
* Canary/shadow deployment capability

---

## 10) Reference Implementation Shape (Concrete)

* Deterministic orchestrator (graph/state machine)
* Typed tool interfaces + schema validation
* Hybrid retrieval + reranker + source hierarchy
* Output-first JSON artifacts + renderers
* Validators and policy gates at every boundary
* Evals harness that runs on every change
* Observability stack with drift detection and kill-switches
