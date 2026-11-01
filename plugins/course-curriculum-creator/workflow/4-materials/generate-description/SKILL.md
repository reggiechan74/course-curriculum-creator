---
name: generate-description
description: Generate student-facing course description for marketing and enrollment
disable-model-invocation: true
argument-hint: "[--tone professional|conversational|technical]"
allowed-tools:
  - AskUserQuestion
  - Bash
  - Read
  - Write
  - Edit
---

# Generate Description Command

Create compelling student-facing course description for marketing, course catalogs, and enrollment materials.

## Prerequisites

- Must have `01-planning/course-positioning.md`
- Must have `01-planning/learning-objectives.md`

## Staleness

Staleness: follow `course-conventions` §Staleness. Output: `01-planning/course-description.md`. Sources: `course-positioning` = `01-planning/course-positioning.md`, `learning-objectives` = `01-planning/learning-objectives.md`.

## Error Handling

**Missing learning-objectives.md:**
- "Error: learning-objectives.md not found. The course description's 'What You'll Learn' section must be derived from actual learning objectives. Run `/course-curriculum-creator:generate-objectives` first."

**Missing course-positioning.md:**
- "Error: course-positioning.md not found. Cannot generate description without course context. Run `/course-curriculum-creator:create-course` first."

## Command Behavior

0. **Conventions and course check**: Load the `course-curriculum-creator:course-conventions` skill first. Follow its §course.yaml is necessary, then run `KIT manifest summary --course "<dir>"` and apply every line in `rules` (§Shape and time budget). Ask the user questions as in `course-conventions` §Questions.
1. Read course positioning and objectives
2. Determine tone (default: professional)
3. Generate student-facing description
4. Write to `01-planning/course-description.md`
5. **Report progress**: follow `course-conventions` §Progress

## Settings

Settings: see `course-conventions` (uses `instructor_name`, `instructor_bio`, `organization`).

## Description Components

**Essential elements:**
- Compelling overview (what students will learn)
- Target audience (who should attend)
- Learning outcomes (what students will achieve)
- Course format, shape and time
- Prerequisites (if any)
- What's included (materials, certificate, etc.)
- Instructor information (from settings)

> **Note:** The "What You'll Learn" section must be derived directly from learning-objectives.md. Do not invent or improvise learning outcomes.

## Tone Options

**Professional** (default):
- Formal, credible language
- Focus on competencies and outcomes
- Suitable for corporate/academic catalogs

**Conversational**:
- Approachable, engaging language
- Focus on benefits and transformation
- Suitable for public courses

**Technical**:
- Precise, detailed language
- Focus on specific skills and tools
- Suitable for technical/specialized audiences

## File Output

```markdown
---
title: Course Description - [Course Title]
date: YYYY-MM-DD
version: 0.1.0
status: draft
courseVersion: [match]
tone: [professional|conversational|technical]
lastUpdated: YYYY-MM-DD
sourceFiles:
  course-positioning: "01-planning/course-positioning.md"
  learning-objectives: "01-planning/learning-objectives.md"
sourceHashes:
  course-positioning: "[md5-first-8]"
  learning-objectives: "[md5-first-8]"
---

# [Course Title]

## Course Overview

[2-3 paragraph compelling description of the course]

[First paragraph: Hook - the problem or opportunity]
[Second paragraph: Solution - what this course provides]
[Third paragraph: Outcome - transformation students will experience]

## Who Should Attend

This course is designed for:

- [Audience type 1 with brief context]
- [Audience type 2 with brief context]
- [Audience type 3 with brief context]

**Prerequisites:**
[Prerequisites from course-positioning, or "No prerequisites required"]

**Experience Level:**
[Beginner/Intermediate/Advanced - from positioning]

## What You'll Learn

By the end of this course, you will be able to:

- [Objective 1 - reworded for student benefit]
- [Objective 2 - reworded for student benefit]
- [Objective 3 - reworded for student benefit]
[Continue for all objectives]

## Course Format

**Shape:** [workshop | cohort | self-paced, from `manifest summary`]

**Time:** [Workshop and cohort: sessions × minutes (e.g. "2 sessions × 420 minutes", "6 sessions × 90 minutes"), plus the async minutes from `asyncMinutes`. Self-paced: estimated hours (`estimatedHours`, or the module minutes in `manifest summary`)]

**Delivery:** [From `deliveryMode` and shape: e.g. in-person intensive workshop, live cohort sessions with assignments between them, or self-paced online modules, with hands-on practice]

**Learning Approach:**
[Brief description of instructional approach - lab-heavy, lecture-heavy, or balanced]

### [Day N | Session N | Module group] [one for each session in `manifest summary`; self-paced: group the modules]

[High-level topics covered]

## What's Included

- Comprehensive course materials and handouts
- Hands-on exercises and case studies
- Reference guides and templates
- Access to instructor for questions during the course
- [Certificate of completion - if applicable]
- [Any other inclusions]

## About the Instructor

[Instructor name and bio from settings]

[Brief credentials and relevant experience - 2-3 sentences]

## Course Details

- **Time:** [sessions × minutes, or estimated hours]
- **Format:** [In-person | Virtual | Hybrid | Self-paced online]
- **Class Size:** [If specified]
- **Language:** [If specified]
- **Level:** [Beginner/Intermediate/Advanced]

## Registration Information

[To be added: pricing, dates, location, registration link]

---

## Internal Notes (Not for public)

**Marketing Angle:** [Key selling points]

**Competitive Differentiation:** [What makes this unique]

**Target Enrollment:** [If specified]
```

## Variants

Generate multiple versions if useful:

**Short Version (100-150 words):**
For catalogs, listings, brief promotions

**Long Version (400-600 words):**
For detailed course pages, full descriptions

**Social Media Version (50-75 words):**
For promotional posts with link to full description

## Post-Generation

Ask: "Review the course description. Would you like me to adjust the tone, emphasize different aspects, or create additional versions (short/social)?"

---

Generate compelling course descriptions that attract the right students and clearly communicate value, outcomes, and course structure.
