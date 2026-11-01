---
title: "CRE-201: AI for CRE - Course Positioning"
date: 2026-02-06
version: 0.6.0
status: draft
instructor: Reggie Chan
organization: 021 Events / Tenebrus Capital
duration: "4-day (two weekends)"
audience: Commercial real estate professionals (brokers, property managers, asset managers, analysts)
keywords: [ai-for-cre, commercial-real-estate, agentic-engineering, claude-code, cre-events, management-skills]
lastUpdated: 2026-02-25
revisionNote: "v0.6.0: Added Reverse Transfer subsection — bidirectional management skills framing. Agentic engineering discipline improves human team management (OFD→delegation, TDD→review rubrics, decomposition→checkpointed assignments)."
---

# CRE-201: AI for CRE - Course Positioning

## Target Audience

Brokers, property managers, asset managers, and analysts in commercial real estate who have used single-turn desktop chatbots (e.g., ChatGPT) and are ready to move beyond basic prompting into structured, multi-step AI workflows for their daily work. Intermediate level; no coding required. See `course-description.md` §Who Should Attend for the full audience profile, prerequisites, and exclusions.

**Audience Heterogeneity Note:** The target audience spans four distinct CRE disciplines with varying AI comfort levels and varying exposure to construction/development processes. A pre-course survey (see `04-materials/CRE_Role_Analogies.md`) assesses each participant's role, experience, and AI baseline. The instructor uses this data to calibrate metaphor intensity and identify participants who may need alternative analogy tracks. See `04-materials/CRE_Role_Analogies.md` for role-specific mappings across all frameworks.

## The Core Insight

### The Workshop as Forcing Function

CRE professionals know they need to level up on AI. They're too busy to do it on their own. This workshop is a forcing function — a structured, compressed intervention that forces participants to upskill across two intensive weekends rather than hoping they'll figure it out between deals. The competitive landscape is moving: if you're still using ChatGPT as a search engine, your competition is building workflows that produce in hours what takes you weeks. This workshop gets you on the train.

The competitive frontier has shifted. The race for better AI models is effectively over — frontier models are already extraordinarily capable. The new competitive advantage is intent infrastructure: which organizations can translate their domain expertise into structured frameworks that tell AI agents how to decide, not just what to know. A mediocre model with clear intent infrastructure will outperform a frontier model with fragmented, unaligned knowledge. This course teaches you to build intent infrastructure.

### Competence Arbitrage

Industries are full of articulate people in senior technical roles who have never done the underlying work. Government and infrastructure are extreme examples — polished talkers get hired into acquisition, asset management, and development roles based on interviews, not track records. These people can't leverage AI because they lack the domain knowledge to direct it. Meanwhile, practitioners with 10-15 years of real experience can use AI to multiply their output by 5-10x — building in an afternoon what an entire team of the unqualified couldn't produce in a month.

AI is also a competence test you can't fake. You can't bullshit a prompt. If you don't understand how a property gets acquired, you can't tell AI what to build — and you can't evaluate whether the output is right. The polished talkers hit a wall with AI that they never hit in meetings or interviews.

Think of AI as a tool that turns an 8-bit image into 16 or 24-bit — it increases the resolution and fidelity of what you already know. But you need to know what that image is to begin with and what the image represents. If the source image is blank, AI amplifies nothing. If you have a clear picture of how property actually gets acquired, AI turns that into a high-resolution deliverable. Domain knowledge is the source image. AI is the upscaler.

**AI doesn't make expertise obsolete. It makes the gap between expertise and bullshit wider and more expensive.**

For CRE professionals, this is the best news they've ever heard. Their domain knowledge just became dramatically more leverageable — and dramatically harder to fake.

**The honest balance:** The competence arbitrage frame is motivationally powerful and fundamentally true. But it can produce overconfidence if participants walk away thinking "I already knew all this, I just needed to apply it to AI." The reality is closer to 60/40 — 60% transferable management instincts, 40% genuinely new AI-specific skills. The course teaches both. Prompt design, context compression, token-aware decomposition, acceptance criteria writing, and frontier calibration are genuinely new competencies that don't have clean CRE equivalents. The positioning is **familiar foundation, new craft** — not "same skills, new domain."

### The Supervision Problem

The competence arbitrage thesis has a practical mechanism: **validation.** How do you manage agents — human or AI — and validate their work, if you aren't a subject matter expert in the work being performed?

This is the management problem that every CRE professional recognizes: the senior manager who's never done the underlying work, now reviewing junior staff output they can't evaluate. AI makes this problem worse because it removes every social cue that signals uncertainty — no nervous junior, no rough draft, no hedging language. AI hands you confidently wrong output in perfect formatting.

