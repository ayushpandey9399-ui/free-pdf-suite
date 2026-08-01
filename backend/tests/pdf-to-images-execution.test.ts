/**
 * PDF to Images execution pipeline tests.
 * Responsibility: prove the dispatcher path end to end: registry engine resolution, adapter
 * planning, Process Runner execution, real pdftoppm output for both formats and every allowed
 * density, page selections, password handling, stable error mapping, cancellation, workspace
 * recovery and output verification.
 */
import assert from 'node:assert/strict';
import { mkdtemp, readdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import test from 'node:test';

import { isAppError } from '../src/core/errors.js';
import { EngineRegistry } from '../src/platform/engines/engine.registry.js';
import { createEngineRegistry } from '../src/platform/engines/index.js';
import { NotImplementedEngineAdapter } from '../src/platform/engines/engine.base.js';
import { createProcessRunner } from '../src/platform/process/process.factory.js';
import type {
  ProcessRunRequest,
  ProcessRunResult,
  ProcessRunner,
} from '../src/platform/process/process.types.js';
import { toolRegistry } from '../src/modules/registry/registry.service.js';
import { WorkspaceManager } from '../src/modules/workspace/workspace.manager.js';
import { LocalWorkspaceStorage } from '../src/modules/workspace/workspace.storage.js';
import { PdfToImagesDispatcher } from '../src/modules/pdf-to-images/pdf-to-images.dispatcher.js';
import {
  ConversionError,
  type ConversionResult,
} from '../src/modules/pdf-to-images/pdf-to-images.conversion.js';
import {
  buildPdfToImagesManifest,
  parsePageSelection,
} from '../src/modules/pdf-to-images/pdf-to-images.schema.js';
import type {
  AllowedDpi,
  AllowedFormat,
  PdfToImagesOptions,
} from '../src/modules/pdf-to-images/pdf-to-images.types.js';

const realRunner: ProcessRunner = createProcessRunner();
const realEngines = createEngineRegistry(realRunner);

/** Register the manifest once, the registry is process wide. */
const manifest = buildPdfToImagesManifest(25 * 1024 * 1024);
if (!toolRegistry.has(manifest.slug)) toolRegistry.register(manifest);

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

interface Harness {
  readonly root: string;
  readonly workspaces: WorkspaceManager;
  readonly workspaceId: string;
  readonly fileId: string;
  readonly outputDir: string;
  cleanup(): Promise<void>;
}

async function harness(bytes: Buffer): Promise<Harness> {
  const root = await mkdtemp(path.join(tmpdir(), 'fph-convert-'));
  const storage = new LocalWorkspaceStorage(root);
  await storage.ensureRoot();
  const workspaces = new WorkspaceManager({ storage });
  const workspace = await workspaces.create({
    requestId: 'req-test',
    toolSlug: manifest.slug,
    ttlMs: 60_000,
  });
  const file = await workspaces.addFile({
    workspaceId: workspace.id,
    scope: 'uploads',
    declaredName: 'client supplied name.pdf',
    contentType: 'application/pdf',
    source: Readable.from([bytes]) as unknown as AsyncIterable<Uint8Array>,
  });
  return {
    root,
    workspaces,
    workspaceId: workspace.id,
    fileId: file.id,
    outputDir: workspaces.scopePathOf(workspace.id, 'outputs'),
    cleanup: async () => {
      await rm(root, { recursive: true, force: true });
    },
  };
}

function options(overrides: Partial<PdfToImagesOptions> = {}): PdfToImagesOptions {
  return {
    dpi: 150,
    format: 'png',
    quality: 90,
    pages: parsePageSelection(undefined),
    ...overrides,
  };
}

function dispatcher(
  target: Harness,
  overrides: { readonly runner?: ProcessRunner; readonly engines?: EngineRegistry } = {},
): PdfToImagesDispatcher {
  return new PdfToImagesDispatcher({
    registry: toolRegistry,
    engines: overrides.engines ?? realEngines,
    workspaces: target.workspaces,
    runner: overrides.runner ?? realRunner,
  });
}

/** Runner that never spawns anything, used to force a specific engine outcome. */
function fakeRunner(overrides: Partial<ProcessRunResult>): ProcessRunner {
  return {
    run: async (request: ProcessRunRequest): Promise<ProcessRunResult> => ({
      outcome: 'completed',
      exitCode: 0,
      signal: null,
      stdout: '',
      stderr: '',
      stdoutTruncated: false,
      stderrTruncated: false,
      durationMs: 1,
      usage: { cpuMs: 0, peakRssBytes: 0, samples: 0 },
      invocation: { binary: request.binary, args: request.args },
      ...overrides,
    }),
  };
}

async function reasonOf(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
    assert.fail('expected the conversion to fail');
  } catch (error) {
    assert.ok(isAppError(error), 'the failure must be an AppError');
    const details = error.details as { reason?: string } | undefined;
    assert.ok(
      !/pdftoppm|\/tmp\/|Error:|stderr/i.test(error.message),
      `message must stay client safe: ${error.message}`,
    );
    return details?.reason ?? '';
  }
}

