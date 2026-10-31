---
name: migrate-course
description: Migrate a v2 course folder to v3 by creating course.yaml, a media registry for existing images and stable IDs, without moving or deleting any file
disable-model-invocation: true
argument-hint: "[course-dir]"
allowed-tools:
  - AskUserQuestion
  - Bash
  - Read
---

# Migrate Course Command

Bring an existing v2 course folder (positioning, objectives, outline, materials) up to v3. The command creates `course.yaml`, registers existing images in `05-media/registry.json` as `imported`, and adds `<!-- id: ... -->` comments to the planning and design files. It never moves or deletes a file, and it is safe to run again.

## Command Behavior

When the user invokes `/course-curriculum-creator:migrate-course [course-dir]` (ask for the folder if it is not given):

### Step 1: Dry run

```
node "${CLAUDE_PLUGIN_ROOT}/skills/course-kit/scripts/course-kit.mjs" migrate-course --course "<dir>" --dry-run
```

The JSON output has `manifest`, `actions`, `questions` and `imported`. Nothing is written.

### Step 2: Show the plan

Show the user the `actions`, the inferred `shape` and the number of sessions (`manifest.timeBudget.live.sessions`), the title, and the `sources` found. If `actions` is empty, tell the user the course is already migrated and stop.

### Step 3: Ask the questions

Ask each entry of `questions` with AskUserQuestion, offering `default` when there is one.

- `shape`: the duration in the positioning file could not be read. Ask for workshop, cohort or self-paced.
- `alt:<id>`: alt text for an imported image. Use Read to open the image file first (the path is in `05-media/registry.json` after a real run, or `04-materials/<name>` for `IMG-<name>`), propose alt text that describes what the image teaches, and let the user edit it.

### Step 4: Run for real

Pass the answers as a JSON object keyed by question id, without `--dry-run`:

```
node "${CLAUDE_PLUGIN_ROOT}/skills/course-kit/scripts/course-kit.mjs" migrate-course --course "<dir>" --answers '{"shape":"cohort","alt:IMG-bmc":"..."}'
```

### Step 5: Validate

```
node "${CLAUDE_PLUGIN_ROOT}/skills/course-kit/scripts/course-kit.mjs" manifest validate --course "<dir>"
```

Show the result, including any warnings.

### Step 6: Tell the user

State that the old files did not move and none were deleted; only `course.yaml`, `05-media/registry.json` and ID comments were added. Pointers to files outside the course (for example a series framework) are recorded as `external` sources.