The course teaches participants to apply the same validation discipline to AI output that they'd apply to a junior team member's work: structural checks, reasonableness checks, internal consistency, source verification, assumption challenges, edge case testing, and the expert sniff test that only comes from years of doing the work. That last layer — the gut check — is the one thing AI can never do for you. It's the moat.

**AI is the fastest junior employee you've ever managed. The question is whether you're qualified to manage them.** See `04-materials/Concept_Supervision_Without_Expertise.md` for the full concept development, validation framework, anonymized case study, and teaching sequence.

### The Reverse Transfer

The management-to-AI transfer is the course's primary scaffolding: your existing management instincts make agentic engineering intuitive. But the transfer runs both ways.

The structured discipline participants learn here — define success before execution (OFD), write acceptance criteria before reviewing output (TDD), decompose with human checkpoints, validate fit before building (VPD) — is more rigorous than what most managers apply to human teams. CRE professionals who internalize this discipline don't just manage AI better. They manage people better.

| Agentic Discipline | Human Team Application |
|---|---|
| OFD (objective function before requirements) | Define success criteria before delegating a project to a junior |
| TDD (acceptance criteria before execution) | Write a rubric before reviewing an analyst's work product |
| Task decomposition with checkpoints | Break a complex assignment into review-gated stages instead of "get back to me Friday" |
| Context assembly | Brief a new team member the way you'd brief an AI — with everything they need, not everything you know |
| Frontier recognition | Know when to hire a specialist vs. stretch an in-house generalist |
| Iterative refinement with specific feedback | Replace "this isn't what I wanted" with "the rent escalation structure is wrong — here's the criteria it needs to meet" |

This isn't taught as a separate module. It emerges naturally from the rigor of the agentic engineering discipline. But the instructor names it explicitly during the closing: "The documentation chain you just learned isn't just for AI. Try writing an OFD for the next project you delegate to a human. You'll be surprised how much better the output is." See `teaching-notes.md` §Course Closing for the exercise.

### Platform-Durable Skills

Here's what separates this course from every "learn ChatGPT" workshop that'll be obsolete in a year: **you're not learning Claude-specific syntax that gets deprecated in six months. You're learning how to think in workflows, break down processes, and translate your experience into specifications written in plain English.**

The 8-Step Process is a project management methodology — it works regardless of which AI platform you use. The Documentation Chain (PRD, OFD, ADR, DDD, TDD/Evals) is universal project planning — every serious engineering effort uses some version of it. Task decomposition, context assembly, quality judgment, frontier recognition — these are cognitive disciplines, not tool features.

Even the most tool-specific part of the course — Claude Code Skills — are written in structured English, not code. A participant who writes a Skill for lease abstract generation hasn't learned a programming language. They've written a specification in their own professional language. That specification transfers to any agent platform that reads natural language instructions — which is the direction the entire industry is moving.

**The skills taught in this course have three durability layers:**

| Layer | What It Is | Shelf Life |
|-------|-----------|------------|
| **Workflow thinking** | 8-Step Process, task decomposition, documentation chain, quality judgment, frontier recognition | Permanent — these are management disciplines |
| **Plain-English specifications** | Skills, PRDs, acceptance criteria, domain models — all written in natural language | Platform-durable — transfers to any agent system that processes natural language |
| **Claude Code fluency** | Specific component types, commands, tool selection | Platform-specific — but the conceptual categories (autonomous workers, reusable procedures, on-demand actions) exist in every agent framework |

**The three eras of AI discipline map to these layers from bottom to top:** prompt engineering (most perishable), context engineering (mid-tier), intent engineering (most durable). The documentation chain progressively translates purpose into parameters — see `learning-objectives.md` §Documentation Chain Distribution for the detailed era-to-layer mapping.

The course is designed so that even if Claude Code disappears tomorrow, participants retain the workflow thinking and plain-English specification skills that make them effective on whatever platform replaces it.

**This is the long-term competence arbitrage play:** CRE professionals who learn to think in workflows — not just use a specific tool — compound their advantage every time the tooling improves. The tool-learners start over with each platform change. The workflow-thinkers just plug in the new tool.

### CRE-Native Framework