function assertSequentialNames(result: ConversionResult, format: AllowedFormat): void {
  const extension = format === 'png' ? '.png' : '.jpg';
  result.images.forEach((image, offset) => {
    assert.equal(image.name, `page-${String(offset + 1).padStart(4, '0')}${extension}`);
    assert.equal(image.index, offset + 1);
    assert.ok(image.sizeBytes > 0);
    assert.ok(!image.name.includes(' '));
  });
}

test('converts every page to PNG and names the files sequentially', async () => {
  const target = await harness(multiPagePdf(3));
  try {
    const result = await dispatcher(target).convert({
      requestId: 'req-1',
      workspaceId: target.workspaceId,
      fileId: target.fileId,
      options: options(),
    });
    assert.equal(result.engineId, 'poppler');
    assert.equal(result.images.length, 3);
    assertSequentialNames(result, 'png');
    assert.deepEqual(
      result.images.map((image) => image.page),
      [1, 2, 3],
    );
    assert.equal(result.metrics.imageCount, 3);
    assert.equal(result.metrics.pagesConverted, 3);
    assert.equal(result.metrics.runCount, 1);
    assert.ok(result.metrics.outputBytes > 0);
    assert.ok(result.metrics.durationMs >= 0);

    const onDisk = (await readdir(target.outputDir)).sort();
    assert.deepEqual(onDisk, ['page-0001.png', 'page-0002.png', 'page-0003.png']);
    for (const name of onDisk) {
      const info = await stat(path.join(target.outputDir, name));
      assert.ok(info.isFile() && info.size > 0);
    }
  } finally {
    await target.cleanup();
  }
});

test('converts to JPEG at the requested quality', async () => {
  const target = await harness(multiPagePdf(2));
  try {
    const result = await dispatcher(target).convert({
      requestId: 'req-2',
      workspaceId: target.workspaceId,
      fileId: target.fileId,
      options: options({ format: 'jpeg', quality: 80 }),
    });
    assert.equal(result.format, 'jpeg');
    assert.equal(result.images.length, 2);
    assertSequentialNames(result, 'jpeg');
    assert.deepEqual((await readdir(target.outputDir)).sort(), ['page-0001.jpg', 'page-0002.jpg']);
  } finally {
    await target.cleanup();
  }
});

for (const dpi of [72, 150, 300, 600] as const) {
  test(`converts at ${dpi} dpi`, async () => {
    const target = await harness(multiPagePdf(1));
    try {
      const result = await dispatcher(target).convert({
        requestId: `req-dpi-${dpi}`,
        workspaceId: target.workspaceId,
        fileId: target.fileId,
        options: options({ dpi: dpi as AllowedDpi }),
      });
      assert.equal(result.dpi, dpi);
      assert.equal(result.metrics.dpi, dpi);
      assert.equal(result.images.length, 1);
      assert.equal(result.images[0]?.name, 'page-0001.png');
    } finally {
      await target.cleanup();
    }
  });
}

test('converts a single page selection', async () => {
  const target = await harness(multiPagePdf(5));
  try {
    const result = await dispatcher(target).convert({
      requestId: 'req-single',
      workspaceId: target.workspaceId,
      fileId: target.fileId,
      options: options({ pages: parsePageSelection('3') }),
    });
    assert.equal(result.images.length, 1);
    assert.equal(result.images[0]?.page, 3);
    assert.equal(result.images[0]?.name, 'page-0001.png');
  } finally {
    await target.cleanup();
  }
});

