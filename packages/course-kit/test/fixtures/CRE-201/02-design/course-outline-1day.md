---
title: "Course Outline - CRE-201 Essentials (1-Day)"
date: 2026-03-03
version: 0.1.0
status: draft
courseVersion: 0.6.0
deliveryFormat: "1-day intensive"
deliveryMode: in-person
targetAudience: "CRE professionals (brokers, property managers, asset managers, analysts)"
participantCount: "12-20"
lastUpdated: 2026-03-03
sourceFiles:
  learning-objectives: "01-planning/learning-objectives.md"
  delivery-strategy: "01-planning/delivery-strategy.md"
  course-positioning: "01-planning/course-positioning.md"
sourceHashes:
  learning-objectives: "5d20fe54"
relatedDocs:
  - course-outline.md
  - ../01-planning/delivery-strategy.md
---

# Course Outline: CRE-201 Essentials (1-Day)

## CRE-201: AI for CRE — One-Day Intensive

**Duration:** 1 day (8:30 AM – 4:30 PM)
**Total Instruction Time:** 345 minutes (5.75 hours)
**Delivery Layers:** Layer 1 (Mindset Shift) + Layer 2 (Practical Skills)
**Objectives Covered:** Level 0, Obj 1, Obj 2, Obj 5, Obj 6, Obj 4 (6 of 10)
**Consciousness Level:** Frameworks named explicitly; remaining course frameworks present implicitly through the lease abstraction thread (see `delivery-strategy.md` §Consciousness Gradient)

**Relationship to Full Course:** This outline covers Layers 1-2 of the three-layer delivery model defined in `delivery-strategy.md`. Layer 3 (Obj 3, 7, 8, 9, 10 — the Build Layer) is reserved for the full 4-day format in `course-outline.md`. Students who complete this 1-day course can progress to a 2-day Layer 3 workshop covering Claude Code tools, failure diagnosis, iterative refinement, and the capstone plugin.

---

## Pre-Workshop

**48 hours before (sent to all participants):**
- Course agenda and objectives overview (1-page PDF)
- AI vocabulary glossary handout (key terms: prompt, context, model, agent, workflow, iteration)
- "Where Are You Now?" self-assessment link (4-point AI usage scale)
- Software pre-install instructions: Claude Code installed and authenticated on participant laptops
- Accommodation note: "Is there anything we can do to support your learning? (Examples: large-print materials, seating preferences, frequent breaks.)"

**UDL Note:** Pre-reading materials reduce cold-start anxiety and allow participants with processing speed differences to preview vocabulary before the workshop. The self-assessment creates a private baseline so participants aren't publicly exposed during Level 0.

---

## Module 1: The Gap & The Mental Model

**Time:** 8:45 – 10:00 (75 min)
**After:** Welcome & Setup (8:30 – 8:45, 15 min)

### Learning Objective(s)

- **Level 0:** Establish baseline AI vocabulary and demonstrate the gap between single-turn prompting and multi-step workflows
- **Obj 1 (Understand):** Explain the three roles of agentic engineering (Product Manager, Engineer, Designer) and how each maps to management competencies CRE professionals already possess

### Key Topics

- The quality gap: single-turn prompting vs. structured multi-step workflow
- AI vocabulary baseline: prompt, context, model, agent, workflow, iteration
- The Holy Trinity: PM, Engineer, Designer — three hats CRE professionals already wear
- CRE parallel: Development Manager, Architect, General Contractor
- Identity anchor: "This is management work, not coding"

### Activities

