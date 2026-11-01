---
title: "CRE Metaphor Map — Agentic Engineering Through Real Estate Parallels"
date: 2026-02-06
version: 0.1.0
status: draft
documentType: Instructor Reference
keywords: [teaching-reference, metaphor-map, cre-parallels, agentic-engineering]
lastUpdated: 2026-02-23
revisionNote: "Component update (2026-02-23): Reduced Claude Code components from 5 to 4 — dropped Tools/Scripts, renamed Commands to Slash Commands, reframed Plugins as 'the project itself' (self-contained distributable package). Updated Section 5 table, teaching note, discussion prompt, quick reference, and capstone reference. Plugin is now capstone target. Prior: OFD-first reframe (2026-02-23). Prior: Incorporated pedagogical review (2026-02-09). Reworked DDD→Rent Roll/Data Room."
---

# CRE Metaphor Map

## Agentic Engineering Through Real Estate Parallels

**Purpose:** Instructor reference for anchoring agentic engineering concepts in the professional language CRE participants already think in. Use these mappings throughout the course to make abstract AI concepts concrete and immediately intuitive.

**Core Teaching Premise:**

> "You already know how to do agentic engineering. You do it every time you take a project from site selection to occupancy. This course teaches you to apply that same process to AI."

---

## 1. The Holy Trinity

The three roles every agentic engineer plays — and the three hats every small developer already wears.

| Agentic Role | CRE Parallel | What They Do |
|---|---|---|
| **Product Manager** | Development / Asset Manager | Defines *what* gets built and *why* — the business case, target market, pro forma, success criteria. Owns the vision and the economics. |
| **Designer** | Architect | Designs *how it works* — the user experience, spatial flow, form meeting function. Translates requirements into a blueprint. |
| **Engineer** | General Contractor | Executes the build — manages technical implementation, coordinates trades, solves on-site problems, delivers the finished product. |

**Teaching Note:**

The small developer who acts as their own PM, hires the architect, and GCs the project is the perfect analogy for the CRE professional doing agentic engineering. They don't need to be expert in all three roles — they need to know enough to manage each one effectively.

**Discussion Prompt:**

"Think about the last deal or project you managed. When were you acting as the PM (defining what and why)? When were you the architect (designing the approach)? When were you the GC (executing and troubleshooting)?"

**Where the analogy breaks:**
- A Development Manager role includes user research, backlog prioritization, and stakeholder management that goes beyond a PM's scope. The mapping works at the level of "defines what and why" — sufficient for a 200-level course.
- In CRE, you wear these hats over weeks or months. In agentic engineering, you switch hats within minutes during a single session. The speed of role-switching is genuinely new.
- The assumption that all CRE professionals have construction/development experience is embedded in this mapping. For participants without that background, see `CRE_Role_Analogies.md` for role-specific Holy Trinity mappings (brokers, PMs, asset managers, analysts).

---

## 2. The 8-Step Process → Development Lifecycle

The agentic engineering process maps almost 1:1 to the real estate development lifecycle every participant has lived through.

| Step | Agentic Engineering | CRE Equivalent | Key Parallel |
|---|---|---|---|
| **1. Discover** | Identify the problem/opportunity, understand the domain | Site Selection / Market Research | What's the opportunity? What does the market need? What are the constraints before we even start? |
| **2. Plan** | Define scope, requirements, success criteria | Feasibility Study / Pro Forma | Is this viable? What are the economics? What are the deal-breakers? |
| **3. Design** | Architect the solution at a conceptual level | Schematic Design (SD) | What does the solution look like? How do the pieces fit together? Not yet detailed — just the concept. |
| **4. Structure** | Detail the implementation — components, data flow, handoffs | Construction Documents (CD) | Detailed specs and drawings. Exactly how it will be built. Enough detail for someone else to execute. |
| **5. Implement** | Build the workflow, write the prompts, configure the tools | Construction | Build it. Coordinate the trades. Solve problems as they arise. |
| **6. Validate & QA** | Check outputs against requirements and standards | Building Inspection / Code Compliance | Does it meet standards? Will the inspector pass it? Are there code violations? |
| **7. Test** | Run end-to-end, stress-test edge cases | Commissioning / Punch List | Does everything actually work when you turn it on? Hot water runs hot? HVAC balances? Punch list items caught? |
| **8. Document** | Record what was built for maintenance and handoff | As-Built Drawings / O&M Manuals | Record what was actually built (not just what was planned). Enable others to operate and maintain it. |

**Teaching Note:**

This is the strongest metaphor thread in the course. Introduce it in Module 1 and reference it throughout. When participants get lost in agentic engineering abstraction, bring them back: "Where are you in the development lifecycle right now?"

**Key Insight to Surface:**

Just as skipping SD and going straight to construction produces expensive rework, skipping Discover/Plan/Design and jumping straight to prompting produces garbage output. The 8-step process exists because front-end thinking prevents back-end waste.

**Discussion Prompt:**

"Has anyone ever seen a project where construction started before design was finished? What happened? That's exactly what happens when you open ChatGPT and start typing without a plan."

