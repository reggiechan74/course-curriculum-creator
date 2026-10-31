# Course Curriculum Creator

<!-- badges-start -->
![Version](https://img.shields.io/badge/version-1.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Claude Code Plugin](https://img.shields.io/badge/Claude%20Code-plugin-blueviolet)
<!-- badges-end -->

A Claude Code plugin for rapidly creating professional, pedagogically-sound curricula for 1-2 day intensive workshops and training programs.

## Overview

This plugin helps independent consultants, trainers, and instructional designers create comprehensive course materials using backward design methodology and Bloom's taxonomy. It generates structured curricula with learning objectives, lesson plans, assessment rubrics, and supporting materials—all in markdown format for easy version control and collaboration.

## Features

- **Backward Design Framework**: Start with learning outcomes, design assessments, then plan activities
- **Bloom's Taxonomy Integration**: Create measurable learning objectives at appropriate cognitive levels
- **Rapid Course Creation**: Generate complete curricula autonomously or step-by-step
- **Modular Architecture**: Create courses optimized for 1-2 day weekend workshops
- **Professional Outputs**: Course descriptions, outlines, lesson plans, rubrics, student materials
- **Template System**: Save and reuse course structures for variants and iterations
- **Staleness Warnings**: Commands flag downstream files that may need regeneration when sources change
- **Export Workflows**: Export as complete document, stakeholder summary, or student syllabus
- **Delivery Support**: Workshop preparation checklists and post-workshop feedback processing
- **Prerequisite Validation**: Commands check required source files exist before generating, with explicit error messages and recovery hints
- **Incremental Updates**: Add, remove, or modify individual objectives and modules
- **Version Control Ready**: Semantic versioning with organized markdown files
- **Learner Analysis**: Generate learner profiles with prior knowledge, motivations, and transfer environment
- **Pre-Work Design**: Micro-learning units with fast track/full path for prerequisite coverage
- **Spaced Practice**: Post-workshop retrieval practice at expanding intervals to combat forgetting curve
- **Affective Objectives**: Krathwohl's taxonomy support for attitude-change workshops
- **Co-Facilitation**: Multi-facilitator support with role rotation and handoff protocols
- **Accessibility Standards**: WCAG 2.1 AA specifications for training materials
- **Cultural Adaptation**: Localization guidance for cross-cultural delivery
- **Content Curation**: RARBA framework for evaluating third-party content quality
- **Series Transitions**: Inter-course retention bridges, placement assessments, and bridge assignments

## Installation

### From GitHub
```
/plugin marketplace add reggiechan74/course-curriculum-creator
/plugin install course-curriculum-creator@course-curriculum-creator
```

When you install the plugin, Claude Code asks for your [settings](#configuration). Every one is optional.

### Local Development
This repository is a marketplace. It contains more than one plugin.

To load your working copy for a single session without installing:
```
claude --plugin-dir /path/to/course-curriculum-creator/plugins/course-curriculum-creator
```
Or register the clone as a local marketplace, so it loads in place and picks up edits on `/reload-plugins`:
```
/plugin marketplace add .
/plugin install course-curriculum-creator@course-curriculum-creator
```
Check changes with `claude plugin validate .` before you commit.

## Quick Start

### Autonomous Course Creation
```
User: "Create a 2-day PropTech fundamentals workshop for real estate professionals"
```
Claude delegates to the `curriculum-architect` agent, which generates the complete curriculum. To call it explicitly, use `@agent-course-curriculum-creator:curriculum-architect`.

### Step-by-Step Course Creation
```bash
# 1. Initialize course project
/course-curriculum-creator:create-course "PropTech Fundamentals"

# 2. Generate core curriculum (backward design order)
/course-curriculum-creator:generate-objectives          # Stage 1: Desired results
/course-curriculum-creator:generate-rubrics             # Stage 2: Assessment evidence
/course-curriculum-creator:generate-outline             # Stage 3: Learning plan
/course-curriculum-creator:generate-lesson-plans        # Stage 3: Detailed activities
/course-curriculum-creator:generate-description         # Student-facing description

# 3. Create additional materials
/course-curriculum-creator:generate-artifacts --type handout
/course-curriculum-creator:generate-artifacts --type instructor-guide
/course-curriculum-creator:generate-artifacts --type pre-work
/course-curriculum-creator:generate-artifacts --type post-work

# 4. Review and export
/course-curriculum-creator:review-curriculum
/course-curriculum-creator:export-curriculum --format full

# 5. Prepare for delivery
/course-curriculum-creator:generate-workshop-prep --date 2026-03-15
```

## Workflow Skills

The workflow steps are skills you run as slash commands (`/course-curriculum-creator:<name>`). They are set to `disable-model-invocation: true`, so Claude never starts one on its own. They run only when you type the command or when one of the plugin's agents runs that step. They are grouped by curriculum development stage:

### Stage 0: Analysis & Initialization (`workflow/0-analysis/`)

| Command | Description |
|---------|-------------|
| `/course-curriculum-creator:assess-needs` | Conduct a training needs assessment to determine if a course is the right intervention |
| `/course-curriculum-creator:create-course` | Initialize new course project with directory structure |
| `/course-curriculum-creator:design-series` | Design a leveled course series (101/201/301/401) |
| `/course-curriculum-creator:generate-learner-profile` | Generate learner profile analyzing prior knowledge, motivations, constraints, and transfer environment |

### Stage 1: Desired Results (`workflow/1-desired-results/`)

| Command | Description |
|---------|-------------|
| `/course-curriculum-creator:generate-objectives` | Create Bloom's-aligned learning objectives |

### Stage 2: Assessment Evidence (`workflow/2-assessment-evidence/`)

| Command | Description |
|---------|-------------|
| `/course-curriculum-creator:generate-rubrics` | Create 1-5 scale analytical assessment rubrics |
| `/course-curriculum-creator:generate-evaluation-plan` | Generate Kirkpatrick L1-L4 evaluation plan with instruments, timelines, and success thresholds |

### Stage 3: Learning Plan (`workflow/3-learning-plan/`)

| Command | Description |
|---------|-------------|
| `/course-curriculum-creator:generate-outline` | Generate module structure with timing |
| `/course-curriculum-creator:generate-lesson-plans` | Generate detailed module-level lesson plans |
| `/course-curriculum-creator:generate-transfer-plan` | Generate post-workshop transfer plan with action items, manager briefings, job aids, and follow-up touchpoints |
| `/course-curriculum-creator:generate-pre-work` | Design pre-workshop micro-learning units covering prerequisites |

### Stage 4: Materials & Communication (`workflow/4-materials/`)

| Command | Description |
|---------|-------------|
| `/course-curriculum-creator:generate-description` | Create student-facing course description |
| `/course-curriculum-creator:generate-artifacts` | Generate student handouts, instructor guides, etc. |
| `/course-curriculum-creator:adapt-for-virtual` | Adapt an existing in-person curriculum for virtual or hybrid delivery |

### Stage 5: Quality Assurance & Approval (`workflow/5-quality-and-review/`)

| Command | Description |
|---------|-------------|
| `/course-curriculum-creator:review-curriculum` | Validate curriculum quality and alignment |
| `/course-curriculum-creator:generate-review-package` | Generate stakeholder/SME review package for curriculum approval |
| `/course-curriculum-creator:export-curriculum` | Export curriculum as combined document (full/summary/syllabus) |

### Stage 6: Delivery & Iteration (`workflow/6-delivery/`)

| Command | Description |
|---------|-------------|
| `/course-curriculum-creator:generate-workshop-prep` | Generate dated preparation checklist for delivery |
| `/course-curriculum-creator:process-workshop-feedback` | Analyze feedback and generate improvement report |
| `/course-curriculum-creator:generate-spaced-practice` | Generate post-workshop spaced retrieval practice sequence |

### Templates (`workflow/7-templates/`)

| Command | Description |
|---------|-------------|
| `/course-curriculum-creator:save-as-template` | Save course structure as reusable template |
| `/course-curriculum-creator:create-from-template` | Create new course from existing template |
| `/course-curriculum-creator:list-templates` | List available course templates with details |

## Skills

### backward-design-methodology
Provides knowledge on Understanding by Design (UbD) framework for creating effective curricula:
- Stage 1: Identify desired results (learning outcomes)
- Stage 2: Determine acceptable evidence (assessments)
- Stage 3: Plan learning experiences (activities)
- Reference files: assessment design, formative assessment techniques, content curation

**Triggers**: "use backward design", "create curriculum using UbD", "design learning outcomes first"

### blooms-taxonomy
Guides creation of measurable learning objectives across cognitive levels:
- Six levels: Remember, Understand, Apply, Analyze, Evaluate, Create
- Action verb selection for each level
- Assessment type recommendations
- Scaffolding strategies for multi-day workshops
- Affective domain support (Krathwohl's taxonomy) for attitude-change objectives

**Triggers**: "write learning objectives", "use Bloom's taxonomy", "create measurable outcomes"

### universal-design-for-learning
Practical guidance for creating inclusive, accessible learning experiences using the three UDL principles:
- Multiple Means of Engagement (the "why" of learning)
- Multiple Means of Representation (the "what" of learning)
- Multiple Means of Action & Expression (the "how" of learning)
- Reference files: accessibility specifications (WCAG 2.1 AA), cultural adaptation guide

**Triggers**: "apply UDL", "make course accessible", "inclusive design", "universal design for learning"

### virtual-facilitation
Practical guidance for designing and facilitating effective virtual and hybrid learning experiences:
- Virtual vs. in-person timing, engagement, and activity differences
- Activity substitution table for converting physical to digital activities
- Hybrid equity rules and co-facilitation model
- Platform-specific tips (Zoom, Teams, Meet)
- Technology checklists and failure backup planning

**Triggers**: "design virtual workshop", "adapt for remote delivery", "hybrid session", "virtual facilitation"

## Agents

### curriculum-architect
Autonomous agent that designs complete course curricula from high-level requirements. Takes course topic, audience, and duration, then generates all core curriculum components following backward design principles.

**Triggers proactively** when user asks to create courses, or invoke manually for autonomous generation.

### quality-reviewer
Validates curriculum quality by checking:
- Alignment between outcomes, assessments, and activities
- Appropriate Bloom's taxonomy usage
- Realistic timing for 1-2 day format
- Assessment-objective correspondence
- Overall pedagogical soundness

Run automatically after generation or invoke with `/course-curriculum-creator:review-curriculum`.

## Configuration

Settings are native plugin options (`userConfig`). Claude Code asks for them when you enable the plugin. To change them later, run:

```
/plugin configure course-curriculum-creator@course-curriculum-creator
```

You can also edit them in `/config`.

| Setting | Default | Used by |
|---|---|---|
| `instructor_name` | (empty) | Positioning, descriptions, guides, reports |
| `instructor_bio` | (empty) | Course description, instructor sections |
| `organization` | (empty) | Document headers |
| `courses_directory` | `~/courses` | `create-course`, `design-series` |
| `default_duration` | `2-day` | `create-course`, `design-series`, `generate-objectives` |
| `default_audience_level` | `professional` | `create-course`, `design-series`, `generate-objectives` |
| `rubric_scale` | `1-5` | `generate-rubrics` |
| `rubric_type` | `analytical` | `generate-rubrics` |
| `template_directory` | `~/.claude/course-templates` | Template commands |

### Per-project overrides

To override settings for one project, for example a client engagement with a different organization name, create `.claude/course-curriculum-creator.local.md` in that project with YAML frontmatter:

```yaml
---
organization: "Client Co."
default_duration: "1-day"
---
```

Values in this file take precedence over your plugin settings. See `examples/course-curriculum-creator.local.md`.

## Course Directory Structure

When you create a course, the following structure is generated:

```
CourseName-YYYY-MM-DD/
├── 01-planning/
│   ├── course-positioning.md      # Market fit, audience, value proposition
│   ├── course-description.md      # Student-facing description
│   ├── learning-objectives.md     # Bloom's-aligned outcomes
│   ├── learner-profile.md         # Audience analysis (optional)
│   └── content-sources.md         # Third-party content & licensing tracker
├── 02-design/
│   ├── course-outline.md          # Module structure with timing
│   └── lesson-plans.md            # Detailed module plans
├── 03-assessment/
│   └── rubrics.md                 # 1-5 scale evaluation criteria
└── 04-materials/
    ├── pre-work.md                # Pre-workshop micro-learning (optional)
    ├── spaced-practice.md         # Post-workshop retrieval practice (optional)
    ├── student-handout.md
    ├── instructor-guide.md
    └── [other artifacts]
```

## Template System

Save successful courses as templates for reuse:

```bash
# Save as template
/course-curriculum-creator:save-as-template "PropTech-Fundamentals-2025-02-15"

# Create variant from template
/course-curriculum-creator:create-from-template PropTech-Fundamentals --variant "Commercial-Focus"
```

Templates preserve structure, objectives, and pedagogical approach while allowing customization for different audiences or contexts.

## Course Series

Design progressive course series that build from foundational to advanced mastery:

```bash
# Design a 4-level series
/course-curriculum-creator:design-series "PropTech" --levels 4

# Create individual courses linked to the series
/course-curriculum-creator:create-course "PropTech 101" --series proptech --level 101
/course-curriculum-creator:create-course "PropTech 201" --series proptech --level 201

# Series plan enforces Bloom's bands during objective generation
/course-curriculum-creator:generate-objectives    # warns if objectives outside level's bands

# Retrofit existing courses into a series
/course-curriculum-creator:design-series "PropTech" --from-existing ./PropTech-Basics/ ./PropTech-Advanced/
```

Series use a **Bloom's Center-of-Gravity model** where each level has a primary Bloom's band (where 60-70% of objectives live), a stretch zone (higher levels with scaffolding), and an assumed floor (mastered in prior levels, not re-taught).

## Version Control

Courses use semantic versioning (v1.0.0, v1.1.0, v2.0.0):
- **Major**: Complete curriculum redesign
- **Minor**: New modules or significant content additions
- **Patch**: Small fixes, timing adjustments, clarity improvements

Update version in `course-positioning.md` frontmatter when making changes.

## Best Practices

1. **Start with outcomes**: Clearly define what students should achieve before designing content
2. **Align rigorously**: Ensure assessments measure objectives, and activities support both
3. **Scaffold appropriately**: Progress from lower to higher Bloom's levels across the workshop
4. **Time realistically**: Account for breaks, setup, troubleshooting in 1-2 day formats
5. **Review regularly**: Use quality-reviewer agent to validate alignment after changes
6. **Version deliberately**: Increment versions when making substantial changes
7. **Template strategically**: Save proven structures for course families

## Examples

See `examples/` directory for:
- `course-curriculum-creator.local.md` - Sample per-project settings override

See `skills/` subdirectories for worked examples:
- `skills/blooms-taxonomy/examples/example-objectives-1day.md` - Complete 1-day workshop objective set
- `skills/blooms-taxonomy/examples/example-objectives-2day.md` - Complete 2-day workshop objective set
- `skills/backward-design-methodology/examples/example-backward-design-1day.md` - Full backward design walkthrough

## What's New

### v2.0.0 - Current Claude Code Plugin Spec
- Changed: Workflow commands migrated from the legacy `commands/` format to skills under `workflow/<stage>/<name>/SKILL.md`. Command names are unchanged (`/course-curriculum-creator:<name>`)
- Changed: Workflow skills set `disable-model-invocation: true`, so Claude doesn't start them unprompted
- New: Native `userConfig` settings, prompted on install and editable via `/plugin configure`. `.claude/course-curriculum-creator.local.md` remains as a per-project override
- Changed: Shorter agent descriptions; methodology skills use `description` + `when_to_use`
- Fixed: Broken `references/assessment-design.md` path in generate-rubrics
- Fixed: UDL and virtual-facilitation reference/example files are now linked from their skills
- Changed: Bloom's affective domain and objective-writing mistakes moved to reference files (SKILL.md under 500 lines)
- New: Plugin icon (`assets/icon.png`)

### v1.1.0 - Learner Analysis, Retention & Inclusivity
- New: `/course-curriculum-creator:generate-learner-profile` command for audience analysis across 5 dimensions
- New: `/course-curriculum-creator:generate-pre-work` command for micro-learning prerequisite coverage
- New: `/course-curriculum-creator:generate-spaced-practice` command for post-workshop retrieval practice
- New: Formative assessment techniques reference with decision rules
- New: WCAG 2.1 AA accessibility specifications reference
- New: Cultural adaptation guide for cross-cultural delivery
- New: Content curation guide with RARBA evaluation framework
- New: Affective domain (Krathwohl's taxonomy) in Bloom's skill
- Enhanced: Co-facilitation support in `/course-curriculum-creator:generate-lesson-plans` with role rotation and handoff protocols
- Enhanced: Inter-course transition design in `/course-curriculum-creator:design-series` with retention bridges and placement assessments
- Enhanced: Curriculum architect generates learner profiles, pre-work, and spaced practice
- Enhanced: Quality reviewer validates learner profiles, affective objectives, pre-work, and spaced practice

### v1.0.0 - Polish & Completeness
- Enhanced: `/course-curriculum-creator:process-workshop-feedback --pilot` flag for first-run pilot analysis with iteration planning
- Enhanced: `/course-curriculum-creator:create-course` now generates `content-sources.md` for IP/licensing tracking
- Enhanced: `/course-curriculum-creator:generate-lesson-plans` prompts for content source tracking after generation
- Enhanced: Quality reviewer validates content licensing compliance
- Enhanced: Curriculum architect tracks content sources in autonomous workflow

### v0.6.0 - Delivery & Process
- New: `/course-curriculum-creator:adapt-for-virtual` command for converting in-person curricula to virtual/hybrid
- New: `/course-curriculum-creator:generate-review-package` command for stakeholder/SME review workflow
- New: `virtual-facilitation` skill with platform-specific guidance
- Enhanced: `--mode` flag in `/course-curriculum-creator:create-course` for virtual/hybrid from the start
- Enhanced: Delivery mode awareness in `/course-curriculum-creator:generate-outline` and `/course-curriculum-creator:generate-lesson-plans`
- Enhanced: Quality reviewer validates delivery mode compliance

### v0.5.0 - Learning Ecosystem
- New: `/course-curriculum-creator:generate-transfer-plan` command for post-workshop learning transfer (action plans, manager briefings, job aids)
- New: `/course-curriculum-creator:generate-evaluation-plan` command for Kirkpatrick L1-L4 evaluation design
- Enhanced: Differentiated instruction (floor/scaffold/extension tiers) in lesson plan template
- Enhanced: Quality reviewer validates differentiation in activities
- Enhanced: Curriculum architect includes transfer and evaluation planning
- Enhanced: Transfer plan prerequisite hook

### v0.4.0 - Professional L&D Foundations
- New: `/course-curriculum-creator:assess-needs` command for training needs assessment (TNA)
- New: `universal-design-for-learning` skill with worked example
- New: Pre-work and post-work artifact types in `/course-curriculum-creator:generate-artifacts`
- Enhanced: UDL validation integrated into `/course-curriculum-creator:generate-outline`, `/course-curriculum-creator:generate-lesson-plans`, `/course-curriculum-creator:generate-rubrics`
- Enhanced: Quality reviewer agent now validates UDL compliance
- Enhanced: Advisory TNA hook in prerequisite system

### v0.3.0 - Course Series
- New: `/course-curriculum-creator:design-series` command for leveled course series (101/201/301/401)
- New: `--series`/`--level` flags on `/course-curriculum-creator:create-course`
- New: Bloom's band enforcement during objective generation
- New: Series validation in `/course-curriculum-creator:review-curriculum`

## Contributing

Contributions welcome! Please:
1. Follow existing patterns for commands, agents, and skills
2. Include examples for new features
3. Update documentation
4. Test with real curriculum creation scenarios

## License

MIT

## Author

Created by Reggie Chan for Tenebrus Capital Corp training programs.

## Support

Issues and contributions: https://github.com/reggiechan74/course-curriculum-creator/issues
