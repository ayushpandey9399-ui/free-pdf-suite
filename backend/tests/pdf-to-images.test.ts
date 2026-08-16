/**
 * PDF to Images API foundation tests.
 * Responsibility: prove the acceptance path of the first production tool: field parsing,
 * page expression parsing, upload validation, workspace creation, the 202 receipt and
 * cleanup on every failure. No conversion is exercised, none exists yet.
 */
import assert from 'node:assert/strict';
import { readdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import type { FastifyInstance } from 'fastify';
import { buildConfig } from '../src/config/index.js';
import { buildApp } from '../src/core/app.js';
import { toolRegistry } from '../src/modules/registry/registry.service.js';
import {
  MAX_PAGE_GROUPS,
  parsePageSelection,
  parsePdfToImagesFields,
} from '../src/modules/pdf-to-images/pdf-to-images.schema.js';

const ROUTE = '/v1/tools/pdf-to-images';
const BOUNDARY = '----pdftoolconverteronlinetest';

let app: FastifyInstance;
let workspaceRoot: string;

before(async () => {
  workspaceRoot = await mkdtemp(path.join(tmpdir(), 'fph-pdf-to-images-'));
  const built = await buildApp({
    config: buildConfig({
      NODE_ENV: 'test',
      LOG_LEVEL: 'silent',
      SWAGGER_ENABLED: 'false',
      WORKSPACE_ROOT: workspaceRoot,
    }),
  });
  app = built.app;
});

after(async () => {
  await app.close();
  await rm(workspaceRoot, { recursive: true, force: true });
});

/** Minimal, structurally valid PDF bytes. */
function pdfBytes(options: { encrypted?: boolean } = {}): Buffer {
  const body =
    '%PDF-1.7\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
    '2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n' +
    '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]>>endobj\n' +
    'trailer<</Size 4/Root 1 0 R' +
    (options.encrypted === true ? '/Encrypt 9 0 R' : '') +
    '>>\nstartxref\n0\n%%EOF\n';
  // Padded past the signature probe window so the streaming path is exercised.
  return Buffer.concat([Buffer.from(body, 'ascii'), Buffer.alloc(5000, 0x20)]);
}

interface FormField {
  readonly name: string;
  readonly value: string;
}

function multipartBody(
  file: { field: string; filename: string; contentType: string; bytes: Buffer } | undefined,
  fields: readonly FormField[] = [],
): Buffer {
  const chunks: Buffer[] = [];
  for (const field of fields) {
    chunks.push(
      Buffer.from(
        `--${BOUNDARY}\r\nContent-Disposition: form-data; name="${field.name}"\r\n\r\n${field.value}\r\n`,
        'ascii',
      ),
    );
  }
  if (file !== undefined) {
    chunks.push(
      Buffer.from(
        `--${BOUNDARY}\r\nContent-Disposition: form-data; name="${file.field}"; filename="${file.filename}"\r\n` +
          `Content-Type: ${file.contentType}\r\n\r\n`,
        'ascii',
      ),
      file.bytes,
      Buffer.from('\r\n', 'ascii'),
    );
  }
  chunks.push(Buffer.from(`--${BOUNDARY}--\r\n`, 'ascii'));
  return Buffer.concat(chunks);
}

async function post(
  file: { field: string; filename: string; contentType: string; bytes: Buffer } | undefined,
  fields: readonly FormField[] = [],
) {
  return app.inject({
    method: 'POST',
    url: ROUTE,
    headers: { 'content-type': `multipart/form-data; boundary=${BOUNDARY}` },
    payload: multipartBody(file, fields),
  });
}

function pdfFile(overrides: Partial<{ field: string; filename: string; contentType: string; bytes: Buffer }> = {}) {
  return {
    field: overrides.field ?? 'file',
    filename: overrides.filename ?? 'sample.pdf',
    contentType: overrides.contentType ?? 'application/pdf',
    bytes: overrides.bytes ?? pdfBytes(),
  };
}

async function workspaceCount(): Promise<number> {
  const entries = await readdir(workspaceRoot, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).length;
}

// ---------------------------------------------------------------------------
// Unit: page expression parser
// ---------------------------------------------------------------------------

test('page parser defaults to every page', () => {
  for (const input of [undefined, '', '   ']) {
    const selection = parsePageSelection(input);
    assert.equal(selection.allPages, true);
    assert.deepEqual(selection.intervals, []);
  }
});

test('page parser accepts single pages, ranges and mixed lists', () => {
  assert.deepEqual(parsePageSelection('1').intervals, [{ start: 1, end: 1 }]);
  assert.deepEqual(parsePageSelection('1-5').intervals, [{ start: 1, end: 5 }]);
  assert.deepEqual(parsePageSelection('2,5,7').intervals, [
    { start: 2, end: 2 },
    { start: 5, end: 5 },
    { start: 7, end: 7 },
  ]);
  assert.deepEqual(parsePageSelection('1-3,8,10-12').intervals, [
    { start: 1, end: 3 },
    { start: 8, end: 8 },
    { start: 10, end: 12 },
  ]);
});

test('page parser merges overlapping and adjacent groups', () => {
  assert.deepEqual(parsePageSelection('1-4,3-6').intervals, [{ start: 1, end: 6 }]);
  assert.deepEqual(parsePageSelection('5,6,7').intervals, [{ start: 5, end: 7 }]);
});

test('page parser rejects malformed expressions', () => {
  const invalid = ['0', '1-0', '5-2', 'a', '1,,2', '1-', '-3', '1;2', '99999999', '1.5'];
  for (const input of invalid) {
    assert.throws(
      () => parsePageSelection(input),
      (error: unknown) => (error as { details?: { reason?: string } }).details?.reason === 'INVALID_PAGE_RANGE',
      `expected "${input}" to be rejected`,
    );
  }
  const tooMany = Array.from({ length: MAX_PAGE_GROUPS + 1 }, (_, index) => index + 1).join(',');
  assert.throws(() => parsePageSelection(tooMany));
});

// ---------------------------------------------------------------------------
// Unit: field parser
// ---------------------------------------------------------------------------

test('field parser applies documented defaults', () => {
  const options = parsePdfToImagesFields({});
  assert.equal(options.dpi, 300);
  assert.equal(options.format, 'png');
  assert.equal(options.quality, 90);
  assert.equal(options.pages.allPages, true);
  assert.equal(options.password, undefined);
});

test('field parser accepts allowed values and normalises jpg', () => {
  const options = parsePdfToImagesFields({ dpi: '150', format: 'JPG', quality: '95', pages: '1-2' });
  assert.equal(options.dpi, 150);
  assert.equal(options.format, 'jpeg');
  assert.equal(options.quality, 95);
  assert.deepEqual(options.pages.intervals, [{ start: 1, end: 2 }]);
});

test('field parser rejects out of set dpi, format and quality', () => {
  const cases: Array<[Record<string, string>, string]> = [
    [{ dpi: '200' }, 'INVALID_DPI'],
    [{ dpi: 'high' }, 'INVALID_DPI'],
    [{ format: 'tiff' }, 'INVALID_FORMAT'],
    [{ quality: '100' }, 'INVALID_QUALITY'],
    [{ quality: 'best' }, 'INVALID_QUALITY'],
  ];
  for (const [fields, reason] of cases) {
    assert.throws(
      () => parsePdfToImagesFields(fields),
      (error: unknown) => (error as { details?: { reason?: string } }).details?.reason === reason,
      `expected ${JSON.stringify(fields)} to fail with ${reason}`,
    );
  }
});

// ---------------------------------------------------------------------------
// Integration: registry lookup
// ---------------------------------------------------------------------------

test('registry resolves the pdf-to-images manifest with limits', () => {
  const manifest = toolRegistry.get('pdf-to-images');
  assert.ok(manifest);
  assert.equal(manifest.enabled, true);
  assert.equal(manifest.limits.maxFiles, 1);
  assert.ok(manifest.limits.maxInputBytes > 0);
  assert.deepEqual([...manifest.acceptedMimes], ['application/pdf']);
});

// ---------------------------------------------------------------------------
// Integration: route
// ---------------------------------------------------------------------------

test('POST accepts a valid PDF and returns 202 with a receipt', async () => {
  const response = await post(pdfFile(), [
    { name: 'dpi', value: '150' },
    { name: 'format', value: 'jpeg' },
    { name: 'quality', value: '80' },
    { name: 'pages', value: '1-3,8' },
  ]);
  assert.equal(response.statusCode, 202);
  const body = response.json();
  assert.equal(body.success, true);
  assert.equal(body.tool, 'pdf-to-images');
  assert.equal(body.status, 'accepted');
  assert.equal(body.nextStep, 'processing');
  assert.match(body.workspaceId, /^[0-9a-f-]{36}$/);
  // The receipt never leaks a path.
  assert.equal(JSON.stringify(body).includes(workspaceRoot), false);
  // The upload is stored inside its own isolated workspace.
  const uploads = await readdir(path.join(workspaceRoot, body.workspaceId, 'uploads'));
  assert.equal(uploads.length, 1);
});

test('POST without a file is rejected and leaves no workspace', async () => {
  const before = await workspaceCount();
  const response = await post(undefined, [{ name: 'dpi', value: '300' }]);
  assert.equal(response.statusCode, 400);
  assert.equal(response.json().error.details.reason, 'INVALID_FILE');
  assert.equal(await workspaceCount(), before);
});

test('POST with a non multipart body is rejected', async () => {
  const response = await app.inject({
    method: 'POST',
    url: ROUTE,
    headers: { 'content-type': 'application/json' },
    payload: { dpi: 300 },
  });
  assert.equal(response.statusCode, 400);
});

test('POST with a non PDF payload is rejected on magic bytes', async () => {
  const before = await workspaceCount();
  const response = await post(
    pdfFile({ filename: 'trick.pdf', bytes: Buffer.alloc(6000, 0x41) }),
  );
  assert.equal(response.statusCode, 415);
  assert.equal(response.json().error.code, 'E_UNSUPPORTED_INPUT');
  assert.equal(await workspaceCount(), before);
});

test('POST with a PNG renamed to pdf is rejected on magic bytes', async () => {
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    Buffer.alloc(6000, 0x00),
  ]);
  const response = await post(pdfFile({ bytes: png }));
  assert.equal(response.statusCode, 415);
});

