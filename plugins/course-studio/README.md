# Course Studio

A Claude Code plugin that plans diagrams, charts and images for courses made with `course-curriculum-creator`. Every asset is linked to a learning objective, estimated before it is made, and approved by you before it is used.

It depends on the core plugin (`course-curriculum-creator`) and needs Node 20 or later.

## Install

```
/plugin marketplace add reggiechan74/course-curriculum-creator
/plugin install course-studio@course-curriculum-creator
```

For local development: `claude --plugin-dir /path/to/course-curriculum-creator/plugins/course-studio`. Check changes with `claude plugin validate .`.

## Skill sequence

Run these in a course folder.

1. `/course-studio:setup` detects Codex, image and diagram tools and design companions, and records them in `.course/providers.json`.
2. `/course-studio:setup-brand` (optional) builds and validates a `<name>.brand.yaml` from your answers or from a website or PDF.
3. `/course-studio:generate-style-guide` writes `05-media/style/` (theme, WCAG-checked `tokens.json`, `style-guide.md`, `prompt-anchors.md`).
4. `/course-studio:plan-media` writes `05-media/media-plan.yaml` with costs, and asks you to approve.
5. `/course-studio:generate-media` makes the approved items (diagrams and charts locally, images through Codex or the `course-media` server) within your budget.
6. `/course-studio:review-media` checks each result against the lesson, writes alt text and captions, and records your approval.
7. `/course-studio:embed-media` writes approved assets into the lesson plans, student handout and instructor guide. Anything not approved shows a "Media pending approval" placeholder.

Two knowledge skills, `course-kit` (the CLI) and `media-pedagogy` (function taxonomy, Mayer's principles, UDL and accessibility rules), are used by the others and are not run by hand.

## Provider routing

`plan-media` and `generate-media` pick the first available tool in each row.

| Function | Preferred | Fallbacks |
| --- | --- | --- |
| Hand-drawn concept or process diagram | `excalidraw` (connector connected and `preferred_diagram_style: hand-drawn`) | `mermaid` |
| Precise flow, sequence, hierarchy, timeline | `mermaid` | Mermaid Chart connector, then a hand-written `svg` |
| Chart (`data-viz`) | `vegalite` | table plus description |
| Illustration, scenario, analogy | `codex` (billed to your ChatGPT plan, no key) | `openai` through `course-media` (needs a key), a detected image tool, then a placeholder plus the saved prompt |
| Infographic, job aid | HTML and SVG template | markdown one-pager |

With no connectors, no Codex and no key, diagrams and charts are still made locally and images stay as placeholders. Images never contain text; labels are added as an overlay.

## Settings

Claude Code asks for these when you enable the plugin. Change them with `/plugin configure course-studio@course-curriculum-creator`.

| Setting | Default | Meaning |
| --- | --- | --- |
| `openai_api_key` | empty | Optional. Used by the `course-media` server when Codex is not available. Stored as a sensitive value. |
| `default_media_budget_usd` | 20 | Spend cap for each new course |
| `max_plan_images` | 40 | Cap on images billed to your ChatGPT plan (Codex) in each course |
| `image_quality` | standard | `draft`, `standard` or `high` |
| `preferred_diagram_style` | clean | `hand-drawn` prefers Excalidraw; `clean` prefers Mermaid |

## Budget and exit codes

Each course has `media.budgetUsd` and `media.maxPlanImages` in `course.yaml`. A generation reserves its cost in `.course/cost-ledger.jsonl` before it calls a provider, and is refused if it would pass either cap. If a process crashes mid-generation, its open `reserve` line keeps counting as spent; confirm nothing is running, then delete that line. `.course/ledger.lock` is stale after 2 minutes.

The CLI prints JSON and exits with: `0` success, `1` usage error, `2` validation error, `3` budget exceeded, `4` provider not available.

## Recommended companions

Companion design skills are recommended, never required. `setup` detects them and shows the install command for any that are missing. It installs nothing unless you say yes. They choose layout and composition; your `tokens.json` and brand stay as hard constraints.

| Companion | Install (Claude Code) | Used for |
| --- | --- | --- |
| Impeccable (`pbakaus/impeccable`) | `/plugin marketplace add pbakaus/impeccable`, then install from `/plugin` | Design direction and polish; `/impeccable audit` and `critique` as a quality gate |
| Taste (`Leonxlnx/taste-skill`) | `npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"` | Avoiding a templated look; design variance, motion and density |
| UI UX Pro Max (`nextlevelbuilder/ui-ux-pro-max-skill`) | `/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill` | Palettes, font pairings, chart guidance; seeds the style guide when there is no brand |
| Anthropic `frontend-design` / `web-artifacts-builder` | built in or via the Anthropic marketplace | Baseline fallback |
