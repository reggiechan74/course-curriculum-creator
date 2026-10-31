---
name: setup
description: Check Node, detect Codex, image and diagram tools and design companions, and record them for a course
disable-model-invocation: true
argument-hint: "[course-folder]"
allowed-tools:
  - AskUserQuestion
  - Bash
  - Read
  - Skill
---

# Setup

Detect what media tools are available and record them. Use the `course-kit` skill for the call form (`KIT` below means `node "${CLAUDE_PLUGIN_ROOT}/skills/course-kit/scripts/course-kit.mjs"`).

The course folder is the argument, or the current directory if it contains `course.yaml`. If neither, ask the user for the path.

## Steps

1. Run `node --version`. If it is below 20, stop and tell the user Node 20 or later is necessary.
2. Run `KIT providers probe-codex`. Keep `available`, `loggedIn` and `billing`. Codex images are free only with a ChatGPT sign-in (`billing: "plan"`). With `billing: "api-key"` Codex would bill an API key outside the course budget, so `gen image --provider codex` refuses it; tell the user to sign in with ChatGPT (`codex logout`, then `codex login`) if they want plan images.
3. Run `KIT providers patterns`. Look at the tools you have now. List every tool whose name matches an `image` pattern and every tool whose name matches a `diagram` pattern (`*` matches any text). Include the `course-media` tools of this plugin if you have them.
4. Look at your available skills. List every skill whose name matches a `designSkills` pattern.
5. Run `KIT providers record --course "<dir>" --json '<json>'` with `detectedAt` (current ISO time), `image`, `diagram`, `designSkills` (the names you found) and `codex` (`{"available":..., "loggedIn":..., "billing":...}`).
6. Show a table: capability, what was found, status (available or missing). Rows: Codex image generation (available only when `billing` is `plan`), image tools, diagram tools, Node, and each design companion below.

   | Companion | Install | What it adds |
   | --- | --- | --- |
   | Impeccable | `/plugin marketplace add pbakaus/impeccable`, then install from `/plugin` | Design direction and polish; audit and critique as a quality gate |
   | Taste (`design-taste-frontend`) | `npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"` | Avoids a templated look; tunes variance and density |
   | UI UX Pro Max | `/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill` | Palettes, font pairings and chart guidance for the style guide |
   | `frontend-design` (Anthropic) | built in or via the Anthropic marketplace | Baseline fallback |

   For each companion that is missing, show its install command and the one-line benefit. They are recommended, not required. Install nothing unless the user says yes.
7. Ask the user (AskUserQuestion) whether to install the local diagram renderers. If yes, run `KIT deps install mermaid-cli excalidraw-to-svg --data-dir "${CLAUDE_PLUGIN_DATA}"`. If no, say that Mermaid and Excalidraw rendering will not work until they are installed.

Tell the user the next step: `/course-studio:setup-brand` (optional), then `/course-studio:generate-style-guide`.