test('POST with the file in the wrong field is rejected', async () => {
  const before = await workspaceCount();
  const response = await post(pdfFile({ field: 'document' }));
  assert.equal(response.statusCode, 400);
  assert.equal(response.json().error.details.reason, 'INVALID_FILE');
  assert.equal(await workspaceCount(), before);
});

test('POST with an invalid page range cleans up the workspace', async () => {
  const before = await workspaceCount();
  const response = await post(pdfFile(), [{ name: 'pages', value: '5-2' }]);
  assert.equal(response.statusCode, 400);
  assert.equal(response.json().error.details.reason, 'INVALID_PAGE_RANGE');
  assert.equal(await workspaceCount(), before);
});

test('POST with an invalid dpi cleans up the workspace', async () => {
  const before = await workspaceCount();
  const response = await post(pdfFile(), [{ name: 'dpi', value: '123' }]);
  assert.equal(response.statusCode, 400);
  assert.equal(response.json().error.details.reason, 'INVALID_DPI');
  assert.equal(await workspaceCount(), before);
});

test('POST with an encrypted PDF and no password is rejected', async () => {
  const before = await workspaceCount();
  const response = await post(pdfFile({ bytes: pdfBytes({ encrypted: true }) }));
  assert.equal(response.statusCode, 400);
  assert.equal(response.json().error.details.reason, 'PASSWORD_REQUIRED');
  assert.equal(await workspaceCount(), before);
});

