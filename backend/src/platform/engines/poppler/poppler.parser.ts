/**
 * Poppler output and metadata parsing.
 * Responsibility: describe what a finished run actually produced by listing the files on
 * disk, and read a pdfinfo report into typed fields.
 *
 * Architecture Notes
 * pdftoppm reports success by exit code and writes an unknown number of files whose names it
 * chooses. Trusting the exit code alone has produced silent empty results in every system that
 * has tried it, so the adapter verifies the artefacts instead. Parsing lives apart from the
 * adapter so both the file listing rules and the pdfinfo dialect can be tested directly.
 */
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import type { PopplerImageFormat } from './poppler.capabilities.js';

export interface PopplerOutputFile {
  readonly name: string;
  readonly path: string;
  readonly sizeBytes: number;
  /** Page number parsed from the file name suffix, when Poppler numbered the file. */
  readonly page: number | undefined;
}

export interface PopplerRasterOutput {
  readonly format: PopplerImageFormat;
  readonly files: readonly PopplerOutputFile[];
  readonly pageCount: number;
  readonly totalBytes: number;
  /** Pages that were requested but have no corresponding file. */
  readonly missingPages: readonly number[];
}

const EXTENSIONS: Readonly<Record<PopplerImageFormat, readonly string[]>> = Object.freeze({
  png: ['.png'],
  jpeg: ['.jpg', '.jpeg'],
  tiff: ['.tif', '.tiff'],
});

/** File extensions Poppler may use for a format. */
export function extensionsForFormat(format: PopplerImageFormat): readonly string[] {
  return EXTENSIONS[format];
}

/** Extract the trailing page number Poppler appends, for example prefix-007.png. */
export function parsePageNumber(fileName: string, prefix: string): number | undefined {
  const withoutExtension = fileName.slice(0, fileName.lastIndexOf('.'));
  if (!withoutExtension.startsWith(prefix)) return undefined;
  const suffix = withoutExtension.slice(prefix.length).replace(/^[-_]/, '');
  if (suffix.length === 0 || !/^\d+$/.test(suffix)) return undefined;
  const page = Number.parseInt(suffix, 10);
  return Number.isSafeInteger(page) ? page : undefined;
}

/**
 * List the artefacts a run produced.
 * expectedPages, when provided, drives the missingPages report.
 */
export async function collectRasterOutput(input: {
  readonly outputDir: string;
  readonly outputPrefix: string;
  readonly format: PopplerImageFormat;
  readonly expectedPages?: readonly number[];
}): Promise<PopplerRasterOutput> {
  const extensions = extensionsForFormat(input.format);
  let entries: string[] = [];
  try {
    entries = await readdir(input.outputDir);
  } catch {
    entries = [];
  }

  const candidates = entries.filter(
    (name) =>
      name.startsWith(input.outputPrefix) &&
      extensions.some((extension) => name.toLowerCase().endsWith(extension)),
  );

  const files: PopplerOutputFile[] = [];
  for (const name of candidates.sort((a, b) => a.localeCompare(b, 'en'))) {
    const filePath = path.join(input.outputDir, name);
    let sizeBytes = 0;
    try {
      const info = await stat(filePath);
      if (!info.isFile()) continue;
      sizeBytes = info.size;
    } catch {
      continue;
    }
    files.push({
      name,
      path: filePath,
      sizeBytes,
      page: parsePageNumber(name, input.outputPrefix),
    });
  }

  const produced = new Set(
    files.map((file) => file.page).filter((page): page is number => page !== undefined),
  );
  const missingPages = (input.expectedPages ?? []).filter((page) => !produced.has(page));

  return {
    format: input.format,
    files: Object.freeze(files),
    pageCount: files.length,
    totalBytes: files.reduce((total, file) => total + file.sizeBytes, 0),
    missingPages: Object.freeze(missingPages),
  };
}

export interface PopplerDocumentInfo {
  readonly pages: number;
  readonly encrypted: boolean;
  readonly pageWidthPt: number;
  readonly pageHeightPt: number;
  readonly pdfVersion: string;
}

/**
 * Read `pdfinfo` key and value output.
 * Unknown keys are ignored, so a newer Poppler cannot break the parser.
 */
export function parseDocumentInfo(stdout: string): PopplerDocumentInfo {
  const fields = new Map<string, string>();
  for (const line of stdout.split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator <= 0) continue;
    fields.set(line.slice(0, separator).trim().toLowerCase(), line.slice(separator + 1).trim());
  }

  const pageSize = fields.get('page size') ?? '';
  const sizeMatch = /([\d.]+)\s*x\s*([\d.]+)\s*pts/i.exec(pageSize);
  const encrypted = (fields.get('encrypted') ?? 'no').toLowerCase();

  return {
    pages: Number.parseInt(fields.get('pages') ?? '0', 10) || 0,
    encrypted: !encrypted.startsWith('no'),
    pageWidthPt: sizeMatch === null ? 0 : Number.parseFloat(sizeMatch[1] ?? '0'),
    pageHeightPt: sizeMatch === null ? 0 : Number.parseFloat(sizeMatch[2] ?? '0'),
    pdfVersion: fields.get('pdf version') ?? '',
  };
}
