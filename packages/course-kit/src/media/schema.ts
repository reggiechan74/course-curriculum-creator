import { z } from 'zod';

export const AssetFunctionSchema = z.enum([
  'concept-map', 'process-flow', 'comparison', 'hierarchy', 'cycle', 'timeline', 'data-viz',
  'worked-example', 'scenario-illustration', 'analogy-illustration', 'infographic', 'job-aid',
  'interactive-explainer', 'audio-recap', 'video-explainer',
]);
export const AssetKindSchema = z.enum(['diagram', 'chart', 'image', 'infographic', 'audio', 'video']);
export const AssetStatusSchema = z.enum(['generated', 'approved', 'rejected', 'imported']);
export const ReviewCheckSchema = z.enum(['no-stray-text', 'factual', 'representation', 'style', 'contrast', 'physical']);

export const ReviewRecordSchema = z.object({
  checks: z.record(ReviewCheckSchema, z.enum(['pass', 'fail', 'n/a'])),
  notes: z.string().optional(),
  at: z.string(),
});

export const AssetSchema = z.object({
  id: z.string().min(1),
  kind: AssetKindSchema,
  function: AssetFunctionSchema.optional(),
  objectives: z.array(z.string()),
  module: z.string().optional(),
  provider: z.string(),
  source: z.string().optional(),
  files: z.array(z.string()),
  alt: z.string(),
  longDescription: z.string().optional(),
  caption: z.string().optional(),
  status: AssetStatusSchema,
  costUsd: z.number(),
  quotaUnits: z.number(),
  sha256: z.string().optional(),
  shareUrl: z.string().optional(),
  review: ReviewRecordSchema.optional(),
  approvedBy: z.literal('user').optional(),
  createdAt: z.string(),
});

export const RegistrySchema = z.object({ schema: z.literal('registry/v1'), assets: z.array(AssetSchema) });

/** provider: free string. Documented: auto, excalidraw, mermaid, vegalite, svg, codex, openai, or a detected tool name. */
export const PlanItemSchema = z.object({
  id: z.string().min(1),
  module: z.string(),
  segment: z.string().optional(),
  objectives: z.array(z.string()),
  function: AssetFunctionSchema,
  kind: AssetKindSchema,
  description: z.string(),
  provider: z.string(),
  estimateUsd: z.number(),
  quotaUnits: z.number(),
  status: z.enum(['proposed', 'approved', 'rejected']),
});
export const MediaPlanSchema = z.object({ schema: z.literal('media-plan/v1'), items: z.array(PlanItemSchema) });

export const PricingSchema = z.object({
  asOf: z.string(),
  image: z.record(z.string(), z.object({ draft: z.number(), standard: z.number(), high: z.number() })),
});

export type AssetFunction = z.infer<typeof AssetFunctionSchema>;
export type AssetKind = z.infer<typeof AssetKindSchema>;
export type AssetStatus = z.infer<typeof AssetStatusSchema>;
export type ReviewCheck = z.infer<typeof ReviewCheckSchema>;
export type ReviewRecord = z.infer<typeof ReviewRecordSchema>;
export type Asset = z.infer<typeof AssetSchema>;
export type Registry = z.infer<typeof RegistrySchema>;
export type PlanItem = z.infer<typeof PlanItemSchema>;
export type MediaPlan = z.infer<typeof MediaPlanSchema>;
export type Pricing = z.infer<typeof PricingSchema>;
