---
name: generate-outline
description: Generate course outline with module structure and timing
disable-model-invocation: true
argument-hint: "[--modules N]"
allowed-tools:
  - AskUserQuestion
  - Bash
  - Read
  - Write
  - Edit
  - Skill
---

# Generate Outline Command

Create high-level course structure with modules, timing, and topics following backward design Stage 3.

## Prerequisites

- Must have `01-planning/learning-objectives.md`
- Should have `03-assessment/rubrics.md` (recommended)

## Staleness

Staleness: follow `course-conventions` §Staleness. Output: `02-design/course-outline.md`. Sources: `learning-objectives` = `01-planning/learning-objectives.md`.

## Command Behavior

0. **Conventions and course check**: Load the `course-curriculum-creator:course-conventions` skill first. Follow its §course.yaml is necessary, then run `KIT manifest summary --course "<dir>"` and apply every line in `rules` (§Shape and time budget). Ask the user questions as in `course-conventions` §Questions.
1. Read learning objectives and time allocations
2. Load universal-design-for-learning skill for accessibility and inclusive design guidance
3. If course-positioning.md has `deliveryMode: virtual` or `deliveryMode: hybrid`, load `course-curriculum-creator:virtual-facilitation` skill for mode-specific timing and activity guidance
4. Group objectives into logical modules
5. Allocate timing for instruction, practice, breaks, using the time budget from `manifest summary` (see "Timing Allocation")
6. Generate structured outline in the heading format for the course shape (see "Shape Structure" and `course-conventions` §IDs and heading formats)
7. Write to `02-design/course-outline.md`
8. Run `manifest sync --write`, then `manifest validate`, and show each issue to the user (see "Manifest Sync" below)
9. **Report progress**: follow `course-conventions` §Progress

## Shape Structure

Read `shape` from `manifest summary`. Never assume a duration.

- **workshop**: one `## Day N: Title` section for each session in `manifest summary`.
- **cohort**: one `## Session N: Title` section for each session in `manifest summary`. Each session opens with a retrieval segment on the previous session (the first session opens with a prior-knowledge activation instead) and ends with a "Between sessions" segment: the assignment and discussion prompts, sized inside `asyncMinutes.betweenSessions`.
- **self-paced**: a `## Modules` section with `### Module N: Title (est. NN min)` headings. Write no session headings and no clock times. Every module ends with a practice-and-feedback segment. Module minutes together are about equal (within 10%) to the learner time (`estimatedHours` in `01-planning/course-positioning.md` × 60) minus `asyncMinutes.total`.

Module minutes in one session must not be more than the session minutes.

Cohort retrieval and "Between sessions" segments are activities inside the session. Do NOT write them as `### Module` headings: the parser counts every `### Module` heading as a module.

## Module Structure Logic

**Module count:** about one module for each 60-120 live minutes in a session (workshop example: a 420-minute day has 4-6 modules, so a 2-day workshop has 8-10).

**Module duration (workshop and cohort):** 60-120 minutes each. Self-paced modules: 15-60 estimated minutes each.

**Module components:**
- Learning objective(s) addressed
- Key topics/concepts
- Activities (high-level)
- Timing breakdown

## Timing Allocation

**Total available:** `sessions[].minutes` from `manifest summary` for each session (self-paced: the module minutes above). Workshop example: a 420-minute day leaves about 360 minutes of module time after breaks and lunch.

**Account for (workshop and cohort):**
- Breaks: 15 min every 90-120 min (not for self-paced)
- Lunch: 60 min (if a full-day session)
- Transitions: 5 min between modules
- Buffer: 10-15% for overruns

**Module timing split:**
- Instruction: 20-30%
- Guided practice: 25-35%
- Independent practice: 30-40%
- Assessment/debrief: 10-15%

## Delivery Mode Adjustments

Read `deliveryMode` from `01-planning/course-positioning.md` YAML frontmatter.

### If deliveryMode is "virtual"

Override default timing:
- **Max session length:** 3.5-4 hours (not 6)
- **Module duration:** 45-60 minutes (not 60-120)
- **Break frequency:** Every 45 minutes
- **Break duration:** 10 minutes minimum
- **Buffer time:** 15% (not 10%)
- **Fit the session minutes** from `manifest summary`: when a session is longer than the maximum session length, ask the user whether to split it into more sessions (workshop example: a 1-day workshop becomes about 5 hours across 2 sessions with an extended lunch)

Apply from virtual-facilitation skill:
- Chunk large modules into 45-min segments
- Add engagement checkpoints every 15-20 minutes within modules
- Replace physical activities with virtual substitutes (breakout rooms, digital whiteboards, chat activities)
- Add tech check slot at the start of the first session (15 min)
- Add re-engagement activity after each break

### If deliveryMode is "hybrid"

Apply virtual timing constraints PLUS:
- Add 15 additional minutes at start for dual-setup verification
- Note co-facilitator requirement for each module
- Flag activities that need parallel in-room and remote versions
- Increase buffer to 20%

### If deliveryMode is "in-person" (or not specified)

No changes — use existing defaults.

## File Output

```markdown
---
title: Course Outline - [Course Title]
date: YYYY-MM-DD
version: 0.1.0
status: draft
courseVersion: [match]
lastUpdated: YYYY-MM-DD
sourceFiles:
  learning-objectives: "01-planning/learning-objectives.md"
sourceHashes:
  learning-objectives: "[md5-first-8]"
---

# Course Outline

## [Course Title]

**Shape:** [workshop | cohort | self-paced]
**Time:** [workshop/cohort: sessions × minutes; self-paced: estimated hours]
**Total Instruction Time:** [Hours]

---

[Use ONE of the three layouts below, by shape.]

## Day N: [Title]   (workshop; one section for each session)

## Session N: [Title]  (cohort; one section for each session)

## Modules  (self-paced; no session headings)

### Module 1: [Title] (Time: 9:00-10:30, 90 min)  [workshop and cohort; self-paced: `### Module 1: [Title] (est. 30 min)` and no clock time]