**Where the analogy breaks:**
- AI workflows iterate orders of magnitude faster than CRE development. You can cycle through steps 5-7 (Implement → Validate → Test) in minutes, not months. The steps are the same. The clock speed is different. That's the whole point.
- The 8-Step Process is more fluid in practice than the development lifecycle. In CRE, going back from Construction to Schematic Design is a major change order. In AI, going back from Implement to Design is a 5-minute pivot. The iteration cost is near-zero, which changes how you plan.

---

## 3. The Four Pillars

The four factors that determine the quality of any AI output — mapped to the four things that determine the quality of any construction project.

| Pillar | Agentic Engineering | CRE Equivalent | Key Parallel |
|---|---|---|---|
| **Context** | Background information, constraints, domain knowledge provided to the AI | Due Diligence Package | Everything you gather before making a decision — zoning, title, environmental, survey, market data, tenant history. Bad due diligence = bad decisions. Bad context = bad AI output. |
| **Model** | The AI system selected (Claude, GPT-4, etc.) — its capabilities and limitations | Building Type / Asset Class | Office vs. industrial vs. retail determines what's structurally possible, what the market expects, what code requires. You pick the asset class for the market. You pick the model for the task. |
| **Prompt** | The specific instructions given to the AI | Design Brief / RFP | The requirements you hand to the architect or contractor — what you want, how you want it, what "done" looks like. A vague RFP gets a vague response. |
| **Tools** | External capabilities the AI can access (APIs, databases, functions) | Trades & Equipment | Electrical, mechanical, plumbing, structural steel, cranes, excavators. Each trade/tool has specific capabilities. You select the right ones for the scope of work. |

**Teaching Note:**

The Context pillar resonates most strongly with CRE professionals. They know viscerally that skipping due diligence kills deals. Use this: "You would never close on a property without a Phase I environmental. Why would you ask AI to analyze a lease without giving it the lease terms, tenant history, and market context?"

**Diagnostic Framework:**

When AI output is wrong, one or more pillars are misconfigured. Teach participants to ask:

| Bad Output Symptom | Likely Pillar Failure | CRE Analogy |
|---|---|---|
| "It doesn't know what I'm talking about" | **Context** — insufficient background | Contractor didn't get the site survey |
| "It can't handle this kind of task" | **Model** — wrong model for the job | Trying to build a 40-story tower on a single-family zoned lot |
| "It did something completely different from what I wanted" | **Prompt** — unclear or ambiguous instructions | Vague RFP got a vague proposal |
| "It can't access the data it needs" | **Tools** — missing integrations | No electrician on a project that needs electrical work |

**Discussion Prompt:**

"Think about the last time a contractor or consultant delivered something disappointing. Which of these four things was actually the problem — did they lack context, were they the wrong firm for the job, were your instructions unclear, or did they not have the right resources?"

**Where the analogy breaks:**
- The **Prompt** pillar is the weakest mapping. Context → Due Diligence, Model → Consultant Selection, Tools → Trades all have strong structural parallels. But structured prompt design — crafting system instructions, constraints, output formatting, and behavioral guardrails for AI — has no clean CRE equivalent. A Design Brief/RFP is the closest, but prompt engineering is a more iterative, technical craft. This pillar is where participants are learning something genuinely new.
- The pillars interact differently than their CRE equivalents. In construction, you can have excellent context (due diligence) but still fail on tools (wrong trade). In AI, the pillars are more tightly coupled — bad context corrupts prompt effectiveness, and model selection constrains available tools. The diagnostic framework works, but the pillar interactions are more fluid.

---

## 4. The Six Management Skills (Embedded, Not Standalone)

The management competencies that make agentic engineering work — each one already practiced daily in CRE.

**Curriculum note (v0.2.0):** These six skills are embedded across the learning objectives where they naturally develop — not taught as a standalone sixth framework. This reduces cognitive load by eliminating a separate nomenclature layer. Context Assembly emerges from Objective 5, Task Decomposition from Objective 4, Quality Judgment and Iterative Refinement from Objective 8, Frontier Recognition from Objective 7, and Workflow Integration from the Capstone (Objective 9). The instructor reference material below remains useful for recognizing and reinforcing these skills as they appear, but they should not be introduced as "The Six Management Skills" — let them emerge naturally.

### 4.1 Context Assembly → Due Diligence / Site Analysis

| Agentic Engineering | CRE Parallel |
|---|---|
| Gathering everything the AI needs to produce quality output — background, constraints, examples, success criteria, domain knowledge | Assembling the due diligence package — title search, environmental reports, zoning analysis, survey, market comps, tenant financials |

**Teaching Point:** "Context assembly for AI is due diligence for decisions. The more thorough your package, the better the outcome. Garbage in, garbage out — you've said this about data your whole career."

### 4.2 Task Decomposition → Work Breakdown Structure / Trade Scheduling

| Agentic Engineering | CRE Parallel |
|---|---|
| Breaking a complex workflow into discrete, delegable units with clear handoff points and human checkpoints | Breaking a construction project into scopes of work — demolition, structural, mechanical, electrical, finishing — each assigned to a specialist trade |

