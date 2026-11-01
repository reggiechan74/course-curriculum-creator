---
max_turns: 40
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit, AskUserQuestion]
---

The course folder ./lease-course (shape: workshop) has a course.yaml, learning objectives and a course outline, but the outline has lost its module ID comments. Run /course-curriculum-creator:generate-outline --update on it so the outline is brought up to date and the course manifest is synced. Do not ask questions; use defaults and keep the three existing modules.