| Time | Activity | Type | UDL |
|------|----------|------|-----|
| 8:30 – 8:45 | **Welcome & Setup:** Instructor introduction, agenda overview, ground rules, technology check | Whole group | Written agenda displayed + verbal walkthrough |
| 8:45 – 9:05 | **Level 0 Gap Demo (20 min):** Instructor pastes lease excerpt into chatbot ("summarize the key terms") — mediocre output. Then shows same lease processed through multi-step workflow (classify → load legislation → extract → validate) — dramatically better output. Quality gap is self-evident. Participants follow along on their own machines. | Instructor-led demo + side-by-side replication | Visual (live demo) + verbal narration + written instructions on screen |
| 9:05 – 9:10 | **Vocabulary anchor (5 min):** Six key terms defined with reference to what participants just saw. Glossary handout referenced. | Whole group | Verbal + handout reference + terms displayed on screen |
| 9:10 – 9:40 | **Holy Trinity instruction (30 min):** Instructor introduces PM/Engineer/Designer roles. Each role mapped to a CRE equivalent (Dev Manager/Architect/GC). Instructor walks back through the gap demo: "When I decided WHAT to extract — that was PM. When I designed HOW to structure the output — that was Designer. When I built the actual workflow — that was Engineer. You do all three when you manage a development project." | Instruction + CRE mapping | Verbal explanation + visual diagram (3-circle Venn) + CRE parallel table on screen + handout |
| 9:40 – 10:00 | **Reflection exercise (20 min):** Participants identify one CRE task from their own work and map the three Holy Trinity roles to it. Written or verbal — participant choice. Share with a neighbor (pairs). 2-3 volunteers share with the room. | Individual → pairs → whole group | Written OR verbal response (learner choice); pair-share before whole-group reduces anxiety |

### Assessment

**Formative:** Written or verbal explanation connecting each Holy Trinity role to a specific CRE management parallel (peer discussion, no instructor grading)

### Materials Needed

