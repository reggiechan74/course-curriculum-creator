---
name: generate-style-guide
description: Derive WCAG-checked style tokens, a style guide and image prompt anchors for a course
disable-model-invocation: true
argument-hint: "[course-folder] [--brand file]"
allowed-tools:
  - AskUserQuestion
  - Bash
  - Read
  - Write
  - Edit
  - Skill
---

# Generate style guide

Write the style files in `<course>/05-media/style/`. `KIT` means `node "${CLAUDE_PLUGIN_ROOT}/skills/course-kit/scripts/course-kit.mjs"`. Follow the `media-pedagogy` skill for accessibility rules.

## Steps

1. Find the brand file, in this order: a `--brand` argument; `brand` in `<course>/course.yaml`; an existing `05-media/style/theme.yaml`. If none exists, ask the user (AskUserQuestion) whether they have a brand file path (the core `brand_config` setting is not visible to this plugin, so ask). Pass any file you find to `style tokens` with `--brand`.
2. If there is still no brand, design a theme from the course topic and audience (read `course.yaml`, the objectives and the positioning). Before choosing colors and fonts, load the design companions found by setup (`.course/providers.json`, `designSkills`; run `KIT providers show --course "<dir>"`), for example `ui-ux-pro-max` for palettes and font pairings. Treat them as helpers only: if none are present, choose from your own judgment. Write the result to `05-media/style/theme.yaml` in the brand file shape (see `/course-studio:setup-brand`).
3. Run `KIT brand validate "<file>"`, then `KIT style tokens --course "<dir>" [--brand "<file>"]`. This writes `05-media/style/tokens.json`. If it exits 2 (contrast fails), change the failing colors as the message says (darken text or brighten the background) and run it again until it passes. Report any warnings.
4. Write `05-media/style/style-guide.md`: palette with hex values and use, type scale and fonts, spacing, logo rules, voice, and accessibility rules (WCAG 2.2 AA, alt text, no text inside raster images).
5. Write `05-media/style/prompt-anchors.md` with these parts:
   - One fixed illustration-style paragraph, written once and reused verbatim in every image prompt.
   - Palette words (named colors, not hex codes).
   - Composition rules (framing, background, level of detail).
   - Imagery do and don't lists.
6. Set `style: 05-media/style/style-guide.md` in `course.yaml` if it is missing. Show the user a summary and tell them the next step: `/course-studio:plan-media`.