**Teaching Point:** "You don't hand the GC a single instruction that says 'build the building.' You break it into scopes, sequence them, and define handoffs. Same principle — you don't give AI one massive prompt. You decompose the task."

### 4.3 Quality Judgment → Property Inspection / Appraisal

| Agentic Engineering | CRE Parallel |
|---|---|
| Evaluating whether AI output meets professional standards — accuracy, completeness, tone, usability | Inspecting a property or appraising a valuation — does it meet code? Are the comps appropriate? Would you sign your name to this report? |

**Teaching Point:** "You review an appraisal before you act on it. You walk a property before you close. Apply the same rigor to AI output. The question is always: would you put your name on this?"

### 4.4 Iterative Refinement → Design Development / Value Engineering

| Agentic Engineering | CRE Parallel |
|---|---|
| Refining AI output through multiple review-feedback cycles until it meets standards | The SD → DD → CD progression, or value engineering to hit budget while preserving function. Each round gets closer to the final product. |

**Teaching Point:** "No building goes from napkin sketch to construction documents in one step. Design development exists because refinement produces quality. AI works the same way — your first output is the schematic. Iterate to construction documents."

### 4.5 Workflow Integration → Critical Path Method / Project Scheduling

| Agentic Engineering | CRE Parallel |
|---|---|
| Coordinating multiple AI tasks in sequence and parallel, managing dependencies and handoffs | The project schedule — you can't drywall before framing, you can't frame before foundation, but you can run electrical and plumbing in parallel. Critical path determines what blocks what. |

**Teaching Point:** "You already manage project schedules with parallel and sequential dependencies. Agentic workflows have the same structure — some steps depend on previous outputs, others can run simultaneously. You're building a project schedule for AI."

### 4.6 Frontier Recognition → Highest & Best Use / Feasibility Analysis

| Agentic Engineering | CRE Parallel |
|---|---|
| Knowing where AI capability ends and human judgment begins — what to automate vs. what requires professional expertise | Knowing what's possible on a given site — zoning won't allow it, soil can't support it, market won't absorb it. Highest and best use is about recognizing what's feasible, not just what's desirable. |

**Teaching Point:** "A good developer doesn't try to build a 50-story tower on a site zoned for 6 stories. Frontier recognition in AI is the same skill — knowing the limits of what the tool can do so you don't waste time or create risk by pushing past them."

---

## 5. Claude Code Components

The building blocks of Claude Code — mapped to the people and resources on a construction project.

| Component | CRE Equivalent | What It Does | When You Use It |
|---|---|---|---|
| **Agents** | Subcontractors / Trade Specialists | Autonomous workers who handle a defined scope — the plumber, electrician, roofer. They work independently within their trade. | When you need a specialist to handle a specific scope of work autonomously |
| **Skills** | Standard Details / Spec Sections | Reusable knowledge and procedures — "how to waterproof a below-grade wall" or "standard fire separation assembly." Documented expertise that can be applied repeatedly. | When you have recurring tasks that follow a consistent procedure |
| **Slash Commands** | Work Orders | User-invocable shortcuts that trigger skills — a single instruction that kicks off a defined scope of work. "/inspect-unit" fires the inspection skill the way a work order dispatches a trade. | When you need to invoke a capability with a single command |
| **Plugins** | The Project Itself | The self-contained, distributable package — the complete construction project with its trades, specs, and procedures bundled together. A plugin packages agents, skills, and slash commands into one deliverable that others can install and use. | When you want to package multiple capabilities into a single distributable unit |

**Teaching Note:**

Don't over-teach the technical details of these components. The goal is recognition and appropriate selection — "I need a subcontractor for this" vs. "I need a work order for this" — not deep implementation knowledge. That's the 301/401 courses. The plugin concept matters most as the capstone target: participants will package their capstone workflow as a self-contained Claude Code plugin.

**Discussion Prompt:**

"On a construction project, how do you decide when to use your own crew vs. hiring a sub? That same judgment applies to Claude Code — when do you prompt directly vs. use an agent vs. invoke a skill? And when do you package multiple capabilities into a single plugin — the way a GC packages trades, specs, and schedules into a single deliverable project?"

---

## 6. The Documentation Chain — OFD, PRD, ADR, DDD, TDD

Engineering documents that form a sequential chain — each one reducing ambiguity for the next. The OFD anchors the entire chain: it defines what success looks like before any other document is written. CRE professionals already produce these documents under different names. They just don't realize they're doing software engineering.

**The Chain (201 level — OFD taught first, embedded in PRD):**

```
OFD/PRD → ADR → DDD → TDD → Implementation
   ↓        ↓       ↓       ↓       ↓
 Optimize  Which    How    Done?   Build
 for what  & Why   (shared  (pass/   it
 + What    this    lang)   fail)
 & Why     way
```

**The Chain (301 level — OFD separates into standalone):**

```
OFD → PRD → ADR → DDD → TDD + Evals Spec → Implementation
 ↓      ↓      ↓      ↓          ↓               ↓
Score- What   Which   How       Done?           Build
board  & Why  & Why  (shared   (pass/fail       it
+ guard       this   lang)    + quality
rails         way             thresholds)
```

