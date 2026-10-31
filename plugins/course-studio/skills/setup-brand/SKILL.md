---
name: setup-brand
description: Create and validate a brand file (colors, fonts, logos, voice, imagery) for course media
disable-model-invocation: true
argument-hint: "[output-folder]"
allowed-tools:
  - AskUserQuestion
  - Bash
  - Read
  - Write
  - WebFetch
---

# Setup brand

Build a `<name>.brand.yaml` file. Use the `course-kit` skill for the call form.

## Steps

1. Ask (AskUserQuestion) whether the user wants to answer questions or point to an existing website or PDF. If they give a URL or PDF path, read it (WebFetch or Read) and extract the colors, fonts, logos and tone. Show what you found and let them correct it.
2. Otherwise ask, one short group at a time with AskUserQuestion: name; primary color (hex) and optional secondary and neutrals; heading, body and mono fonts; logo files (light and dark, SVG preferred); voice and tone; imagery (illustration, photo or mixed, plus do and don't lists).
3. Write `<name>.brand.yaml` in the folder the user chose (default: the current directory). Shape:

   ```yaml
   name: Acme
   logos: { light: logos/acme-light.svg, dark: logos/acme-dark.svg }
   colors:
     primary: "#1f4e79"
     secondary: "#e07a1f"
     neutral: ["#111827", "#f3f4f6"]
     semantic: { success: "#15803d", warning: "#b45309", error: "#b91c1c", info: "#1d4ed8" }
   fonts: { heading: "Inter", body: "Inter", mono: "JetBrains Mono" }
   voice: "Plain, warm, direct."
   imagery: { style: illustration, do: ["flat shapes"], dont: ["stock photo people"] }
   ```

   Only `name`, `colors.primary`, `fonts.heading` and `fonts.body` are required.
4. Run `node "${CLAUDE_PLUGIN_ROOT}/skills/course-kit/scripts/course-kit.mjs" brand validate "<file>"`. On exit 2, fix the reported fields and run it again.
5. Tell the user to use the file by setting it as the core plugin's `brand_config` setting (`/plugin configure course-curriculum-creator@course-curriculum-creator`), or as `brand:` in the course's `course.yaml`. Next step: `/course-studio:generate-style-guide`.
