# Changelog

## 3.0.0 - course-curriculum-creator

### Breaking

- Core workflow skills need `course.yaml`. If it is missing they stop and point to `/course-curriculum-creator:migrate-course <folder>` (v2 folders) or `/course-curriculum-creator:create-course` (new courses).
- Not affected: `create-course`, `migrate-course`, `design-series`, `list-templates` and `create-from-template` need no existing `course.yaml`. `assess-needs` and `generate-learner-profile` need it only when run inside a course folder.

### Added

- `course-conventions` knowledge skill: settings, the `course.yaml` rule, shape and time budget, IDs and heading formats, staleness, progress, question style, WCAG 2.2 AA.
- Toolkit commands: `manifest summary`, `progress [--write]`, `progress skip|unskip <stage>`, `audit`, `hash-write --sources`.
- Shape rules and validation for cohort and self-paced courses; cohort outline headings (`## Session N`, `## Week N`).
- Full `migrate-course`: delivery shape, audience level, sessions from counts, image objective links, a `changes` diff summary (including hash refreshes), stages from progress, Integration Objective headings.
- Golden sample courses in `plugins/course-curriculum-creator/examples/courses/` (`workshop`, `cohort`, `self-paced`).
- Skills lint test.
- Evals: workshop pipeline, cohort and self-paced create and outline, CRE-201 migration, architect resume, no-manifest behaviour.

### Changed

- Every workflow skill uses `course-conventions` and the toolkit; no md5sum prose and no duplicated settings.
- `create-course` asks the shape first (`--shape`, `--sessions`, `--session-minutes`).
- Outline, lesson plans, pre-work, spaced practice and workshop prep are shape-aware.
- `curriculum-architect` is resumable (progress loop), offers optional stages and stops after a stage or four stages; no model pin.
- `quality-reviewer` runs `manifest validate` and `audit` first; audit errors cap the rating; no model pin. `review-curriculum` runs `audit`.
- Knowledge skills use one objective-count rule (about one per 60-90 minutes, 3-10) and shape-neutral time guidance.
- Accessibility reference moved to WCAG 2.2 AA.
- `default_duration` applies to the workshop shape only. Plugin description and keywords cover all three shapes.

### Unchanged by design

- `generate-artifacts --type slides` stays until Phase 4.
- The hub item coverage check comes in Phase 3.
