---
title: "Course Outline - CRE-201: AI for CRE"
date: 2026-02-25
version: 0.2.0
status: draft
courseVersion: 0.4.0
lastUpdated: 2026-02-25
format: "4-day (two weekends)"
sourceFiles:
  learning-objectives: "01-planning/learning-objectives.md"
  teaching-notes: "01-planning/teaching-notes.md"
sourceHashes:
  learning-objectives: "e8c1aa6e"
  teaching-notes: "f7835ee9"
revisionNote: "Restructured from 2-day to 4-day two-weekend format. Added bookends, extended practice sessions, expanded capstone. Teaching notes fully integrated."
---

# Course Outline

## CRE-201: AI for Commercial Real Estate

**Duration:** 4-day (two weekends: Saturday-Sunday + Saturday-Sunday)
**Total Structured Time:** ~16.5 hours (990 minutes)
**Core Instruction (Obj 1-10):** 12.1 hours (725 minutes)
**Extended Practice & Bookends:** ~4.4 hours (265 minutes)
**Delivery Mode:** In-person
**Class Size:** 12-20 participants

**Format Rationale:** The two-weekend format creates a spaced-repetition interval. Participants apply Weekend 1 frameworks to real work during the week, then return to Weekend 2 with authentic questions and experience. The capstone benefits directly — participants arrive Day 3 having already tried (and struggled with) building something, which is exactly the productive failure that makes the Claude Code lab and capstone click.

**Lease Abstraction Anchor Example:** A classification-gated lease abstraction plugin threads through every objective using Gradual Release of Responsibility:
- **"I do" (Days 1-2):** Instructor demonstrates each concept applied to lease abstraction
- **"We do" (Day 3):** Participants work alongside the instructor on shared exercises
- **"You do" (Day 4):** Participants build their own CRE workflow plugin independently

---

## Weekend 1, Day 1 (Saturday): Foundations & Mental Models

**Theme:** Establish the mental models and vocabulary that make everything else learnable.
**Objectives covered:** Level 0, Obj 1, Obj 2, Integration Pause 1, Obj 3
**Structured time:** 240 min (4h)

---

### Welcome & Course Orientation (9:00-9:10, 10 min)

- Instructor introduction and logistics (restrooms, Wi-Fi, materials)
- Course arc preview: "By Sunday of Weekend 2, you'll have a working plugin"
- Distribute participant materials packet
- Quick round of names, roles, one CRE task they wish AI could do better

---

### Module 1: Foundations — Orientation & Mental Models (9:10-10:50, 100 min)

**Learning Objective(s):**
- *Level 0:* Establish baseline AI vocabulary and demonstrate the gap between single-turn prompting and multi-step workflows.
- *Obj 1:* Explain the three roles of agentic engineering (Product Manager, Engineer, Designer) and how each maps to management competencies CRE professionals already possess.
- *Obj 2:* Describe the four pillars of agentic engineering (Context, Model, Prompt, Tools) and explain how each pillar contributes to the quality of AI-generated output.

**Key Topics:**
- Level 0 vocabulary: prompt, context, model, agent, workflow, iteration
- Holy Trinity: PM/Engineer/Designer role-switching speed (minutes in AI vs. weeks on a deal)
- CRE parallels: scoping deals (PM), building analyses (Engineer), shaping deliverables (Designer)
- Four Pillars as diagnostic framework: when output is wrong, which pillar failed?
- The Prompt pillar is genuinely new — no clean CRE equivalent (teaching-notes marker)

**Activities:**
- 09:10-09:30: Level 0 live demo — single-turn lease summary vs. multi-step workflow on same excerpt. Key vocabulary check. Three-era framing: Prompt Engineering → Context Engineering → Intent Engineering — "this course teaches all three; by Day 4 you'll operate across the full stack." "Where are you now?" self-assessment on 4-point scale (20 min)
- 09:30-09:42: Instructor framing of Holy Trinity with CRE management parallels. Lease abstraction role mapping: PM scopes extraction fields, Engineer designs the pipeline, Designer formats the output (12 min instruction)
- 09:42-09:54: Pair exercise — map PM/Engineer/Designer to a CRE task from their own work (12 min guided practice)
- 09:54-10:04: Individual written explanation connecting each role to a specific CRE parallel (10 min independent practice)
- 10:04-10:10: Peer share and debrief (6 min assessment)
- 10:10-10:22: Instructor framing of Four Pillars and interdependencies. Lease abstraction diagnosis: Context failure (missing legislation), Model failure (hallucinated terms), Prompt failure (wrong template), Tools failure (garbled OCR) (12 min instruction)
- 10:22-10:34: Pair diagnosis — identify failing pillar in a flawed lease abstract (12 min guided practice)
- 10:34-10:44: Individual concept map showing pillar interdependencies with CRE examples (10 min independent practice)
- 10:44-10:50: Self-check against instructor map, quick debrief (6 min assessment)

**Lease Abstraction Thread:** Stage = **I do**. Anchor example introduced via Level 0 demo. Instructor diagnoses a bad lease abstract using all four pillars (teaching-notes: Context = missing Ontario CTA, Model = hallucinated renewal option, Prompt = "summarize" instead of structured extraction, Tools = scanned PDF without OCR).

**Assessment:**
- Obj 1: Written explanation connecting each Holy Trinity role to a CRE management parallel (formative, peer discussion)
- Obj 2: Concept map showing pillar interdependencies with CRE-specific examples (formative, self-assessed against instructor example)

**Materials Needed:**
- Slide deck (Level 0 + Obj 1 + Obj 2)
- Lease excerpt handout (same excerpt used all four days)
- Holy Trinity role card
- Four Pillars concept-map template
- Self-assessment baseline form