test('converts a contiguous range', async () => {
  const target = await harness(multiPagePdf(8));
  try {
    const result = await dispatcher(target).convert({
      requestId: 'req-range',
      workspaceId: target.workspaceId,
      fileId: target.fileId,
      options: options({ pages: parsePageSelection('2-4') }),
    });
    assert.deepEqual(
      result.images.map((image) => image.page),
      [2, 3, 4],
    );
    assertSequentialNames(result, 'png');
    assert.equal(result.metrics.runCount, 1);
  } finally {
    await target.cleanup();
  }
});

test('converts a mixed selection with one engine run per interval', async () => {
  const target = await harness(multiPagePdf(12));
  try {
    const result = await dispatcher(target).convert({
      requestId: 'req-mixed',
      workspaceId: target.workspaceId,
      fileId: target.fileId,
      options: options({ pages: parsePageSelection('1-3,8,10-12') }),
    });
    assert.deepEqual(
      result.images.map((image) => image.page),
      [1, 2, 3, 8, 10, 11, 12],
    );
    assert.equal(result.metrics.runCount, 3);
    assertSequentialNames(result, 'png');
    assert.deepEqual((await readdir(target.outputDir)).sort(), [
      'page-0001.png',
      'page-0002.png',
      'page-0003.png',
      'page-0004.png',
      'page-0005.png',
      'page-0006.png',
      'page-0007.png',
    ]);
  } finally {
    await target.cleanup();
  }
});

test('accepts a supplied password', async () => {
  const target = await harness(multiPagePdf(1));
  try {
    const result = await dispatcher(target).convert({
      requestId: 'req-password',
      workspaceId: target.workspaceId,
      fileId: target.fileId,
      options: options({ password: 'correct horse' }),
    });
    assert.equal(result.images.length, 1);
  } finally {
    await target.cleanup();
  }
});

test('maps a wrong password onto a stable reason', async () => {
  const target = await harness(multiPagePdf(1));
  try {
    const reason = await reasonOf(
      dispatcher(target, {
        runner: fakeRunner({ exitCode: 1, stderr: 'Command Line Error: Incorrect password' }),
      }).convert({
        requestId: 'req-wrong-password',
        workspaceId: target.workspaceId,
        fileId: target.fileId,
        options: options({ password: 'wrong' }),
      }),
    );
    assert.equal(reason, ConversionError.PASSWORD_INCORRECT);
  } finally {
    await target.cleanup();
  }
});

test('rejects a corrupted document', async () => {
  const target = await harness(Buffer.from('%PDF-1.7\nnot really a pdf at all\n', 'latin1'));
  try {
    const reason = await reasonOf(
      dispatcher(target).convert({
        requestId: 'req-corrupt',
        workspaceId: target.workspaceId,
        fileId: target.fileId,
        options: options(),
      }),
    );
    assert.ok(
      [ConversionError.INVALID_PDF, ConversionError.OUTPUT_EMPTY].includes(
        reason as (typeof ConversionError)[keyof typeof ConversionError],
      ),
      `unexpected reason ${reason}`,
    );
  } finally {
    await target.cleanup();
  }
});

test('maps an engine timeout onto a stable reason', async () => {
  const target = await harness(multiPagePdf(1));
  try {
    const reason = await reasonOf(
      dispatcher(target, { runner: fakeRunner({ outcome: 'timeout', exitCode: null }) }).convert({
        requestId: 'req-timeout',
        workspaceId: target.workspaceId,
        fileId: target.fileId,
        options: options(),
      }),
    );
    assert.equal(reason, ConversionError.CONVERSION_TIMEOUT);
  } finally {
    await target.cleanup();
  }
});

test('maps an aborted run onto a stable reason', async () => {
  const target = await harness(multiPagePdf(1));
  try {
    const reason = await reasonOf(
      dispatcher(target, { runner: fakeRunner({ outcome: 'aborted', exitCode: null }) }).convert({
        requestId: 'req-aborted',
        workspaceId: target.workspaceId,
        fileId: target.fileId,
        options: options(),
      }),
    );
    assert.equal(reason, ConversionError.CONVERSION_CANCELLED);
  } finally {
    await target.cleanup();
  }
});

