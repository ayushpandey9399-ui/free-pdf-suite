/**
 * PDF to Images output delivery tests.
 * Responsibility: prove the delivery pipeline end to end over HTTP: a single page returns the
 * image itself, several pages return a verified ZIP of exactly those images, a signed link
 * streams the bytes with correct headers, forged and expired links are refused, the workspace is
 * deleted after a download and after a failure, concurrent downloads of one link both complete,
 * and a retried conversion produces a fresh, independent link.
 */
import assert from 'node:assert/strict';
import { mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import type { FastifyInstance } from 'fastify';

import { buildConfig } from '../src/config/index.js';
import { buildApp } from '../src/core/app.js';
import { DownloadError } from '../src/modules/download/download.errors.js';
import { DownloadTokenSigner } from '../src/modules/download/download.tokens.js';
import type { DownloadClaims } from '../src/modules/download/download.types.js';
import {
  createStoredZip,
  readStoredZipEntryNames,
  ZipWriteError,
} from '../src/platform/archive/index.js';

const JOBS_ROUTE = '/v1/tools/pdf-to-images/jobs';
const BOUNDARY = '----pdftoolconverteronlinedelivery';
const TOKEN_SECRET = 'delivery-test-secret-key';

let app: FastifyInstance;
let workspaceRoot: string;
let scratch: string;

before(async () => {
  workspaceRoot = await mkdtemp(path.join(tmpdir(), 'fph-delivery-'));
  scratch = await mkdtemp(path.join(tmpdir(), 'fph-delivery-zip-'));
  const built = await buildApp({
    config: buildConfig({
      NODE_ENV: 'test',
      LOG_LEVEL: 'silent',
      SWAGGER_ENABLED: 'false',
      WORKSPACE_ROOT: workspaceRoot,
      DOWNLOAD_TOKEN_SECRET: TOKEN_SECRET,
    }),
  });
  app = built.app;
});

after(async () => {
  await app.close();
  await rm(workspaceRoot, { recursive: true, force: true });
  await rm(scratch, { recursive: true, force: true });
});

/** Build a structurally valid PDF with the requested number of blank pages. */
function multiPagePdf(pageCount: number): Buffer {
  const kids = Array.from({ length: pageCount }, (_, index) => `${index + 3} 0 R`).join(' ');
  const objects: string[] = [
    '<</Type/Catalog/Pages 2 0 R>>',
    `<</Type/Pages/Count ${pageCount}/Kids[${kids}]>>`,
    ...Array.from(
      { length: pageCount },
      () => '<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]/Resources<<>>>>',
    ),
  ];

  let body = '%PDF-1.7\n';
  const offsets: number[] = [];
  objects.forEach((object, index) => {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = body.length;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    xref += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }
  const trailer = `trailer\n<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(body + xref + trailer, 'latin1');
}

function multipartBody(bytes: Buffer, fields: readonly { name: string; value: string }[]): Buffer {
  const chunks: Buffer[] = [];
  for (const field of fields) {
    chunks.push(
      Buffer.from(
        `--${BOUNDARY}\r\nContent-Disposition: form-data; name="${field.name}"\r\n\r\n${field.value}\r\n`,
        'ascii',
      ),
    );
  }
  chunks.push(
    Buffer.from(
      `--${BOUNDARY}\r\nContent-Disposition: form-data; name="file"; filename="client supplied.pdf"\r\n` +
        'Content-Type: application/pdf\r\n\r\n',
      'ascii',
    ),
    bytes,
    Buffer.from('\r\n', 'ascii'),
    Buffer.from(`--${BOUNDARY}--\r\n`, 'ascii'),
  );
  return Buffer.concat(chunks);
}

interface ReadyBody {
  readonly success: boolean;
  readonly status: string;
  readonly imageCount: number;
  readonly download: {
    readonly url: string;
    readonly filename: string;
    readonly contentType: string;
    readonly sizeBytes: number;
    readonly kind: string;
    readonly expiresAt: string;
  };
  readonly metrics: { readonly pagesConverted: number; readonly outputBytes: number };
}

async function convert(
  pageCount: number,
  fields: readonly { name: string; value: string }[] = [],
) {
  return app.inject({
    method: 'POST',
    url: JOBS_ROUTE,
    headers: { 'content-type': `multipart/form-data; boundary=${BOUNDARY}` },
    payload: multipartBody(multiPagePdf(pageCount), fields),
  });
}

async function workspaceCount(): Promise<number> {
  const entries = await readdir(workspaceRoot, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).length;
}

/**
 * The suite shares one workspace root, so each case starts from a clean slate.
 * Cleanup is attached to the response lifecycle rather than awaited by the handler, so this
 * polls briefly instead of asserting on the same tick.
 */
async function assertNoWorkspacesLeft(): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if ((await workspaceCount()) === 0) return;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  assert.equal(await workspaceCount(), 0, 'every workspace must be cleaned up');
}

function claims(overrides: Partial<DownloadClaims> = {}): DownloadClaims {
  return {
    workspaceId: '0192f0aa-bbcc-7ddd-8eee-0123456789ab',
    scope: 'outputs',
    key: 'page-0001.png',
    filename: 'page-0001.png',
    contentType: 'image/png',
    sizeBytes: 1234,
    kind: 'file',
    toolSlug: 'pdf-to-images',
    expiresAtMs: Date.now() + 60_000,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Unit: stored ZIP writer
// ---------------------------------------------------------------------------

test('the zip writer packs entries and reads their names back', async () => {
  const a = path.join(scratch, 'a.bin');
  const b = path.join(scratch, 'b.bin');
  await writeFile(a, Buffer.alloc(1024, 0x41));
  await writeFile(b, Buffer.from('second entry payload', 'ascii'));

  const target = path.join(scratch, 'packed.zip');
  const result = await createStoredZip(
    [
      { name: 'page-0001.png', path: a },
      { name: 'page-0002.png', path: b },
    ],
    target,
  );

  assert.equal(result.entryCount, 2);
  assert.ok(result.sizeBytes > 1024);
  assert.deepEqual([...result.entryNames], ['page-0001.png', 'page-0002.png']);
  assert.deepEqual(await readStoredZipEntryNames(target), ['page-0001.png', 'page-0002.png']);
});

test('the zip writer rejects empty archives, bad names and empty entries', async () => {
  const empty = path.join(scratch, 'empty.bin');
  await writeFile(empty, Buffer.alloc(0));

  await assert.rejects(
    () => createStoredZip([], path.join(scratch, 'none.zip')),
    (error: unknown) => error instanceof ZipWriteError,
  );
  await assert.rejects(
    () =>
      createStoredZip(
        [{ name: '../escape.png', path: empty }],
        path.join(scratch, 'escape.zip'),
      ),
    (error: unknown) => error instanceof ZipWriteError,
  );
  await assert.rejects(
    () =>
      createStoredZip([{ name: 'page-0001.png', path: empty }], path.join(scratch, 'zero.zip')),
    (error: unknown) => error instanceof ZipWriteError,
  );
});

// ---------------------------------------------------------------------------
// Unit: download tokens
// ---------------------------------------------------------------------------

test('a signed token round trips its claims', () => {
  const signer = new DownloadTokenSigner({ secret: TOKEN_SECRET });
  const original = claims();
  const verified = signer.verify(signer.sign(original));
  assert.deepEqual({ ...verified }, { ...original });
});

test('a tampered payload, a foreign key and a malformed token are all refused', () => {
  const signer = new DownloadTokenSigner({ secret: TOKEN_SECRET });
  const other = new DownloadTokenSigner({ secret: 'a-completely-different-key' });
  const token = signer.sign(claims());
  const [version, payload, signature] = token.split('.') as [string, string, string];

  const forged = Buffer.from(
    JSON.stringify({ ...JSON.parse(Buffer.from(payload, 'base64url').toString()), b: 999999 }),
  ).toString('base64url');

  for (const candidate of [
    `${version}.${forged}.${signature}`,
    other.sign(claims()),
    'not-a-token',
    `d9.${payload}.${signature}`,
    '',
  ]) {
    assert.throws(
      () => signer.verify(candidate),
      (error: unknown) => {
        const details = (error as { details?: { reason?: string } }).details;
        return details?.reason === DownloadError.INVALID_TOKEN;
      },
      `token must be refused: ${candidate.slice(0, 12)}`,
    );
  }
});

test('an expired token reports expiry rather than invalidity', () => {
  const signer = new DownloadTokenSigner({ secret: TOKEN_SECRET, now: () => 1_000 });
  const token = signer.sign(claims({ expiresAtMs: 2_000 }));
  const later = new DownloadTokenSigner({ secret: TOKEN_SECRET, now: () => 5_000 });
  assert.throws(
    () => later.verify(token),
    (error: unknown) =>
      (error as { details?: { reason?: string } }).details?.reason === DownloadError.EXPIRED_TOKEN,
  );
});

test('a token that points outside the allowed scopes cannot be minted', () => {
  const signer = new DownloadTokenSigner({ secret: TOKEN_SECRET });
  assert.throws(() => signer.sign(claims({ scope: 'uploads' })));
  assert.throws(() => signer.sign(claims({ key: '../../etc/passwd' })));
  assert.throws(() => signer.sign(claims({ contentType: 'text/html' })));
});

// ---------------------------------------------------------------------------
// Integration: single page delivery
// ---------------------------------------------------------------------------

test('a single page PDF is delivered as the image itself', async () => {
  const response = await convert(1);
  assert.equal(response.statusCode, 200, response.body);
  const body = response.json<ReadyBody>();

  assert.equal(body.status, 'ready');
  assert.equal(body.imageCount, 1);
  assert.equal(body.download.kind, 'file');
  assert.equal(body.download.contentType, 'image/png');
  assert.equal(body.download.filename, 'page-0001.png');
  assert.ok(body.download.sizeBytes > 0);
  assert.ok(body.download.url.startsWith('/v1/downloads/'));
  assert.ok(!JSON.stringify(body).includes('client supplied'), 'no uploaded name may leak');
  assert.ok(!JSON.stringify(body).includes(workspaceRoot), 'no path may leak');

  const download = await app.inject({ method: 'GET', url: body.download.url });
  assert.equal(download.statusCode, 200);
  assert.equal(download.headers['content-type'], 'image/png');
  assert.equal(download.headers['content-length'], String(body.download.sizeBytes));
  assert.equal(
    download.headers['content-disposition'],
    'attachment; filename="page-0001.png"',
  );
  assert.equal(download.headers['cache-control'], 'no-store, private');
  // PNG signature.
  assert.deepEqual([...download.rawPayload.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]);

  await assertNoWorkspacesLeft();
});

test('a JPEG request is delivered with the JPEG content type', async () => {
  const response = await convert(1, [
    { name: 'format', value: 'jpg' },
    { name: 'quality', value: '80' },
    { name: 'dpi', value: '72' },
  ]);
  assert.equal(response.statusCode, 200, response.body);
  const body = response.json<ReadyBody>();
  assert.equal(body.download.contentType, 'image/jpeg');
  assert.equal(body.download.filename, 'page-0001.jpg');

  const download = await app.inject({ method: 'GET', url: body.download.url });
  assert.equal(download.statusCode, 200);
  assert.deepEqual([...download.rawPayload.subarray(0, 2)], [0xff, 0xd8]);
  await assertNoWorkspacesLeft();
});

// ---------------------------------------------------------------------------
// Integration: multi page delivery
// ---------------------------------------------------------------------------

test('a multi page PDF is delivered as a ZIP of exactly the generated images', async () => {
  const response = await convert(3, [{ name: 'dpi', value: '72' }]);
  assert.equal(response.statusCode, 200, response.body);
  const body = response.json<ReadyBody>();

  assert.equal(body.imageCount, 3);
  assert.equal(body.download.kind, 'archive');
  assert.equal(body.download.contentType, 'application/zip');
  assert.equal(body.download.filename, 'images.zip');
  assert.equal(body.metrics.pagesConverted, 3);

  const download = await app.inject({ method: 'GET', url: body.download.url });
  assert.equal(download.statusCode, 200);
  assert.equal(download.headers['content-type'], 'application/zip');
  assert.equal(download.headers['content-length'], String(body.download.sizeBytes));
  assert.deepEqual([...download.rawPayload.subarray(0, 2)], [0x50, 0x4b]);

  const archivePath = path.join(scratch, 'delivered.zip');
  await writeFile(archivePath, download.rawPayload);
  assert.deepEqual(await readStoredZipEntryNames(archivePath), [
    'page-0001.png',
    'page-0002.png',
    'page-0003.png',
  ]);

  await assertNoWorkspacesLeft();
});

test('a page range is delivered as a ZIP that holds only the selected pages', async () => {
  const response = await convert(6, [
    { name: 'pages', value: '1,4-5' },
    { name: 'dpi', value: '72' },
  ]);
  assert.equal(response.statusCode, 200, response.body);
  const body = response.json<ReadyBody>();
  assert.equal(body.imageCount, 3);

  const download = await app.inject({ method: 'GET', url: body.download.url });
  const archivePath = path.join(scratch, 'range.zip');
  await writeFile(archivePath, download.rawPayload);
  assert.deepEqual(await readStoredZipEntryNames(archivePath), [
    'page-0001.png',
    'page-0002.png',
    'page-0003.png',
  ]);
  await assertNoWorkspacesLeft();
});

// ---------------------------------------------------------------------------
// Integration: download refusals and cleanup
// ---------------------------------------------------------------------------

test('a forged download link is refused and reveals nothing', async () => {
  const response = await app.inject({ method: 'GET', url: '/v1/downloads/d1.abc.def' });
  assert.equal(response.statusCode, 400);
  const payload = response.json<{ error: { message: string; details: { reason: string } } }>();
  assert.equal(payload.error.details.reason, DownloadError.INVALID_TOKEN);
  assert.ok(!payload.error.message.includes('/'), 'no path may appear in the message');
});

test('an expired link is refused with a gone status', async () => {
  const signer = new DownloadTokenSigner({ secret: TOKEN_SECRET, now: () => Date.now() - 10_000 });
  const token = signer.sign(claims({ expiresAtMs: Date.now() - 5_000 }));
  const response = await app.inject({ method: 'GET', url: `/v1/downloads/${token}` });
  assert.equal(response.statusCode, 410);
  assert.equal(
    response.json<{ error: { details: { reason: string } } }>().error.details.reason,
    DownloadError.EXPIRED_TOKEN,
  );
});

test('a valid link to a deleted workspace is refused', async () => {
  const signer = new DownloadTokenSigner({ secret: TOKEN_SECRET });
  const token = signer.sign(claims());
  const response = await app.inject({ method: 'GET', url: `/v1/downloads/${token}` });
  assert.equal(response.statusCode, 410);
  assert.equal(
    response.json<{ error: { details: { reason: string } } }>().error.details.reason,
    DownloadError.ARTIFACT_GONE,
  );
});

test('a link cannot be used twice, because the workspace is cleaned up after the download', async () => {
  const response = await convert(2, [{ name: 'dpi', value: '72' }]);
  const body = response.json<ReadyBody>();

  const first = await app.inject({ method: 'GET', url: body.download.url });
  assert.equal(first.statusCode, 200);

  const second = await app.inject({ method: 'GET', url: body.download.url });
  assert.equal(second.statusCode, 410);
  await assertNoWorkspacesLeft();
});

test('concurrent downloads of one link both complete', async () => {
  const response = await convert(2, [{ name: 'dpi', value: '72' }]);
  const body = response.json<ReadyBody>();

  const [a, b] = await Promise.all([
    app.inject({ method: 'GET', url: body.download.url }),
    app.inject({ method: 'GET', url: body.download.url }),
  ]);

  assert.equal(a.statusCode, 200);
  assert.equal(b.statusCode, 200);
  assert.equal(a.rawPayload.length, body.download.sizeBytes);
  assert.equal(b.rawPayload.length, body.download.sizeBytes);
  await assertNoWorkspacesLeft();
});

test('a rejected conversion leaves no workspace behind', async () => {
  const response = await app.inject({
    method: 'POST',
    url: JOBS_ROUTE,
    headers: { 'content-type': `multipart/form-data; boundary=${BOUNDARY}` },
    payload: multipartBody(Buffer.from('this is not a pdf at all', 'ascii'), []),
  });
  assert.equal(response.statusCode, 415);
  await assertNoWorkspacesLeft();
});

test('an invalid option is refused before any conversion happens', async () => {
  const response = await convert(1, [{ name: 'dpi', value: '999' }]);
  assert.equal(response.statusCode, 400);
  await assertNoWorkspacesLeft();
});

test('a retry after a refusal produces a fresh, independent link', async () => {
  const refused = await convert(2, [{ name: 'pages', value: '0' }]);
  assert.equal(refused.statusCode, 400);
  await assertNoWorkspacesLeft();

  const first = (await convert(2, [{ name: 'dpi', value: '72' }])).json<ReadyBody>();
  const second = (await convert(2, [{ name: 'dpi', value: '72' }])).json<ReadyBody>();
  assert.notEqual(first.download.url, second.download.url);

  assert.equal((await app.inject({ method: 'GET', url: first.download.url })).statusCode, 200);
  assert.equal((await app.inject({ method: 'GET', url: second.download.url })).statusCode, 200);
  await assertNoWorkspacesLeft();
});
