---
name: generate-pre-work
description: Design pre-course micro-learning units to cover prerequisites and free the first session for Apply+ activities
disable-model-invocation: true
argument-hint: "[--format full|micro-only|emails-only]"
allowed-tools:
  - AskUserQuestion
  - Bash
  - Read
  - Write
  - Edit
  - Skill
---

# Generate Pre-Work Command

Design pre-course micro-learning units that cover foundational prerequisites, freeing the first session (or, for self-paced, the module practice) for hands-on application activities.

## Prerequisites

- Must have `01-planning/learning-objectives.md` (run `/course-curriculum-creator:generate-objectives` first if missing)
- Should have `01-planning/learner-profile.md` (optional — used to calibrate depth and format)

## Staleness

Staleness: follow `course-conventions` §Staleness. Output: `04-materials/pre-work.md`. Sources: `learning-objectives` = `01-planning/learning-objectives.md`, `learner-profile` = `01-planning/learner-profile.md` (if the file exists).

## Command Behavior

0. **Conventions and course check**: Load the `course-curriculum-creator:course-conventions` skill first. Follow its §course.yaml is necessary, then run `KIT manifest summary --course "<dir>"` and apply every line in `rules` (§Shape and time budget). The pre-work time is `asyncMinutes.preWork`. Ask the user questions as in `course-conventions` §Questions.
1. Load `course-curriculum-creator:blooms-taxonomy` skill for cognitive level identification
2. Read `01-planning/learning-objectives.md` — identify:
   - Remember-level objectives → candidates for full pre-work coverage
   - Understand-level objectives → candidates for introduction/preview in pre-work
   - Apply+ objectives → extract implied prerequisites not covered by explicit objectives
3. Read `01-planning/learner-profile.md` (if exists) — calibrate:
   - High prior knowledge → shorter pre-work, quiz-only fast track
   - Low prior knowledge → fuller explanations, more examples
   - Tech constraints → text-based pre-work over video
4. Design micro-learning units (see rules below)
5. Generate readiness self-assessment
6. Generate reminder email templates
7. Write to `04-materials/pre-work.md`
8. **Cohort only**: also write the between-session work for each session gap (one block for each gap between consecutive sessions in `manifest summary`: the assignment, a short retrieval self-check and discussion prompts). Together the blocks fit inside `asyncMinutes.betweenSessions`; split the minutes evenly across the gaps unless the outline says otherwise.
9. **Report progress**: follow `course-conventions` §Progress

## Micro-Learning Unit Design Rules

- **Total completion time** = `asyncMinutes.preWork` from `manifest summary` (do not exceed it). Use as many units as fit, about 10-15 minutes each; if `preWork` is 0, tell the user there is no pre-work time and stop. Workshop example: a 30-minute budget gives at most 3 units
- Each unit: **10-15 minutes**, single concept focus, one self-check question at end
- Two paths per unit:
  - **Fast track:** Already familiar — read 2-sentence summary, take self-check quiz, done (2-3 min)
  - **Full path:** Concept explanation + 1-2 examples + self-check quiz (10-15 min)
- Units ordered by **dependency** (if concept B requires concept A, unit A comes first)

## Readiness Self-Assessment

- **5-8 questions** matching prerequisite concepts (not course content)
- Include answer key with brief explanations for each answer
- Score interpretation:
  - 8/8 or 7/8: Well prepared. The course will build on these foundations.
  - 5/8 or 6/8: Review the units for questions missed.
  - Below 5/8: Complete all pre-work units in full path mode before attending.

## Email Templates

### T-7 Days: Welcome & Pre-Work Instructions

- **Subject:** Prepare for [Course Title] — [Date]
- Body includes: welcome message, pre-work link, estimated completion time, contact for questions

### T-2 Days: Reminder

- **Subject:** Reminder: Complete pre-work for [Course Title] — [Date]
- Body includes: reminder, direct link to self-assessment, support contact

## Format Options

- `--format full` (default): All components — micro-learning units, self-assessment, email templates
- `--format micro-only`: Just the micro-learning units
- `--format emails-only`: Just the email templates (for when pre-work content already exists)

## Output Format

Write to `04-materials/pre-work.md` using this template:

