---
max_turns: 40
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit, AskUserQuestion]
---

/course-curriculum-creator:generate-outline --update ./lease-course

The course folder ./lease-course (shape: workshop) has a course.yaml, learning objectives and a course outline, but the outline has lost its module ID comments. Bring the outline up to date and sync the course manifest. Do not ask questions; use defaults and keep the three existing modules.
