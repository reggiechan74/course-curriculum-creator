---
name: save-as-template
description: Save current course as reusable template
disable-model-invocation: true
argument-hint: "[template-name]"
allowed-tools:
  - AskUserQuestion
  - Bash
  - Read
  - Write
---

# Save As Template Command

Save current course structure as a reusable template for creating variants.

## Prerequisites

- Must be in complete course directory
- Should have at least objectives and outline

## Command Behavior

0. **Conventions and course check**: Load the `course-curriculum-creator:course-conventions` skill first. This skill runs on an existing course, so follow its §course.yaml is necessary, then run `KIT manifest summary --course "<dir>"` and apply every line in `rules` (§Shape and time budget). Ask the user questions as in `course-conventions` §Questions.
1. Validate course completeness
2. Ask for the template name (if not provided)
3. Copy course structure to template directory, including `course.yaml` (see "Template course.yaml")
4. Create template metadata
5. Confirm template saved
6. **Report progress**: follow `course-conventions` §Progress. Nothing in the course changed, so run `KIT progress --course "<dir>"` without `--write` and report `next`.

## Settings

Settings: see `course-conventions` (uses `template_directory`, `instructor_name`, `organization`). `template_directory` is where saved templates are stored; the other two fill the metadata and the placeholders below.

If a value is empty and not overridden, use sensible defaults or prompt user.

## Template Storage

**Location:** From the `template_directory` plugin setting or default `~/.claude/course-templates/`

**Structure:**
```
~/.claude/course-templates/
└── template-name/
    ├── template-metadata.json
    ├── course.yaml
    ├── 01-planning/
    ├── 02-design/
    ├── 03-assessment/
    └── 04-materials/
```

## Template course.yaml

The template keeps the shape, delivery, sessions, audience, time budget and media budget of the course, so a new course made from it has the same structure. Copy `course.yaml` into the template directory, then edit the copy (edit the YAML only; do not hand-write other fields):

- `id`: set to `""`
- `title`: set to `""`
- `created`: set to `""`
- `targets`: set to `{}`

Leave every other field as it is. The copy is not a valid course until `create-from-template` fills these fields through `manifest init`.

## Template Metadata

```json
{
  "templateName": "template-name",
  "originalCourse": "CourseName-YYYY-MM-DD",
  "createdDate": "YYYY-MM-DD",
  "createdBy": "[instructor from settings]",
  "shape": "workshop | cohort | self-paced",
  "sessionCount": 2,
  "liveMinutes": 840,
  "audienceLevel": "professional",
  "cognitiveDistribution": {
    "understand": 2,
    "apply": 4,
    "analyze": 2,
    "evaluate": 1,
    "create": 1
  },
  "moduleCount": 8,
  "description": "Brief template description",
  "keywords": ["PropTech", "Real Estate", "Analysis"]
}
```

## What Gets Saved

**Include:**
- Complete directory structure
- `course.yaml` with `id`, `title`, `created` and `targets` cleared
- All curriculum files with content
- Assessment rubrics
- Lesson plans structure

**Parameterize:**
- Course title → [COURSE_TITLE]
- Specific examples → [EXAMPLE]
- Date references → [DATE]
- Instructor name → [INSTRUCTOR]

## Parameterization Rules

When saving a course as a template, apply these parameterization rules to make the template reusable:

### Automatic Replacements

These replacements are made automatically during template save:

| Original Value | Template Placeholder | Source |
|---------------|---------------------|--------|
| Course title | `{{COURSE_TITLE}}` | From course-positioning.md frontmatter `title` |
| Course dates | `{{DATE}}` | All date references in content |
| Instructor name | `{{INSTRUCTOR_NAME}}` | From settings `instructor_name` or frontmatter |
| Organization name | `{{ORGANIZATION}}` | From settings `organization` or frontmatter |
| Version number | `{{VERSION}}` | Reset to `0.1.0` in template |
| Status | `draft` | Always reset to draft |

### Domain-Specific Replacements (Prompted)

Prompt the user to identify these context-specific elements for parameterization:

- **Industry examples**: "Which examples are specific to this course's domain?" → Replace with `{{EXAMPLE: description}}`
- **Case studies**: "Which case studies should be swapped for different audiences?" → Replace with `{{CASE_STUDY: description}}`
- **Tool/software names**: "Which tools are specific to this offering?" → Replace with `{{TOOL: description}}`
- **Audience-specific references**: "Which references assume a particular audience?" → Replace with `{{AUDIENCE_REF: description}}`

### What NOT to Parameterize

Preserve these elements as-is (they represent pedagogical design decisions):
- Bloom's taxonomy action verbs in objectives
- Cognitive level distribution
- Module timing allocations and structure
- Assessment criteria and rubric descriptors
- Scaffolding sequence and progression
- Activity types and instructional strategies

### Template Manifest

When saving, also generate `template-manifest.md` alongside `template-metadata.json`:

```markdown
# Template Manifest: {{COURSE_TITLE}}

## Placeholders

| Placeholder | Type | Description | Example Value |
|-------------|------|-------------|---------------|
| `{{COURSE_TITLE}}` | automatic | Course title | "PropTech Fundamentals" |
| `{{DATE}}` | automatic | Current date | "2026-02-23" |
| `{{INSTRUCTOR_NAME}}` | automatic | Instructor name | "John Smith" |
| `{{ORGANIZATION}}` | automatic | Organization | "Acme Corp" |
| `{{VERSION}}` | automatic | Version number | "0.1.0" |
| `{{EXAMPLE: ...}}` | domain | Domain-specific example | varies |
| `{{CASE_STUDY: ...}}` | domain | Case study reference | varies |
| `{{TOOL: ...}}` | domain | Tool/software name | varies |

## Files Parameterized

- `course.yaml` - cleared `id`, `title`, `created`, `targets` (no placeholders)
- `01-planning/course-positioning.md` - [N] replacements
- `01-planning/learning-objectives.md` - [N] replacements
- [list all files with replacement counts]

## Customization Guide

When creating a course from this template:
1. All automatic placeholders are replaced during `/course-curriculum-creator:create-from-template`
2. Domain-specific placeholders ({{EXAMPLE}}, {{CASE_STUDY}}, etc.) require manual customization
3. Review all files for domain-specific references that weren't parameterized
```

## Usage Message

```
✓ Template saved: [template-name]

Location: ~/.claude/course-templates/template-name/

This template includes:
- Shape: [shape] ([sessions and minutes, or estimated hours])
- [N] learning objectives ([distribution])
- [N] modules
- Assessment rubrics
- Lesson plan structure
- [Other components]

Create course from this template:
  /course-curriculum-creator:create-from-template [template-name] --variant [YourVariant]

List all templates:
  /course-curriculum-creator:list-templates
```

---

Save proven course structures as templates for rapid variant creation.
