/**
 * Tool manifest schemas.
 * Responsibility: validate a tool manifest before it can enter the registry. A manifest is
 * configuration written by hand, so it is exactly the kind of input that must be parsed
 * rather than trusted: a wrong slug, a negative timeout or a missing capability would only
 * surface at runtime, inside a request, on a document.
 */
import { z } from 'zod';
import { errors } from '../../core/errors.js';
import type { ToolManifest } from './registry.types.js';

const slugSchema = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be lowercase words joined by single hyphens');

const mimeSchema = z
  .string()
  .min(3)
  .max(128)
  .regex(/^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/, 'invalid media type');

const capabilitySchema = z
  .string()
  .min(3)
  .max(64)
  .regex(/^[a-z0-9]+(?:\.[a-z0-9]+)+$/, 'capability must look like "pdf.raster"');

export const workerClassSchema = z.enum(['light', 'raster', 'office', 'ocr', 'image', 'maint']);

export const toolCategorySchema = z.enum([
  'organize',
  'convert',
  'edit',
  'secure',
  'image',
  'ocr',
  'platform',
]);

export const toolRoutingSchema = z.object({
  forceAsync: z.boolean(),
  syncBudgetMs: z.number().int().positive().max(600_000),
  workerClass: workerClassSchema,
});

export const toolLimitsSchema = z.object({
  maxFiles: z.number().int().positive().max(200),
  maxInputBytes: z.number().int().positive(),
  timeoutMs: z.number().int().positive().max(1_800_000),
});

export const toolManifestSchema = z.object({
  slug: slugSchema,
  title: z.string().min(2).max(120),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'version must be semver major.minor.patch'),
  category: toolCategorySchema,
  enabled: z.boolean(),
  acceptedMimes: z.array(mimeSchema).min(1),
  outputMime: mimeSchema,
  requires: z.array(capabilitySchema),
  routing: toolRoutingSchema,
  limits: toolLimitsSchema,
});

export type ParsedToolManifest = z.infer<typeof toolManifestSchema>;

/**
 * Validate an unknown value as a manifest.
 * Throws an AppError with the failing paths so a bad manifest fails at boot, loudly.
 */
export function parseToolManifest(candidate: unknown): ToolManifest {
  const result = toolManifestSchema.safeParse(candidate);
  if (!result.success) {
    throw errors.validation(
      'Invalid tool manifest',
      result.error.issues.map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`),
    );
  }
  return Object.freeze({
    ...result.data,
    acceptedMimes: Object.freeze([...result.data.acceptedMimes]),
    requires: Object.freeze([...result.data.requires]),
    routing: Object.freeze({ ...result.data.routing }),
    limits: Object.freeze({ ...result.data.limits }),
  });
}