test('POST with an encrypted PDF and a password is accepted', async () => {
  const response = await post(pdfFile({ bytes: pdfBytes({ encrypted: true }) }), [
    { name: 'password', value: 'secret' },
  ]);
  assert.equal(response.statusCode, 202);
  assert.equal(JSON.stringify(response.json()).includes('secret'), false);
});

test('POST with two files is rejected', async () => {
  const before = await workspaceCount();
  const filePart = (name: string) =>
    Buffer.concat([
      Buffer.from(
        `--${BOUNDARY}\r\nContent-Disposition: form-data; name="file"; filename="${name}"\r\n` +
          'Content-Type: application/pdf\r\n\r\n',
        'ascii',
      ),
      pdfBytes(),
      Buffer.from('\r\n', 'ascii'),
    ]);
  const body = Buffer.concat([
    filePart('first.pdf'),
    filePart('second.pdf'),
    Buffer.from(`--${BOUNDARY}--\r\n`, 'ascii'),
  ]);
  const response = await app.inject({
    method: 'POST',
    url: ROUTE,
    headers: { 'content-type': `multipart/form-data; boundary=${BOUNDARY}` },
    payload: body,
  });
  assert.equal(response.statusCode, 400);
  assert.equal(response.json().error.details.reason, 'INVALID_FILE');
  assert.equal(await workspaceCount(), before);
});

test('error envelopes never leak the file system or a stack', async () => {
  const response = await post(pdfFile(), [{ name: 'pages', value: 'nonsense' }]);
  const raw = response.body;
  assert.equal(raw.includes(workspaceRoot), false);
  assert.equal(raw.includes('at '), false);
  assert.equal(raw.includes('stack'), false);
});
