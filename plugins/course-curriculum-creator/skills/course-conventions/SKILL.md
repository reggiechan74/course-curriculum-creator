---
name: course-conventions
description: "Shared rules for every course-curriculum-creator workflow skill: settings, the course.yaml rule, shape and time budget, IDs, staleness, progress, question style and accessibility. Load it first in each workflow skill."
user-invocable: false
---

# Course conventions

Every workflow skill follows these rules. Load this skill first, then do the work of the skill.

## 1. Toolkit

`KIT` = `node "${CLAUDE_PLUGIN_ROOT}/skills/course-kit/scripts/course-kit.mjs"`

Node 20 or later is necessary. If `node` is not available, stop and tell the user. Always quote paths. Output is JSON on stdout. Command list: the `course-kit` skill.

## 2. Settings

Plugin settings (set with `/plugin configure`). A project file `.claude/course-curriculum-creator.local.md` can override them in its YAML frontmatter. An empty value, or a literal `${user_config.…}` placeholder, means "not set": use the default.

- `instructor_name` = `${user_config.instructor_name}` (default: not set): instructor name in positioning, guides and reports
- `instructor_bio` = `${user_config.instructor_bio}` (default: not set): credentials in course descriptions and instructor guides
- `organization` = `${user_config.organization}` (default: not set): organization name in document headers
- `courses_directory` = `${user_config.courses_directory}` (default `~/courses`): where new courses go when no location is given
- `default_duration` = `${user_config.default_duration}` (default `2-day`): duration when none is given. It applies only to the workshop shape.
- `default_audience_level` = `${user_config.default_audience_level}` (default `professional`): suggest it in prompts
- `default_shape` = `${user_config.default_shape}` (default `workshop`): course shape when the user gives none
- `rubric_scale` = `${user_config.rubric_scale}` (default `1-5`): scoring scale for rubrics when no argument gives one
- `rubric_type` = `${user_config.rubric_type}` (default `analytical`): rubric type (analytical, performance, holistic) when no argument gives one
- `template_directory` = `${user_config.template_directory}` (default `~/.claude/course-templates`): where templates are saved and found
- `brand_config` = `${user_config.brand_config}` (default: not set): optional `*.brand.yaml` brand file (colors, fonts, imagery) used by course-studio

## 3. course.yaml is necessary

Before a skill reads or writes course files, run `KIT manifest validate --course "<dir>"`.

- If `course.yaml` is missing: stop. If the folder has `01-planning/course-positioning.md`, offer `/course-curriculum-creator:migrate-course`. Otherwise offer `/course-curriculum-creator:create-course`.
- Do not write `course.yaml` by hand.
- On exit 2, show the errors and stop.

## 4. Shape and time budget

Run `KIT manifest summary --course "<dir>"`. Use its `shape`, `sessions`, `liveMinutes`, `asyncMinutes` and `rules` for every duration decision. Never assume "1 or 2 days". Apply every line in `rules`.

- Workshop and cohort: the time comes from `sessions[].minutes` (compare with each session's `plannedMinutes`).
- Self-paced: the time comes from `asyncMinutes` and the module `minutes`.

## 5. IDs and heading formats

- IDs are `LO-n` (objectives), `Mn` (modules), `Sn` (sessions). The ID is in a comment `<!-- id: X -->` on the line after the heading. Never edit or remove an ID comment by hand.
- Objectives file: `### Objective N: Title` with `**Cognitive Level:** Level`; `### Affective Objective X: Title`; `### Integration Objective N: Title`; `## Level 0: Title`.
- Outline sessions: `## Day N: …` (workshop); `## Session N: …` (cohort, one heading for each session); no session headings (self-paced).
- Modules: `### Module N: Title (NN min)`; in self-paced, `### Module N: Title (est. NN min)`. Module bodies name objectives as `Objective N`.
- After a skill writes objectives or the outline, run `KIT manifest sync --course "<dir>" --write`.

## 6. Staleness

- All paths, `<output>` and the `--sources` paths alike, are relative to the course folder (for example `04-materials/pre-work.md`).
- Before you regenerate an output: `KIT stale <output> --course "<dir>"`. If it is `stale`, tell the user which sources changed (`changed`) and that regeneration includes those changes. `missing-output` means a first generation: no warning is needed.
- After you write an output: `KIT hash-write <output> --course "<dir>" --sources '{"<key>":"<path>",…}'`, with the source files the skill read.
- Never compute hashes with shell commands.

## 7. Progress

After a skill writes its output, run `KIT progress --course "<dir>" --write`. When `next` is not null, tell the user the next stage and its skill name. To leave out an optional stage for good: `KIT progress skip <stage> --course "<dir>"` (`unskip` reverses it).

## 8. Questions

- Use AskUserQuestion for every choice the user must make.
- Ask only for values that the arguments, `course.yaml` and the settings do not give.
- At most 4 questions in one call.
- Put the recommended option first, with "(Recommended)".
- When the user says "do not ask", or the run is non-interactive, use the defaults and state them in the final message.

## 9. Accessibility

Course materials meet WCAG 2.2 AA. See `universal-design-for-learning/references/accessibility-specifications.md`.