```markdown
---
title: Pre-Work Materials - [Course Title]
date: YYYY-MM-DD
version: 0.1.0
status: draft
courseVersion: [match]
lastUpdated: YYYY-MM-DD
totalEstimatedTime: "[N] minutes (fast track: [M] minutes)"
sourceFiles:
  learning-objectives: "01-planning/learning-objectives.md"
  learner-profile: "01-planning/learner-profile.md"
sourceHashes:
  learning-objectives: "[md5-first-8]"
  learner-profile: "[md5-first-8]"
---

# Pre-Work Materials

## [Course Title]

**Purpose:** Prepare participants with foundational knowledge before the course, freeing the first session for hands-on application.

**Total Time:** [N] minutes (full path) | [M] minutes (fast track)

**Instructions for Participants:**
Complete these materials before [course start date]. If you're already familiar with a topic, use the Fast Track option to verify your knowledge quickly.

---

## Unit 1: [Concept Title]

**Prerequisite for:** Module [N] — [Module Title]
**Estimated Time:** [N] min (full) | [M] min (fast track)

### Fast Track
[2-3 sentence summary of the concept]

**Quick Check:** [Single question to verify understanding]

If you answered correctly, skip to Unit 2. If not, complete the Full Path below.

### Full Path

[Concept explanation — clear, concise, with concrete example]

**Example 1:** [Domain-relevant example]

**Example 2:** [Different context example for transfer]

**Self-Check:** [Question matching the prerequisite level]
- Answer: [With brief explanation]

---

[Repeat for each unit, up to 3 maximum]

---

## Between Sessions (cohort only)

### After Session [N], before Session [N+1]

**Estimated Time:** [N] min
**Assignment:** [Transfer assignment tied to the session's objectives]
**Retrieval self-check:** [2-3 questions on the session]
**Discussion prompts:**
- [Prompt 1]
- [Prompt 2]

[Repeat for each session gap]

---

## Readiness Self-Assessment

**Instructions:** Answer these questions to verify you're ready for the course. You should be able to answer at least 6 of 8 correctly.

1. [Question targeting prerequisite concept 1]
2. [Question targeting prerequisite concept 2]
...

### Answer Key
[Answers with brief explanations]

### Score Interpretation
- 8/8 or 7/8: You're well prepared. The course will build on these foundations.
- 5/8 or 6/8: Review the units for questions you missed.
- Below 5/8: Complete all pre-work units in full path mode before attending.

---

## Email Templates

### T-7 Days: Welcome & Pre-Work Instructions

**Subject:** Prepare for [Course Title] — [Date]

[Email body with welcome, pre-work link, estimated time, contact for questions]

### T-2 Days: Reminder

**Subject:** Reminder: Complete pre-work for [Course Title] — [Date]

[Email body with reminder, direct link to self-assessment, support contact]
```

## Validation Checks

- Total pre-work time does not exceed `asyncMinutes.preWork` (warn if it does — completion rates drop sharply)
- Cohort: between-session work for each gap fits inside `asyncMinutes.betweenSessions`
- Every pre-work unit maps to a specific objective or prerequisite
- Self-assessment questions match prerequisite concepts, not course content
- Fast track path exists for every unit (don't force experienced participants through full content)

## Integration Points

- `generate-lesson-plans` checks if `04-materials/pre-work.md` exists:
  - If yes, adjust Module 1 of the first session: skip foundation content already covered in pre-work, add brief "pre-work review" activity (5-10 min recap + Q&A) instead of full instruction
  - Reference pre-work in module prerequisites
- `generate-workshop-prep` includes pre-work distribution in T-2 weeks checklist:
  - T-14 days: Finalize pre-work materials
  - T-7 days: Send welcome email with pre-work
  - T-2 days: Send reminder email
  - T-1 day: Check completion rates (if LMS tracking available)
- `curriculum-architect` agent adds pre-work generation as Phase 7.5 (after lesson plans, before description)

## Error Handling

- **Missing learning objectives:** "Error: learning-objectives.md not found. Cannot identify prerequisites. Run `/course-curriculum-creator:generate-objectives` first."
- **No Remember/Understand objectives found:** "Advisory: No Remember/Understand-level objectives found. Pre-work will focus on implied prerequisites for Apply+ objectives."
- **Pre-work already exists:** Prompt with overwrite/update/cancel options

## Implementation Notes

- When `learner-profile.md` is absent, default to moderate prior knowledge and no tech constraints
- Pre-work units should use plain language appropriate for the identified audience
- Email templates should include placeholder tokens (e.g., `[course start date]`, `[Course Title]`) for easy customization
- The fast track path is critical for participant engagement — experienced learners who are forced through basic content will disengage from all pre-work