**UDL Notes:** Representation uses live demo + diagramming + text artifacts (3 modes). Engagement includes self-assessment choice and peer mapping. Activity pattern rotates: demo → lecture → pair work → individual → debrief. Embedded role-switch at 10:04 (54 min in) provides cognitive reset within UDL break cadence.

---

### Break (10:50-11:05, 15 min)

---

### Integration Pause 1 (11:05-11:20, 15 min)

Participants map all three Holy Trinity roles AND all four Pillars to a single CRE task from their own work. Purpose: consolidate before VPD adds another framework. Surfaces which participants have strong mental models and which need scaffolding.

---

### Module 2: Value-Delivery Fit — Paired VPD Lite + BMC Awareness (11:25-12:40, 75 min)

**Learning Objective(s):**
- *Obj 3:* Apply a paired value-delivery fit analysis to determine whether a proposed CRE workflow is worth building: identify the user jobs and pains (business fit), recognize the Four Pillars as engineering capability substrate (engineering fit), validate cross-layer traceability, and recognize that full business viability requires broader canvas analysis introduced here and developed in the APD series.

**Key Topics:**
- Four Pillars reframed: diagnostic lens (Obj 2) → design lens (Obj 3) — same components, different question
- Paired VPD: Business side (Customer Profile → Value Map) + Engineering side (System Task Profile → Delivery Map)
- Customer jobs split by type: execution, decision, validation, coordination (genuinely new — teaching-notes marker)
- Cross-layer traceability rules: "If a business pain reliever has no engineering mechanism, it's marketing copy"
- BMC awareness: 5-minute cost sniff test (build cost, per-use value, break-even)
- Full cost principle: token cost is never the whole cost (human review + failure/rework + cost of delay)

**Activities:**
- 11:25-11:40: Instructor bridge from Obj 2 — "Same four components, different lens: from 'what broke?' to 'what do I need to deliver?'" CRE parallels: Business VPD = Tenant Needs Assessment, Engineering VPD = Building Capability Assessment, Cross-layer = Lease ↔ Building spec alignment (15 min instruction)
- 11:40-12:00: Instructor "I do" — walks through complete paired VPD for lease abstraction plugin (business customer profile + engineering system task profile, with cross-layer trace annotations) (20 min guided practice)
- 12:00-12:05: Embedded reset — participants select their own CRE workflow for VPD exercise
- 12:05-12:30: Pairs complete VPD worksheet (business + engineering sides) and annotate cross-layer trace lines for their chosen CRE workflow. Include 5-minute cost sniff test (25 min independent practice)
- 12:30-12:40: Peer review using traceability checklist — flag unmatched items on each other's worksheets (10 min assessment)

**Lease Abstraction Thread:** Stage = **I do**. Instructor fully models the paired VPD: Business side (jobs: extract terms, determine market-standard, verify completeness, route to deal team; pains: 2-4 hours manual abstraction, inconsistent output, missed critical dates). Engineering side (system tasks: classify property type, load legislation, extract fields, validate completeness; failure pains: wrong classification cascading, hallucinated terms, context overflow). Cross-layer trace: "missed critical dates" → "critical date extraction with completeness validation."

**Assessment:**
- Paired VPD worksheet with cross-layer trace annotations + 5-min cost sniff test (formative, peer review using traceability checklist)

**Materials Needed:**
- Paired VPD worksheet (business + engineering sides, with trace annotation columns)
- Traceability checklist
- Cost sniff mini-template
- Printed lease-abstraction VPD exemplar
- CRE parallels reference card (Tenant Needs Assessment → Business VPD, Building Capability → Engineering VPD)

**UDL Notes:** Representation uses spoken walkthrough + table visuals + worksheet artifact (3 modes). Engagement includes learner choice of CRE workflow for VPD. Activity variety: instructor model → pair production → peer critique. Low-stakes practice (pair + peer review) before any individual work.

---

### Extended Practice: VPD Refinement Workshop (12:40-13:10, 30 min)

Participants refine their VPD worksheets based on peer feedback. Instructor circulates for spot coaching. Purpose: ensure VPD quality before it feeds into OFD/PRD on Day 2. Participants who finish early begin sketching OFD fields (primary objective, hard constraints, escalation triggers) as preview.

---

### Day 1 Wrap-up & Preview (13:10-13:20, 10 min)

- Recap: Holy Trinity, Four Pillars, VPD — "You now know the roles, the diagnostic tool, and the fit-check"
- Preview Day 2: "Tomorrow we take your validated VPD and turn it into a buildable plan"
- Homework (optional): Review your VPD worksheet. Think about the objective function — what does success look like for your workflow?

---

## Weekend 1, Day 2 (Sunday): Process & Design

**Theme:** Convert validated ideas into structured, buildable plans.
**Objectives covered:** Obj 4, Obj 5, Integration Pause 2, Obj 6
**Structured time:** 255 min (4h 15m)

---

### Day 2 Recap & Preview (9:00-9:10, 10 min)

Quick recall of Holy Trinity, Four Pillars, VPD. "Today we move from 'is this worth building?' to 'how do we build it?'"

---

### Module 3: The 8-Step Process + OFD/PRD (9:10-10:40, 90 min)

