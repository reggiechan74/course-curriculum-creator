---
max_turns: 60
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit, AskUserQuestion]
---

Run /course-studio:generate-media on the course folder ./lease-course. No image provider works in this environment: Codex is not logged in, there is no OpenAI key and no MCP image tool. Do not ask questions, do not install anything, and do not call any image API. Render the diagram and the chart with the tools that work without installs (write the diagram SVG yourself, use the bundled Vega-Lite renderer), and leave the image as a placeholder. When done, tell me the output of `ledger totals`.
