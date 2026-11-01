import { z } from 'zod';

export const ShapeSchema = z.enum(['workshop', 'cohort', 'self-paced']);
export const DeliverySchema = z.enum(['in-person', 'virtual', 'hybrid', 'async']);
export const ObjectiveKindSchema = z.enum(['cognitive', 'affective', 'orientation', 'integration']);
export const StageNameSchema = z.enum([
  'positioning', 'needsAnalysis', 'learnerProfile', 'objectives', 'rubrics', 'outline', 'lessonPlans', 'preWork',
  'materials', 'description', 'transferPlan', 'evaluationPlan', 'spacedPractice', 'virtualAdaptation',
])
export const StageStatusSchema = z.enum(['present', 'missing', 'stale', 'skipped']);

export const SessionSchema = z.object({ id: z.string(), label: z.string(), minutes: z.number() });
export const ObjectiveSchema = z.object({
  id: z.string(), title: z.string(), kind: ObjectiveKindSchema, bloom: z.string().optional(),
});
export const ModuleSchema = z.object({
  id: z.string(), title: z.string(), session: z.string().optional(),
  objectives: z.array(z.string()), minutes: z.number().optional(),
});
export const SourceRefSchema = z.object({
  path: z.string(), role: z.enum(['source', 'derived', 'variant', 'external', 'material']), of: z.string().optional(),
});

/** Key order here is the key order written to course.yaml. */
export const ManifestSchema = z.object({
  schema: z.literal('course/v3'),
  id: z.string(),
  title: z.string(),
  version: z.string(),
  status: z.enum(['draft', 'review', 'final']),
  created: z.string(),
  shape: ShapeSchema,
  delivery: DeliverySchema,
  audience: z.object({ level: z.string(), summary: z.string() }),
  timeBudget: z.object({
    live: z.object({ sessions: z.array(SessionSchema) }).optional(),
    async: z.object({
      preWorkMinutes: z.number(), betweenSessionMinutes: z.number(), postWorkMinutes: z.number(),
    }).optional(),
  }),
  objectives: z.array(ObjectiveSchema),
  modules: z.array(ModuleSchema),
  brand: z.string().optional(),
  style: z.string().optional(),
  media: z.object({ budgetUsd: z.number(), maxPlanImages: z.number(), approvalRequired: z.boolean() }),
  sources: z.array(SourceRefSchema).optional(),
  stages: z.partialRecord(StageNameSchema, StageStatusSchema).optional(),
  extra: z.record(z.string(), z.unknown()).optional(),
  targets: z.record(z.string(), z.unknown()),
});

export type Shape = z.infer<typeof ShapeSchema>;
export type Delivery = z.infer<typeof DeliverySchema>;
export type ObjectiveKind = z.infer<typeof ObjectiveKindSchema>;
export type StageName = z.infer<typeof StageNameSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type Objective = z.infer<typeof ObjectiveSchema>;
export type Module = z.infer<typeof ModuleSchema>;
export type SourceRef = z.infer<typeof SourceRefSchema>;
export type Manifest = z.infer<typeof ManifestSchema>;

export interface ValidationIssue { level: 'error' | 'warning'; path: string; message: string }
export const InitOptionsSchema = z.object({
  title: z.string().min(1), shape: ShapeSchema, delivery: DeliverySchema, sessions: z.array(SessionSchema),
  audienceLevel: z.string(), audienceSummary: z.string(), budgetUsd: z.number(), maxPlanImages: z.number(),
  async: z.object({
    preWorkMinutes: z.number(), betweenSessionMinutes: z.number(), postWorkMinutes: z.number(),
  }).optional(),
});
export type InitOptions = z.infer<typeof InitOptionsSchema>;
