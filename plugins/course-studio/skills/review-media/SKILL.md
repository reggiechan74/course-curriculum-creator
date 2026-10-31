---
name: review-media
description: Review generated course media against the review checklist and the lesson, write alt text and captions, and record the user's approval
disable-model-invocation: true
argument-hint: "[course-folder]"
allowed-tools:
  - AskUserQuestion
  - Bash
  - Read
  - Write
  - Edit
  - Skill
---

# Review media

Check every generated asset, then let the user decide. `KIT` means `node "${CLAUDE_PLUGIN_ROOT}/skills/course-kit/scripts/course-kit.mjs"`. Use the review and accessibility rules in `media-pedagogy`.

## Steps

1. Run `KIT registry list --course "<dir>"`. Take the assets with `status: generated`. If there are none, say so and stop.
2. Asset `files` and `source` are relative to the course folder: open them as `<dir>/<path>`. For each asset, open the file (`Read` shows images and SVG sources) and its source. Compare its facts with the lesson segment in `02-design/lesson-plans.md` (the plan item `segment` and `description`). Record each check as `pass`, `fail` or `n/a`, with a short note:

   | Check | Question |
   | --- | --- |
   | `no-stray-text` | Is there any text, letters, numbers or logos that were not asked for, or misspelled text? |
   | `factual` | Does every claim, label, number and relation match the lesson? |
   | `representation` | Does it serve the objective, with no decoration? |
   | `style` | Does it follow `style-guide.md` and the tokens? |
   | `contrast` | Does text and key content have enough contrast (WCAG 2.2 AA)? |
   | `physical` | For people and objects: is anatomy, perspective and scale believable? |

3. If a check fails, remake the asset once (see `generate-media`, "Remake"; the budget applies) and review it again. If it still fails, show the failure to the user and let them decide.
4. Write the text for each asset, then save it:
   `KIT registry update <id> --course "<dir>" --json '{"alt":"…","longDescription":"…","caption":"…"}'`
   - `alt`: what the image shows and why it matters, in one or two sentences, with no "image of". Required.
   - `longDescription`: for complex diagrams, charts and infographics, the full content in reading order (steps, categories, values). Leave it out for simple images.
   - `caption`: a short figure caption. Optional.
   `registry update` cannot change status and refuses approved assets.
5. Show each asset (or all together) with its review result, alt text and caption. Ask (AskUserQuestion) for each asset or for the group: approve, reject or regenerate.
6. Act only on what the user said:
   - Approve: `KIT registry status <id> approved --course "<dir>" --approved-by user --review '<json>'`. Do this only after the user explicitly approves in this conversation. Never approve on your own, never because checks passed, and never for an asset whose alt text is empty.
   - Reject: `KIT registry status <id> rejected --course "<dir>" --review '<json>'`.
   - Regenerate: remake it (see `generate-media`, "Remake") and review it again. Record the earlier failure with `registry status <id> rejected --review '<json>'` first if you want to keep the review.
   - Revoke an approval (the user wants to change an asset that is already approved): `KIT registry status <id> rejected --course "<dir>"`. This removes `approvedBy`. Run `KIT embed all --course "<dir>"` so the lessons show the placeholder again. Then either regenerate it, or edit its text and set it back with `KIT registry status <id> generated --course "<dir>"`, and review it again.

   `--review` is JSON like `{"checks":{"no-stray-text":"pass","factual":"pass","representation":"pass","style":"pass","contrast":"pass","physical":"n/a"},"notes":"…","at":"<iso>"}` with all six checks.
7. Tell the user the next step: `/course-studio:embed-media`.