**CRE Translation:**

```
Investment Criteria → Pro Forma → IC Memo → Rent Roll/Data Room → Underwriting → Construction
         ↓                ↓          ↓              ↓                  ↓              ↓
  "What does a good   "What are  "Why this   "What are the        "What must     "Build
   deal look like?"   we doing?"  approach?"  entities &            the numbers    it."
  "What are the       "Does it               relationships?"       look like?"
   dealbreakers?"      pencil?"
```

**Teaching Point:** "Each document narrows the solution space. The OFD defines what you're optimizing for and where the guardrails are — it grounds the entire chain. The PRD says what to build, serving the objectives the OFD established. The ADR says how to approach it. The DDD maps the domain. The TDD defines what passing looks like. By the time you start building, most of the decisions are already made — and that's exactly where AI performs best: in a highly constrained, well-defined space."

**CRE Parallel:** "Your investment criteria (OFD) determine whether your underwriting process (PRD-driven workflow) converges on a good deal or wanders through bad ones. You define your criteria before you evaluate the opportunity — not after you've already fallen in love with the deal."

---

### 6.1 PRD (Product Requirements Document) → Development Pro Forma / Business Plan

| Agentic Engineering | CRE Equivalent |
|---|---|
| Define the problem space before making any design or implementation decisions. Cover target users, goals, functional requirements, non-functional requirements, success metrics, and constraints. Deliberately technology-agnostic — it should read the same regardless of which AI model or tool you use. | The development pro forma or business plan that scopes a project before a single dollar is spent. Who is the target tenant? What are the market requirements? What are the financial constraints? What does success look like? You don't pick the architect before you know what you're building. |

**The Core Principle:** Scope before solution. Requirements before architecture. Business case before tools.

**Teaching Point:** "You wouldn't break ground without a pro forma. The pro forma defines what you're building, who it's for, what it costs, and what 'success' looks like in dollar terms. A PRD is the same thing for an agentic workflow. It defines the problem, the users, the requirements, and the constraints — before you touch any tools. If you skip it, the AI makes every scoping decision for you. And those decisions compound."

**PRD Template (CRE Language):**

*Teaching Note: The OFD fields are completed first. Participants define what success looks like before they define what to build.*

```
WORKFLOW REQUIREMENTS: [Name]

OBJECTIVE FUNCTION (OFD — embedded at 201):
- Primary objective: What are we optimizing for?
  (CRE: "What's the target return on this deal?")
- Hard constraints: What can't be violated?
  (CRE: "What are the dealbreakers in underwriting?")
- Escalation triggers: When should the AI stop and hand off to you?
  (CRE: "When do you call the principal instead of making the call yourself?")

PROBLEM:
What business problem are we solving? Why now?

USERS:
Who will use this workflow? What do they need?

REQUIREMENTS:
- [Must have]: Critical functionality
- [Should have]: Important but not blocking
- [Nice to have]: Future consideration

CONSTRAINTS:
- Budget/time limits
- Data availability
- Compliance/regulatory
- Integration requirements

SUCCESS METRICS:
- [Metric 1]: How will we measure success?
- [Metric 2]: What does "good enough" look like?

OUT OF SCOPE:
- What this workflow will NOT do (equally important)
```

**CRE Examples That Reinforce:**
- **Development proposal:** Scopes the project for the investment committee before design begins
- **Lease strategy memo:** Defines target tenant profile, rate expectations, and deal parameters before marketing
- **Capital project request:** Scopes the renovation before engaging contractors

**Discussion Prompt:** "When you start a new deal, what's the first document you produce? It's not the floor plan. It's the business case. A PRD is the business case for your agentic workflow."

---

### 6.1b OFD (Objective Function Document) → Investment Criteria / Underwriting Parameters

*[Added v0.2.1, updated v0.3.0 — The OFD is the primary concept; at the 201 level it is embedded in the PRD as three fields (the PRD is the container). At the 301 level, the OFD separates into a standalone document with a full metric hierarchy, acceptance thresholds, and abstain/escalate policy.]*

| Agentic Engineering | CRE Equivalent |
|---|---|
| Define the optimization target, hard constraints, and escalation boundaries before building anything. The OFD is the "scoreboard and guardrails" — it tells the system what to maximize, what it can't violate, and when it must stop and escalate to a human. Without it, the system has no way to judge its own output against your intent. | Investment criteria define what a good deal looks like before you evaluate any deal. Target cap rate, minimum return threshold, tenant quality floor, maximum leverage — these are the guardrails. Dealbreakers are hard constraints. And every junior analyst knows: when the deal looks weird, you don't close it yourself — you call the principal. That's the escalation trigger. |

**The Core Principle:** Define what "good" means before you start building. Define what "unacceptable" means. Define when to stop.

**Teaching Point:** "The OFD grounds the entire chain. In iterative AI development, the quality of your objective function determines the quality of your iterative convergence. A strong OFD produces iterations that converge; a weak one produces iterations that wander. You'd never evaluate a deal without investment criteria. You'd never let a junior analyst close a $10M acquisition without escalation thresholds. The OFD is the same discipline for AI: what are we optimizing for, what's off limits, and when does the system stop and ask a human? Without it, the AI fills in those decisions for you — and you won't notice until the output is wrong."

