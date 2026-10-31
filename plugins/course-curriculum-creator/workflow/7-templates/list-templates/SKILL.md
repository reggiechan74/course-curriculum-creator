---
name: list-templates
description: List available course templates with details
disable-model-invocation: true
argument-hint: "[--verbose]"
allowed-tools:
  - Bash
  - Read
  - Glob
---

# List Templates Command

Display available course templates from the template directory.

## Command Behavior

When user invokes `/course-curriculum-creator:list-templates`:

1. **Determine template directory:**
   - Use the `template_directory` plugin setting (see Settings below)
   - Default: `~/.claude/course-templates/`

2. **Scan for templates:**
   - List subdirectories in the template directory
   - Read `template-metadata.json` from each subdirectory
   - If metadata file is missing, note as "unregistered template"

3. **Display template list:**

**Standard output:**

```
Available Course Templates:

1. proptech-fundamentals
   Duration: 2-day | Modules: 8 | Level: professional
   "Two-day PropTech workshop for real estate professionals"

2. ai-basics-workshop
   Duration: 1-day | Modules: 5 | Level: beginner
   "Introduction to AI concepts for non-technical professionals"

[No templates found: Template directory is empty. Save a course as template using /course-curriculum-creator:save-as-template]
```

**Verbose output (with --verbose flag):**

```
Available Course Templates:

1. proptech-fundamentals
   Duration: 2-day | Modules: 8 | Level: professional
   "Two-day PropTech workshop for real estate professionals"

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

## Settings Integration

Plugin settings (configured with `/plugin configure`). If the project has a `.claude/course-curriculum-creator.local.md` file, values in its YAML frontmatter override these. A value still shown as a literal `${user_config.…}` placeholder has not been set, so use its default:
- `template_directory` = `${user_config.template_directory}` (default `~/.claude/course-templates`): Where to look for templates

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
[Shows template names, duration, module count, level, description]
```

**Verbose:**
```
User: /course-curriculum-creator:list-templates --verbose
[Shows full details including cognitive distribution, keywords, dates, placeholder counts]
```

---

List available course templates to help instructors find and reuse proven curriculum structures.