- Sample commercial lease excerpt (2-3 pages, Ontario jurisdiction)
- Pre-built lease abstraction workflow (Claude Code plugin — instructor's REIXS-backed demo)
- Holy Trinity visual diagram (3-circle Venn: PM / Engineer / Designer with CRE labels)
- Holy Trinity reflection worksheet (digital + print)
- Glossary handout (pre-distributed)

### Instructor Notes

- The gap demo IS the course hook. If this doesn't land, nothing else will. Practice it until it's smooth.
- The REIXS spec behind the demo is invisible to students — it's the instructor's validated backbone ensuring the demo is reproducible and correct (see `delivery-strategy.md` §REIXS Role 1).
- Don't rush the reflection exercise. This is where participants connect new concepts to existing identity. The pair-share creates psychological safety before public sharing.
- Watch for participants who struggle to identify CRE parallels — they may need alternative analogies from `04-materials/CRE_Role_Analogies.md`.

---

### Break (10:00 – 10:15, 15 min)

---

## Module 2: The Diagnostic Toolkit

**Time:** 10:15 – 11:30 (75 min)

### Learning Objective(s)

- **Obj 2 (Understand):** Describe the four pillars of agentic engineering (Context, Model, Prompt, Tools) and explain how each pillar contributes to the quality of AI-generated output
- **Integration Pause 1:** Consolidate Holy Trinity + Four Pillars into a single integrated mental model

### Key Topics

- Four Pillars: Context, Model, Prompt, Tools
- CRE parallel: Due Diligence, Consultant Selection, RFP/Brief, Trades & Equipment
- Diagnostic framework: "When AI output is wrong, one of these four is broken"
- Pillar interdependencies: how pillars interact and compensate for each other
- Retrospective diagnosis of Level 0 gap demo through pillar lens

### Activities

| Time | Activity | Type | UDL |
|------|----------|------|-----|
| 10:15 – 10:20 | **Reconnect (5 min):** "Before the break, you identified three roles you play. Now we're going to learn the four factors that determine whether the AI's output is any good." | Whole group | Verbal bridge from Module 1 |
| 10:20 – 10:45 | **Four Pillars instruction (25 min):** Instructor introduces Context, Model, Prompt, Tools. Each mapped to CRE equivalent. Instructor revisits the gap demo: "The single-turn attempt failed because Context was thin — the AI didn't know the jurisdiction, the lease type, or what 'correct extraction' looks like. Same Model, same basic Prompt, minimal Tools. The multi-step version fixed Context, upgraded the Prompt, and added Tools. Same AI, dramatically different output." | Instruction + retrospective demo analysis | Verbal + visual diagram (4-pillar graphic) + CRE parallel table + live callback to gap demo |
| 10:45 – 11:00 | **Pillar diagnosis exercise (15 min):** Instructor shows 2 failed AI outputs (pre-generated, lease-related). Participants identify which pillar(s) failed and propose a fix. Individual think time (2 min) → pair discussion (5 min) → whole-group debrief (8 min). | Individual → pairs → whole group | Written notes OR verbal; failed outputs displayed on screen + printed handout |
| 11:00 – 11:05 | **Transition (5 min):** "You now have two frameworks: three roles and four diagnostic levers. Let's see if you can use them together." | Whole group | Verbal |
| 11:05 – 11:30 | **Integration Pause 1 (25 min):** Participants take the SAME CRE task from Module 1 and add the Four Pillars lens. Worksheet prompt: "For your CRE task, identify: (1) Which role are you playing right now? (2) Which pillar is most likely to cause failure? (3) What would you do to fix it?" Individual work (10 min) → small group discussion (10 min) → 2-3 groups share key insights (5 min). | Individual → small group → whole group | Worksheet (digital + print); concept map OR written response (learner choice) |

### Assessment

**Formative:** Concept map or written explanation showing pillar interdependencies with CRE-specific examples (self-assessed against instructor example)

### Materials Needed

- Four Pillars visual diagram (Context / Model / Prompt / Tools with CRE labels)
- 2 pre-generated failed AI outputs (lease-related, each with a different pillar failure)
- Integration Pause 1 worksheet (digital + print) — maps Holy Trinity + Four Pillars to one CRE task
- Instructor example: completed Integration Pause worksheet for lease abstraction

### Instructor Notes

- The retrospective demo analysis is powerful — participants see the SAME demo from Module 1 through a new diagnostic lens. Don't skip it.
- The pillar diagnosis exercise is the first "genuinely new" skill — diagnosing AI failures is not a CRE transfer skill. Move slowly here.
- Integration Pause 1 is the most important consolidation point in the morning. If participants can map both frameworks to one task, they're ready for the afternoon. If they can't, the afternoon won't land.
- UDL: Offer concept map OR bullet-point list OR verbal explanation for the integration exercise. The goal is demonstrating understanding of framework connections, not format compliance.

---

### Transition to Lunch Topic Tease (11:30 – 11:35, 5 min)

"This afternoon, you'll learn the two most practical skills in the course: how to break a complex task into pieces an AI can handle, and how to give the AI everything it needs to do the job well. After lunch, we build."

---

### Lunch (11:35 – 12:35, 60 min)

---

## Module 3: Breaking Down the Work

**Time:** 12:35 – 2:10 (95 min)

### Learning Objective(s)

- **Obj 5 (Apply):** Apply task decomposition to break a complex CRE process into discrete, delegable units suitable for agentic execution, identifying human checkpoints at appropriate boundaries
- **Obj 6 (Apply):** Apply context assembly techniques to provide Claude Code with sufficient background information, constraints, and success criteria for accurate CRE task execution

### Key Topics

**Task Decomposition (first half):**
- Breaking complex CRE processes into AI-delegable and human-required units
- Human checkpoints: where the AI must stop and a human must decide
- CRE parallel: phased construction with inspection gates
- Lease abstraction decomposition: classify → load rules → extract → validate → human review

**Context Assembly (second half):**
- The "most underestimated pillar" — why domain experts fail at AI
- What context includes: domain background, constraints, success criteria, examples, templates
- Thin context vs. rich context: same prompt, dramatically different output
- CRE parallel: briefing a new analyst vs. briefing a seasoned one

### Activities

| Time | Activity | Type | UDL |
|------|----------|------|-----|
| 12:35 – 12:40 | **Re-engagement (5 min):** Quick recap of morning frameworks. "You know the three roles and the four pillars. Now: the two skills you'll use Monday morning." | Whole group | Verbal + visual recap slide |
| 12:40 – 12:55 | **Task decomposition instruction (15 min):** Instructor walks through lease abstraction as a decomposition example. Shows the full process broken into 5-6 steps with human checkpoints marked. "Step 3 is where the AI extracts terms. Step 4 is where YOU check if the extraction is correct. This checkpoint is non-negotiable — the AI doesn't know if it got the permitted use clause right. You do." CRE parallel: phased construction with inspection gates at each stage. | Instruction + worked example | Verbal + decomposition diagram displayed + printed reference |
| 12:55 – 13:20 | **Decomposition exercise (25 min):** Participants select a recurring CRE process from their own work (lease renewal, tenant screening, asset report, due diligence checklist). Break it into 4-7 steps. Mark each step as AI-delegable or human-required. Identify at least 2 human checkpoints. Individual work (15 min) → pair review: "Did your partner miss a human checkpoint?" (10 min). | Individual → pairs | Worksheet (digital + print); decomposition map format OR bullet list (learner choice) |
| 13:20 – 13:25 | **Activity transition (5 min):** Stand, stretch. "You just learned how to break work apart. Now: how to give the AI what it needs to do each piece well." | Transition | Physical movement break — UDL accommodation for sustained seated work |
| 13:25 – 13:40 | **Context assembly instruction (15 min):** Instructor shows the "before and after" — same lease abstraction prompt with thin context (just the lease) vs. rich context (lease + jurisdiction legislation + property-type template + success criteria + example output). Run both live. The quality difference is self-evident. "The AI didn't get smarter. You gave it what it needed." | Instruction + live comparison demo | Visual comparison (side-by-side outputs) + verbal analysis + printed reference |
| 13:40 – 14:00 | **Context assembly exercise (20 min):** Participants take one step from their decomposition map and list everything the AI would need to execute it well. Categories: domain background, constraints, success criteria, examples/templates, edge cases. Individual work (10 min) → pair review: "What did your partner forget?" (10 min). | Individual → pairs | Worksheet with category prompts; written OR annotated diagram |
| 14:00 – 14:10 | **Module debrief (10 min):** 2-3 volunteers share their decomposition + context assembly. Instructor highlights patterns: "Notice how everyone's context list is longer than they expected. That's the gap between 'I know what I want' and 'the AI has what it needs.'" | Whole group | Verbal sharing + instructor synthesis |

### Assessment

**Formative (Obj 5):** Decomposition map showing a multi-step CRE process with AI-delegable and human-required components marked (peer review)
**Formative (Obj 6):** Side-by-side comparison — participants can articulate why rich context produces better output than thin context (self-assessed, quality difference is self-evident)

### Materials Needed

- Lease abstraction decomposition diagram (instructor example — 5-6 steps with checkpoints)
- Decomposition worksheet (digital + print) — categories: step description, AI or human, checkpoint Y/N
- Context assembly worksheet (digital + print) — categories: domain background, constraints, success criteria, examples, edge cases
- Pre-prepared thin-context and rich-context prompts for live comparison demo
- Sample lease document (same as Module 1)

### Instructor Notes

- This module combines two objectives because they're the practical twin: decomposition says WHAT to delegate; context assembly says HOW to equip each delegated piece. Teaching them back-to-back reinforces the connection.
- The "before and after" context demo is the afternoon's "wow" moment — equivalent to the Level 0 gap demo but now participants understand WHY. The first demo showed the gap; this one shows the mechanism.
- The activity transition at 13:20 is deliberate — participants have been seated since 12:35. A brief stretch break prevents afternoon slump and marks the shift from decomposition to context assembly.
- Consciousness gradient note: The instructor IS defining what "correct" means (OFD), IS accounting for jurisdictions (DDD), IS testing outputs (TDD) during the live demos — all implicitly. Don't name these frameworks yet. They're present; they're just not the focus. See `delivery-strategy.md` §Consciousness Gradient.
- UDL: The decomposition exercise offers two formats (map vs. list). Some participants think spatially; others think linearly. Both demonstrate the same skill.

---

### Break (2:10 – 2:25, 15 min)

---

## Module 4: The Engineering Backbone

**Time:** 2:25 – 4:00 (95 min)

### Learning Objective(s)

- **Obj 4 (Apply):** Apply the 8-step agentic engineering process (Discover, Plan, Design, Structure, Implement, Validate & QA, Test, Document) to plan an agentic workflow for a specific CRE task, first defining an objective function (what success looks like, what's off limits, when to stop) and then producing a PRD that operationalizes those objectives into buildable requirements

### Key Topics

- 8-Step Process: Discover → Plan → Design → Structure → Implement → Validate & QA → Test → Document
- CRE parallel: Site Selection → Feasibility → SD → CD → Construction → Inspection → Commissioning → As-Builts
- **OFD vs. PRD — the critical distinction:**
  - OFD (Objective Function Document) = **"What does winning look like?"** — primary objective, hard constraints, escalation triggers. CRE parallel: **investment criteria** ("7%+ cap rate, Class B+, 85%+ occupancy, walk away if Phase II required")
  - PRD (Product Requirements Document) = **"What do we build to win?"** — operationalizes the OFD into buildable requirements. CRE parallel: **acquisition checklist** ("property inspection, tenant estoppels, title search, rent roll verification")
  - **The test:** "Can I evaluate whether the output is correct without reading the PRD?" If yes → OFD. If it's about how to build → PRD.
  - The OFD sits above the PRD. You could change your acquisition process (PRD) without changing what you're looking for (OFD). But if you change your investment thesis (OFD), the entire process (PRD) must change to serve it.
- Intent engineering: encoding goals and decision boundaries so AI knows HOW to decide, not just WHAT to know

### Activities

| Time | Activity | Type | UDL |
|------|----------|------|-----|
| 2:25 – 2:30 | **Reconnect (5 min):** "You can break tasks apart and equip each piece with context. Now: the methodology that ties it all together — from 'I have an idea' to 'it's built, tested, and documented.'" | Whole group | Verbal bridge from Module 3 |
| 2:30 – 2:50 | **8-Step Process instruction (20 min):** Instructor walks through all 8 steps using the lease abstraction plugin as the worked example. Each step mapped to its CRE development lifecycle parallel. "You already do this with buildings. Same sequence, different material." Visual: 8-step timeline displayed with CRE parallel underneath. | Instruction + CRE mapping | Verbal + visual timeline diagram + CRE parallel table + printed reference card |
| 2:50 – 3:05 | **OFD instruction (15 min):** Instructor introduces the Objective Function Document — "What does winning look like?" Three fields: (1) Primary objective: what are we optimizing for? (2) Hard constraints: what would make us walk away? (3) Escalation triggers: when must the AI stop and ask a human? **CRE parallel — investment criteria:** "Before you underwrite a deal, you define what a good deal looks like: 7%+ cap rate, Class B+ or better, 85%+ occupancy, walk away if Phase II environmental required. You don't start the acquisition process without knowing what you're looking for. The OFD is the same discipline — define winning before you build." **Lease abstraction OFD example:** "Primary objective: extract all material lease terms accurately. Hard constraint: never fabricate a term that isn't in the document. Escalation trigger: if a clause is ambiguous, flag for human review rather than guessing." | Instruction + worked example | Verbal + OFD template displayed + investment criteria analogy on screen + lease abstraction OFD example |
| 3:05 – 3:25 | **OFD exercise (20 min):** Participants write an OFD for the CRE task they decomposed in Module 3. Three fields only — keep it simple. Individual work (12 min) → pair review using checklist: "Is the primary objective specific enough? Are the hard constraints actually hard? Would you know when to escalate?" (8 min). | Individual → pairs | OFD worksheet (digital + print); checklist for peer review |
| 3:25 – 3:40 | **PRD instruction + exercise (15 min):** "The OFD defines what winning looks like — your investment criteria. The PRD answers a different question: what do we BUILD to win? It's your acquisition checklist." **CRE parallel — acquisition checklist:** "Your investment criteria say '7%+ cap rate, Ontario, Class B+.' Your acquisition checklist says 'property inspection, tenant estoppels, title search, rent roll verification, OpEx audit.' You could change your acquisition process without changing what you're looking for — and if you change your investment thesis, the whole checklist has to change to serve it. Same relationship: OFD above, PRD below." **The test:** "Can I evaluate whether the output is correct without reading the PRD? If yes, that criterion belongs in the OFD. If it's about HOW to build, it belongs in the PRD." Participants add 3-5 requirements to their OFD, turning it into a mini-PRD. Each requirement must trace back to their primary objective or a hard constraint. | Instruction + individual practice | Verbal + OFD-vs-PRD comparison table displayed + PRD template; participants extend their OFD worksheet |
| 3:40 – 3:50 | **8-Step walkback (10 min):** Instructor maps the full day's work to the 8-Step Process: "This morning, you Discovered (gap demo) and Planned (decomposition). This afternoon, you Designed (OFD) and Structured (PRD + context assembly). In the full course, you'd continue through Implement, Validate, Test, and Document. You've completed 4 of 8 steps today." | Whole group | Verbal + visual showing steps 1-4 highlighted on timeline |
| 3:50 – 3:55 | **REIXS North Star preview (5 min):** "The OFD you just wrote — three fields, plain English. Here's what a production-grade OFD looks like." Instructor briefly shows the REIXS OFD section (projected, not taught). "Uncertainty policy. Scoring rubric. Failure conditions. Everything you wrote, plus the engineering rigor that makes it machine-validatable. This is where your work is heading — and it's what the advanced course teaches." | Instructor-led preview | Visual (projected REIXS spec excerpt) + verbal framing — NOT an exercise |
| 3:55 – 4:00 | **Module wrap (5 min):** Key takeaway: "You now have a methodology (8-Step), investment criteria for your AI workflows (OFD), and an acquisition checklist to build them (PRD). The OFD tells you what winning looks like. The PRD tells you what to build. These are the planning tools that make everything else work." | Whole group | Verbal synthesis |

### Assessment

**Formative:** Completed OFD (3 fields) + mini-PRD (3-5 requirements) for a participant-selected CRE task (peer review using OFD checklist)

### Materials Needed

- 8-Step Process visual timeline with CRE parallel labels
- 8-Step Process reference card (wallet-sized or single-page — participants take this home)
- OFD worksheet (digital + print) — three fields: primary objective, hard constraints, escalation triggers
- OFD peer review checklist (3 questions)
- PRD template (abbreviated — problem, users, requirements, constraints, success metrics)
- Lease abstraction OFD example (completed, instructor reference)
- REIXS OFD section excerpt (projected only — not distributed as a handout)

### Instructor Notes

- The 8-Step Process instruction moves fast (20 min for 8 steps). This is intentional — participants need the overview, not deep mastery of each step. The CRE parallel does the heavy lifting: "You already know this sequence."
- The OFD exercise is the most important afternoon activity. If participants can write three clear fields (objective, constraints, escalation), they've internalized the core of intent engineering. Spend time here, not on the PRD.
- **The OFD/PRD distinction must be crystal clear.** The investment criteria vs. acquisition checklist parallel is the sharpest way to land it. If participants confuse the two, ask: "Could you judge whether the AI's output is correct using only this statement? If yes, it's OFD. If it's about how to build the workflow, it's PRD." Common confusion: participants put process steps in the OFD (that's PRD) or success criteria in the PRD (that's OFD). The investment criteria analogy prevents this — nobody puts "conduct a title search" in their investment criteria.
- The REIXS preview is exactly 5 minutes. Don't teach it. Don't distribute it. Just show it: "This is where your work is heading." This plants a seed for CRE-301 without adding cognitive load. See `delivery-strategy.md` §REIXS Role 2.
- The 8-Step walkback is a metacognitive moment — participants realize they've been following the methodology all day without knowing it. This reinforces the consciousness gradient principle: they experienced the pattern before they named it.
- UDL: The OFD exercise accepts any format that captures the three fields. Some participants will write paragraphs, others will use bullet points, others will annotate a diagram. All are valid.

---

## Course Closing

**Time:** 4:00 – 4:30 (30 min)

### Activities

| Time | Activity | Type | UDL |
|------|----------|------|-----|
| 4:00 – 4:10 | **Course synthesis (10 min):** Visual recap of the full day's arc. "You started this morning watching a gap demo. By this afternoon, you were writing OFDs and PRDs for your own tasks. Here's what you now have: an identity framework (Holy Trinity), a diagnostic toolkit (Four Pillars), a decomposition skill, a context assembly practice, and a methodology (8-Step Process + OFD/PRD)." Instructor displays a single visual showing all five elements connected. | Whole group | Visual synthesis diagram + verbal narrative |
| 4:10 – 4:15 | **Reverse transfer moment (5 min):** "Quick exercise: name one thing from today that you'll apply to managing a HUMAN team member, not an AI." 1 minute think time → 3-4 volunteers share. Examples: "I'll write clearer success criteria before delegating." "I'll break assignments into checkpoint stages." | Individual → whole group | Verbal; private reflection before sharing |
| 4:15 – 4:22 | **What comes next (7 min):** Preview of Layer 3 (the Build Layer): Claude Code hands-on, failure diagnosis, iterative refinement, capstone plugin. "Today you learned to think in workflows. The full course teaches you to build them — and leaves you with a working plugin for a task you do every week." Mention CRE-301 path: "Everything you learned today compiles into a single specification file that a machine can validate. Learning to write those specs is the advanced course." | Whole group | Verbal + visual (Layer 1-2-3 diagram from delivery strategy) |
| 4:22 – 4:30 | **Post-course resources & Q&A (8 min):** Distribute: 8-Step Process reference card, glossary, completed worksheets (digital). Post-course email with all materials + recommended next steps. Open Q&A. | Whole group | Physical reference card + digital materials bundle |

### Materials Needed

- Course synthesis visual (single diagram connecting all five elements)
- Layer 1-2-3 progression visual (from delivery strategy)
- 8-Step Process reference card (take-home)
- Digital materials bundle (all worksheets, glossary, diagrams — emailed post-course)

---

## Schedule Summary

| Time | Module | Duration | Type |
|------|--------|----------|------|
| 8:30 – 8:45 | Welcome & Setup | 15 min | Opening |
| 8:45 – 10:00 | Module 1: The Gap & The Mental Model | 75 min | Instruction + Reflection |
| 10:00 – 10:15 | Break | 15 min | — |
| 10:15 – 11:30 | Module 2: The Diagnostic Toolkit | 75 min | Instruction + Integration |
| 11:30 – 11:35 | Lunch Topic Tease | 5 min | Transition |
| 11:35 – 12:35 | Lunch | 60 min | — |
| 12:35 – 2:10 | Module 3: Breaking Down the Work | 95 min | Applied Skills (practice-heavy) |
| 2:10 – 2:25 | Break | 15 min | — |
| 2:25 – 4:00 | Module 4: The Engineering Backbone | 95 min | Methodology + Planning |
| 4:00 – 4:30 | Course Closing | 30 min | Synthesis + Next Steps |

**Total Instruction:** 345 min (5.75 hours)
**Total Breaks:** 30 min
**Total Lunch:** 60 min
**Total Opening + Closing:** 45 min
**Grand Total:** 480 min (8.0 hours)

## Timing Allocation Analysis

| Component | Minutes | Percentage |
|-----------|---------|-----------|
| Instruction (lectures, demos, worked examples) | 130 min | 38% |
| Guided practice (exercises with instructor support) | 100 min | 29% |
| Peer interaction (pair/group discussion, peer review) | 65 min | 19% |
| Assessment/debrief (sharing, synthesis, Q&A) | 50 min | 14% |

**Note:** The split skews toward instruction (38%) compared to the skill's recommended 20-30% because this is a crash course covering conceptual foundations. The full 4-day course shifts significantly toward independent practice (30-40%) in Layers 2-3. This 1-day format prioritizes "I do" and "We do" phases of the Gradual Release model — participants observe and practice alongside the instructor. Independent "You do" happens post-course.

## Objective Coverage Map

| Objective | Module | Time | Cognitive Level | Assessment |
|-----------|--------|------|----------------|------------|
| Level 0: Orientation | 1 | 20 min | — | Self-assessment (pre-distributed) |
| Obj 1: Holy Trinity | 1 | 55 min | Understand | Written/verbal CRE mapping (formative) |
| Obj 2: Four Pillars | 2 | 45 min | Understand | Pillar diagnosis + concept map (formative) |
| Integration Pause 1 | 2 | 25 min | — | Combined framework mapping (formative) |
| Obj 5: Task Decomposition | 3 | 45 min | Apply | Decomposition map with checkpoints (formative) |
| Obj 6: Context Assembly | 3 | 45 min | Apply | Before/after comparison + context list (formative) |
| Obj 4: 8-Step + OFD/PRD | 4 | 85 min | Apply | OFD (3 fields) + mini-PRD (formative) |

**Objectives NOT covered (Layer 3 — full course only):**
- Obj 3: Value-Delivery Fit (paired VPD + BMC) — "Should I build this?"
- Obj 7: Claude Code Fundamentals + ADR/DDD — Hands-on tools
- Obj 8: Diagnosing Failures + Frontier Recognition — Analytical skills
- Obj 9: Iterative Refinement + TDD — Quality judgment
- Obj 10: Capstone Plugin — Synthesis deliverable

**Implicitly present but not named (consciousness gradient):**
- OFD expanded fields (uncertainty policy, scoring rubric) → present in REIXS preview
- DDD (Domain Data Dictionary) → present in gap demo (jurisdiction-specific rules) and context assembly (domain background)
- TDD/acceptance criteria → present in OFD exercise (defining "correct") and context assembly (success criteria)
- SESF/behavioral rules → present in decomposition (decision logic at checkpoints)
- Frontier recognition → present in decomposition (marking human-required steps)

## UDL Validation

### Representation (The "What")
- [x] Every module presents key concepts in at least 2 modes (verbal + visual in all modules; live demos in M1, M3; printed handouts throughout)
- [x] Complex processes illustrated with diagrams (Holy Trinity Venn, Four Pillars graphic, 8-Step timeline, decomposition maps)
- [x] Technical terms defined in context and compiled in glossary handout (pre-distributed)
- [x] Examples span multiple CRE contexts (lease abstraction as anchor + participant-generated examples from their own roles)
- [x] Reference handouts available for every module (worksheets, diagrams, reference cards)

### Engagement (The "Why")
- [x] Each half-day includes learner choice (AM: reflection format in M1; PM: task selection in M3, response format in M4)
- [x] Every module opens with real-world connection (gap demo in M1, retrospective diagnosis in M2, "Monday morning" framing in M3, methodology mapping in M4)
- [x] Activities alternate collaborative and individual (individual → pairs → whole group pattern in all modules)
- [x] Low-stakes practice precedes sharing (think time before pair-share; pair-share before whole-group in every exercise)
- [x] Progress visible through module recaps (transition statements, 8-Step walkback in M4, course synthesis in closing)

### Action & Expression (The "How")
- [x] Multiple response formats accepted (written OR verbal OR diagram in M1 reflection, M2 integration, M3 decomposition, M4 OFD)
- [x] Time guidance provided with prioritization ("complete the 3 OFD fields first; PRD requirements are a stretch extension")
- [x] Standing/stretch break included at Module 3 midpoint (13:20)
- [x] Non-technology fallback: all worksheets available in print; exercises work with paper and pen if devices fail
- [x] Rubrics assess understanding, not format (OFD peer review checks content quality, not presentation)

### Proactive Accommodation
- [x] All materials in digital + print
- [x] Font sizes: 18pt+ projected, 12pt+ handouts (specify in materials prep)
- [x] Color paired with text labels in all diagrams
- [x] Breaks every 75-95 minutes (within 90-120 min guideline)
- [x] Buffer time: ~35 min across the day (transitions, flexible debrief lengths)
- [x] Pre-reading sent 48 hours before workshop

## Implicit Framework Presence

Per the consciousness gradient principle from `delivery-strategy.md`, the following frameworks are **present but not named** in this 1-day format. The instructor does these things during demos and exercises; students absorb the pattern without learning the formal framework name:

| Framework (Named in Full Course) | Where It Appears Implicitly | What the Instructor Says Instead |
|----------------------------------|-----------------------------|----------------------------------|
| Domain Data Dictionary (DDD) | Gap demo: jurisdiction-specific rules; Context assembly: domain background | "The workflow loads Ontario legislation for this lease — different province, different rules" |
| TDD / Acceptance Criteria | OFD exercise: defining "correct"; Context assembly: success criteria | "Before we run anything, what does 'good output' actually look like?" |
| Value-Delivery Fit (VPD) | Module 3 opening: "Is this task worth automating?" | "Not every task needs an AI workflow. Some are faster by hand." |
| ADR (Architecture Decision Records) | Gap demo: why multi-step instead of single-turn | "I chose to classify first because jurisdiction rules depend on property type" |
| SESF / Behavioral Rules | Decomposition: decision logic at human checkpoints | "If the clause is ambiguous, the AI stops and asks you" |
| Frontier Recognition | Decomposition: marking human-required steps | "This step requires your professional judgment — the AI can't evaluate this" |
| Iterative Refinement | Context assembly: comparing outputs and adjusting | "The first output wasn't right. We added more context and ran it again." |

These frameworks become explicit content in the full 4-day course (Layer 3). Students who complete the 1-day version will recognize them when they encounter the formal names: "Oh, THAT'S what a DDD is — I saw you do that when you loaded the jurisdiction rules."

## Next Steps

1. Review outline for logical flow and realistic timing
2. Validate against delivery-strategy.md Layer 1 + 2 definitions
3. Generate detailed lesson plans: `/generate-lesson-plans` (if proceeding to full materials development for this format)
4. Prepare demo materials: sample lease, pre-built workflow, failed output examples
5. Schedule dry-run with David using Layer 1 subset (Modules 1-2 only, ~2.5 hours)

## Version History

- v0.1.0 (2026-03-03): Initial 1-day crash course outline. 4 modules covering Layer 1 + Layer 2 (Level 0, Obj 1, 2, 5, 6, 4). 345 min instruction in 8-hour day. Consciousness gradient applied — all frameworks present, 5 named explicitly, remainder implicit. REIXS north star preview in Module 4. UDL validation complete. Based on delivery-strategy.md v0.3.0 and learning-objectives.md v0.6.0.