**201 Level (embedded in PRD):**
Participants write three fields as part of their PRD:
1. **Primary objective** — "What does success look like for this workflow?"
2. **Hard constraints** — "What can't be violated?"
3. **Escalation triggers** — "When should the AI stop and hand off to you?"

**301 Level (standalone OFD) adds:**
- Metric hierarchy (north star, leading, quality, cost metrics)
- Acceptance thresholds (quantified pass/fail)
- Penalties (critical failure definitions)
- Full abstain/escalate policy

**Where the analogy holds:** Investment criteria and the OFD serve the same structural purpose — they define the decision boundary before decisions are made. Both prevent "falling in love with the deal" (or the output) by establishing objective evaluation standards upfront.

**Where the analogy breaks:** An OFD in production systems includes quantified metrics, cost budgets, and statistical thresholds that go beyond what CRE investment criteria typically formalize. At the 201 level, the three-field version captures the intent without the quantification.

---

### 6.2 ADR (Architectural Decision Record) → Investment Committee Memo

*[Unchanged from previous version — the IC Memo mapping remains correct]*

| Agentic Engineering | CRE Equivalent |
|---|---|
| Document key design decisions with context, alternatives considered, rationale for the choice, and consequences. Creates a permanent record of *why* the workflow was built this way. | The IC memo captures the deal thesis, alternatives evaluated, risks identified, and the rationale for the investment recommendation. When someone asks "why did we do this?" — the IC memo has the answer. |

**Sequence Note:** The ADR takes the OFD/PRD as input. The OFD says "we're optimizing for tenant retention rate with a hard constraint on response time." The PRD says "we need a lease renewal workflow that handles 200 tenants." The ADR says "we chose to use Claude Code agents for initial drafting and human review for final approval, because [rationale], rather than [alternative A] or [alternative B]."

---

### 6.3 DDD (Domain Data Dictionary) → Rent Roll / Property Data Room

*[Revised v0.2.0 — Reworked from Offering Memorandum to Rent Roll/Data Room per pedagogical review. The OM is a narrative marketing document; a DDD is a structured domain model. The Rent Roll/Data Room mapping is structurally closer: both define entities, relationships, and boundaries in a structured format.]*

| Agentic Engineering | CRE Equivalent |
|---|---|
| Model the problem space before building — identify all entities (objects), their relationships, rules that govern them, and the domain-specific language. Creates the shared understanding that the AI system needs to operate correctly. | The Rent Roll (or Property Data Room) is the structured domain model for a property. It defines every entity that matters — tenants, suites, lease terms, rent steps, options — and how they relate to each other. It's not a narrative. It's a structured dataset that defines the entities and relationships of the property. You can't underwrite, manage, or sell without it. |

**Why Rent Roll/Data Room, not Offering Memorandum:** An OM is a narrative marketing document — its purpose is disclosure and persuasion. A DDD is a structured technical artifact that models entities, relationships, and bounded contexts. The rent roll is structurally closer: it defines entities (tenants), attributes (rent, term, suite), relationships (tenant → lease → suite), and rules (escalation schedules, option dates). When the DDD says "a *Lease* has a *Tenant*, a *Suite*, a *Term*, and *Rent Steps*" — that's exactly what a rent roll models. The data room extends this: it's the comprehensive, structured collection of property data organized by domain (financial, physical, legal, environmental). Both are structured domain models, not narratives.

**Sequence Note:** The DDD takes the OFD/PRD and ADRs as input. The OFD defines what we're optimizing for. The PRD defines what we're building. The ADRs define the approach. The DDD maps the domain so thoroughly that the implementation language is unambiguous. When the DDD says "a *Lease* has a *Tenant*, a *Suite*, a *Term*, and *Rent Steps*" — that language appears verbatim in the workflow. No translation gaps.

**Bounded Contexts — A Powerful CRE Concept:**

DDD's concept of bounded contexts maps naturally to CRE operations. Each context has its own entities, rules, and language:

| Bounded Context | Key Entities | CRE Parallel |
|---|---|---|
| Lease Administration | Lease, Tenant, Suite, Term, Rent Steps, Options | Rent Roll |
| Property Valuation | Comparable, Adjustment, Cap Rate, NOI | Appraisal |
| Tenant Relations | Inquiry, Tour, Proposal, Negotiation | Leasing Pipeline |
| Capital Planning | System, Component, Condition, Replacement Cost | Capital Reserve Study |
| Asset Reporting | Period, Budget, Actual, Variance | Monthly Operating Report |

**Teaching Point:** "Each bounded context is like a different department in your building — they share the same physical address but operate with different terminology, rules, and stakeholders. Your lease admin team and your capital planning team both talk about 'the building,' but they mean different things. DDD makes those boundaries explicit so the AI doesn't confuse one context for another."

