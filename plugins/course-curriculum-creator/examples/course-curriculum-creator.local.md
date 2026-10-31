---
# Per-project overrides. Include only the keys you want to change for this project.
# Everything else comes from your plugin settings (/plugin configure course-curriculum-creator@course-curriculum-creator).

organization: "Client Co."
instructor_bio: "Facilitator bio tailored to this client"
default_duration: "1-day"           # 1-day | 2-day
default_audience_level: "beginner"  # beginner | intermediate | professional | expert
rubric_scale: "1-4"                 # 1-4 | 1-5 | letter-grades | pass-fail
rubric_type: "performance"          # analytical | performance | holistic
courses_directory: "./courses"
---

# Course Curriculum Creator: Project Settings Override

Your defaults normally live in the plugin's settings, which Claude Code asks for when you install the plugin. To change them, run `/plugin configure course-curriculum-creator@course-curriculum-creator` or use `/config`.

Use this file only when one project needs different values.

## Setup

1. Copy this file to `.claude/course-curriculum-creator.local.md` in the project.
2. Keep only the keys you want to override.
3. The repo's `.gitignore` already excludes `.claude/*.local.md`.

## Keys

| Key | Purpose |
|---|---|
| `instructor_name` | Name on course materials |
| `instructor_bio` | Credentials for descriptions and instructor guides |
| `organization` | Organization name in document headers |
| `courses_directory` | Where new course projects are created |
| `default_duration` | `1-day` or `2-day` |
| `default_audience_level` | `beginner`, `intermediate`, `professional`, `expert` |
| `rubric_scale` | `1-4`, `1-5`, `letter-grades`, `pass-fail` |
| `rubric_type` | `analytical`, `performance`, `holistic` |
| `template_directory` | Where templates are saved and looked up |
