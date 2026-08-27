import { z } from 'zod';
import { ValidationError } from './errors.js';
export function validate<T>(schema: z.ZodSchema<T>, input: unknown): T {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw new ValidationError(parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '));
  return parsed.data;
}
export const schemas = {
  idParam: z.object({ id: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/) }),
  search: z.object({ q: z.string().trim().min(1).max(200), limit: z.coerce.number().int().min(1).max(50).default(10) }),
  limit: z.object({ limit: z.coerce.number().int().min(1).max(100).default(20) }),
  graphNeighbors: z.object({ id: z.string().min(1).max(100), limit: z.coerce.number().int().min(1).max(50).default(20) }),
  devPath: z.object({ fromId: z.string().min(1).max(100), toId: z.string().min(1).max(100) })
};