test('cancellation stops before execution and leaves the workspace recoverable', async () => {
  const target = await harness(multiPagePdf(2));
  try {
    const controller = new AbortController();
    controller.abort();
    const reason = await reasonOf(
      dispatcher(target).convert({
        requestId: 'req-cancel',
        workspaceId: target.workspaceId,
        fileId: target.fileId,
        options: options(),
        signal: controller.signal,
      }),
    );
    assert.equal(reason, ConversionError.CONVERSION_CANCELLED);

    // The workspace survives, the input is intact and no output was published.
    const input = await stat(target.workspaces.pathOf(target.fileId));
    assert.ok(input.size > 0);
    assert.deepEqual(await readdir(target.outputDir), []);

    const result = await dispatcher(target).convert({
      requestId: 'req-cancel-retry',
      workspaceId: target.workspaceId,
      fileId: target.fileId,
      options: options(),
    });
    assert.equal(result.images.length, 2);
  } finally {
    await target.cleanup();
  }
});

test('reports an empty output when the engine writes nothing', async () => {
  const target = await harness(multiPagePdf(1));
  try {
    const reason = await reasonOf(
      dispatcher(target, { runner: fakeRunner({}) }).convert({
        requestId: 'req-empty',
        workspaceId: target.workspaceId,
        fileId: target.fileId,
        options: options(),
      }),
    );
    assert.equal(reason, ConversionError.OUTPUT_EMPTY);
  } finally {
    await target.cleanup();
  }
});

test('reports a missing page when the engine skips one', async () => {
  const target = await harness(multiPagePdf(2));
  try {
    const reason = await reasonOf(
      dispatcher(target).convert({
        requestId: 'req-out-of-range',
        workspaceId: target.workspaceId,
        fileId: target.fileId,
        options: options({ pages: parsePageSelection('40-41') }),
      }),
    );
    assert.equal(reason, ConversionError.INVALID_PAGE_RANGE);
  } finally {
    await target.cleanup();
  }
});

test('reports the engine as unavailable when no adapter provides the capability', async () => {
  const target = await harness(multiPagePdf(1));
  try {
    const reason = await reasonOf(
      dispatcher(target, { engines: new EngineRegistry([]) }).convert({
        requestId: 'req-no-engine',
        workspaceId: target.workspaceId,
        fileId: target.fileId,
        options: options(),
      }),
    );
    assert.equal(reason, ConversionError.ENGINE_UNAVAILABLE);
  } finally {
    await target.cleanup();
  }
});

test('reports the engine as unavailable when the provider is not installed', async () => {
  const target = await harness(multiPagePdf(1));
  const unavailable = new (class extends NotImplementedEngineAdapter {
    constructor() {
      super('ghostscript', ['pdf.raster']);
    }
  })();
  try {
    const reason = await reasonOf(
      dispatcher(target, {
        engines: new EngineRegistry([unavailable]),
      }).convert({
        requestId: 'req-unhealthy-engine',
        workspaceId: target.workspaceId,
        fileId: target.fileId,
        options: options(),
      }),
    );
    assert.equal(reason, ConversionError.ENGINE_UNAVAILABLE);
  } finally {
    await target.cleanup();
  }
});

test('rejects unsupported options before touching an engine', async () => {
  const target = await harness(multiPagePdf(1));
  try {
    for (const bad of [
      options({ dpi: 200 as AllowedDpi }),
      options({ format: 'tiff' as AllowedFormat }),
      options({ format: 'jpeg', quality: 55 as never }),
    ]) {
      const reason = await reasonOf(
        dispatcher(target).convert({
          requestId: 'req-bad-options',
          workspaceId: target.workspaceId,
          fileId: target.fileId,
          options: bad,
        }),
      );
      assert.equal(reason, ConversionError.INVALID_OPTIONS);
    }
    assert.deepEqual(await readdir(target.outputDir), []);
  } finally {
    await target.cleanup();
  }
});

test('writes every image inside the workspace output directory only', async () => {
  const target = await harness(multiPagePdf(2));
  try {
    await dispatcher(target).convert({
      requestId: 'req-isolation',
      workspaceId: target.workspaceId,
      fileId: target.fileId,
      options: options(),
    });
    const entries = await readdir(path.join(target.root, target.workspaceId), {
      withFileTypes: true,
    });
    assert.deepEqual(
      entries.map((entry) => entry.name).sort(),
      ['outputs', 'quarantine', 'tmp', 'uploads'],
    );
    assert.deepEqual(await readdir(path.join(target.root, target.workspaceId, 'tmp')), []);
    const names = await readdir(target.outputDir);
    assert.ok(names.every((name) => /^page-\d{4}\.png$/.test(name)));
  } finally {
    await target.cleanup();
  }
});
