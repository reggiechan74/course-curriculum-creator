---
name: export-curriculum
description: Export curriculum as a single combined document in various formats
disable-model-invocation: true
argument-hint: "--format [full|summary|syllabus]"
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
---

# Export Curriculum Command

Combine curriculum files into a single document suitable for sharing, printing, or conversion.

## Prerequisites

- Must be in a course project directory with completed curriculum files
- Recommended: Run `/course-curriculum-creator:review-curriculum` first to validate quality

## Command Behavior

When user invokes `/course-curriculum-creator:export-curriculum --format [format]`:

0. **Conventions and course check**: Load the `course-curriculum-creator:course-conventions` skill first. Follow its §course.yaml is necessary, then run `KIT manifest summary --course "<dir>"` and apply every line in `rules` (§Shape and time budget).

1. **Run the audit:** `KIT audit --course "<dir>"`. Keep the result `{ok, issues, counts}` for the export. Copy `course.yaml` to `export/course.yaml` (create `export/` if needed) so the export carries the course description with it. Do not edit the copy.

2. **Discover curriculum files:**
   - Glob for all `.md` files in the course directory
   - Verify core files exist (positioning, objectives, outline, lesson plans, rubrics)
   - Note any missing files

3. **Combine based on format** (see format options below)

4. **Write output file:**
   - Full: `[course-dir]/export/[CourseName]-full-curriculum.md`
   - Summary: `[course-dir]/export/[CourseName]-summary.md`
   - Syllabus: `[course-dir]/export/[CourseName]-syllabus.md`

5. **Suggest PDF conversion:**
   "Export saved to [path]. To convert to PDF, you can use pandoc:
   `pandoc [output-file] -o [output-file].pdf --pdf-engine=xelatex`"

6. **Report progress**: follow `course-conventions` §Progress

## Export Formats

### --format full (Complete Curriculum Document)

Intended audience: Instructional designers, curriculum reviewers, stakeholders

**Structure:**
```markdown
# [Course Title] - Complete Curriculum

**Version:** [version] | **Date:** [date] | **Status:** [status]
**Instructor:** [name] | **Organization:** [org]
**Shape:** [shape from course.yaml] | **Delivery:** [delivery]

---

## Table of Contents

1. Course Overview
2. Learning Objectives
3. Assessment Strategy
4. Course Outline
5. Detailed Lesson Plans
6. Assessment Rubrics
7. Supporting Materials
8. Course Manifest and Automated Checks

---

<!-- page break -->

## 1. Course Overview

[Content from course-positioning.md - target audience, value proposition, scope]

---

<!-- page break -->

## 2. Learning Objectives

[Content from learning-objectives.md - full objectives with cognitive levels]

---

<!-- page break -->

## 3. Assessment Strategy

[Content from rubrics.md - assessment philosophy, rubric summaries]

---

<!-- page break -->

## 4. Course Outline

[Content from course-outline.md - module structure, schedule]

---

<!-- page break -->

## 5. Detailed Lesson Plans

[Content from lesson-plans.md - all module lesson plans]

---

<!-- page break -->

## 6. Assessment Rubrics

[Full rubric tables from rubrics.md]

---

<!-- page break -->

## 7. Supporting Materials

[List of available materials from 04-materials/]

---

<!-- page break -->

## 8. Course Manifest and Automated Checks

[The contents of course.yaml in a fenced yaml block, then the audit result: the counts and every issue grouped by check, with level, path and message]
```

### --format summary (Stakeholder Overview)

Intended audience: Managers, sponsors, decision-makers who need high-level understanding

**Structure:**
```markdown
# [Course Title] - Curriculum Summary

**Shape:** [shape] | **Time:** [live minutes and async minutes from `manifest summary`; self-paced: estimated learner hours] | **Audience:** [audience] | **Level:** [level]

## Course Purpose

[2-3 paragraphs from course-positioning.md - value proposition and problem solved]

## Learning Outcomes

By the end of this course, learners will be able to:
[Numbered list of objectives - statement only, no metadata]

## Course Structure

[Module list with titles and durations only - from course-outline.md]

[One schedule table for each live session in `manifest summary` (heading = the session label), with these columns. Self-paced: one table of modules with estimated minutes and no clock times.]

| Time | Module | Duration |
|------|--------|----------|
[Schedule table]

## Assessment Approach

[Brief summary of assessment strategy - 1-2 paragraphs, not full rubrics]

## Instructor

[Instructor name and brief bio]

## Quality Status

[Audit result: error, warning and info counts, and any error in one line each]

## Next Steps

[Registration, logistics information placeholder]
```

### --format syllabus (Student-Facing)

Intended audience: Learners who will take the course

**Structure:**
```markdown
# [Course Title]

## Welcome

[Content from course-description.md - overview section]

## What You'll Learn

[Objectives reworded as student benefits - from course-description.md]

## Schedule

[Simplified schedule from course-outline.md - module titles and times only. One section for each live session in `manifest summary`, headed by its label, with time blocks and module names. Self-paced: the module list with estimated minutes, no clock times.]

## What to Bring / Prerequisites

[Prerequisites from course-positioning.md]

## How You'll Be Assessed

[Brief, student-friendly description of assessment approach]

## What's Included

[From course-description.md - materials, certificate, etc.]

## About Your Instructor

[Instructor info]

## Questions?

[Contact information placeholder]
```

## Error Handling

**Missing curriculum files:**
- If core files are missing, warn: "⚠ Missing [file]. Export will be incomplete. Run [command] to generate."
- Proceed with available files, noting gaps

**Export directory doesn't exist:**
- Create `export/` subdirectory in the course directory

## Settings

Settings: see `course-conventions` (uses `instructor_name`, `instructor_bio`, `organization`). Use them for the instructor sections and the header information.

If a value is empty and not overridden, use values from course-positioning.md frontmatter.

---

Export curriculum documents for sharing with stakeholders, learners, and reviewers in appropriate formats.