**Learning Objective(s):**
- [Objective from learning-objectives.md]

**Key Topics:**
- [Topic 1]
- [Topic 2]

**Activities:**
- Introduction and objective preview (5 min)
- Concept instruction with examples (20 min)
- Guided practice exercise (30 min)
- Independent application task (25 min)
- Debrief and Q&A (10 min)

**Assessment:** [Formative method]

**Materials Needed:**
- [List materials]

---

### Break (10:30-10:45, 15 min)  [workshop and cohort only]

---

### Module 2: [Title] (Time: 10:45-12:15, 90 min)

[Repeat format]

---

[Cohort: end each session with a "Between sessions" segment: assignment + discussion prompts. Self-paced: end each module with a practice-and-feedback segment.]

---

## Schedule Summary  (workshop and cohort; self-paced: a module table with estimated minutes only)

### [Day N or Session N]

| Time | Module | Duration | Type |
|------|--------|----------|------|
| 9:00-10:30 | Module 1: [Title] | 90 min | Instruction/Practice |
| 10:30-10:45 | Break | 15 min | - |
| 10:45-12:15 | Module 2: [Title] | 90 min | Instruction/Practice |
| 12:15-1:15 | Lunch | 60 min | - |
| 1:15-2:45 | Module 3: [Title] | 90 min | Practice-heavy |
| 2:45-3:00 | Break | 15 min | - |
| 3:00-4:30 | Module 4: [Title] | 90 min | Assessment/Synthesis |

**Total session instruction:** [sum of module minutes] minutes (workshop example: 360 minutes in a 420-minute day)

[Repeat for each session]

---

## Next Steps

1. Review outline for logical flow and realistic timing
2. Generate detailed lesson plans for each module: `/course-curriculum-creator:generate-lesson-plans`
3. Ensure all learning objectives are addressed across modules
```

## Manifest Sync

**Sync the manifest and validate it.** Run `manifest sync --write` (call form in the `course-kit` skill):

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/course-kit/scripts/course-kit.mjs" manifest sync --course "<course-dir>" --write
```

It returns `{ manifest, issues }`. Show each issue to the user. Then run `manifest validate --course "<course-dir>"`. It warns when a session's module minutes are more than the session minutes (path `timeBudget.live.sessions[i]`) and gives an error when a self-paced module names a session. Fix the outline for each warning (shorten or move a module, or ask the user about a longer session), and run sync and validate again until there are no time-budget warnings.

## Post-Generation

Ask: "Review the outline. Would you like me to adjust module timing, regroup objectives, or modify the sequence?"

Next: "Generate detailed lesson plans using `/course-curriculum-creator:generate-lesson-plans`"

### UDL Validation (Post-Generation)

After generating the outline, validate each module against UDL minimums:

- **Representation**: Does each module use at least 2 representation modes? (e.g., not all lecture, not all reading)
  - Flag modules that rely on a single modality
- **Engagement**: Does each half-day (or each session, or each self-paced module) include at least one activity with learner choice?
  - Flag half-days without choice opportunities
- **Activity variety**: Do activity types rotate across the day? (individual → pair → group → individual)
  - Flag sequences of 3+ same-format activities
- **Breaks** (workshop and cohort; not for self-paced): Are breaks scheduled every 45-60 minutes during instruction?
  - Flag gaps longer than 60 minutes without breaks

If any check fails, add a note to the outline: "⚠ UDL Note: [specific recommendation]"

## Incremental Update Mode

When invoked with `--update`, modify existing outline instead of regenerating:

### Adding a Module

```
/course-curriculum-creator:generate-outline --update "Add a module on Advanced Analytics after Module 3"
```

**Behavior:**
1. Read existing `02-design/course-outline.md`
2. Insert new module at specified position
3. Renumber subsequent modules
4. Recalculate timing (adjust break/lunch schedule if needed)
5. Assign relevant learning objectives to the new module
6. Warn about downstream staleness: "⚠ Lesson plans need regeneration to include the new module. Run `/course-curriculum-creator:generate-lesson-plans` to update."

### Removing a Module

```
/course-curriculum-creator:generate-outline --update --remove 4
```

**Behavior:**
1. Remove module 4
2. Renumber subsequent modules
3. Recalculate timing
4. Warn if removed module was the only one covering certain objectives
5. Warn about downstream staleness

### Reordering Modules

```
/course-curriculum-creator:generate-outline --update --move 5 --to 2
```

**Behavior:**
1. Move module 5 to position 2
2. Renumber all modules
3. Recalculate timing
4. Validate Bloom's level progression still makes sense (warn if not)

### Adjusting Module Timing

```
/course-curriculum-creator:generate-outline --update --resize 3 120
```

**Behavior:**
1. Change module 3 duration to 120 minutes
2. Recalculate schedule (break/lunch/transition times)
3. Warn if module minutes in the session exceed the session minutes (`manifest validate` does this check)

### Validation After Update

After any incremental change:
- Verify all learning objectives are still covered by at least one module
- Verify total time fits within the session minutes from `manifest summary` (with buffer)
- Verify Bloom's level progression is maintained
- Update sourceHashes in frontmatter (`KIT hash-write`, see Staleness)

---

Create structured outlines that scaffold learning, allocate time realistically, and prepare for detailed lesson planning.
