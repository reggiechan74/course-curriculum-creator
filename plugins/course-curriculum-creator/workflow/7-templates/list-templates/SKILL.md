---
name: list-templates
description: List available course templates with details
disable-model-invocation: true
argument-hint: "[--verbose]"
allowed-tools:
  - Bash
  - Read
  - Glob
  - Skill
---

# List Templates Command

Display available course templates from the template directory.

## Command Behavior

When user invokes `/course-curriculum-creator:list-templates`:

0. **Conventions**: Load the `course-curriculum-creator:course-conventions` skill first. This skill needs no existing `course.yaml`: it works on the template directory, not on a course.

1. **Determine template directory:**
   - Use the `template_directory` plugin setting (see Settings below)
   - Default: `~/.claude/course-templates/`

2. **Scan for templates:**
   - List subdirectories in the template directory
   - Read `template-metadata.json` from each subdirectory
   - Read the shape from the template's `course.yaml` (`shape`; the session count and minutes come from `timeBudget.live.sessions`). If there is no `course.yaml`, use `shape` from the metadata. If neither exists, show the shape as "unknown (v2 template)".
   - If metadata file is missing, note as "unregistered template"

3. **Display template list:**

**Standard output:**

```
Available Course Templates:

1. proptech-fundamentals
   Shape: workshop | Time: 2 sessions, 840 min | Modules: 8 | Level: professional
   "PropTech workshop for real estate professionals"

2. underwriting-lab
   Shape: cohort | Time: 4 sessions, 360 min | Modules: 4 | Level: professional
   "Cohort course on underwriting for real estate analysts"

3. ai-basics
   Shape: self-paced | Time: about 4 hours | Modules: 6 | Level: beginner
   "Introduction to AI concepts for non-technical professionals"

Time: workshop and cohort show the sessions and their total minutes. Self-paced shows the estimated learner hours (`estimatedHours` in the template's positioning file), or the module minutes if that is missing.

[No templates found: Template directory is empty. Save a course as template using /course-curriculum-creator:save-as-template]
```

**Verbose output (with --verbose flag):**

```
Available Course Templates:

1. proptech-fundamentals
   Shape: workshop | Time: 2 sessions, 840 min | Modules: 8 | Level: professional
   "PropTech workshop for real estate professionals"

   Cognitive Distribution:
     Understand: 2 | Apply: 4 | Analyze: 2 | Evaluate: 1 | Create: 1

   Keywords: PropTech, Real Estate, Analysis, Technology
   Created: 2026-01-15 by Reggie Chan
   Template directory: ~/.claude/course-templates/proptech-fundamentals/

   Placeholders: 12 automatic, 8 domain-specific
   Files: 6 curriculum files + template-manifest.md

---

[Repeat for each template]
```

## Settings

Settings: see `course-conventions` (uses `template_directory`). It is the directory where templates are found.

If a value is empty and not overridden, use default template directory.

## Error Handling

**Template directory doesn't exist:**
- "No template directory found at [path]. Create templates using `/course-curriculum-creator:save-as-template` first."

**Empty template directory:**
- "No templates found. Save a course as a template using `/course-curriculum-creator:save-as-template`."

**Corrupted metadata:**
- Skip the template and note: "[template-name]: Unable to read metadata (template-metadata.json missing or corrupt)"

## Example Usage

**Standard:**
```
User: /course-curriculum-creator:list-templates
[Shows template names, shape, time, module count, level, description]
```

**Verbose:**
```
User: /course-curriculum-creator:list-templates --verbose
[Shows full details including cognitive distribution, keywords, dates, placeholder counts]
```

---

No progress step: this skill works on no course, so `course-conventions` §Progress does not apply.

List available course templates to help instructors find and reuse proven curriculum structures.
