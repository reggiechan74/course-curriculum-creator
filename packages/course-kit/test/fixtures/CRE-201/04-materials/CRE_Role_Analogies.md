---
title: "CRE Role-Specific AI Analogies"
date: 2026-02-09
version: 0.1.0
status: draft
documentType: Instructor Reference
keywords: [teaching-reference, metaphor-map, cre-parallels, role-specific, broker, property-manager, asset-manager, analyst]
lastUpdated: 2026-02-09
origin: Strategic review identified audience breadth as P0 issue — development lifecycle analogy skews toward developers/construction, leaving brokers, PMs, asset managers, and analysts without native reference points
---

# CRE Role-Specific AI Analogies

## Purpose

The core CRE Metaphor Map uses the **development lifecycle** (site selection to occupancy) as the primary analogy. This works well for participants with construction/development experience but doesn't resonate equally across all CRE roles.

This document provides **parallel lifecycle mappings for each CRE discipline** so the instructor can anchor concepts in whichever professional context a participant actually lives in. The underlying AI workflow process is identical — only the analogy changes.

**Teaching approach:** Present the development lifecycle as the primary mapping (it's the most complete), then show participants how their specific role follows the same pattern. The table in Section 1 is the money slide — it shows all roles at once, so every participant sees themselves.

---

## 1. The 8-Step Process Across CRE Roles

| Step | AI Workflow | Development | Investment Sales Broker | Leasing Broker | Property Manager | Asset Manager | Analyst |
|------|------------|-------------|------------------------|----------------|------------------|---------------|---------|
| **1. Discover** | Identify the problem, understand the domain | Site Selection / Market Research | Prospecting / Seller identification | Tenant requirements gathering / Space search | Building assessment / Tenant needs | Market research / Opportunity screening | Data gathering / Research brief |
| **2. Plan** | Define scope, requirements, success criteria | Feasibility Study / Pro Forma | BOV (Broker Opinion of Value) / Pricing strategy | Short list / Tour plan | Operating budget / Capital plan | Underwriting / Pro forma | Analysis framework / Assumptions |
| **3. Design** | Architect the solution conceptually | Schematic Design | Marketing strategy / OM outline | Proposal / RFP response | Service level agreements / Vendor specs | Business plan / Value-add strategy | Financial model design / Sensitivity structure |
| **4. Structure** | Detail the implementation — components, handoffs | Construction Documents | OM production / Data room setup | LOI / Lease term negotiation | Contracts / Lease administration setup | Capital stack / JV agreement / Legal docs | Model build / Data structuring |
| **5. Implement** | Build it — prompts, tools, workflows | Construction | Deal marketing / Buyer tours / Offer management | Lease drafting / Legal review / Landlord negotiation | Day-to-day operations / Work order execution | Business plan execution / CapEx deployment | Analysis execution / Data processing |
| **6. Validate** | Check outputs against requirements | Inspection / Code Compliance | Offer review / Terms verification | Landlord approval / Credit check | Compliance audit / Fire & safety inspection | Quarterly valuation / Performance vs. plan | Peer review / Assumption validation |
| **7. Test** | End-to-end stress testing | Commissioning / Punch List | Due diligence coordination / Condition satisfaction | Lease execution / Fixturing conditions | Tenant satisfaction survey / Performance review | Hold/sell analysis / Disposition readiness | Stress testing / Scenario analysis |
| **8. Document** | Record what was built for handoff | As-Built Drawings / O&M Manuals | Closing statement / Commission reconciliation / Post-mortem | Lease abstract / Occupancy handoff | Annual reporting / CAM reconciliation | Investor reporting / Exit documentation | Final report / Board memo |

**Teaching note:** Print this table as a handout. Ask participants to circle their row. That's their reference track for the rest of the course.

---

## 2. The Documentation Chain Across CRE Roles

The four-document planning chain maps to every CRE discipline — the artifact names change, the logic doesn't.

| Document | AI Workflow | Purpose | Development | Inv. Sales Broker | Leasing Broker | Property Manager | Asset Manager | Analyst |
|----------|-----------|---------|-------------|-------------------|----------------|------------------|---------------|---------|
| **PRD** | Product Requirements Document | What are we building and why? | Pro Forma / Development Brief | Listing Agreement / Client requirements | Tenant Requirements / Search Criteria | Management Agreement / Scope of Services | Investment Thesis / Acquisition Criteria | Research Brief / Analysis Request |
| **OFD** | Objective Function Document | What are we optimizing for? What can't we violate? | Investment Criteria / Return Targets | Pricing Floor / Deal Parameters | Occupancy Targets / Lease Economics | Service Level Agreements / Budget Limits | Hold/Sell Criteria / Return Thresholds | Accuracy Standards / Confidence Levels |
| **ADR** | Architecture Decision Record | What approach are we taking and why? | IC Memo / Go/No-Go Decision | Pricing Strategy / Comparable Analysis | Short List Rationale / Tour Debrief | Operating Budget / Capital Plan Rationale | Business Plan / Value-Add Strategy | Methodology / Assumptions Document |
| **DDD** | Domain Data Dictionary | How is the data/domain structured? | Rent Roll / Property Data Room | Data Room / OM Data Package | Lease Comp Database / Space Inventory | Tenant Ledger / Building Systems Inventory | Rent Roll / Property Data Room | Financial Model / Data Model |
| **TDD** | Test-Driven Development | How do we verify correctness? (binary) | Building Code Compliance / Unit Counts | Transaction Checklist / Closing Conditions | Lease Execution Checklist / Occupancy Conditions | Compliance Checklist / Inspection Standards | Hold/Sell Threshold Checks / Exit Triggers | QC Checklist / Data Validation Rules |
| **EDD** | Evaluation-Driven Development | How do we verify quality? (judgment) | Appraisal / Design Review | Pricing Opinion / Market Positioning | Tenant Fit Assessment / Space Quality | Service Quality Surveys / Tenant Satisfaction | Performance Attribution / Portfolio Review | Peer Review / Methodology Assessment |

**Teaching note:** The key insight is the same regardless of role — *define what you're optimizing for and what "done" looks like before you start building.* The OFD defines the scoreboard and guardrails (investment criteria); TDD/underwriting criteria define the acceptance test. Together they answer: "What are we trying to achieve?" and "Did we achieve it?" If you don't define either before you prompt AI, you have no way to evaluate whether the output is good.

---

## 3. The Holy Trinity Across CRE Roles

Three hats every professional wears — who defines the vision, who designs the approach, who executes?

| Role | Product Manager (What & Why) | Designer (How It Works) | Engineer (Build & Deliver) |
|------|------------------------------|------------------------|---------------------------|
| **Development** | Development / Asset Manager | Architect | General Contractor |
| **Inv. Sales Broker** | Managing Director / Rainmaker | Marketing / OM Designer | Transaction Coordinator |
| **Leasing Broker** | Listing Agent / Tenant Rep Lead | Space Planner / Proposal Designer | Deal Administrator / Lease Coordinator |
| **Property Manager** | Property Manager / Director | Building Engineer / Superintendent | Maintenance Team / Vendors |
| **Asset Manager** | Portfolio Manager | Asset Strategist / Analyst | Operations / Property Management |
| **Analyst** | Research Director / MD | Senior Analyst (model design) | Junior Analyst (execution) |

**Teaching note:** The point isn't that these map perfectly — it's that every participant already switches between these three hats daily. When you're deciding what AI should do, you're the PM. When you're designing the prompt structure, you're the architect. When you're running the workflow and troubleshooting, you're the GC.

---

## 4. The Four Pillars Across CRE Roles

What determines output quality — same four pillars, different artifacts.

| Pillar | AI Workflow | Development | Broker | Property Manager | Asset Manager | Analyst |
|--------|-----------|-------------|--------|------------------|---------------|---------|
| **Context** | Background information provided to AI | Due Diligence Package | Comparable sales / Market data / Property history | Lease files / Tenant history / Building condition reports | Rent roll / Operating history / Market studies | Raw data / Prior research / Market reports |
| **Model** | AI system selected | Building Type / Asset Class | Deal type (investment sale vs. user sale vs. land) | Property type (office vs. retail vs. industrial) | Investment strategy (core vs. value-add vs. opportunistic) | Analysis type (market study vs. appraisal vs. feasibility) |
| **Prompt** | Instructions given to AI | Design Brief / RFP | Client brief / Listing pitch / Offer terms | RFP to landlord / Tenant proposal | Management directive / Budget instruction | Research question / Analysis request |
| **Tools** | External capabilities AI can access | Trades & Equipment | CoStar / MLS / Argus / Marketing platforms | Lease admin software / Space planning tools | Yardi / MRI / Building automation systems | Argus / Excel / Bloomberg / CoStar |

**Teaching note:** The diagnostic framework is universal. When AI gives bad output, ask: Did I give it enough context? Did I pick the right model? Were my instructions clear? Does it have access to the tools it needs? Every CRE professional already troubleshoots this way — "the appraisal came back wrong because the appraiser didn't have the right comps (context), used the wrong methodology (model), misunderstood the scope (prompt), and didn't have access to our internal data (tools)."

---

## 5. The Diagnostic Framework — Universal

This works regardless of CRE role because the failure modes are the same.

| Bad AI Output Symptom | Pillar Failure | What Every CRE Professional Recognizes |
|----------------------|----------------|---------------------------------------|
| "It doesn't know what I'm talking about" | **Context** — insufficient background | Appraiser who didn't tour the property |
| "It can't handle this kind of task" | **Model** — wrong tool for the job | Hiring a residential agent for a $50M industrial portfolio |
| "It did something completely different from what I wanted" | **Prompt** — unclear instructions | Vague RFP that comes back with a proposal for the wrong building |
| "It can't access the data it needs" | **Tools** — missing integrations | Underwriting without rent rolls because the seller won't share |

---

## 6. Instructor Guidance

### When to Use Role-Specific Analogies

- **Module openers:** "Who in the room is a broker? Property manager? Asset manager? Let me show you how this maps to your specific workflow."
- **When someone is lost:** Pivot from the development lifecycle to their role. "Forget construction for a second — think about how you put together an OM. That's exactly what we're doing here."
- **During exercises:** Let participants choose their role-track for the hands-on work. A broker should design a workflow for deal marketing, not for construction management.
- **Capstone:** Participants build a workflow for their actual job, not a generic exercise. The role tables tell them which lifecycle to follow.

### Where the Analogies Break

Be honest about limits. Flag these proactively to maintain credibility:

| Analogy | Where It Breaks | How to Handle |
|---------|----------------|---------------|
| All roles → 8-Step Process | AI workflows iterate faster than any CRE process — you can run steps 5-7 in minutes, not months | "The steps are the same. The clock speed is different. That's the whole point." |
| Broker → Marketing as "Design" | Marketing is creative/persuasive; AI prompt design is structured/technical | "Both translate requirements into something a recipient can act on. The medium is different." |
| Property Manager → Operations as "Implement" | PM operations are ongoing; AI implementation has a defined endpoint | "Think of each workflow as one work order, not the whole year." |
| Analyst → Model as "Design" | Financial models and AI workflow design have different validation methods | "Both require architectural decisions before you start building. The testing is different." |
| DDD → Rent Roll/Data Room | DDD is about domain boundaries and relationships, not just data | "The rent roll is the closest CRE artifact — it defines entities (tenants), relationships (lease terms), and boundaries (the property). That's domain modeling." |

### Pre-Course Survey Questions (Recommended)

To determine which analogies each participant needs:

1. What is your primary CRE role? (Broker / Property Manager / Asset Manager / Analyst / Developer / Other)
2. Have you ever managed or been involved in a construction/development project? (Y/N)
3. What CRE task do you spend the most time on each week? (Free text)
4. What's a deliverable you produce regularly that you wish took less time? (Free text)

Questions 3 and 4 determine the capstone exercise. Questions 1 and 2 determine which analogy track to emphasize.
