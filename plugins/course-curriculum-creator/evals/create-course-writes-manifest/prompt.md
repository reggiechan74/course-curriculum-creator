---
max_turns: 30
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit, AskUserQuestion]
---

/course-curriculum-creator:create-course "Lease Basics" --duration 1-day

Use the default settings for everything else (workshop shape, in-person, any audience). Do not ask questions. Create the course in the current directory (--location .). When it is created, run `manifest validate` on the new course folder and tell me its exit code.
