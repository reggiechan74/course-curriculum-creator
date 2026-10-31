---
title: "CRE-201: AI for CRE"
date: 2026-02-06
version: 0.3.0
status: draft
keywords: [ai-for-cre, commercial-real-estate, curriculum, cre-events]
lastUpdated: 2026-02-25
---

# CRE-201: AI for CRE

**Status:** Draft
**Version:** 0.3.0
**Last Updated:** 2026-02-25

**Series Framework:** [`../CRE_Series_Framework.md`](../CRE_Series_Framework.md) — governs concept progression across all CRE courses. This course's planning docs must align with the series framework.

## Overview

A 2-day intensive workshop for commercial real estate professionals to build practical AI skills using management-based frameworks. Participants learn to delegate tasks, review outputs, design workflows, and build personal AI playbooks — all within CRE-specific contexts. 10 learning objectives across four Bloom's taxonomy levels, built on 6 original frameworks with integration pauses and post-course reinforcement.

## Project Structure

```
01-planning/          Course positioning, description, objectives
02-design/            Course outline and lesson plans
03-assessment/        Rubrics and evaluation criteria
04-materials/         Student handouts and instructor materials
```

## Development Workflow

### Backward Design Approach

1. **Define Learning Outcomes** (`01-planning/learning-objectives.md`) — COMPLETE (v0.3.0)
   - 10 objectives + Level 0 orientation + 3 integration pauses + 2 affective objectives
   - Pedagogical review incorporated (2026-02-09 → 2026-02-20)

2. **Design Assessments** (`03-assessment/rubrics.md`) — COMPLETE (v0.1.0)
   - 9 analytical rubrics (1-5 scale) aligned to all objectives
   - Formative assessments (Obj 1-7), Summative assessments (Obj 8-9)
   - Affective domain assessment, formative strategy, alignment matrix
   - Reviewed in `01-planning/learning-objectives-review.md`

3. **Plan Learning Activities** (`02-design/`) — NEXT
   - Use `/generate-outline` for structure (design for completeness, no time compression)
   - Use `/generate-lesson-plans` for detailed plans
   - Validate alignment with outcomes and assessments

4. **Create Supporting Materials** (`04-materials/`)
   - Use `/generate-artifacts` command
   - Generate handouts, guides, etc.
   - Post-course reinforcement: Week 1 Challenge, diagnostic one-pager, spaced repetition emails

### Quality Assurance

- Run `/review-curriculum` to validate alignment
- Check outcomes -> assessments -> activities coherence

## Series Design Principles

### Theory/Tool Progression

The CRE series follows a deliberate progression from design thinking to tool fluency:

| Series | Concept + Design on Paper | Hands-on in Tool | Rationale |
|--------|--------------------------|-------------------|-----------|
| **201** | ~50% | ~50% | Build mental models first. Participants learn to externalize intent through handwritten plans, PRDs, and design sketches *before* the tool starts making decisions. |
| **301** | ~20% | ~80% | Mental models are internalized. Participants produce all four documentation chain artifacts and build production workflows. Theory becomes just-in-time reinforcement. |

**Why this matters:** The most common failure mode in agentic engineering is rushing past design. When you let the tool think through too much of the design, you don't discover misaligned intent until you're staring at a finished implementation that solves the wrong problem. The 201 course deliberately slows participants down — the handwritten design phase forces you to decide what you actually want *before* the tool starts filling in gaps with plausible-sounding decisions.

By 301, participants have the discipline to design before building. The ratio shifts to tool work because the design thinking is internalized, not because it's less important.

### Concept Durability

The curriculum teaches **concepts** (agents, skills, tools, hooks, workflows) using Claude Code as the implementation vehicle. Every agentic platform has its own version of the same building blocks. Participants learn what these concepts *are* and why they matter, not platform-specific syntax. Claude Code is where they practice; the thinking is the skill.

### Scaffolded Document Production

| Document | 201 | 301 |
|----------|-----|-----|
| OFD | Produce (OFD-first — 3 fields define success before PRD is written) | Produce (standalone — full metric hierarchy) |
| PRD | Produce (operationalizes OFD into buildable requirements) | Produce (advanced) |
| ADR | Interpret (instructor-provided) | Produce |
| DDD | Interpret (instructor-provided) | Produce |
| TDD | Produce (both deterministic + rubric criteria) | Produce (deterministic test harness) |
| VPD | Produce (Paired VPD Lite — business + engineering fit, cross-layer traceability) | Produce (full paired VPD — standalone) |
| BMC | Awareness (cost sniff test, 15 min) | Produce (full paired BMC — standalone) |
| Evals Spec | Awareness only (TDD/EDD distinction named) | Produce (evaluation harness for probabilistic components) |

## Course Details

- **Instructor:** Reggie Chan
- **Organization:** 021 Events / Tenebrus Capital
- **Duration:** [PENDING — designing for completeness first per Gratton directive. Previous: 2-day weekend workshop.]
- **Target Audience:** CRE professionals (brokers, property managers, asset managers, analysts)
- **Experience Level:** Intermediate
- **Frameworks:** Holy Trinity, Four Pillars, 8-Step Process, Documentation Chain, Claude Code Basics, Value-Delivery Fit

## Version History

- v0.1.0 (2026-02-06): Initial course structure created
- v0.2.0 (2026-02-20): Incorporated pedagogical review (2026-02-09). Reduced 11→9 objectives. Absorbed Six Management Skills into existing objectives. Distributed Documentation Chain across objectives. Added Level 0 orientation, integration pauses, affective objectives, post-course reinforcement plan. Reworked DDD mapping from OM to Rent Roll/Data Room. Reframed "Monday-ready" claims.
- v0.2.1 (2026-02-23): Added Series Design Principles (theory/tool progression ratios, concept durability, scaffolded document production). Clarified Learning Approach as 50/50 concept-design vs. Claude Code hands-on. Fixed DDD terminology inconsistency. Decoupled CRE Metaphor Map from DDD in learning objectives.
- v0.2.2 (2026-02-23): Gratton directive — design for completeness without length constraints. Flagged duration as pending. Updated backward design workflow (rubrics complete, outline next). Fixed body text version/date mismatch. Aligned version numbers across all planning documents.
- v0.2.3 (2026-02-23): Claude Code components reduced from 5 to 4 (dropped Tools/Scripts, renamed Commands to Slash Commands). Capstone reframed from "workflow design draft" to "working CRE workflow plugin." Updated across all planning and materials files.
- v0.3.0 (2026-02-25): Added VPD/BMC integration. Updated objective count (9→10), framework count (5→6). Added VPD/BMC rows to scaffolded document production table.
