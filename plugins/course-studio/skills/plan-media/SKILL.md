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

## Steps

1. Run `KIT manifest sync --course "<dir>"`. Stop on errors.
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

   Rules: `objectives` has 1 or more existing IDs, `module` an existing module ID, `function` one of the taxonomy values, `kind` one of diagram, chart, image, infographic, audio, video. Leave `estimateUsd` and `quotaUnits` at 0; the estimate step fills them. Each module needs 2 or more representation modes.
   Pick `provider` with this routing (first available wins):

   | Function | Preferred | Fallbacks |
   | --- | --- | --- |
   | Hand-drawn concept or process diagram | `excalidraw` | Excalidraw JSON rendered locally, then `mermaid` |
   | Precise flow, sequence, hierarchy, timeline | `mermaid` | Mermaid Chart connector, then hand-authored `svg` |
   | `data-viz` | `vegalite` | table plus description |
   | Illustration, scenario, analogy | `codex` (plan-billed, no key) | `openai` via `course-media` (`generate_image`), a detected image tool, then placeholder plus saved prompt |
   | Infographic, job aid | HTML and SVG template | markdown one-pager |
   | Audio recap | `course-media` speech or a detected TTS tool | script only |

   Honor `preferred_diagram_style` (hand-drawn prefers Excalidraw, clean prefers Mermaid). If Codex is not logged in, do not choose `codex`. Use `auto` only when unsure.
4. Run `KIT plan validate --course "<dir>"`. On exit 2, correct every error (unknown IDs, missing objectives, wrong function) and run it again. Remove any item you cannot link to an objective.
5. Run `KIT plan estimate --course "<dir>" --quality <image_quality>` using the studio `image_quality` setting (default `standard`).
6. Show a table for each module: item ID, description, function, tool, cost (USD and plan images). Then the totals against `media.budgetUsd` and `media.maxPlanImages` from `course.yaml`.
7. Budget defaults: `manifest sync` already wrote `media.budgetUsd: 20` and `maxPlanImages: 40`. If the studio settings `default_media_budget_usd` and `max_plan_images` differ and `course.yaml` still has 20 and 40, ask the user whether to apply the studio values. Do not change other values.
8. Ask (AskUserQuestion): approve all items, approve per module, or edit. For edits, change the plan and repeat from step 4. Set `status` to `approved` on approved items and `rejected` on dropped ones. Leave the rest `proposed`.
9. Run `plan validate` once more. Tell the user the next step: `/course-studio:generate-media` (arrives in the next release of this plugin).
