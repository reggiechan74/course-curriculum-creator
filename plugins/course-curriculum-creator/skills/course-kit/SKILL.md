---
name: course-kit
description: "Deterministic course toolkit CLI: hashing, staleness checks, course.yaml manifest init/validate/sync. Use when a course-curriculum-creator workflow tells you to run course-kit."
user-invocable: false
---

# course-kit

A bundled Node CLI that does the deterministic work (hashes, IDs, manifest) so prose never has to.

## Call form

```
node "${CLAUDE_PLUGIN_ROOT}/skills/course-kit/scripts/course-kit.mjs" <command> --course "<dir>"
```

Always quote paths; course folders may contain spaces. Output is JSON on stdout.

## Commands

- `hash <file>`: print the 8-hex-character MD5 hash of a file.
- `stale <file> --course "<dir>"`: compare `sourceHashes` in the file's frontmatter with current source files; reports `fresh` or `stale` with the changed files.
- `hash-write <file> --course "<dir>"`: recompute and write `sourceHashes` into the file's frontmatter.
- `manifest init --course "<dir>" --json '<options>' [--force]`: create `course.yaml`. Refuses to overwrite without `--force`.
- `manifest validate --course "<dir>"`: validate `course.yaml`; exit 2 on errors.
- `manifest sync --course "<dir>" [--write]`: parse the objectives and outline markdown, assign stable IDs, update `course.yaml`; `--write` also writes `<!-- id: ... -->` comments into the objectives file and outline, and module ID comments (`## Module 1:` becomes `M1`) into `02-design/lesson-plans.md`, `04-materials/student-handout.md` and `04-materials/instructor-guide.md` when they exist. Safe to run repeatedly.
- `migrate-course --course "<dir>" [--dry-run] [--answers '<json>']`: migrate a v2 course folder: writes `course.yaml`, registers `.png`/`.jpg`/`.svg` files in `04-materials/` in the media registry as `imported`, and inserts ID comments. Prints `{manifest, actions, questions, imported}`; `--dry-run` writes nothing. Answers are keyed by question id (`shape`, `alt:<asset id>`). Never moves or deletes files; a second run reports no actions.

Later releases add more commands (plan, registry and media commands); they will be listed here.

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