**Where the analogy breaks:** A DDD is about modeling the problem domain's *structure* so that implementation language is unambiguous. A rent roll models property entities and relationships. The structural parallel holds well. Where it weakens: a DDD also includes business rules, invariants, and bounded context boundaries that go beyond what a rent roll captures. The data room mapping is broader — it encompasses the full domain — but a data room is a collection of documents, not a single structured model. The honest framing: "The rent roll is the closest CRE artifact. It defines entities, relationships, and boundaries. That's domain modeling."

---

### 6.4 TDD (Test-Driven Development) → Building Inspection / Underwriting

| Agentic Engineering | CRE Equivalent |
|---|---|
| Define what "passing" looks like before you build anything. Write acceptance criteria first, then build the workflow to satisfy them. If the output doesn't pass the tests, it's not done. | Underwrite the deal before you acquire. Model the expected performance (the pro forma) before you commit capital. If the numbers don't pencil on paper, you don't proceed to closing. |

**The Core Principle:** Tests before code. Pro forma before acquisition. Acceptance criteria before prompting.

**Teaching Point:** "You would never buy a building without underwriting it first. The pro forma IS your test — it defines what 'success' looks like before you spend a dollar. TDD is the same principle applied to AI workflows. Define what 'good output' looks like before you start building. If you can't describe what passing looks like, you can't evaluate what the AI gives you."

**Two kinds of acceptance criteria (TDD vs. EDD):**

Not all tests work the same way. CRE professionals already know this intuitively:

| | TDD (Deterministic) | EDD (Evaluation-Driven Development) |
|---|---|---|
| **What it tests** | Did the machinery work correctly? | Did the behavior produce a good result? |
| **Pass/fail** | Binary — yes or no | Threshold-based — good enough or not |
| **CRE parallel** | **Building inspection** — the wiring meets code or it doesn't | **Appraisal** — the value is a range, subject to methodology and professional judgment |
| **Examples** | "The lease abstract includes all critical dates" | "The market analysis captures the key trends" |
| | "The rent roll totals match the GL" | "The tenant communication is professional and accurate" |
| | "All 47 tenants are listed" | "The investment memo is persuasive and well-supported" |

**Teaching Point:** "Some of your acceptance criteria are building inspections — binary pass/fail. The data is either right or wrong. Some are appraisals — you're evaluating quality against a rubric, and reasonable professionals might disagree on the margin. Both are valid. At this level, the discipline is the same: define what 'good' looks like before the AI produces anything. At the 301 level, you'll learn why the distinction matters operationally — deterministic checks run automatically, but judgment-based evaluation needs a different kind of harness."

**At 301, TDD splits into two artifacts:**
- **TDD** remains for deterministic components (parsers, validators, schema checks, data transforms)
- **Evals Spec** formalizes evaluation-driven development for probabilistic/agentic components (prompt quality, task success rates, hallucination rates) — with datasets, rubrics, graders, thresholds, and regression policies

