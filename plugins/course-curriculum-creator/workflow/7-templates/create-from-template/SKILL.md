---
name: create-from-template
description: Create new course from saved template
disable-model-invocation: true
argument-hint: "[template-name] --variant [VariantName] [--location path]"
allowed-tools:
  - AskUserQuestion
  - Bash
  - Read
  - Write
  - Edit
  - Skill
---

# Create From Template Command

Generate new course by adapting a saved template.

## Prerequisites

- Template must exist in template directory
- User must specify variant focus

## Command Behavior

0. **Conventions**: Load the `course-curriculum-creator:course-conventions` skill first. This skill needs no existing `course.yaml`: it creates a new course. The new course is validated at the end (step 7). Ask the user questions as in `course-conventions` §Questions.
1. Verify template exists
2. Ask for variant details (if not provided). The variant name is the new course title.
3. Copy the template's markdown files to the new course directory (not `course.yaml`, `template-metadata.json` or `template-manifest.md`)
4. Replace parameterized values
5. Generate new dates/versions
6. Write `course.yaml` (see "Course Manifest")
7. Run `KIT manifest sync --course "<new-dir>" --write`, then `KIT manifest validate --course "<new-dir>"`. Show each problem to the user.
8. Report created course with customization guidance
9. **Report progress**: follow `course-conventions` §Progress, with `KIT progress --course "<new-dir>" --write`

## Course Manifest

Do not copy or hand-write `course.yaml`. Read the template's `course.yaml` and build the `manifest init` options from it, with the NEW title:

| Option | Source in the template `course.yaml` |
|---|---|
| `title` | the new course title (the variant name) |
| `shape`, `delivery` | `shape`, `delivery` |
| `sessions` | `timeBudget.live.sessions` (`id`, `label`, `minutes`) |
| `audienceLevel`, `audienceSummary` | `audience.level`, `audience.summary` |
| `budgetUsd`, `maxPlanImages` | `media.budgetUsd`, `media.maxPlanImages` |
| `async` | `timeBudget.async` (`preWorkMinutes`, `betweenSessionMinutes`, `postWorkMinutes`) |

Run `KIT manifest init --course "<new-dir>" --json '<options>'`. Use `--force` only if the new directory already holds a `course.yaml` that the user agreed to overwrite. Exit code 2 means the options failed validation: show the error, fix the options and retry. Then `manifest sync --write` fills the objectives and modules of the new `course.yaml` from the copied markdown files (and writes the ID comments). The template's own objectives and modules are not copied; the markdown is the source.

If the template has no `course.yaml` (a template saved by a v2 version), copy the files, then tell the user to run `/course-curriculum-creator:migrate-course` on the new folder to create `course.yaml`. Stop after the copy and the placeholder replacement.

## Settings

Settings: see `course-conventions` (uses `template_directory`, `instructor_name`, `organization`). `template_directory` is where saved templates are found; the other two fill the `{{INSTRUCTOR_NAME}}` and `{{ORGANIZATION}}` placeholders.

If a value is empty and not overridden, use sensible defaults or prompt user.

## Arguments

**Required:**
- `template-name`: Name of saved template

**Optional:**
- `--variant`: Variant name (e.g., "Commercial-Focus", "Residential")
- `--location`: Output directory (default from settings)

## Variant Customization

After creating from template:

1. **Update course positioning**:
   - Adjust target audience for variant
   - Refine value proposition
   - Update market differentiation

2. **Customize examples**:
   - Replace {{EXAMPLE: ...}} placeholders with variant-specific examples
   - Update case studies
   - Adjust scenarios

3. **Adjust timing** (if needed):
   - Module duration may vary
   - Activity complexity may differ
   - After a change, run `KIT manifest summary --course "<new-dir>"` and check the minutes against the time budget

4. **Refine objectives** (if needed):
   - May emphasize different aspects
   - Add/remove based on variant focus

## Output Structure

```
VariantName-YYYY-MM-DD/
├── course.yaml (new title, from the template's structure)
├── 01-planning/
│   ├── course-positioning.md (updated with variant focus)
│   ├── course-description.md (from template, needs customization)
│   └── learning-objectives.md (from template)
├── 02-design/
│   ├── course-outline.md (from template)
│   └── lesson-plans.md (from template, examples need updating)
├── 03-assessment/
│   └── rubrics.md (from template)
└── 04-materials/
    └── README.md
```

## Completion Message

```
✓ Course created from template: [template-name]

New course: [location]/VariantName-YYYY-MM-DD/

**Template:** [template-name]
**Variant:** [VariantName]
**Shape:** [shape] | **Manifest:** validated
**Customization needed:**

1. Update examples in lesson-plans.md (search for {{EXAMPLE)
2. Refine course-positioning.md for variant audience
3. Customize case studies and scenarios
4. Review and adjust timing if needed

**Next steps:**
- Review all files for template placeholders
- Update course-description.md for variant
- Customize materials: /course-curriculum-creator:generate-artifacts
```

## Template List

If user doesn't know template names:
```
Available templates:

1. proptech-fundamentals
   - workshop, 2 sessions, professional level
   - 10 objectives (Apply/Analyze focus)
   - Real estate technology analysis

2. [other-template]
   - [details]

Use: /course-curriculum-creator:create-from-template [template-name] --variant [YourVariant]
```

---

Rapidly create course variants from proven templates, maintaining structure while allowing customization for specific audiences or contexts.
