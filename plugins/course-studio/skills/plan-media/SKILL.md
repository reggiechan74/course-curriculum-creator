---
name: plan-media
description: Plan diagrams, charts and images for a course from its objectives and lesson plans, with cost estimates and approval
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

# Plan media

Write `05-media/media-plan.yaml`. `KIT` means `node "${CLAUDE_PLUGIN_ROOT}/skills/course-kit/scripts/course-kit.mjs"`. Follow the `media-pedagogy` skill: every item serves an objective, uses one function, and uses a diagram tool when it is text-heavy or precise.

## Settings

Plugin settings (configured with `/plugin configure course-studio@course-curriculum-creator`). A value still shown as a literal `${user_config.…}` placeholder has not been set, so use its default:
- `image_quality` = `${user_config.image_quality}` (default `standard`): quality for `plan estimate` and for generated images.
- `preferred_diagram_style` = `${user_config.preferred_diagram_style}` (default `clean`): `hand-drawn` prefers Excalidraw, `clean` prefers Mermaid.
- `default_media_budget_usd` = `${user_config.default_media_budget_usd}` (default `20`): spend cap for a new course.
- `max_plan_images` = `${user_config.max_plan_images}` (default `40`): plan-billed (Codex) image cap for a new course.

## Steps

1. Run `KIT manifest sync --course "<dir>" --write` (without `--write` it is a dry run). Stop on errors.
2. Read `02-design/lesson-plans.md`, or `02-design/course-outline.md` if there are no lesson plans, plus `05-media/style/style-guide.md`. Read `.course/providers.json` (`KIT providers show`) to see which tools are available.
3. Write `05-media/media-plan.yaml`:

   ```yaml
   schema: media-plan/v1
   items:
     - id: A-M1-01
       module: M1
       segment: "Opening: why leases fail"
       objectives: [LO-1]
       function: process-flow
       kind: diagram
       description: "Steps from letter of intent to signed lease"
       provider: mermaid
       estimateUsd: 0
       quotaUnits: 0
       status: proposed
   ```

   Rules: `objectives` has 1 or more existing IDs, `module` an existing module ID, `function` one of the taxonomy values, `kind` one of diagram, chart, image, infographic, audio, video. Set `quotaUnits: 1` on `codex` image items and 0 on all others. Set `estimateUsd` to 0 (the toolkit prices `openai` image items itself from its pricing table; `plan estimate` does not write values back into the plan). Each module needs 2 or more representation modes.
   Pick `provider` with this routing (first available wins):

   | Function | Preferred | Fallbacks |
   | --- | --- | --- |
   | Hand-drawn concept or process diagram | `excalidraw` | Excalidraw JSON rendered locally, then `mermaid` |
   | Precise flow, sequence, hierarchy, timeline | `mermaid` | Mermaid Chart connector, then hand-authored `svg` |
   | `data-viz` | `vegalite` | table plus description |
   | Illustration, scenario, analogy | `codex` (plan-billed, no key) | `openai` via `course-media` (`generate_image`), a detected image tool, then placeholder plus saved prompt |
   | Infographic, job aid | HTML and SVG template | markdown one-pager |
   | Audio recap | `course-media` speech or a detected TTS tool | script only |

   Honor `preferred_diagram_style` (hand-drawn prefers Excalidraw, clean prefers Mermaid). If Codex is not signed in with ChatGPT (`codex.billing` is not `plan` in `.course/providers.json`), do not choose `codex`. Use `auto` only when unsure.
4. Run `KIT plan validate --course "<dir>"`. On exit 2, correct every error (unknown IDs, missing objectives, wrong function) and run it again. Remove any item you cannot link to an objective.
5. Run `KIT plan estimate --course "<dir>" --quality <image_quality>` using `image_quality` from Settings.
6. Show a table for each module: item ID, description, function and tool. Under each table show that module's cost from `plan estimate` (`perModule`: USD and plan images). Do not invent per-item costs. Then the totals (`totalUsd`, `totalQuota`) against `media.budgetUsd` and `media.maxPlanImages` from `course.yaml`.
7. Budget defaults: read `media.budgetUsd` and `media.maxPlanImages` in `course.yaml`. When `manifest sync` (step 1) or `migrate-course` creates `course.yaml`, it writes the toolkit defaults 20 and 40; an existing `course.yaml` keeps whatever it had. If `default_media_budget_usd` or `max_plan_images` from Settings differ from the toolkit defaults, and `course.yaml` still has exactly 20 and 40, ask the user (AskUserQuestion) whether to apply the settings values; if yes, edit those two values in `course.yaml`. Never change values the user already set.
8. Ask (AskUserQuestion): approve all items, approve per module, or edit. For edits, change the plan and repeat from step 4. Set `status` to `approved` on approved items and `rejected` on dropped ones. Leave the rest `proposed`.
9. Run `plan validate` once more. Tell the user the next step: `/course-studio:generate-media`.
