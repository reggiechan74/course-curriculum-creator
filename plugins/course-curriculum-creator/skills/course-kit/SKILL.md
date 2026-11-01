---
name: course-kit
description: "Deterministic course toolkit CLI: hashing, staleness checks, course.yaml manifest init/validate/sync, v2 migration, media plan and registry. Use when a course-curriculum-creator workflow tells you to run course-kit."
user-invocable: false
---

# course-kit

Workflow rules for using these commands are in the `course-conventions` skill.

A bundled Node CLI that does the deterministic work (hashes, IDs, manifest) so prose never has to.

## Call form

```
node "${CLAUDE_PLUGIN_ROOT}/skills/course-kit/scripts/course-kit.mjs" <command> --course "<dir>"
```

Always quote paths; course folders may contain spaces. Output is JSON on stdout.

## Commands

- `hash <file>`: print the 8-hex-character MD5 hash of a file.
- `stale <file> --course "<dir>"`: compare `sourceHashes` in the file's frontmatter with current source files; reports `fresh` or `stale` with the changed files.
- `hash-write <file> --course "<dir>" [--sources '{"key":"path"}']`: write `sourceFiles` (from `--sources`), then `sourceHashes`, into the file's frontmatter. A missing source or output file is exit 2.
- `manifest init --course "<dir>" --json '<options>' [--force]`: create `course.yaml`. Refuses to overwrite without `--force`.
- `manifest validate --course "<dir>"`: validate `course.yaml`; exit 2 on errors.
- `manifest sync --course "<dir>" [--write]`: parse the objectives and outline markdown, assign stable IDs, update `course.yaml`; `--write` also writes `<!-- id: ... -->` comments into the objectives file and outline, and module ID comments (`## Module 1:` becomes `M1`) into `02-design/lesson-plans.md`, `04-materials/student-handout.md` and `04-materials/instructor-guide.md` when they exist. Safe to run repeatedly.
- `manifest summary --course "<dir>"`: print `{id,title,shape,delivery,sessions,liveMinutes,asyncMinutes,unscheduledModules,objectives,modules,rules}`; the time budget for the course.
- `progress --course "<dir>" [--write]`: print the workflow stages (`present`, `missing`, `stale` or `skipped`) and the `next` stage; `--write` saves them in `course.yaml`.
- `progress skip|unskip <stage> --course "<dir>"`: leave out an optional stage, or put it back.
- `audit --course "<dir>"`: check the course (manifest, objective coverage, stale outputs, media links, alt text, long descriptions, UDL representation); prints `{ok, issues, counts}`; exit 2 only if `course.yaml` is bad.
- `migrate-course --course "<dir>" [--dry-run] [--answers '<json>']`: migrate a v2 course folder: writes `course.yaml`, registers `.png`/`.jpg`/`.svg` files in `04-materials/` in the media registry as `imported`, and inserts ID comments. Prints `{manifest, actions, changes, questions, imported}`; `changes` lists each file as `create` or `modify` with `added` and `removed` line counts. `--dry-run` writes nothing. Answers are keyed by question id: `shape`, `delivery`, `sessionMinutes`, `objectives:<asset id>`, `alt:<id>`. Never moves or deletes files; a second run reports no actions.

Media plan and registry (also in this bundle; the course-studio plugin uses them most):

- `plan validate --course "<dir>"`: check `05-media/media-plan.yaml`; exit 2 on errors.
- `plan estimate --course "<dir>" --quality draft|standard|high [--data-dir "<dir>"]`: estimate cost per item and in total.
- `registry list|add|update|status ...`: read and change `05-media/registry.json` (see the course-studio course-kit skill for the arguments).

Media generation, rendering and embedding commands are in the course-studio plugin's bundle.

## course.yaml notes

- Top-level keys that the schema does not know (for example a hand-added `notes:`) are moved into `extra` the next time a command saves `course.yaml`. They are kept there, not lost. Put your own fields under `extra` to begin with.
- If the objectives or outline markdown file is missing, `manifest sync` keeps the objectives or modules already in `course.yaml` and reports a warning.
- `manifest sync --write` and `migrate-course` change the objectives, outline and lesson files (ID comments). Outputs whose `sourceHashes` were fresh before are re-hashed after, so they stay fresh; outputs that were already stale stay stale.

## Exit codes

| Code | Meaning |
| --- | --- |
| 0 | success |
| 1 | usage error |
| 2 | validation error |
| 3 | budget exceeded |
| 4 | provider not available |

## Rule

If `node` is not available, stop. Tell the user that Node 20 or later is necessary.
