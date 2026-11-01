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

Load the `course-curriculum-creator:course-conventions` skill first; it explains the v3 folder layout, IDs and stages that this command creates. Ask the user questions as in `course-conventions` §Questions.

Bring an existing v2 course folder (positioning, objectives, outline, materials) up to v3. The command creates `course.yaml`, registers existing images in `05-media/registry.json` as `imported`, and adds `<!-- id: ... -->` comments to the planning and design files. It never moves or deletes a file, and it is safe to run again.

## Command Behavior

When the user invokes `/course-curriculum-creator:migrate-course [course-dir]` (ask for the folder if it is not given):

### Step 1: Dry run

```
node "${CLAUDE_PLUGIN_ROOT}/skills/course-kit/scripts/course-kit.mjs" migrate-course --course "<dir>" --dry-run
```

The JSON output has `manifest`, `actions`, `questions`, `imported` and `changes`. Nothing is written.

### Step 2: Show the plan

Show the `changes` as a table with the columns file, create/modify, +added and −removed (lines). Then show the `actions`, the inferred `shape` and the number of sessions (`manifest.timeBudget.live.sessions`), the title, and the `sources` found. If `actions` is empty, tell the user the course is already migrated and stop.

### Step 3: Ask the questions

Ask each entry of `questions` with AskUserQuestion, offering `default` when there is one.

- `shape`: the duration in the positioning file could not be read. Ask for workshop, cohort or self-paced.
- `delivery`: the delivery mode in the positioning file was not in-person, virtual or hybrid. Ask which one applies.
- `sessionMinutes`: the course has a session or day count but the outline lists no sessions, so the tool creates `S1…Sn`. Ask how many minutes each live session takes.
- `objectives:<id>`: ask which objectives an imported image supports. Show the objective IDs and titles from `manifest.objectives` in the dry-run output, open the image with Read, and propose the IDs that match what the image shows. Answer with IDs separated by commas, for example `LO-1, LO-3`, or leave it empty for none. An ID that is not in `manifest.objectives` is rejected with exit code 2 and nothing is written.
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

Show the result, including any warnings. Then check the course for problems:

```
node "${CLAUDE_PLUGIN_ROOT}/skills/course-kit/scripts/course-kit.mjs" audit --course "<dir>"
```

Show the issues it reports.

### Step 6: Tell the user

State that the old files did not move and none were deleted; only `course.yaml`, `05-media/registry.json` and ID comments were added, and the `sourceHashes` of any output that was up to date are refreshed so the new ID comments do not make it look stale (the `changes` table lists every such file). Pointers to files outside the course (for example a series framework) are recorded as `external` sources.

Core v3 workflow skills need `course.yaml`, so a v2 folder must be migrated with this command before any other workflow skill runs on it.
