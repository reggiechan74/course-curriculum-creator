---
name: generate-objectives
description: Generate Bloom's taxonomy-aligned learning objectives for the course
disable-model-invocation: true
argument-hint: "[--count N] [--levels cognitive-levels]"
allowed-tools:
  - AskUserQuestion
  - Bash
  - Read
  - Write
  - Edit
  - Skill
---

# Generate Objectives Command

Create measurable, Bloom's-aligned learning objectives for the course based on backward design principles.

## Prerequisites

Must be run within a course project directory with a `course.yaml` (created via `/course-curriculum-creator:create-course` or `/course-curriculum-creator:migrate-course`).

## Staleness

Staleness: follow `course-conventions` §Staleness. Output: `01-planning/learning-objectives.md`. Sources: `course-positioning` = `01-planning/course-positioning.md`.

## Series Enforcement

If `course-positioning.md` contains `seriesName` and `seriesLevel` in its YAML frontmatter:

### Step 1: Load Series Context

1. Read `seriesPlanFile` path from positioning frontmatter
2. Read the series plan and extract this level's configuration:
   - Primary Bloom's band
   - Stretch zone
   - Assumed floor (prior level's handoff outcomes)

### Step 2: Constrain Generation

When generating objectives:
- Target 60-70% of objectives within the **primary band**
- Allow up to 20% in the **stretch zone** (must be scaffolded)
- Do NOT generate objectives at levels below the **assumed floor** (these are prerequisites, not learning targets)
- Ensure assumed floor outcomes appear in the course prerequisites, not as new objectives

### Step 3: Post-Generation Validation

After generating all objectives, validate each one:

For each objective, check its Bloom's level against the series bands:

**If within primary band:** Pass (no action needed)

**If within stretch zone:** Note in validation output: "Objective #N is in the stretch zone ([level]). Ensure it includes scaffolding and guided practice."

**If outside both primary band and stretch zone (too high):**
Prompt the user with AskUserQuestion:
"Objective #[N] ('[objective text]') is at [Bloom's level], which is above this level's stretch zone ([stretch zone]).

Options:
1. Keep it anyway (override series constraint)
2. Move it to Level [N+1]'s plan (note for future)
3. Revise to [highest stretch zone level] with scaffolding"

**If below assumed floor (too low / re-teaching):**
Prompt the user:
"Objective #[N] ('[objective text]') is at [Bloom's level], which is in the assumed floor for Level [level]. This should have been mastered in Level [N-1].

Options:
1. Keep it as a brief review activity (not a formal objective)
2. Remove it (trust the prerequisite chain)
3. Keep it as a formal objective (override series constraint)"

### Step 4: Update Cognitive Level Distribution

In the generated `Cognitive Level Distribution` section, add a series compliance note:

```
## Series Compliance

**Series:** [name] | **Level:** [N]
**Primary band:** [levels] | **Stretch zone:** [levels]
**Objectives in primary band:** [count] ([%])
**Objectives in stretch zone:** [count] ([%])
**Overrides:** [count] (user chose to keep objectives outside bands)
```

## Command Behavior

0. **Conventions and course check**: Load the `course-curriculum-creator:course-conventions` skill first. Follow its §course.yaml is necessary, then run `KIT manifest summary --course "<dir>"` and use its `shape`, `liveMinutes`, `asyncMinutes` and `rules` (§Shape and time budget). Ask the user questions as in `course-conventions` §Questions.
1. **Load required skills**: Load `course-curriculum-creator:blooms-taxonomy` and `course-curriculum-creator:backward-design-methodology` skills
2. **Read course positioning**: Parse `01-planning/course-positioning.md` for context
3. **Gather requirements** (if not specified):
   - Number of objectives (default from total time: see "Quantity by Total Time")
   - Cognitive level distribution preference
   - Target audience considerations
4. **Generate learning objectives**: Create SMART objectives with appropriate action verbs
5. **Write to file**: Save to `01-planning/learning-objectives.md`
6. **Update positioning**: Suggest updating course-positioning.md with outcomes summary
7. **Sync the manifest**: Run `manifest sync --write` and show each issue to the user (see "Manifest Sync" below)
8. **Report progress**: follow `course-conventions` §Progress

## Manifest Sync

**Last step: sync the manifest.** Run `manifest sync --write` (call form in the `course-kit` skill):

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/course-kit/scripts/course-kit.mjs" manifest sync --course "<course-dir>" --write
```

It returns `{ manifest, issues }`. Show each issue to the user.

## Skill Loading

Always load these skills before generating:
```
Load blooms-taxonomy skill for action verb selection and cognitive levels
Load backward-design-methodology skill for outcomes-first approach
```

## Input Gathering

**Read from course-positioning.md:**
- Shape and total time (from `manifest summary`, not from the positioning file)
- Target audience
- Prerequisites
- Course topic/focus

**Prompt user if needed:**
- Desired cognitive level focus (Apply-heavy, balanced, or advanced with Evaluate/Create)
- Specific skills or competencies students must achieve
- Any constraints or requirements

**Use settings defaults:**
- total time from `manifest summary` for objective count
- `default_audience_level` for cognitive complexity

## Settings

Settings: see `course-conventions` (uses `default_audience_level`). It guides the cognitive complexity distribution (e.g., beginner skews toward Apply, advanced includes more Evaluate/Create). If it is not set, use sensible defaults or prompt the user.

## Objective Generation Logic

### Quantity by Total Time

Total time = `liveMinutes` + `asyncMinutes.total` from `manifest summary`. Plan about one objective for each 60-90 minutes of total time, with at least 3 and at most 10 objectives. The count from this rule always overrides any totals in the examples below. The mixes below are shares of the total, not absolute counts: scale them to the count you computed (round so the counts add up to the total, and keep Remember at 0-1). Lean toward the shorter-course mix when total time is short and toward the longer-course mix when it is long.

**Shorter-course mix (workshop example: 1-day):**
- Remember: minimal, 0-1 (minimize or pre-work)
- Understand: about 20-30% of the total
- Apply: about 50-60% (primary focus)
- Analyze: 0-1 (optional)
- Evaluate/Create: 0

**Longer-course mix (workshop example: 2-day):**
- Remember: minimal, 0-1 (minimize or pre-work)
- Understand: about 10-20% of the total
- Apply: about 35-45%
- Analyze: about 20-25%
- Evaluate: about 10-15%
- Create: 1 (capstone)

### Objective Quality Standards

Each objective must:
- Use measurable action verb from Bloom's taxonomy
- Specify what students will do (observable behavior)
- Include context or conditions
- Be achievable within the course's time budget
- Align with course positioning and audience needs

**Format:**
```
[Action Verb] + [What] + [Context/Conditions] + [Criteria (optional)]
```

**Example:**
"Apply Porter's Five Forces framework to analyze PropTech use cases in commercial real estate, identifying all five forces with supporting evidence"

### Scaffolding

Ensure objectives progress logically:
- Start with lower cognitive levels (Understand/Apply)
- Build to higher levels (Analyze/Evaluate/Create)
- Each objective should build on or complement previous ones
- Create clear learning pathway

## File Output Format

### 01-planning/learning-objectives.md

```markdown
---
title: Learning Objectives - [Course Title]
date: YYYY-MM-DD
version: 0.1.0
status: draft
courseVersion: [match course version]
lastUpdated: YYYY-MM-DD
sourceFiles:
  course-positioning: "01-planning/course-positioning.md"
sourceHashes:
  course-positioning: "[md5-first-8]"
---

# Learning Objectives

## Course: [Course Title]

**Shape:** [workshop | cohort | self-paced]
**Time:** [Live minutes and async minutes from `manifest summary`]
**Target Audience:** [From course-positioning.md]

## Overview

By the end of this course, participants will be able to demonstrate the following competencies:

## Learning Objectives

### Objective 1: [Descriptive Title]

**Objective Statement:**
[Full SMART objective with action verb, context, criteria]

**Cognitive Level:** [Bloom's level]
**Time Allocation:** [Estimated minutes]
**Assessment Method:** [How this will be measured]
**Module:** [Which module addresses this - TBD until outline created]

**Rationale:**
[Why this objective is important, how it serves course positioning]

---

### Objective 2: [Descriptive Title]

[Repeat format for each objective]

---

## Objective Summary Table

| # | Objective | Cognitive Level | Time | Assessment |
|---|-----------|-----------------|------|------------|
| 1 | [Brief description] | [Level] | [Min] | [Method] |
| 2 | [Brief description] | [Level] | [Min] | [Method] |
| ... | | | | |

## Cognitive Level Distribution

- **Understand:** [Count] objectives ([Percentage]%)
- **Apply:** [Count] objectives ([Percentage]%)
- **Analyze:** [Count] objectives ([Percentage]%)
- **Evaluate:** [Count] objectives ([Percentage]%)
- **Create:** [Count] objectives ([Percentage]%)

**Total:** [Count] objectives, [Total time] minutes

## Scaffolding Plan

**Learning Progression:**

[Describe how objectives build on each other]

**Focus by session (workshop and cohort, one line for each session) or by stage (self-paced):** [Cognitive levels and themes]

## Alignment with Course Positioning

[Brief explanation of how these objectives fulfill the value proposition and target audience needs from course-positioning.md]

## Next Steps

1. Review and refine objectives
2. Update course-positioning.md with outcomes summary
3. Design assessments aligned to objectives: `/course-curriculum-creator:generate-rubrics`
4. Plan learning activities: `/course-curriculum-creator:generate-outline` then `/course-curriculum-creator:generate-lesson-plans`

## Notes

- All objectives follow SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound)
- Action verbs selected from appropriate Bloom's taxonomy levels
- Time allocations include instruction + practice + assessment
- Progression scaffolds from lower to higher cognitive complexity
```

## Post-Generation Actions

After generating learning-objectives.md:

1. **Prompt user to review**: "Review the generated objectives. Would you like me to adjust cognitive levels, add/remove objectives, or modify any objectives?"

2. **Suggest course-positioning update**: "These objectives should inform your course positioning. Would you like me to update 01-planning/course-positioning.md with an outcomes summary?"

3. **Recommend next step**: "Next: Generate assessment rubrics aligned to these objectives using `/course-curriculum-creator:generate-rubrics`"

## Validation Checks

Before finalizing, validate:
- [ ] All objectives use Bloom's taxonomy action verbs
- [ ] Cognitive levels appropriate for the total time and shape
- [ ] Total time allocation realistic against `liveMinutes` + `asyncMinutes.total` (workshop example: 5-6 hours for 1-day, 11-12 hours for 2-day)
- [ ] Objective count within 3-10 and about one for each 60-90 minutes
- [ ] Objectives progress logically from simple to complex
- [ ] Each objective is SMART (measurable, achievable, specific)
- [ ] Objectives align with course positioning audience/needs
- [ ] Prerequisites are addressed (or noted as pre-work)

## Error Handling

**Not in course directory or `course.yaml` missing:**
- Follow `course-conventions` §course.yaml is necessary

**Missing course-positioning.md:**
- "Error: course-positioning.md not found. Cannot generate objectives without course context."

**Objectives already exist:**
- Prompt: "learning-objectives.md already exists. Options: (1) Regenerate (overwrites), (2) Edit existing, (3) Cancel"
- Handle user choice

## Example Usage

**Basic (uses defaults):**
```
User: /course-curriculum-creator:generate-objectives
[Plugin reads context, generates appropriate objectives]
```

**With arguments:**
```
User: /course-curriculum-creator:generate-objectives --count 6 --levels "apply-heavy"
[Plugin generates 6 objectives with emphasis on Apply level]
```

**Autonomous integration:**
```
[curriculum-architect agent may invoke this internally]
```

## Implementation Notes

**Always use bash for dates:**
```bash
TZ='America/New_York' date '+%Y-%m-%d'
```

**Time allocation calculation:**
- Remember: 15-20 min per objective
- Understand: 30-45 min per objective
- Apply: 45-60 min per objective
- Analyze: 60-90 min per objective
- Evaluate: 90-120 min per objective
- Create: 120-180 min per objective

**Assessment method suggestions:**
- Remember/Understand: Quiz, explanation, summary
- Apply: Framework application, problem-solving
- Analyze: Case analysis, pattern identification
- Evaluate: Multi-criteria evaluation, recommendation
- Create: Design, plan, strategy development

## Incremental Update Mode

When invoked with `--update`, modify existing objectives instead of regenerating all:

### Adding Objectives

```
/course-curriculum-creator:generate-objectives --update "Add an Evaluate-level objective about assessing PropTech ROI"
```

**Behavior:**
1. Read existing `01-planning/learning-objectives.md`
2. Parse current objectives and cognitive level distribution
3. Generate the new objective following the same quality standards
4. Validate it doesn't duplicate existing objectives
5. Add it in the appropriate position (maintaining Bloom's level progression)
6. Update the Objective Summary Table and Cognitive Level Distribution
7. Warn about downstream staleness: "⚠ Downstream files (rubrics, outline, lesson plans) may need regeneration. Run `/course-curriculum-creator:generate-rubrics`, `/course-curriculum-creator:generate-outline`, etc. to update."

### Removing Objectives

```
/course-curriculum-creator:generate-objectives --update --remove 3
```

**Behavior:**
1. Read existing objectives
2. Remove objective #3
3. Renumber remaining objectives
4. Update Summary Table and Distribution
5. Warn about downstream staleness

### Modifying Objectives

```
/course-curriculum-creator:generate-objectives --update --modify 2 "Change to Analyze level with focus on market comparison"
```

**Behavior:**
1. Read existing objectives
2. Modify objective #2 as specified
3. Validate modified objective meets quality standards
4. Update Summary Table and Distribution
5. Warn about downstream staleness

### Validation After Update

After any incremental change:
- Revalidate cognitive level distribution is appropriate for duration
- Revalidate total time allocation is realistic
- Revalidate scaffolding progression
- Update sourceHashes in frontmatter

---

Generate learning objectives that are measurable, achievable, and appropriately scaffolded. Use Bloom's taxonomy action verbs, align with course positioning, and set foundation for assessment and activity design.