**CRE Examples That Reinforce:**
- **Building inspection (TDD):** Code compliance is binary — the sprinkler system either meets NFPA standards or it doesn't. No range. No judgment call.
- **Appraisal (EDD):** A property valuation is a professional opinion supported by methodology. Two qualified appraisers can reach different values and both be "correct" within an acceptable range.
- **Lease negotiation (both):** Your minimum rent is a hard constraint (TDD — meets threshold or doesn't). Whether the overall deal terms are "good" is judgment-based (EDD — evaluated against your criteria but with room for professional interpretation).
- **Due diligence (both):** The checklist items are binary (TDD — document received or not). The assessment of risk is judgment-based (EDD — how concerning is this environmental report?).

**Discussion Prompt:** "What's your underwriting process? When do you define your go/no-go criteria — before or after you fall in love with the deal? And which of those criteria are binary inspections vs. judgment calls? The best investors know the difference. So do the best agentic engineers."

---

### 6.2 ADR (Architectural Decision Record) → Investment Committee Memo

| Agentic Engineering | CRE Equivalent |
|---|---|
| Document key design decisions with context, alternatives considered, rationale for the choice, and consequences. Creates a permanent record of *why* the workflow was built this way. | The IC memo captures the deal thesis, alternatives evaluated, risks identified, and the rationale for the investment recommendation. When someone asks "why did we do this?" — the IC memo has the answer. |

**The Core Principle:** Decisions decay in memory. Write them down with the reasoning, not just the conclusion.

**Teaching Point:** "Every investment committee requires a memo — not because they don't trust you, but because decisions need traceable rationale. Six months from now, when your agentic workflow needs updating, you'll ask 'why did I design it this way?' An ADR is your IC memo for AI workflows. It captures what you decided, what you considered, and why you chose this path."

**ADR Template (CRE Language):**

```
DECISION RECORD: [What was decided]

CONTEXT:
What problem were we solving? What constraints existed?

OPTIONS CONSIDERED:
1. [Option A] — Pros / Cons
2. [Option B] — Pros / Cons
3. [Option C] — Pros / Cons

DECISION:
[Which option was selected]

RATIONALE:
[Why this option over the others]

CONSEQUENCES:
[What this decision enables or constrains going forward]
```

**CRE Examples That Reinforce:**
- **Disposition vs. hold analysis:** Documented rationale for why the asset was sold or retained
- **Vendor selection:** Why this property manager over the other three who bid
- **Zoning application:** The planning rationale submitted to the municipality

**Discussion Prompt:** "Think about a decision you made on a deal two years ago. Can you remember *why* you made it? If not, an ADR would have saved you. Your future self will thank you."

---

### 6.3 DDD (Domain Data Dictionary) → Rent Roll / Property Data Room

| Agentic Engineering | CRE Equivalent |
|---|---|
| Model the problem space before building — identify all entities (objects), their relationships, rules that govern them, and the domain-specific language. Creates the shared understanding that the AI system needs to operate correctly. | The Rent Roll (or Property Data Room) is the structured domain model for a property. It defines every entity that matters — tenants, suites, lease terms, rent steps, options — and how they relate to each other. You can't underwrite, manage, or sell without it. |

**The Core Principle:** You can't engineer what you don't understand. Map the domain first.

**Teaching Point:** "A rent roll is a domain design document for a property's income. It captures every entity that matters — the tenants, the suites, the lease terms, the rent steps — and how they relate to each other. Before you can build an agentic workflow for lease administration, you need the same kind of map: What are the entities? What are the relationships? What are the rules? If you skip the domain model, the AI will make assumptions — and assumptions in CRE cost money."

**DDD Template (CRE Language):**

```
DOMAIN MODEL: [CRE Process Being Automated]

ENTITIES:
- [Entity 1]: What it is, key attributes
- [Entity 2]: What it is, key attributes
- [Entity 3]: What it is, key attributes

RELATIONSHIPS:
- [Entity 1] → [Entity 2]: How they connect
- [Entity 2] → [Entity 3]: How they connect

RULES:
- [Business rule 1]: e.g., "Lease renewal notices must go out 12 months before expiry"
- [Business rule 2]: e.g., "Operating expense reconciliation uses calendar year basis"

DOMAIN LANGUAGE:
- [Term]: Definition as used in THIS context (not generic)
- [Term]: Definition as used in THIS context
```

**CRE Examples That Reinforce:**
- **Rent roll:** The domain model for a property's income — tenants, suites, lease terms, rent steps, options
- **Stacking plan:** The spatial domain model — who is where, how much space, what floor
- **Capital plan:** The domain model for building systems — age, condition, replacement cost, timeline
- **Data room:** The comprehensive domain model for a transaction — financial, physical, legal, environmental data organized by bounded context

**Discussion Prompt:** "Could you hand your rent roll to someone who's never seen your building and have them understand the tenancy? That's what a domain design document does for AI — it's the rent roll for your workflow."

---

### 6.5 How the Documents Work Together

The chain is sequential — each document takes the previous ones as input and reduces entropy for the next. The OFD anchors the chain: every subsequent document traces back to the objectives and constraints it established.

```
OFD (Define what success looks like — the anchor)
  ↓ bounds the optimization target and guardrails
PRD (Scope the problem — serving the OFD)
  ↓ bounds the problem space
ADR (Make design decisions)
  ↓ bounds the approach
DDD (Model the domain)
  ↓ bounds the language
TDD (Define acceptance criteria)
  ↓ bounds what "done" means
IMPLEMENTATION (Build it)
```

**CRE Parallel:**

```
Investment Criteria
  ↓ "Here's what a good deal looks like — before we evaluate anything"
Pro Forma
  ↓ "Here's what we're building, and does it meet the criteria?"
IC Memo
  ↓ "Here's why we're doing it this way"
Rent Roll / Data Room
  ↓ "Here are the entities, relationships, and rules"
Underwriting Criteria
  ↓ "Here's what the numbers must look like"
CONSTRUCTION
```

**The Entropy Reduction Principle:**

| Step | Input | Output | Failure mode if skipped |
|---|---|---|---|
| OFD (anchor) | Business need + domain expertise | Optimization target, constraints, escalation boundary | No scoreboard — system optimizes for plausibility instead of your intent; iterations wander instead of converge |
| PRD (serves the OFD) | OFD + business need | Scoped requirements aligned to OFD objectives | Building the wrong thing, or building something that doesn't serve the defined objectives |
| ADR | OFD/PRD + technical context | Constrained architecture | AI hallucinates architecture; decisions are implicit and inconsistent |
| DDD | OFD/PRD + ADRs | Domain model with shared language | Code structure doesn't map to business reality; refactoring spirals |
| TDD | OFD/PRD + ADRs + DDD | Deterministic acceptance criteria (binary pass/fail) | No way to know if the machinery works; data errors go undetected |
| EDD (Evals Spec at 301) | OFD/PRD + ADRs + DDD | Probabilistic quality thresholds (rubric-based) | No way to know if the behavior is good; quality is subjective and unmeasured |

*At 201, both TDD and EDD criteria are written together as "acceptance criteria." At 301, they split into separate artifacts with different evaluation harnesses.*

**Teaching Point:** "You'd never evaluate a deal without investment criteria — and you define those criteria before you look at any deal, not after you've already fallen in love with one. The OFD is your investment criteria. The PRD is your pro forma — it serves those criteria. The IC memo, the rent roll, the underwriting — each one traces back to the objectives you set at the start. OFD, PRD, ADR, DDD, and TDD are the same documents for agentic engineering. Each one eliminates ambiguity so the next step can succeed — and the OFD anchors them all."

**Key Insight for Solo Operators:**

In a vibe-coding or solo agentic workflow, one person plays all three Holy Trinity roles. The documents still matter — arguably more, because the AI agent has no institutional knowledge. The discipline becomes: wear the PM hat for the OFD first (what are we optimizing for, what are the guardrails, when do we stop?), then the PRD (what are we building to serve those objectives?), switch to the engineer hat for the ADR, bring both perspectives together for the DDD, then define your acceptance tests with TDD. The documents force the cognitive separation even when the person doesn't change.

### 6.6 The Chain Mapped to the 8-Step Process

The documentation chain covers the "front half" of the 8-step process (planning). The "back half" is execution and verification:

```
FRONT HALF (Planning — documents)     BACK HALF (Execution — action)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OFD/PRD → Discover + Plan             Implement  → Construction
ADR  → Design                         Validate   → Building Inspection
DDD  → Structure                      Test       → Commissioning
TDD  → (defines criteria for →)       Document   → As-Builts
```

**Teaching Point:** "The documentation chain is your planning phase. It's everything you do before breaking ground. The 8-step process includes the planning AND the execution. Don't confuse planning with doing — but also don't skip the planning."

---

## 7. Quick Reference — The Complete Metaphor Map

### One-Page Summary for Participant Handout

| Agentic Engineering Concept | CRE Parallel | Remember This |
|---|---|---|
| **Product Manager** | Development/Asset Manager | Defines what and why |
| **Designer** | Architect | Designs how it works |
| **Engineer** | General Contractor | Builds and delivers |
| **Discover** | Site Selection / Market Research | Find the opportunity |
| **Plan** | Feasibility / Pro Forma | Validate viability |
| **Design** | Schematic Design | Conceptual solution |
| **Structure** | Construction Documents | Detailed specs |
| **Implement** | Construction | Build it |
| **Validate & QA** | Building Inspection | Check against standards |
| **Test** | Commissioning / Punch List | Does it actually work? |
| **Document** | As-Builts / O&M Manuals | Record for handoff |
| **Context** | Due Diligence Package | Background for decisions |
| **Model** | Building Type / Asset Class | Capabilities & constraints |
| **Prompt** | Design Brief / RFP | Instructions to the team |
| **Tools** | Trades & Equipment | Resources for the job |
| **OFD** | Investment Criteria / Underwriting Parameters | Define what "good" means before anything else |
| **PRD** | Development Pro Forma / Business Plan | Scope the problem to serve the OFD |
| **ADR** | Investment Committee Memo | Document why, not just what |
| **DDD** | Rent Roll / Property Data Room | Map the domain completely |
| **TDD** | Building Inspection / Underwriting | Define binary pass/fail before building |
| **EDD** | Appraisal / Professional Judgment | Define quality thresholds before evaluating |
| **Context Assembly** | Due Diligence | Gather what's needed |
| **Task Decomposition** | Work Breakdown Structure | Break into scopes |
| **Quality Judgment** | Inspection / Appraisal | Does it meet standards? |
| **Iterative Refinement** | Design Development / VE | Refine through rounds |
| **Workflow Integration** | Critical Path Method | Sequence and coordinate |
| **Frontier Recognition** | Highest & Best Use | Know the limits |
| **Agents** | Subcontractors | Autonomous specialists |
| **Skills** | Standard Details / Specs | Reusable procedures |
| **Slash Commands** | Work Orders | User-invocable shortcuts |
| **Plugins** | The Project Itself | Self-contained distributable package |

---

## 8. Participant-Facing Caution (Include in Workbook)

> **A note on the CRE parallels:** These mappings are designed to help you recognize familiar skills and build new ones faster. They are not exact equivalents. As you develop your agentic engineering practice, you will encounter places where the CRE parallel no longer fits — where the AI-specific skill requires new thinking that your real estate experience doesn't cover. **That is a sign of growing expertise, not a flaw in the framework.** The parallels are your on-ramp. The destination is a new craft built on a familiar foundation.

---

## 9. Usage Guidelines

**When to deploy these metaphors:**

- **Module openings** — Introduce each new framework with its CRE parallel before diving into the agentic engineering version
- **When participants look confused** — "Think of it this way..." and reach for the construction analogy
- **During exercises** — "You're in the SD phase right now. Don't jump to construction."
- **In the capstone** — "Your plugin is your construction project. Could a GC build from the design documents that structure it?"

**When NOT to use them:**

- Don't force every single concept through the metaphor. Some ideas are clearer stated directly.
- Don't let the metaphor become a crutch. By Day 2, participants should be using the agentic engineering vocabulary natively.
- Transition language: Day 1 heavy on CRE parallels, Day 2 participants should be saying "context assembly" not "due diligence for AI."

---

*Document created: 2026-02-06 | Last updated: 2026-02-23*
*Instructor reference — not for student distribution (the one-page summary table in Section 7 and the participant caution in Section 8 are suitable for the participant workbook)*
