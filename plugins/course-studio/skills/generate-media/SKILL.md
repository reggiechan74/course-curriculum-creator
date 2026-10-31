---
name: generate-media
description: Generate the approved diagrams, charts and images of a course media plan, within budget, and register them for review
disable-model-invocation: true
argument-hint: "[course-folder]"
allowed-tools:
  - AskUserQuestion
  - Bash
  - Read
  - Write
  - Edit
  - Skill
  - mcp__plugin_course-studio_course-media__generate_image
  - mcp__plugin_course-studio_course-media__estimate_cost
---

# Generate media

Make every approved item in `05-media/media-plan.yaml`. `KIT` means `node "${CLAUDE_PLUGIN_ROOT}/skills/course-kit/scripts/course-kit.mjs"`. Follow `media-pedagogy` and `05-media/style/style-guide.md`. Nothing made here is used in course materials until `review-media` and the user approve it.

The course folder is the argument, or the current directory if it contains `course.yaml`.

## Steps

1. Run `KIT providers show --course "<dir>"`. If it returns `{"detected":null}`, do steps 2 to 5 of the `setup` skill (probe Codex, match tool patterns, match design skills, `providers record`) and read it again.
2. Run `KIT plan validate --course "<dir>"` (exit 2: stop and show the errors) and `KIT registry list --course "<dir>"`. Take the plan items with `status: approved` in module sequence. Skip any item that already has an asset in the registry with status `generated`, `approved` or `imported`. For an asset with status `rejected`, make it again (the same `id`; see "Remake" below).
3. For each item, use the section for its `kind`. Save sources in `05-media/src/` and results in `05-media/out/`, named by item ID. Use the style tokens in `05-media/style/tokens.json` (`--tokens`) where a renderer accepts them.
4. After all items, run `KIT ledger totals --course "<dir>"` and tell the user: what was made, what is still a placeholder and why, and the spend. Then give the next step: `/course-studio:review-media`.

## Diagrams (`kind: diagram`, `chart` is below)

Follow the item `provider`, then the fallbacks in this order:

1. `excalidraw`: only when the Excalidraw connector is connected and `preferred_diagram_style` is `hand-drawn` (or the item says `excalidraw`). Create the scene with the connector, save the scene JSON to `05-media/src/<id>.excalidraw` and keep its share URL. Run `KIT render excalidraw 05-media/src/<id>.excalidraw 05-media/out/<id>.svg --data-dir "${CLAUDE_PLUGIN_DATA}"`.
2. `mermaid`: write Mermaid to `05-media/src/<id>.mmd` and run `KIT render mermaid 05-media/src/<id>.mmd 05-media/out/<id>.svg --data-dir "${CLAUDE_PLUGIN_DATA}" --tokens 05-media/style/tokens.json`. Use this when the Excalidraw connector or its renderer is not available.
3. If mermaid-cli is not installed (exit 4), use the Mermaid Chart connector, if connected, and save its SVG to the output path.
4. If no tool is available (or the item `provider` is `svg`), write the SVG yourself to `05-media/out/<id>.svg`: a `viewBox`, a `<title>` and `<desc>`, text of at least 16px equivalent, colors from `tokens.json`, no external references.

Chart (`kind: chart`): write a Vega-Lite spec to `05-media/src/<id>.vl.json` with the data inline, then run `KIT render vegalite 05-media/src/<id>.vl.json 05-media/out/<id>.svg --tokens 05-media/style/tokens.json`.

After a diagram or chart renders, register it with `KIT registry add --course "<dir>" --json '<asset>'`:
`{"id":"<id>","kind":"diagram"|"chart","function":<item function>,"objectives":<item objectives>,"module":"<item module>","provider":"excalidraw|mermaid|vegalite|svg","source":"05-media/src/<file>","files":["05-media/out/<id>.svg"],"alt":"","status":"generated","costUsd":0,"quotaUnits":0,"shareUrl":<only when you have one>,"createdAt":"<iso>"}`. Leave `alt` empty; `review-media` writes it.

### Renderer exit codes

- Exit 2 (bad diagram source): read the error, fix the source file, and run the renderer once more. If it fails again, keep the item as a placeholder and tell the user why. Do not loop.
- Exit 4 (renderer or provider not available): go to the next fallback above. Do not retry the same tool.

## Images (`kind: image`)

`gen image` and `generate_image` read the approved plan item, compose the prompt from its `description` and `05-media/style/prompt-anchors.md` (the style guide must exist), save it to `05-media/src/<id>.prompt.txt`, and add the asset to the registry themselves. Do not `registry add` for them. Never ask the image model for text, letters, numbers or logos; needed labels are added later with `render overlay`. Write a clear plan item `description` first if it is vague (edit the plan, then run `plan validate`).

Choose the provider in this order, using `.course/providers.json`:

1. `codex`, when `codex.loggedIn` is true: `KIT gen image --course "<dir>" --asset <id> --provider codex --quality <image_quality>`.
2. The `course-media` MCP tool `generate_image({courseDir, assetId, quality})` (OpenAI key from the plugin settings), when Codex is not available or gave exit 4. Use `estimate_cost` first if the user wants the price.
3. A detected third-party image tool, as the last choice. Run `KIT ledger check --course "<dir>" --usd <n> --quota <n>` before you use it, then register the result with `registry add` (`kind: image`, `status: generated`, `alt: ""`).

Never call an image API directly with `curl` or a script. All generation goes through `gen image` or the MCP tool, because only they reserve budget in the ledger. If no provider operates, keep the placeholder, tell the user which provider each missing image needs. The embed step shows the placeholder until an asset is approved.

If an image needs labels, run `KIT render overlay <image> <labels.json> <out.svg>` and register the overlay file in the asset `files` after the image.

### Image exit codes

- Exit 3 (budget exceeded): stop all generation. Run `KIT ledger totals --course "<dir>"`, show the totals against `media.budgetUsd` and `media.maxPlanImages`, and ask the user (AskUserQuestion) to raise the budget in `course.yaml` or to stop. Continue only after they raise it.
- Exit 4 (provider not available): go to the next provider in the order above. Do not retry the same one.
- Exit 2 (validation): fix the registered asset or the plan and retry once.

## Remake

Use this when `review-media` asks for one more attempt (or an asset is `rejected` and the user wants it again). The budget applies as for any generation. Do it once for each failed review.

- Diagram or chart: fix the source, render again to the same output path. If the asset is `rejected`, run `KIT registry status <id> generated --course "<dir>"` first.
- Image: run `gen image` (or the MCP tool) again for the same `id`; it replaces the earlier `generated` or `rejected` asset.
