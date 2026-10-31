---
name: media-pedagogy
description: "Rules for choosing and checking course media: function taxonomy, Mayer's multimedia principles, UDL and accessibility. Use when planning or reviewing diagrams, charts and images."
user-invocable: false
---

# Media pedagogy

Every asset serves a learning objective. No objective, no asset.

## Function taxonomy

Give each planned asset exactly one function.

| Function | Use it when |
| --- | --- |
| `concept-map` | Learners must see how ideas relate. |
| `process-flow` | Steps happen in order, with decisions or branches. |
| `comparison` | Two or more options differ on set criteria. |
| `hierarchy` | Things nest or rank (org charts, taxonomies). |
| `cycle` | A process repeats or feeds back on itself. |
| `timeline` | Order and timing of events matter. |
| `data-viz` | A number pattern is the point (chart from real data). |
| `worked-example` | A solved problem is shown step by step. |
| `scenario-illustration` | A realistic situation sets up practice or discussion. |
| `analogy-illustration` | A familiar picture explains an unfamiliar idea. |
| `infographic` | A one-page visual summary of a module. |
| `job-aid` | A checklist or cheat sheet used on the job. |
| `interactive-explainer` | The learner steps through or manipulates a model. |
| `audio-recap` | A short spoken review for listening between sessions. |
| `video-explainer` | Motion or narration shows what a still cannot. |

Rule: a text-heavy or precise visual (flows, labeled structures, hierarchies, timelines, comparisons) must use a diagram tool (Excalidraw, Mermaid, Vega-Lite or SVG). Never use raster generation for it. Raster generation is for illustration functions only.

## Mayer's principles (check each plan item)

- Coherence: the asset removes no load. Check: would the lesson be weaker without it? If not, drop it.
- Signaling: the key point is marked. Check: color, arrows or emphasis lead the eye to what matters.
- Redundancy: no narrated text read aloud verbatim next to the same on-screen text. Check: narration adds to the visual, not repeats it.
- Contiguity: labels sit next to what they describe, and related media appear together in time. Check: no legend far from the diagram; no caption on another page.
- Segmenting: one idea per asset. Check: if it needs more than about 7 elements or two messages, split it.

## UDL

Every module offers 2 or more representation modes (for example text plus diagram, or diagram plus audio). Check the plan per module before it is approved.

## Accessibility

- Alt text of 125 characters or fewer. Say what the image shows and why it matters. Do not start with "Image of".
- Complex diagrams (flows, charts, hierarchies) also get a long description that gives the same information in prose or a list.
- Colors meet WCAG 2.2 AA contrast (4.5:1 for text, 3:1 for large text and graphics). Do not rely on color alone.
- Raster images contain no text. Labels go in an SVG overlay.
