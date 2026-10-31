import { z } from 'zod';

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Accepts #rgb or #rrggbb (any case); normalises to lowercase #rrggbb. */
export const HexColorSchema = z.string().regex(HEX, 'must be a hex color like #1a2b3c or #abc').transform((s) => {
  const h = s.slice(1).toLowerCase();
  return '#' + (h.length === 3 ? [...h].map((c) => c + c).join('') : h);
});

export const BrandSchema = z.object({
  name: z.string().min(1),
  logos: z.object({ light: z.string().optional(), dark: z.string().optional() }).optional(),
  colors: z.object({
    primary: HexColorSchema,
    secondary: HexColorSchema.optional(),
    neutral: z.array(HexColorSchema).optional(),
    semantic: z.object({
      success: HexColorSchema.optional(), warning: HexColorSchema.optional(),
      error: HexColorSchema.optional(), info: HexColorSchema.optional(),
    }).optional(),
  }),
  fonts: z.object({ heading: z.string().min(1), body: z.string().min(1), mono: z.string().optional() }),
  voice: z.string().optional(),
  imagery: z.object({
    style: z.enum(['illustration', 'photo', 'mixed']),
    do: z.array(z.string()).optional(),
    dont: z.array(z.string()).optional(),
  }).optional(),
});
export type Brand = z.infer<typeof BrandSchema>;
