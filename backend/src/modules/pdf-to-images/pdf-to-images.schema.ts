/**
 * PDF to Images request schemas.
 * Responsibility: parse the untrusted form fields of one request into resolved options, and
 * parse a page expression into normalised intervals. Pure functions only, so every rule is
 * unit testable without a server, a multipart body or a document.
 */
import { z } from 'zod';
import { parseToolManifest } from '../registry/registry.schema.js';
import type { ToolManifest } from '../registry/registry.types.js';
import { pdfToImagesErrors } from './pdf-to-images.errors.js';
import {
  ALLOWED_DPI,
  ALLOWED_FORMATS,
  ALLOWED_QUALITY,
  DEFAULT_DPI,
  DEFAULT_FORMAT,
  DEFAULT_QUALITY,
  type AllowedDpi,
  type AllowedFormat,
  type AllowedQuality,
  type PageInterval,
  type PageSelection,
  type PdfToImagesOptions,
} from './pdf-to-images.types.js';

/** Slug of this tool, the single source of truth for registry lookups. */
export const PDF_TO_IMAGES_SLUG = 'pdf-to-images';

/** Upper bound on a page number, so an absurd expression cannot plan an absurd job. */
export const MAX_PAGE_NUMBER = 10_000;
/** Upper bound on the number of comma separated groups in one expression. */
export const MAX_PAGE_GROUPS = 100;

const PAGE_EXPRESSION_MAX_LENGTH = 512;
const PASSWORD_MAX_LENGTH = 256;

const pageGroupPattern = /^(\d{1,5})(?:\s*-\s*(\d{1,5}))?$/;

/**
 * Parse an expression such as "1", "1-5", "2,5,7" or "1-3,8,10-12".
 * An empty or absent expression means every page.
 */
export function parsePageSelection(raw: string | undefined): PageSelection {
  const expression = (raw ?? '').trim();
  if (expression.length === 0) {
    return Object.freeze({ expression: '', intervals: Object.freeze([]), allPages: true });
  }
  if (expression.length > PAGE_EXPRESSION_MAX_LENGTH) {
    throw pdfToImagesErrors.invalidPageRange('the expression is too long');
  }

  const groups = expression.split(',').map((group) => group.trim());
  if (groups.some((group) => group.length === 0)) {
    throw pdfToImagesErrors.invalidPageRange('empty group between commas');
  }
  if (groups.length > MAX_PAGE_GROUPS) {
    throw pdfToImagesErrors.invalidPageRange(`at most ${MAX_PAGE_GROUPS} groups are allowed`);
  }

  const intervals: PageInterval[] = [];
  for (const group of groups) {
    const match = pageGroupPattern.exec(group);
    if (match === null) {
      throw pdfToImagesErrors.invalidPageRange(`"${sanitizeForMessage(group)}" is not a page or a range`);
    }
    const start = Number.parseInt(match[1] as string, 10);
    const end = match[2] === undefined ? start : Number.parseInt(match[2], 10);
    if (start < 1 || end < 1) {
      throw pdfToImagesErrors.invalidPageRange('page numbers start at 1');
    }
    if (start > end) {
      throw pdfToImagesErrors.invalidPageRange(`range ${start}-${end} is reversed`);
    }
    if (end > MAX_PAGE_NUMBER) {
      throw pdfToImagesErrors.invalidPageRange(`page numbers above ${MAX_PAGE_NUMBER} are not allowed`);
    }
    intervals.push({ start, end });
  }

  return Object.freeze({
    expression,
    intervals: Object.freeze(mergeIntervals(intervals)),
    allPages: false,
  });
}

/** Merge overlapping and adjacent intervals so a plan never renders a page twice. */
function mergeIntervals(intervals: readonly PageInterval[]): PageInterval[] {
  const sorted = [...intervals].sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: PageInterval[] = [];
  for (const interval of sorted) {
    const last = merged[merged.length - 1];
    if (last !== undefined && interval.start <= last.end + 1) {
      merged[merged.length - 1] = { start: last.start, end: Math.max(last.end, interval.end) };
      continue;
    }
    merged.push({ start: interval.start, end: interval.end });
  }
  return merged;
}

/** Strip anything that could confuse a log line or a client renderer. */
function sanitizeForMessage(value: string): string {
  return value.replace(/[^\w\s.-]/g, '').slice(0, 32);
}

const rawFieldsSchema = z.object({
  dpi: z.string().optional(),
  format: z.string().optional(),
  pages: z.string().optional(),
  quality: z.string().optional(),
  password: z.string().max(PASSWORD_MAX_LENGTH).optional(),
});

export type RawPdfToImagesFields = z.infer<typeof rawFieldsSchema>;

/** Resolve raw form fields into fully specified options, applying documented defaults. */
export function parsePdfToImagesFields(raw: Record<string, string>): PdfToImagesOptions {
  const parsed = rawFieldsSchema.safeParse(raw);
  if (!parsed.success) {
    throw pdfToImagesErrors.missingFile();
  }
  const fields = parsed.data;

  const format = parseFormat(fields.format);
  const dpi = parseDpi(fields.dpi);
  const quality = parseQuality(fields.quality);
  const pages = parsePageSelection(fields.pages);
  const password = fields.password?.length ? fields.password : undefined;

  return Object.freeze({
    dpi,
    format,
    quality,
    pages,
    ...(password === undefined ? {} : { password }),
  });
}

function parseFormat(raw: string | undefined): AllowedFormat {
  const value = (raw ?? '').trim().toLowerCase();
  if (value.length === 0) return DEFAULT_FORMAT;
  const normalised = value === 'jpg' ? 'jpeg' : value;
  const match = ALLOWED_FORMATS.find((candidate) => candidate === normalised);
  if (match === undefined) throw pdfToImagesErrors.invalidFormat(ALLOWED_FORMATS);
  return match;
}

function parseDpi(raw: string | undefined): AllowedDpi {
  const value = (raw ?? '').trim();
  if (value.length === 0) return DEFAULT_DPI;
  if (!/^\d{1,5}$/.test(value)) throw pdfToImagesErrors.invalidDpi(ALLOWED_DPI);
  const numeric = Number.parseInt(value, 10);
  const match = ALLOWED_DPI.find((candidate) => candidate === numeric);
  if (match === undefined) throw pdfToImagesErrors.invalidDpi(ALLOWED_DPI);
  return match;
}

function parseQuality(raw: string | undefined): AllowedQuality {
  const value = (raw ?? '').trim();
  if (value.length === 0) return DEFAULT_QUALITY;
  if (!/^\d{1,3}$/.test(value)) throw pdfToImagesErrors.invalidQuality(ALLOWED_QUALITY);
  const numeric = Number.parseInt(value, 10);
  const match = ALLOWED_QUALITY.find((candidate) => candidate === numeric);
  if (match === undefined) throw pdfToImagesErrors.invalidQuality(ALLOWED_QUALITY);
  return match;
}

/**
 * Manifest of this tool.
 * Limits live here so the route reads them from the registry instead of hardcoding them.
 */
export function buildPdfToImagesManifest(maxInputBytes: number): ToolManifest {
  return parseToolManifest({
    slug: PDF_TO_IMAGES_SLUG,
    title: 'PDF to Images',
    version: '0.1.0',
    category: 'convert',
    enabled: true,
    acceptedMimes: ['application/pdf'],
    outputMime: 'application/zip',
    requires: ['pdf.raster'],
    routing: { forceAsync: true, syncBudgetMs: 20_000, workerClass: 'raster' },
    limits: { maxFiles: 1, maxInputBytes, timeoutMs: 150_000 },
  });
}
