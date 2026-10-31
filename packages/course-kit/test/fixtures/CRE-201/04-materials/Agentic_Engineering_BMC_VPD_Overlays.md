# Consolidated Agentic Engineering Framework v2

Incorporates the **minimum relevant overlays** from Strategyzer’s other books as structural components (not extra lectures):

1. **Assumptions → Tests → Evidence** (Testing Business Ideas function)
2. **Explore/Exploit portfolio governance** (Invincible Company function, conditional but included as a thin layer)
3. **Team alignment primitives** (High-Impact Tools for Teams function, included only as the smallest set that prevents delivery failure)

This produces four canvases (Business/Engineering × BMC/VPD) plus three overlays that bind them into a decision system.

---

# Overlay 0 — The Binding Layer (must sit on top of all canvases)

## O0.1 Assumptions → Tests → Evidence (Non-optional)

Every seam “fit” and every economics claim is a hypothesis until tested.

### Assumption map types (apply everywhere)

* **Desirability**: users want this outcome enough to change behavior
* **Feasibility**: system can deliver within constraints (quality/latency/risk)
* **Viability**: unit economics work at expected usage
* **Trust/Compliance**: adoption is not blocked by verification burden or policy

### Evidence gates (minimum)

* Define **acceptance thresholds** before building
* Require **artifact evidence**: eval results, pilot metrics, cost/run measurements, approval-cycle metrics

### Placement (spatial)

* VPD seam = desirability + trust hypotheses
* Engineering VPD seam = feasibility hypotheses
* BMC bottom row = viability hypotheses
* Engineering BMC bottom row = runtime economics feasibility

---

## O0.2 Portfolio Lens (thin, included)

Only needed when there are multiple bets or a shared platform.

* **Explore**: prototypes, uncertain value, fast tests
* **Exploit**: hardening, scale, reliability, cost optimization

Placement:

* Business BMC top/center: where growth bets live (new segments, new VP, new pricing)
* Engineering BMC right/bottom: where hardening and operating discipline lives (eval gates, ops maturity, runtime economics ceilings)

---

## O0.3 Team Alignment Primitives (minimum viable set)

Use only what prevents repeated failures:

* Explicit **ownership** of each canvas block
* Explicit **decision rights** on autonomy/risk thresholds
* Explicit **handoff contract** for human review/escalation

Placement:

* Cross-layer bridge: Business trust mode ↔ Engineering guardrails/HITL
* Ops area: observability, incident response, release gating ownership

---

# Part I — Agentic Engineering BMC (paired, spatial)

## 1) Business Layer BMC (agentic-adapted, classic geometry)

### Spatial layout (standard BMC)

**Left (Production side)**

* Key Partners
* Key Activities
* Key Resources

**Center**

* Value Proposition (market promise)

**Right (Market side)**

* Customer Relationships (trust/autonomy model)
* Channels (interaction + integration)
* Customer Segments

**Bottom (Economics)**

* Cost Structure
* Revenue Streams

**Sidecar (required)**

* Key Risks / Assumptions (feeds O0.1)

### Agentic-specific field injections per block (minimal)

* Customer Relationships includes: autonomy mode, approval gates, auditability
* Cost Structure must include: failure/rework cost + cost of delay, not only tokens
* Key Activities must include: eval ops + monitoring + integration

### Adjacency rules (retain original causality)

* Partners touch Activities/Resources; all touch Cost Structure
* Value Proposition touches Activities/Resources and Relationships/Channels
* Relationships touch Channels (interface shapes trust)
* Segments touch Revenue Streams (pricing unit depends on buyer/user)

### O0.1 placement inside Business BMC

* Each block produces assumptions; highest-risk assumptions prioritized for tests
* Bottom row economics claims require evidence (pilot usage, WTP, churn signals)

---

## 2) Engineering Layer BMC (systems twin with adjacency)

### Spatial layout (systems geometry)

**Left (Capability substrate)**

* Tooling / Action Surface
* Data / Context / Memory / State
* Model + Prompt/Policy Stack

**Center-left (Execution engine)**

* Task Topology / Workflow Graph
* Agent Roles & Orchestration

**Center (Delivery contract)**

* Objective Function + Constraints

**Right (Assurance machinery)**

* Evaluation & Acceptance
* Observability & Operations
* Failure Modes & Recovery
* Guardrails / Security / Governance

**Bottom (Systems economics)**

* Runtime Economics (cost/latency/throughput/intervention)

### Core adjacency rules (the “touching boxes” logic)

* Substrate blocks must touch each other (tools/data/policies co-determine behavior)
* Substrate touches topology/orchestration (capabilities only matter through process)
* Objective touches evals, guardrails, runtime economics (constraints are enforced/measured here)
* Evals touch failure modes (taxonomy drives tests)
* Observability touches failure modes (detection)
* Guardrails touch tooling (permission boundary)
* Runtime economics touches everything upstream (all design choices cash out here)

### O0.1 placement inside Engineering BMC

* Objective function yields measurable acceptance criteria
* Runtime economics thresholds (cost/run, p95 latency, intervention rate) are explicit gates
* Evals are treated as experiments producing evidence

### O0.2 placement (portfolio lens)

* Explore: topology/orchestration changes, model routing experiments, narrow pilots
* Exploit: eval hardening, ops maturity, cost ceilings, governance tightening

### O0.3 placement (team alignment)