Every concept in AI workflow engineering maps directly to something CRE professionals already do — see the Content Framework Summary table below for the complete mapping. CRE professionals aren't learning foreign skills. They're recognizing familiar ones applied to AI instead of buildings, **then building genuinely new skills on that familiar foundation** (see Market Differentiation #5 for specifics).

## Value Proposition

### What Students Will Achieve

Students will discover that AI is a competence amplifier — it makes their existing CRE expertise dramatically more productive and valuable. Through direct CRE-to-AI mapping, participants will learn to see the development lifecycle in the engineering process, the deal documentation in the workflow documentation, and the project management discipline in the AI management discipline. They will leave with the ability to decompose complex CRE tasks, assemble context for AI systems, diagnose why AI outputs fail, and design complete multi-step workflows using Claude Code. The capstone deliverable is a **working CRE workflow plugin** for a recurring task — a self-contained Claude Code plugin that participants will refine over the following weeks into a production-ready automation. The kind of deliverable that used to require a team starts with the plugin you build in this room.

### Problem Being Solved

CRE professionals are stuck at the "single-turn chatbot" level — asking AI one question at a time and getting inconsistent results. Meanwhile, people with less domain knowledge but better presentation skills are getting promoted around them. Most AI training makes both problems worse by teaching from a developer's perspective, using tech-industry language that feels foreign and irrelevant. CRE professionals walk away thinking "this isn't for me" — not because they lack the skills, but because nobody showed them that AI is the tool that finally rewards what they actually know over how well they present it.

The gap isn't technical ability. It's the absence of a bridge between the AI tools they need and the domain competencies they already possess. This course is that bridge — **and it's honest about where the bridge ends and the new territory begins.**

### Market Differentiation

**1. CRE-native, not CRE-adjacent.** Every framework, document, and practice maps to something CRE professionals already do daily. The 8-step process is the development lifecycle. The documentation chain is the deal process. This isn't translation — it's recognition.

**2. Management lens, not developer lens.** The Holy Trinity (PM, Engineer, Designer) maps to Development Manager, Architect, General Contractor. Participants learn agentic engineering as an extension of the three hats they already wear — not as a foreign technical discipline.

**3. Distributed documentation chain.** VPD → OFD/PRD → ADR → DDD → TDD is taught across the course where each document naturally belongs — PRD with embedded objective function during the planning process, ADR/DDD with the hands-on lab, TDD with quality judgment. Participants produce documents they already know how to write (pro forma with investment criteria, underwriting criteria), applied to AI workflow design.

**3b. VPD-grounded design.** Before writing requirements, participants validate whether the workflow is worth building — using a paired Value Proposition Design canvas that checks business fit (does this address real user jobs?) and engineering fit (can our system deliver?). Every business claim must trace to an engineering mechanism. This "fit before build" discipline prevents the most expensive mistake in agentic engineering: building the wrong thing well.

**4. Hands-on with real tools.** Claude Code serves as the platform, giving participants a real toolkit — not just theory. Every exercise uses their actual CRE tasks.

**5. Competence arbitrage framing with honest boundaries.** Most AI courses sell fear ("AI will replace you"). This course sells leverage: your domain knowledge is the one thing AI can't fake. **And it's honest about what's genuinely new** — prompt design, context compression, and AI frontier calibration are new skills, not relabeled CRE competencies. Participants leave understanding both their advantage and their learning edge.

**6. Platform-durable, not tool-dependent.** Participants learn workflow thinking and plain-English specification skills that transfer to any AI agent platform — not Claude-specific syntax that depreciates with the next product cycle. Even the Skills they write are structured English, not code. The thinking compounds regardless of which tool wins.

**7. Original frameworks.** The Holy Trinity, Four Pillars, Value-Delivery Fit, 8-Step Process, Documentation Chain, and Claude Code component mappings are original to this curriculum. No other course teaches AI workflow engineering through CRE-native mapping.

**8. Intent engineering, not just prompting.** Most AI workshops stop at era 1 (prompt engineering) or era 2 (context engineering). This course teaches era 3: *intent engineering* — encoding goals, constraints, and decision boundaries into the OFD, documentation chain, and acceptance criteria so AI agents know how to decide, not just what to know. The Microsoft Copilot deployment proved the cost of skipping this step: 85% of Fortune 500 adopted, but only 5% scaled — because organizations hired thousands of digital agents without defining how the company makes trade-offs.

## Course Positioning Statement

**For** CRE professionals **who** have real domain expertise but can't get AI to produce reliable, multi-step work products, **this workshop** reveals that AI is a competence amplifier — it rewards what you actually know, not how well you present it. The engineering process behind AI workflows maps directly to the development lifecycle, deal documentation, and project management participants already practice — **providing** a structured 8-step process, a value-delivery fit gate, a distributed four-document planning chain, diagnostic frameworks, and hands-on Claude Code experience, **all taught through CRE-native parallels** that make every concept immediately intuitive. Participants leave with a **working CRE workflow plugin** they will refine into a production tool — because AI turns 15 years of domain knowledge into an unfair advantage, and this course teaches you how to wield it.

## Learning Outcomes Summary

10 objectives across four Bloom's taxonomy levels: Understand (2), Apply (5+1 Apply/Create), Analyze (1), Evaluate (1). Plus Level 0 orientation, 3 integration pauses, and 2 affective domain objectives. The course progresses through the three disciplines of AI work: prompt engineering (Level 0 baseline), context engineering (Obj 2, 6), and intent engineering (Obj 4, 9, 10) — with the documentation chain progressively translating abstract purpose into machine-actionable parameters. Core instruction: ~725 minutes (12.1 hours). With extended practice and bookends: ~990 minutes (16.5 hours total structured time). See `learning-objectives.md` for complete objectives, assessment methods, time allocations, and rationale.

### Content Framework Summary

| Framework | Agentic Engineering | CRE Parallel |
|-----------|---|---|
| **Holy Trinity** | Product Manager, Engineer, Designer | Dev/Asset Manager, Architect, General Contractor |
| **Four Pillars** | Context, Model, Prompt, Tools | Due Diligence, Consultant Selection, RFP/Brief, Trades & Equipment |
| **8-Step Process** | Discover → Plan → Design → Structure → Implement → Validate → Test → Document | Site Selection → Feasibility → SD → CD → Construction → Inspection → Commissioning → As-Builts |
| **Documentation Chain** | VPD → OFD/PRD → ADR → DDD → TDD | Tenant Needs Assessment → Pro Forma + Investment Criteria → IC Memo → Rent Roll/Data Room → Underwriting |
| **Value-Delivery Fit** | Paired VPD (business + engineering customer/system profiles), BMC awareness (cost sniff test) | Tenant Needs Assessment + Building Capability Assessment, Back-of-envelope Pro Forma |
| **Claude Code Basics** | Agents, Skills, Slash Commands, Plugins | Subcontractors, Spec Sections, Work Orders, The Project Package |

**Management skills** (Context Assembly, Quality Judgment, Task Decomposition, Iterative Refinement, Workflow Integration, Frontier Recognition) are embedded across the objectives where they naturally develop — not taught as a separate framework. See the Management Skills Integration Map in `learning-objectives.md`.

## Workshop Format

4-day, two weekends (Sat-Sun + week gap + Sat-Sun; ~17 hours total). In-person, 12-20 participants. See `course-description.md` §Workshop Format and §Course Details for the full schedule and logistics.

## Next Steps

See `learning-objectives.md` §Next Steps for the current checklist (steps 1-3 complete, step 4 next).

## Version History

- v0.1.0 (2026-02-06): Initial positioning
- v0.2.0 (2026-02-20): Incorporated pedagogical review. Reframed "Monday-ready" as "workflow design draft." Reduced framework count from 6 to 5 (absorbed Six Management Skills). Rebalanced competence arbitrage framing ("familiar foundation, new craft" rather than "same skills, new domain"). Updated to 9 objectives. Reworked DDD mapping from Offering Memorandum to Rent Roll/Data Room. Added audience heterogeneity acknowledgment.
- v0.2.1 (2026-02-23): Claude Code components reduced from 5 to 4 (dropped Tools/Scripts, renamed Commands to Slash Commands, reframed Plugins as "The Project Package"). Capstone reframed from "workflow design draft" to "working CRE workflow plugin."
- v0.3.0 (2026-02-25): Added Value-Delivery Fit framework to Content Framework Summary. Updated documentation chain to VPD-grounded sequence (VPD → OFD/PRD → ADR → DDD → TDD). Updated objective count (9→10), time budget (725 min), and cognitive distribution. Added VPD-grounded design to market differentiation.
- v0.4.0 (2026-02-25): Updated format from 2-day to 4-day two-weekend (Sat-Sun + week gap + Sat-Sun). Duration updated to ~17 hours total. Workshop format section updated. Structured time totals updated to include extended practice and bookends (~990 min).
- v0.5.0 (2026-02-25): Added intent engineering framing. Three-era progression (Prompt → Context → Intent) integrated into Platform-Durable Skills and Learning Outcomes. Intent infrastructure positioning added to Forcing Function. Copilot case study (85%/5%) added to Market Differentiation.
- v0.5.1 (2026-02-25): Removed branded labels (Cascade of Specificity, Intent Race) — replaced with direct descriptions. Concepts retained; labels dropped to maintain CRE-native voice.
- v0.5.2 (2026-02-25): Cross-file deduplication. Trimmed Target Audience (prereqs/experience → cross-ref to course-description.md), Workshop Format (→ cross-ref), Platform-Durable Skills (era-layer detail → cross-ref to learning-objectives.md), CRE-Native Framework (removed closing paragraph redundant with Market Differentiation #1), Next Steps (→ cross-ref to learning-objectives.md). Canonical details now stated once in their most logical file.
- v0.5.3 (2026-02-25): Within-file deduplication. CRE-Native Framework replaced inline mapping list with reference to Content Framework Summary table and Market Differentiation #5 for specifics on genuinely new skills.
- v0.6.0 (2026-02-25): Added "The Reverse Transfer" subsection under The Core Insight. Bidirectional management skills framing: agentic engineering discipline (OFD, TDD, decomposition, context assembly, frontier recognition, iterative refinement) transfers to human team management. Table mapping each agentic discipline to its human team application. Cross-refs to teaching-notes.md §Course Closing exercise.
