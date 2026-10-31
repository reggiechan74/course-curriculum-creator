---
name: embed-media
description: Embed approved media into the lesson plans, student handout and instructor guide, with placeholders for media that is not approved
disable-model-invocation: true
argument-hint: "[course-folder]"
allowed-tools:
  - Bash
  - Read
  - Skill
---

# Embed media

Put approved assets into the course documents. `KIT` means `node "${CLAUDE_PLUGIN_ROOT}/skills/course-kit/scripts/course-kit.mjs"`.

## Steps

1. Run `KIT manifest sync --course "<dir>" --write`. It keeps the IDs in `course.yaml`, the objectives file and the outline current, without duplicating comments. Stop on errors.
2. Run `KIT embed all --course "<dir>"`. It writes to `02-design/lesson-plans.md`, `04-materials/student-handout.md` and `04-materials/instructor-guide.md` when each exists and has the module ID comment. Only assets with status `approved` get an image block; every other planned item gets a "Media pending approval" placeholder. Running it again changes nothing.
3. Report a table from the output, one row per file: embedded blocks and placeholder blocks, with the asset IDs. If a file is missing, say so. If a file exists but has no `<!-- id: Mx -->` comment for a module that has media, `embed all` skips it: tell the user, and offer (AskUserQuestion) to add `<!-- id: Mx -->` on the line after each matching module heading in that file. Edit the file only if they say yes, then run `embed all` again. For placeholders, name the next step for each: `/course-studio:generate-media` (not made yet) or `/course-studio:review-media` (made, not approved).

To place one asset by hand: `KIT embed <file> --asset <id> --anchor <module-id> --course "<dir>"`. If the anchor is missing it exits 2 with `Anchor <id> not found`.