* Ownership of release gates, incident response, and autonomy decisions is explicit

---

## 3) Cross-layer BMC Trace Links (required)

* Business Value Proposition ↔ Engineering Objective Function + Constraints
* Business Customer Relationships ↔ Engineering Guardrails + HITL + Auditability
* Business Channels ↔ Engineering Triggers/Interfaces + Topology constraints
* Business Cost Structure ↔ Engineering Runtime Economics + failure/rework + intervention rate
* Business Key Risks/Assumptions ↔ Engineering Failure taxonomy + monitoring + contingency paths

These are not notes; they are mandatory links.

---

# Part II — Agentic Engineering VPD (paired, spatial)

## 4) Business Layer VPD (market/workflow fit)

### Spatial layout (classic VPD)

**Left (Customer Profile)**

* Customer Jobs
* Pains
* Gains

**Right (Value Map)**

* Products & Services
* Pain Relievers
* Gain Creators

**Seam (fit relationships)**

* Jobs ↔ Products/Services
* Pains ↔ Pain Relievers
* Gains ↔ Gain Creators

**Overlay strip (required for agentic)**

* Trust/Verification requirements
* Error severity class (L/M/H)
* Usage assumptions (frequency, stakes)
* Test plan hooks (feeds O0.1)

### Agentic constraints injected into Customer Jobs

Split jobs explicitly:

* Execution jobs
* Decision jobs
* Validation jobs
* Coordination jobs

Reason: agentic systems often help execution while worsening validation. This split prevents that.

### Adjacency rules (VPD logic)

* Jobs touch pains/gains (workflow creates both)
* Products touch pain relievers/gain creators (form determines whether relief is real)
* Pain relievers touch gain creators (tradeoffs; some create new pains)

### O0.1 placement inside Business VPD

Each seam statement is a hypothesis:

* “Reliever reduces pain” becomes a testable claim with an experiment and evidence gate
  Minimum experiments (examples by function, not by book list):
* Workflow pilot with before/after cycle time
* Blind review comparison for trust/quality
* Adoption friction tests (drop-off, time-to-first-value)

---

## 5) Engineering Layer VPD (delivery fit)

### Spatial layout (VPD-mirrored)

**Left (System Task Profile)**

* System Tasks
* Failure Pains
* Performance Gains Needed

**Right (System Delivery Map)**

* Capabilities / Components
* Failure Relievers
* Performance Creators

**Seam (delivery fit relationships)**

* Tasks ↔ Capabilities
* Failure pains ↔ Failure relievers
* Performance gains ↔ Performance creators

**Overlay strip (required)**

* Objective function + constraints
* Guardrail rules
* Eval acceptance criteria
* Runtime economics thresholds

### Adjacency rules

* System tasks touch failure pains (each task introduces failure modes)
* Failure relievers touch capabilities (control depends on architecture)
* Performance creators touch failure relievers (tradeoffs: speed vs safety vs cost)

### O0.1 placement inside Engineering VPD

Every performance claim is a hypothesis until measured:

* p95 latency
* cost/run
* calibration quality
* intervention rate
* false positive/negative rates
* citation coverage

Evidence comes from:

* offline evals + regression
* staged pilots with monitoring
* cost/latency instrumentation

---

## 6) Cross-layer VPD Trace Links (required)

* Customer Jobs → System Tasks
* Customer Pains → Failure Pains + performance targets
* Customer Gains → Performance Gains Needed
* Products/Services → Capabilities/components + autonomy mode
* Pain Relievers → Failure Relievers + verification UX mechanisms
* Gain Creators → Performance Creators + architecture optimizations
* Trust requirements → provenance/citations + confidence thresholds + HITL gates
* Error severity → autonomy limits + guardrail strictness

---

# Part III — Teaching / Operating Mode (embedded, not optional)

## Minimum operating loop (the framework’s “engine”)

1. Fill Business VPD + Engineering VPD
2. Extract top assumptions (O0.1), rank by risk
3. Run tests/evals/pilots to generate evidence
4. Update VPDs; only then stabilize into BMCs
5. Use Business BMC + Engineering BMC to scale with governance (O0.2)
6. Maintain ownership/decision rights (O0.3) for release gates and autonomy policy

This loop is the difference between a canvas exercise and an engineering discipline.

---

# Part IV — Where token cost and latency live (integrated)

* Business BMC Cost Structure includes:

  * tokens/inference + tool fees + compute
  * human ops/review
  * failure/rework
  * cost of delay (latency economics)
* Engineering BMC Runtime Economics includes:

  * per-stage token use, retries, cache hit rates
  * latency budgets (p50/p95), throughput, concurrency
  * intervention/escalation rates

Latency is treated as:

* Business: economic penalty and adoption risk
* Engineering: budgeted performance constraint

---

# Deliverable summary (what you now have)

1. **Agentic Business VPD** (spatial, with trust/severity/evidence hooks)
2. **Agentic Engineering VPD** (spatial, with objective/evals/economics gates)
3. **Agentic Business BMC** (classic spatial logic, agentic-adapted)
4. **Agentic Engineering BMC** (systems spatial logic)
5. Three overlays integrated as operating rules:

   * Assumptions→Tests→Evidence (non-optional)
   * Explore/Exploit portfolio lens (thin, conditional but present)
   * Team alignment primitives (minimal, ownership/decision rights/handoffs)