**Learning Objective(s):**
- *Obj 4:* Apply the 8-step agentic engineering process to plan an agentic workflow for a specific CRE task, first defining an objective function (what success looks like, what's off limits, when to stop) and then producing a PRD that operationalizes those objectives into buildable requirements.

**Key Topics:**
- OFD-first discipline: define success before writing requirements (3 fields: primary objective, hard constraints, escalation triggers)
- OFD as intent engineering: primary objective = trade-off logic, hard constraints = decision boundaries, escalation triggers = resolution hierarchies. The documentation chain (VPD → OFD → PRD → ADR → DDD → TDD) progressively translates abstract purpose into increasingly machine-actionable parameters — each document reducing ambiguity until intent becomes implementation
- Microsoft Copilot lesson: 85% of Fortune 500 adopted, only 5% scaled — the failure was the Intent Gap, not the model. The OFD prevents that.
- Convergence principle: objective quality determines refinement quality (teaching-notes)
- VPD → OFD traceability: objective function takes paired VPD as input
- PRD as operationalization of OFD — "what to build" in service of "what good looks like"
- CRE parallel: investment criteria (OFD) before underwriting (PRD) — you don't evaluate a deal after you've fallen in love with it
- Front-loading discipline is genuinely new — CRE professionals often start prompting before planning (teaching-notes marker)

**Activities:**
- 09:10-09:32: Instructor teaches 8-step flow and OFD-first principle with CRE underwriting analogy. Names OFD as intent engineering with Copilot case study: "85% of Fortune 500 adopted Copilot; only 5% scaled — the failure was the Intent Gap." Seniority reframe: "In the AI era, seniority is your ability to externalize what you know into a framework an agent can execute." (22 min instruction)
- 09:32-09:57: Instructor "I do" — lease abstraction OFD (primary: ≥95% field completeness; constraints: never fabricate, never misapply jurisdiction; triggers: unfamiliar clauses, ambiguous terms, mixed-use properties), then PRD serving the OFD (25 min guided practice)
- 09:57-10:02: Embedded reset
- 10:02-10:32: Participants complete 8-step worksheet + OFD/PRD for their CRE task, using their VPD from Day 1 as input (30 min independent practice)
- 10:32-10:40: Peer review with OFD/PRD checklist — "Do the escalation triggers define a real boundary? Does the PRD serve the OFD?" (8 min assessment)

**Lease Abstraction Thread:** Stage = **I do**. Instructor demonstrates OFD-first: escalation triggers defined before requirements ("unfamiliar clause types," "ambiguous terms requiring legal interpretation," "jurisdictions not in knowledge base"). Highlights: "Notice I defined when the system should STOP before I wrote what it should DO."

**Assessment:**
- Completed 8-step planning worksheet with OFD (3 fields) and PRD (problem, users, requirements, constraints, success metrics) (formative, peer review using OFD/PRD checklist)

**Materials Needed:**
- 8-step process diagram (wall-size for reference)
- OFD/PRD template (OFD fields first, then PRD sections)
- OFD/PRD peer-review checklist
- Annotated lease-abstraction OFD/PRD exemplar

**UDL Notes:** Representation uses process diagram + worked example + completed-document exemplar (3 modes). Engagement includes learner choice of CRE task and peer feedback. Activity flow rotates: explanation → modeled walkthrough → individual production → peer review.

---

### Break (10:40-10:55, 15 min)

---

### Module 4: Task Decomposition (11:00-11:50, 50 min)

**Learning Objective(s):**
- *Obj 5:* Apply task decomposition to break a complex CRE process into discrete, delegable units suitable for agentic execution, identifying human checkpoints at appropriate boundaries.

**Key Topics:**
- AI decomposition heuristics differ from CRE: context boundaries, token limits, validation gates (not trade specialties) — genuinely new (teaching-notes marker)
- Human checkpoint placement: where must a human verify before the next step proceeds?
- Decomposition as the bridge between PRD (what to build) and context assembly (what each step needs)

**Activities:**
- 11:00-11:12: Instructor teaches decomposition heuristics — context boundaries as "the new trade boundaries." CRE construction decomposes by trade; AI decomposes by what information each step needs (12 min instruction)
- 11:12-11:27: Instructor "I do" — decomposes lease abstraction into 5 steps: classify (low risk, first 2-3 pages) → load context (deterministic routing) → extract per template (medium risk, full context) → validate completeness (AI + human review) → format (deterministic). Points out: "Step 1 needs just the first pages. Step 3 needs the full lease plus loaded context. Context boundaries are the decomposition driver." (15 min guided practice)
- 11:27-11:42: Participants produce decomposition maps with human checkpoints for their CRE process (15 min independent practice)
- 11:42-11:50: Peer review — "Does the decomposition follow context boundaries? Are human checkpoints at the right gates?" (8 min assessment)

**Lease Abstraction Thread:** Stage = **I do**. Instructor makes the 5-step decomposition explicit with boundary rationale per step: context boundary, token budget estimate, human checkpoint placement.

**Assessment:**
- Decomposition map showing AI-delegable and human-required components with boundary justification (formative, peer review)

**Materials Needed:**
- Decomposition map template (with context boundary and checkpoint columns)
- Lease abstraction 5-step decomposition exemplar
- Human-checkpoint decision guide

**UDL Notes:** Representation uses flowchart + verbal walkthrough + written map (3 modes). Engagement includes learner-selected CRE process. Activity alternates: lecture → modeled demo → individual mapping → peer critique.

---

### Integration Pause 2 (11:50-12:05, 15 min)

Participants connect Holy Trinity + Four Pillars + 8-Step Process + Task Decomposition to the same CRE task. Target articulation: "I'm acting as [role], following [step], and this task decomposes into [units]." Purpose: consolidate all Weekend 1 frameworks before adding Context Assembly.

---

### Module 5: Context Assembly (12:10-13:00, 50 min)

**Learning Objective(s):**
- *Obj 6:* Apply context assembly techniques to provide Claude Code with sufficient background information, constraints, and success criteria for accurate CRE task execution.

**Key Topics:**
- Context is the pillar CRE professionals most underestimate — they know their domain but fail to transfer that knowledge to AI (teaching-notes marker)
- Five strategies for context overflow: knowledge distillation, multi-pass architecture, dynamic context loading, chunked document processing, context budgeting
- Skills-as-knowledge-containers pattern: plugin skills don't just contain instructions, they contain (or reference) the domain knowledge needed for the task
- CRE parallels: distillation = relevant code sections for site inspection, multi-pass = phased due diligence, dynamic loading = jurisdiction-specific surveys, chunking = system-by-system building inspection, budgeting = development pro forma line items

**Activities:**
- 12:10-12:22: Instructor teaches context assembly with token-budget framing. "Context assembly isn't 'give the AI more information.' It's engineering decisions about what to load, when to load it, and how much room to leave." (12 min instruction)
- 12:22-12:37: Instructor "I do" — side-by-side lease abstraction demo. Thin context ("summarize the key terms") vs. assembled context (classified as Ontario office → distilled CTA + office template + domain knowledge). Output quality gap is immediately visible. Then walks through all five overflow strategies with lease-abstraction examples (15 min guided practice)
- 12:37-12:52: Participants build a context packet for their CRE task using the five strategies, then run a side-by-side comparison (15 min independent practice)
- 12:52-13:00: Self-assessment on output quality delta and debrief (8 min assessment)

**Lease Abstraction Thread:** Stage = **I do**. Instructor demonstrates the context overflow problem: 30-50K token lease + 40-60K token raw statute + 2K template = 80-120K tokens, exceeding practical working limits. Then applies all five strategies to bring it to ~48K with reasoning room.

**Assessment:**
- Side-by-side comparison of AI outputs from thin-context vs. fully assembled context for the same CRE task (formative, self-assessed — quality difference is self-evident)

**Materials Needed:**
- Context assembly worksheet with token budget fields
- Five strategies reference card (with CRE parallel for each)
- Example distilled knowledge packet
- Pre-built thin and assembled context prompts for live demo

**UDL Notes:** Representation uses live prompt comparison + reference card + written worksheet (3 modes). Engagement includes learner-selected CRE process. Activity alternates: lecture → live demo → independent build → self-assessment.

---

### Extended Practice: Build-Ready Checkpoint (13:00-13:35, 35 min)

Participants verify their complete Weekend 1 artifact chain: VPD → OFD/PRD → Decomposition Map → Context Strategy. Instructor circulates for spot coaching. Peers cross-check: "Does your context strategy match your decomposition boundaries? Does your OFD trace back to your VPD?" Purpose: ensure participants enter the week gap with a coherent design ready for Claude Code on Day 3.

---

### Weekend 1 Closing & Homework Briefing (13:35-13:50, 15 min)

- Weekend 1 recap: "You have a validated idea (VPD), a buildable plan (OFD/PRD), a decomposition, and a context strategy. Next weekend, you build."
- **Between-weekend homework:** Try building one simple skill for a CRE task — it doesn't need to be your capstone task. You've been using Claude Code side-by-side all weekend; now try building something on your own. The productive struggle makes Day 3 click. Optional: refine your artifact chain based on what you learn.
- Preview Weekend 2: "Day 3 opens with what you tried during the week. Day 4 is your capstone."

---

## Week Gap (5 business days)

Participants apply Weekend 1 frameworks to real work. The between-weekend homework (try building a simple skill independently) creates the productive struggle that makes Day 3's Claude Code lab and productive failure exercise resonate. Participants who attempt and fail to build something during the week are pedagogically better positioned than those who succeeded — they arrive Day 3 with specific, authentic questions about context assembly, decomposition, and component selection.

---

## Weekend 2, Day 3 (Saturday): Tools & Analysis

**Theme:** Get hands-on with Claude Code, then learn to diagnose when things go wrong.
**Objectives covered:** Obj 7, Obj 8, Integration Pause 3
**Structured time:** 255 min (4h 15m)

---

### Weekend 2 Opening: Week-in-Review (9:00-9:20, 20 min)

Participants share what they tried during the week: which frameworks they used, what worked, what didn't, what confused them. Instructor captures common patterns on whiteboard. Purpose: surface real-world application gaps, build community, normalize struggle. This becomes teaching material for Day 3 — the instructor can reference specific participant experiences during the Claude Code lab and failure diagnosis.

---

### Module 6: Claude Code Fundamentals + ADR/DDD (9:20-10:50, 90 min)

**Learning Objective(s):**
- *Obj 7:* Use core Claude Code components (agents, skills, slash commands, plugins) to execute a guided multi-step CRE workflow, distinguishing the purpose and appropriate use case for each component type. Interpret instructor-provided ADR and DDD examples to understand how design decisions and domain models structure a real workflow. Understand that a plugin is the self-contained distributable unit — the format for the capstone deliverable.

**Key Topics:**
- Component hierarchy: Plugin (the project) → Agents (subcontractors) → Skills (spec sections) → Slash Commands (work orders)
- Everything in this objective is genuinely new — CRE analogies are scaffolding, not substance (teaching-notes marker)
- ADR/DDD interpretation as design literacy (not full authoring at 201 level)
- Productive failure: what happens when you rush into Claude Code without OFD/decomposition/context strategy
- Minimal plugin structure: `plugin.json` manifest + at least one skill

**Activities:**
- 09:20-09:42: Instructor teaches component types and hierarchy with CRE analogies. Component hierarchy diagram on screen. "At 201, you learn to use all four and understand how plugins bundle them. At 301, you build production plugins." (22 min instruction)
- 09:42-10:07: **Productive failure exercise (participatory)** — Instructor AND all participants type the same poorly-specified prompt on their own machines: "Create a skill that abstracts leases." LLM variance produces different-but-similarly-flawed outputs across the room — class discussion surfaces the variation. Common failures: generic templates, no jurisdiction awareness, raw statute loaded, missed critical dates. Instructor: "Everyone typed the same thing. Did anyone get the same result? The problem isn't randomness — it's the absence of specification. Context without intent is a loaded weapon with no target." Then class rebuilds together with OFD, decomposition, context strategy — participants follow along, comparing their corrected outputs (25 min guided practice)
- 10:07-10:12: Embedded reset
- 10:12-10:37: **Structured lab** — participants use pre-built lease-abstraction plugin: invoke the plugin, trigger classification agent, read extraction skill, run `/abstract` command. Use at least 3 of 4 component types. Examine `plugin.json` manifest and skill structure (25 min independent practice)
- 10:37-10:50: ADR/DDD annotation exercise — participants write "I would have made this decision because..." or "I would have modeled this differently because..." on instructor-provided ADR and DDD. Peer discussion (13 min assessment)

**Lease Abstraction Thread:** Stage = **We do** (first participatory build). Everyone builds wrong together, then rebuilds correctly — demonstrating every prior objective's discipline at the moment participants are most tempted to abandon it. LLM variance across participants' outputs teaches that specification, not luck, determines output quality. Then structured lab uses the correctly-built lease-abstraction plugin for hands-on experience.

**Assessment:**
- Structured lab completion using at least 3 of 4 Claude Code component types + ADR/DDD annotations with reasoning (formative, lab completion + peer discussion)

**Materials Needed:**
- Claude Code lab environment (pre-configured)
- Pre-built lease-abstraction plugin directory (plugin.json, classify-lease skill, extract-sections skill, knowledge/ directory)
- ADR and DDD annotation handouts
- Component hierarchy wall chart
- Productive failure comparison outputs (bad vs. corrected)

**UDL Notes:** Representation uses architecture diagram + live terminal demo + annotation text (3 modes). Engagement includes hands-on component selection and interpretation choices. Activity variety rotates: lecture → live demo/failure → lab execution → reflective annotation. Productive failure before lab execution reduces anxiety ("even the instructor gets it wrong when rushing").

---

### Break (10:50-11:05, 15 min)

---

### Module 7: Diagnosing Failures & Frontier Recognition (11:05-12:20, 75 min)

**Learning Objective(s):**
- *Obj 8:* Analyze a failed or subpar AI output to diagnose which of the four pillars requires adjustment, and differentiate between CRE tasks suitable for agentic automation and those requiring human judgment.

**Key Topics:**
- Pillar failure taxonomy with specific repair actions per pillar
- Frontier categories (the "Capability Map"): fully automatable, AI-assisted with human review, human-only
- Moving frontier — what's impossible today may be routine in 6 months (genuinely new — CRE zoning/code boundaries are stable, AI frontiers are not) (teaching-notes marker)
- OFD escalation trigger callback: triggers defined in Obj 4 ARE the frontier boundary
- Boundary-case reasoning — the boundary between diagnosis and frontier recognition is itself instructive

**Activities:**
- 11:05-11:20: Instructor frames failure diagnosis (pillar taxonomy) and moving-frontier judgment. Connects to week-in-review: "Some of you experienced exactly these failure modes during the week" (15 min instruction)
- 11:20-11:40: Guided diagnosis — instructor and participants jointly analyze first lease-abstraction failure case (BC lease with Ontario legislation loaded = Context failure). Then jointly classify one boundary case (20 min guided practice)
- 11:40-11:45: Embedded reset
- 11:45-12:08: **Part A:** Teams diagnose three pre-generated lease-abstraction failure outputs: (1) jurisdiction mismatch = Context, (2) residential fields on commercial lease = Prompt/routing, (3) fabricated renewal option = Model/OFD constraint. **Part B:** Classify 12-15 CRE tasks into frontier categories with written boundary rationale (23 min independent practice)
- 12:08-12:20: Peer scoring (Part A) and instructor-facilitated boundary debate (Part B) — boundary cases are deliberately arguable (12 min assessment)

**Lease Abstraction Thread:** Stage = **We do**. Instructor and participants jointly diagnose all three failure modes. Part B uses lease abstraction tasks for frontier mapping: "Extract structured fields" (automatable) → "Flag non-standard indemnification" (AI-assisted) → "Determine if exclusive use conflicts with another tenant" (human judgment — requires business relationship understanding).

**Assessment:**
- Part A: Correctly identify failing pillar and propose fix for 3 failure outputs (formative, peer-scored)
- Part B: Classification of 12-15 CRE tasks with written boundary justification (formative, instructor-facilitated discussion)

**Materials Needed:**
- Failure-case packet (3 lease-abstraction outputs with different failure modes)
- Pillar diagnosis worksheet (pillar, evidence, proposed fix columns)
- Frontier classification card deck (12-15 CRE tasks on individual cards)
- Boundary rationale rubric

**UDL Notes:** Representation uses failure exemplars + category framework + justification writing (3 modes). Engagement includes team strategy choices and debate positions (learner agency in arguable boundary cases). Activity sequence: guided analysis → collaborative classification → whole-group debate.

---

### Lunch (12:20-12:50, 30 min)

---

### Integration Pause 3 (12:50-13:05, 15 min)

Participants revisit their Day 2 task decomposition and identify: (1) which decomposed units could fail and why (pillar diagnosis), and (2) which units are beyond the AI frontier and need human execution. Purpose: connect analytical skills just learned to their own workflow design.

---

### Extended Lab: Failure Diagnosis on Own Workflows (13:05-13:50, 45 min)

Participants apply failure diagnosis and frontier recognition to their *own* CRE workflows from the week — not instructor-created exercises. They run their workflows (or attempt to), identify failure modes, diagnose pillars, and update their frontier boundary maps. Instructor circulates for coaching. This is authentic assessment data that does not exist in the compressed 2-day format. Participants who struggled during the week have the most material to work with.

---

### Day 3 Wrap-up & Capstone Preview (13:50-14:00, 10 min)

- Recap: "You can now use Claude Code components, diagnose failures, and map frontiers"
- Capstone preview: "Tomorrow you build your own plugin. Tonight, review your artifact chain (VPD → OFD/PRD → decomposition → context strategy → frontier map). Everything feeds into the capstone."
- Distribute capstone rubric and checklist for overnight review

---

## Weekend 2, Day 4 (Sunday): Quality & Synthesis

**Theme:** Define quality, then build and present your capstone plugin.
**Objectives covered:** Obj 9, Obj 10
**Structured time:** 270 min (4h 30m)

---

### Day 4 Recap & Capstone Briefing (9:00-9:10, 10 min)

- Quick recall of Day 3: Claude Code components, failure diagnosis, frontier recognition
- Capstone briefing: minimum viable plugin requirements (plugin.json + one skill + OFD/PRD + TDD criteria + frontier boundary map + live demo)
- "Before you build, you need to define what 'good' looks like — that's Obj 9"

---

### Module 8: Iterative Refinement + Quality Judgment + TDD (9:10-10:10, 60 min)

**Learning Objective(s):**
- *Obj 9:* Evaluate AI-generated CRE work products using quality judgment criteria derived from TDD-style acceptance criteria defined before execution, applying iterative refinement across multiple cycles to improve output until it meets professional standards.

**Key Topics:**
- TDD acceptance criteria as pre-output quality anchor — define "what good looks like" before the AI produces anything
- TDD vs. EDD distinction (teaching-notes): TDD = deterministic/binary (building inspection: code or not), EDD = probabilistic/rubric-based (appraisal: value is a range)
- Multi-cycle refinement logs: criteria-writing skill matters at 201; operational harnesses are 301
- Economics check (BMC callback from Obj 3): is the refinement effort worth the outcome improvement? Marginal quality gain vs. marginal cost (tokens + review time + delay)
- Documentation chain closure: TDD criteria trace back to OFD → VPD. If criteria don't connect to the objective function, you're evaluating against criteria the process generated, not criteria you defined
- Alignment drift awareness (301 preview): acceptance criteria aren't disposable — in production they monitor continuously. Agents can drift from intent over time. At 301, you build feedback loops to detect and correct drift

**Activities:**
- 09:10-09:23: Instructor explains TDD/EDD distinction with CRE parallels (building inspection vs. appraisal) and economics callback to Obj 3 (13 min instruction)
- 09:23-09:39: Guided drafting — instructor and participants co-develop lease-abstraction acceptance criteria. TDD: "All critical dates extracted" (binary), "Rent structure matches source" (binary), "No fabricated terms" (binary). EDD: "Clause summaries capture material terms" (rubric), "Abstract is organized usefully" (quality standard). Instructor highlights: "Your TDD criteria trace back to OFD hard constraints. Your EDD criteria map to OFD primary objective." (16 min guided practice)
- 09:39-10:01: Participants write 3-5 acceptance criteria for their own capstone plugin, run 2-3 refinement cycles, log quality improvement per cycle. Economics check: "Is the fourth cycle worth it?" (22 min independent practice)
- 10:01-10:10: Summative readiness review — instructor reviews acceptance criteria quality and refinement log for capstone readiness (9 min assessment)

**Lease Abstraction Thread:** Stage = **We do**. Participants co-develop criteria with instructor coaching, tracing each criterion back to the OFD. Economics check demonstrated: "Three cycles improved EDD score by ~5% each. Each cycle costs 50K tokens (~$0.15) and 3 minutes. Is cycle four worth it?"

**Assessment:**
- Multi-round refinement exercise: (1) write 3-5 acceptance criteria before generation, (2) evaluate initial output, (3) iterate 2-3 cycles with documented improvement (summative, instructor reviews for capstone readiness)

**Materials Needed:**
- Acceptance-criteria template (TDD/EDD columns)
- Refinement log sheet (criteria scores per cycle, changes made, economics check)
- Lease-abstraction acceptance criteria exemplar
- Readiness review rubric

**UDL Notes:** Representation uses rubric table + sample outputs + live scoring model (3 modes). Engagement includes participant control over refinement strategy, stopping point, and criteria selection. Activity rotates: instructor model → joint drafting → independent cycles → structured review.

---

### Break (10:10-10:25, 15 min)

---

### Module 9: Capstone Build — CRE Workflow Plugin (10:25-11:55, 90 min)

**Learning Objective(s):**
- *Obj 10:* Build a self-contained Claude Code plugin for a recurring CRE workflow task, integrating OFD/PRD (from Obj 4), at least one skill, TDD acceptance criteria (from Obj 9), and a frontier boundary map. Present the plugin design and working demonstration to peers.

**Key Topics:**
- Plugin as documentation chain exercise: VPD → OFD/PRD → decomposition → context strategy → ADR → DDD → TDD all converge in one deliverable
- Minimum viable plugin: `plugin.json` + one skill that runs
- Capstone explicitly framed as "working first draft" — functional but requiring 2-4 hours of post-course refinement
- "You do" — participants transfer the lease-abstraction pattern to their own domain

**Activities:**
- 10:25-10:45: Capstone brief and scaffold walkthrough. Instructor reviews minimum viable plugin criteria against rubric. `--plugin-dir` testing instructions. Instructor office-hours pass — quick check with each participant on scope (20 min instruction/guided practice)
- 10:45-10:50: Embedded reset
- 10:50-11:55: **Independent build** — participants create: plugin.json manifest, at least one skill implementing a CRE workflow step, align with OFD/PRD, write TDD acceptance criteria, create frontier boundary map. Instructor circulates for coaching. Early finishers add a second skill or slash command (65 min independent practice)

**Lease Abstraction Thread:** Stage = **You do**. Capstone instruction: "You've seen every concept in this course applied to one plugin — lease abstraction. You've seen the VPD, the OFD, the decomposition, the context strategy, the component structure, the failure modes, and the acceptance criteria. Now build your own. Pick a CRE workflow you do repeatedly. Apply the same pipeline. You have the pattern; the capstone asks you to replicate it for your domain."

**Assessment:**
- Working plugin package: (1) plugin.json manifest, (2) at least one skill, (3) OFD/PRD, (4) TDD acceptance criteria, (5) frontier boundary map, (6) live demo using `--plugin-dir` (summative, instructor evaluates design coherence and functionality)

**Materials Needed:**
- Capstone plugin scaffold (starter directory structure)
- Capstone checklist (6 required deliverables)
- Capstone rubric
- Local testing instructions (`--plugin-dir`)
- Claude Code lab environment

**UDL Notes:** Representation uses checklist + runnable artifact + live demo evidence (3 modes). Engagement is maximum learner agency — choice of workflow domain, implementation path, component selection. Expression flexibility: rubric assesses design coherence, not polish or presentation skill.

---

### Lunch (11:55-12:25, 30 min)

---

### Capstone Polish & Testing (12:25-13:10, 45 min)

Participants refine their plugins based on their own TDD acceptance criteria from Obj 9. Run `--plugin-dir` tests, iterate on skill prompts, fix failure modes identified through pillar diagnosis. This extended build time — impossible in the 2-day format — allows genuine iterative refinement: 2-3 additional cycles where participants apply the TDD/EDD discipline they just learned to their own capstone output.

---

### Capstone Presentations & Peer Feedback (13:10-13:55, 45 min)

Each participant (or pair) presents:
1. The CRE workflow their plugin addresses (1 min)
2. Live demo using `--plugin-dir` (2 min)
3. One design decision they're proud of and one limitation they'd fix with more time (1 min)

Peers provide structured rubric feedback (not open-ended "what do you think?" — specific prompts: "Does the frontier boundary map match what you saw in the demo?" "Do the acceptance criteria trace to the OFD?").

With 12-20 participants at ~4 min each: 48-80 min. For larger classes, use small-group presentations (3-4 groups of 5) at 4 min each = 20 min per group + 10 min gallery walk.

---

### Course Closing & Next Steps (13:55-14:15, 20 min)

- Course recap: the full arc from vocabulary (Level 0) to working plugin (Obj 10). Three-era callback: "You started in era 1 (prompting). You learned era 2 (context assembly). You built era 3 (intent engineering — OFDs, acceptance criteria, frontier maps). That's the full stack."
- Intent infrastructure framing: "The race for better models is effectively over — frontier models are already extraordinarily capable. The new competitive advantage is intent infrastructure. A mediocre model with clear intent infrastructure will outperform a frontier model with fragmented, unaligned knowledge. You spent four days building intent infrastructure. That's the durable advantage."
- Durability layers reminder: workflow thinking (permanent) → plain-English specs (platform-durable) → Claude Code fluency (platform-specific)
- Post-course reinforcement: Week 1 Challenge (add a second skill to your plugin), spaced repetition schedule
- Evaluations (participant feedback forms)
- "Your plugin is a working first draft. Refine it over the next 2-4 hours. You now have the frameworks, the vocabulary, and the diagnostic tools to keep building."

---

## UDL Validation Summary

| Check | Day 1 | Day 2 | Day 3 | Day 4 |
|---|---|---|---|---|
| **Representation (2+ modes per module)** | Pass (3 per module) | Pass (3 per module) | Pass (3 per module) | Pass (3 per module) |
| **Engagement (choice per half-day)** | Pass (CRE task selection, VPD workflow choice) | Pass (CRE task for OFD/PRD, process for decomposition) | Pass (team strategy, debate positions, own-workflow lab) | Pass (capstone domain, implementation path, refinement strategy) |
| **Activity variety (no 3+ same format)** | Pass (rotates demo/pair/individual/debrief) | Pass (rotates lecture/demo/independent/peer) | Pass (rotates lecture/demo/lab/debate) | Pass (rotates model/draft/build/present) |
| **Break cadence (≤60 min)** | Pass (embedded resets at ~50 min within Module 1) | Pass (modules ≤50 min after Module 3, which has reset at ~50 min) | Pass (embedded reset at ~50 min in Module 6) | Pass (modules ≤60 min, embedded reset in Module 9) |
| **Proactive accommodation** | Materials in digital + print, high-contrast slides, glossary distributed | Same + pre-reading for Obj 4 (8-step process diagram) | Lab environment pre-tested, non-tech fallback for annotation | Capstone scaffold pre-loaded, seated presentation alternative |

---

## Schedule Summary — Day 1 (Weekend 1, Saturday)

| Time | Item | Duration | Type |
|---|---|---:|---|
| 9:00-9:10 | Welcome & Course Orientation | 10 min | Bookend |
| 9:10-10:50 | Module 1: Foundations — Orientation & Mental Models | 100 min | Module |
| 10:50-11:05 | Break | 15 min | Break |
| 11:05-11:20 | Integration Pause 1 | 15 min | Integration Pause |
| 11:20-11:25 | Transition | 5 min | Transition |
| 11:25-12:40 | Module 2: Value-Delivery Fit (Paired VPD + BMC) | 75 min | Module |
| 12:40-13:10 | Extended Practice: VPD Refinement Workshop | 30 min | Extended Practice |
| 13:10-13:20 | Day 1 Wrap-up & Preview | 10 min | Bookend |
| **Total** | **9:00-1:20 PM** | **260 min (4h 20m)** | |
| **Structured** | | **240 min (4h)** | |

## Schedule Summary — Day 2 (Weekend 1, Sunday)

| Time | Item | Duration | Type |
|---|---|---:|---|
| 9:00-9:10 | Day 2 Recap & Preview | 10 min | Bookend |
| 9:10-10:40 | Module 3: The 8-Step Process + OFD/PRD | 90 min | Module |
| 10:40-10:55 | Break | 15 min | Break |
| 10:55-11:00 | Transition | 5 min | Transition |
| 11:00-11:50 | Module 4: Task Decomposition | 50 min | Module |
| 11:50-12:05 | Integration Pause 2 | 15 min | Integration Pause |
| 12:05-12:10 | Transition | 5 min | Transition |
| 12:10-13:00 | Module 5: Context Assembly | 50 min | Module |
| 13:00-13:35 | Extended Practice: Build-Ready Checkpoint | 35 min | Extended Practice |
| 13:35-13:50 | Weekend 1 Closing & Homework Briefing | 15 min | Bookend |
| **Total** | **9:00-1:50 PM** | **290 min (4h 50m)** | |
| **Structured** | | **265 min (4h 25m)** | |

## Schedule Summary — Day 3 (Weekend 2, Saturday)

| Time | Item | Duration | Type |
|---|---|---:|---|
| 9:00-9:20 | Weekend 2 Opening: Week-in-Review | 20 min | Bookend |
| 9:20-10:50 | Module 6: Claude Code Fundamentals + ADR/DDD | 90 min | Module |
| 10:50-11:05 | Break | 15 min | Break |
| 11:05-12:20 | Module 7: Diagnosing Failures & Frontier Recognition | 75 min | Module |
| 12:20-12:50 | Lunch | 30 min | Lunch |
| 12:50-13:05 | Integration Pause 3 | 15 min | Integration Pause |
| 13:05-13:50 | Extended Lab: Failure Diagnosis on Own Workflows | 45 min | Extended Practice |
| 13:50-14:00 | Day 3 Wrap-up & Capstone Preview | 10 min | Bookend |
| **Total** | **9:00-2:00 PM** | **300 min (5h)** | |
| **Structured** | | **255 min (4h 15m)** | |

## Schedule Summary — Day 4 (Weekend 2, Sunday)

| Time | Item | Duration | Type |
|---|---|---:|---|
| 9:00-9:10 | Day 4 Recap & Capstone Briefing | 10 min | Bookend |
| 9:10-10:10 | Module 8: Iterative Refinement + Quality Judgment + TDD | 60 min | Module |
| 10:10-10:25 | Break | 15 min | Break |
| 10:25-11:55 | Module 9: Capstone Build — CRE Workflow Plugin | 90 min | Module |
| 11:55-12:25 | Lunch | 30 min | Lunch |
| 12:25-13:10 | Capstone Polish & Testing | 45 min | Extended Practice |
| 13:10-13:55 | Capstone Presentations & Peer Feedback | 45 min | Assessment |
| 13:55-14:15 | Course Closing & Next Steps | 20 min | Bookend |
| **Total** | **9:00-2:15 PM** | **315 min (5h 15m)** | |
| **Structured** | | **270 min (4h 30m)** | |

## Grand Total

| Metric | Value |
|---|---|
| **Total days** | 4 (two weekends) |
| **Total onsite** | 1165 min (19h 25m) |
| **Total structured** | 1030 min (17h 10m) |
| **Core instruction (Obj 1-10)** | 725 min (12h 5m) |
| **Integration pauses** | 45 min |
| **Extended practice & labs** | 155 min (2h 35m) |
| **Bookends** | 105 min (1h 45m) |
| **Longest day (onsite)** | Day 4: 5h 15m |
| **Shortest day (onsite)** | Day 1: 4h 20m |

---

## Next Steps

1. Review outline for logical flow and realistic timing
2. Generate detailed lesson plans for each module: `/generate-lesson-plans`
3. Ensure all learning objectives are addressed across modules
4. Design between-weekend homework assignment and practice guide
5. Update `learning-objectives.md` to reflect two-weekend format

## Version History

- v0.1.0 (2026-02-25): Initial 2-day outline generated via Codex CLI (8 modules)
- v0.2.0 (2026-02-25): Restructured to 4-day two-weekend format (9 modules). Added bookends, extended practice sessions (VPD Refinement Workshop, Build-Ready Checkpoint, Extended Lab, Capstone Polish). Expanded capstone from 90 min to 180 min (build + polish + present). Added Week-in-Review opening for Weekend 2. Teaching notes fully integrated into module activities. UDL validation updated for 4-day format.
