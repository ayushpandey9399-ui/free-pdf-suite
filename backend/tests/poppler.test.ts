/**
 * Phase 6 Poppler adapter tests.
 * Cover binary discovery, capability detection, request validation, argument planning, output
 * parsing, pdfinfo parsing, error normalisation, health probing and registry integration.
 */
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile, chmod, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { EngineErrorCode, isEngineError } from '../src/platform/engines/engine.errors.js';
import { EngineRegistry } from '../src/platform/engines/engine.registry.js';
import { createEngineRegistry } from '../src/platform/engines/index.js';
import type { ProcessRunRequest, ProcessRunResult, ProcessRunner } from '../src/platform/process/process.types.js';
import {
  PopplerAdapter,
  PopplerBinaryLocator,
  PopplerHealthProbe,
  buildInfoRunRequest,
  buildRasterArgs,
  buildRasterRunRequest,
  classifyPopplerStderr,
  collectRasterOutput,
  detectPopplerCapabilities,
  extractVersion,
  parseDocumentInfo,
  parsePageNumber,
  supportsFormat,
  validateRasterRequest,
} from '../src/platform/engines/poppler/index.js';
import type { PopplerRasterRequest } from '../src/platform/engines/poppler/index.js';

const HELP_OUTPUT = `
pdftoppm version 24.02.0
Usage: pdftoppm [options] [PDF-file [PPM-file-prefix]]
  -f <int>          : first page to print
  -l <int>          : last page to print
  -r <fp>           : resolution, in DPI (default is 150)
  -x <int>          : x-coordinate of the crop area top left corner
  -y <int>          : y-coordinate of the crop area top left corner
  -W <int>          : width of crop area in pixels
  -H <int>          : height of crop area in pixels
  -mono             : generate a monochrome PBM file
  -gray             : generate a grayscale PGM file
  -png              : generate a PNG file
  -jpeg             : generate a JPEG file
  -jpegopt <string> : jpeg options
  -tiff             : generate a TIFF file
  -opw <string>     : owner password
  -upw <string>     : user password
`;

function ok(overrides: Partial<PopplerRasterRequest> = {}): PopplerRasterRequest {
  return {
    inputPath: '/ws/abc/input/doc.pdf',
    outputDir: '/ws/abc/output',
    outputPrefix: 'page',
    format: 'png',
    dpi: 150,
    timeoutMs: 30_000,
    ...overrides,
  };
}

function result(overrides: Partial<ProcessRunResult> = {}): ProcessRunResult {
  return {
    outcome: 'completed',
    exitCode: 0,
    signal: null,
    stdout: '',
    stderr: '',
    stdoutTruncated: false,
    stderrTruncated: false,
    durationMs: 12,
    usage: { cpuMs: 0, peakRssBytes: 0, samples: 0 },
    invocation: { binary: '/usr/bin/pdftoppm', args: [] },
    ...overrides,
  };
}

class FakeRunner implements ProcessRunner {
  public readonly requests: ProcessRunRequest[] = [];
  constructor(private readonly responder: (request: ProcessRunRequest) => ProcessRunResult) {}
  public async run(request: ProcessRunRequest): Promise<ProcessRunResult> {
    this.requests.push(request);
    return this.responder(request);
  }
}

function healthyRunner(): FakeRunner {
  return new FakeRunner((request) =>
    request.args.includes('-v')
      ? result({ stderr: 'pdftoppm version 24.02.0' })
      : result({ stdout: HELP_OUTPUT }),
  );
}

// ---------------------------------------------------------------- binary discovery

test('locator resolves an executable file from PATH', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'poppler-bin-'));
  try {
    const binary = path.join(dir, 'pdftoppm');
    await writeFile(binary, '#!/bin/sh\n');
    await chmod(binary, 0o755);
    const locator = new PopplerBinaryLocator(dir);
    assert.equal(await locator.find('pdftoppm'), binary);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('locator ignores a non executable file and a directory', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'poppler-bin-'));
  try {
    await writeFile(path.join(dir, 'pdftoppm'), 'x');
    await chmod(path.join(dir, 'pdftoppm'), 0o644);
    await mkdir(path.join(dir, 'pdfinfo'));
    const locator = new PopplerBinaryLocator(dir);
    assert.equal(await locator.find('pdftoppm'), undefined);
    assert.equal(await locator.find('pdfinfo'), undefined);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('locator ignores relative PATH entries', async () => {
  const locator = new PopplerBinaryLocator('./bin:relative/dir:/nonexistent-poppler-abs');
  assert.equal(await locator.find('pdftocairo'), undefined);
});

test('locator require throws ENGINE_NOT_INSTALLED when missing', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'poppler-empty-'));
  try {
    const locator = new PopplerBinaryLocator(dir);
    await assert.rejects(
      () => locator.require('pdftocairo'),
      (error: unknown) =>
        isEngineError(error) && error.code === EngineErrorCode.ENGINE_NOT_INSTALLED,
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('locator caches a resolved path', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'poppler-cache-'));
  try {
    const binary = path.join(dir, 'pdfinfo');
    await writeFile(binary, '#!/bin/sh\n');
    await chmod(binary, 0o755);
    const locator = new PopplerBinaryLocator(dir);
    assert.equal(await locator.find('pdfinfo'), binary);
    await rm(binary);
    assert.equal(await locator.find('pdfinfo'), binary, 'cached after removal');
    locator.reset();
    assert.equal(await locator.find('pdfinfo'), undefined);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------- capabilities

test('capability detection reads every flag from help output', () => {
  const caps = detectPopplerCapabilities(HELP_OUTPUT);
  assert.deepEqual([...caps.formats], ['png', 'jpeg', 'tiff']);
  assert.equal(caps.pageSelection, true);
  assert.equal(caps.resolution, true);
  assert.equal(caps.grayscale, true);
  assert.equal(caps.monochrome, true);
  assert.equal(caps.cropping, true);
  assert.equal(caps.password, true);
});

test('capability detection reports a minimal build honestly', () => {
  const caps = detectPopplerCapabilities('Usage: pdftoppm\n  -png : png output\n');
  assert.deepEqual([...caps.formats], ['png']);
  assert.equal(caps.pageSelection, false);
  assert.equal(caps.cropping, false);
  assert.equal(supportsFormat(caps, 'tiff'), false);
  assert.equal(supportsFormat(caps, 'png'), true);
});

test('version extraction returns digits and dots only', () => {
  assert.equal(extractVersion('pdftoppm version 24.02.0\nCopyright'), '24.02.0');
  assert.equal(extractVersion('no version here'), '');
});

// ---------------------------------------------------------------- validation

test('validation accepts a well formed request', () => {
  assert.doesNotThrow(() => validateRasterRequest(ok()));
});

test('validation rejects relative paths', () => {
  for (const bad of [{ inputPath: 'doc.pdf' }, { outputDir: 'out' }]) {
    assert.throws(
      () => validateRasterRequest(ok(bad)),
      (error: unknown) => isEngineError(error) && error.code === EngineErrorCode.ENGINE_INVALID_REQUEST,
    );
  }
});

test('validation rejects an unsafe output prefix', () => {
  for (const prefix of ['../page', 'a/b', 'page name', '', 'p'.repeat(65)]) {
    assert.throws(() => validateRasterRequest(ok({ outputPrefix: prefix })));
  }
});

test('validation bounds dpi', () => {
  assert.throws(() => validateRasterRequest(ok({ dpi: 0 })));
  assert.throws(() => validateRasterRequest(ok({ dpi: 5_000 })));
  assert.throws(() => validateRasterRequest(ok({ dpi: 150.5 })));
});

test('validation rejects an inverted page range', () => {
  assert.throws(() => validateRasterRequest(ok({ firstPage: 5, lastPage: 2 })));
  assert.throws(() => validateRasterRequest(ok({ firstPage: 0 })));
});

test('validation rejects grayscale together with monochrome', () => {
  assert.throws(() => validateRasterRequest(ok({ grayscale: true, monochrome: true })));
});

test('validation bounds jpeg quality and crop geometry', () => {
  assert.throws(() => validateRasterRequest(ok({ format: 'jpeg', jpegQuality: 0 })));
  assert.throws(() => validateRasterRequest(ok({ format: 'jpeg', jpegQuality: 101 })));
  assert.throws(() => validateRasterRequest(ok({ crop: { x: 0, y: 0, width: 0, height: 10 } })));
  assert.throws(() => validateRasterRequest(ok({ crop: { x: -1, y: 0, width: 10, height: 10 } })));
});

test('validation rejects a non positive timeout and a null byte password', () => {
  assert.throws(() => validateRasterRequest(ok({ timeoutMs: 0 })));
  assert.throws(() => validateRasterRequest(ok({ password: 'a\u0000b' })));
});

// ---------------------------------------------------------------- planning

test('argument vector has a fixed order and ends with input then output stem', () => {
  const args = buildRasterArgs(ok({ firstPage: 2, lastPage: 4 }));
  assert.deepEqual(args, [
    '-png',
    '-r',
    '150',
    '-f',
    '2',
    '-l',
    '4',
    '/ws/abc/input/doc.pdf',
    '/ws/abc/output/page',
  ]);
});

test('argument vector carries format, quality, colour and crop flags', () => {
  const args = buildRasterArgs(
    ok({ format: 'jpeg', jpegQuality: 82, grayscale: true, crop: { x: 1, y: 2, width: 30, height: 40 } }),
  );
  assert.equal(args[0], '-jpeg');
  assert.ok(args.includes('-gray'));
  assert.deepEqual(args.slice(args.indexOf('-jpegopt'), args.indexOf('-jpegopt') + 2), [
    '-jpegopt',
    'quality=82',
  ]);
  assert.deepEqual(args.slice(args.indexOf('-x'), args.indexOf('-x') + 8), [
    '-x', '1', '-y', '2', '-W', '30', '-H', '40',
  ]);
});

test('password is passed as an argument value and never in the label', () => {
  const request = buildRasterRunRequest('/usr/bin/pdftoppm', ok({ password: 's3cret' }));
  const index = request.args.indexOf('-upw');
  assert.equal(request.args[index + 1], 's3cret');
  assert.equal(request.label?.includes('s3cret'), false);
});

test('run request runs in the output directory with an empty environment', () => {
  const request = buildRasterRunRequest('/usr/bin/pdftoppm', ok());
  assert.equal(request.binary, '/usr/bin/pdftoppm');
  assert.equal(request.cwd, '/ws/abc/output');
  assert.deepEqual(request.env, {});
  assert.equal(request.timeoutMs, 30_000);
  assert.equal(request.label, 'poppler.pdftoppm');
});

test('info run request appends the password before the input path', () => {
  const request = buildInfoRunRequest('/usr/bin/pdfinfo', {
    inputPath: '/ws/abc/input/doc.pdf',
    cwd: '/ws/abc',
    timeoutMs: 5_000,
    password: 'pw',
  });
  assert.deepEqual(request.args, ['-upw', 'pw', '/ws/abc/input/doc.pdf']);
  assert.equal(request.label, 'poppler.pdfinfo');
});

test('info run request rejects a relative input path', () => {
  assert.throws(() =>
    buildInfoRunRequest('/usr/bin/pdfinfo', { inputPath: 'doc.pdf', cwd: '/ws', timeoutMs: 1 }),
  );
});

// ---------------------------------------------------------------- output parsing

test('page number parsing handles the Poppler suffix forms', () => {
  assert.equal(parsePageNumber('page-01.png', 'page'), 1);
  assert.equal(parsePageNumber('page-007.png', 'page'), 7);
  assert.equal(parsePageNumber('page.png', 'page'), undefined);
  assert.equal(parsePageNumber('other-1.png', 'page'), undefined);
});

test('output collection lists matching files, sizes and pages', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'poppler-out-'));
  try {
    await writeFile(path.join(dir, 'page-1.png'), 'aaaa');
    await writeFile(path.join(dir, 'page-2.png'), 'bbbbbb');
    await writeFile(path.join(dir, 'page-1.txt'), 'ignored');
    await writeFile(path.join(dir, 'other-1.png'), 'ignored');
    const output = await collectRasterOutput({ outputDir: dir, outputPrefix: 'page', format: 'png' });
    assert.equal(output.pageCount, 2);
    assert.equal(output.totalBytes, 10);
    assert.deepEqual(output.files.map((file) => file.page), [1, 2]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('output collection reports missing expected pages', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'poppler-out-'));
  try {
    await writeFile(path.join(dir, 'page-1.png'), 'a');
    const output = await collectRasterOutput({
      outputDir: dir,
      outputPrefix: 'page',
      format: 'png',
      expectedPages: [1, 2, 3],
    });
    assert.deepEqual([...output.missingPages], [2, 3]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('output collection returns empty for a missing directory', async () => {
  const output = await collectRasterOutput({
    outputDir: '/nonexistent-poppler-dir-xyz',
    outputPrefix: 'page',
    format: 'png',
  });
  assert.equal(output.pageCount, 0);
  assert.equal(output.totalBytes, 0);
});

test('pdfinfo parsing reads pages, encryption, size and version', () => {
  const info = parseDocumentInfo(
    ['Title:          Doc', 'Pages:          12', 'Encrypted:      no', 'Page size:      595.28 x 841.89 pts (A4)', 'PDF version:    1.7'].join('\n'),
  );
  assert.equal(info.pages, 12);
  assert.equal(info.encrypted, false);
  assert.equal(info.pageWidthPt, 595.28);
  assert.equal(info.pageHeightPt, 841.89);
  assert.equal(info.pdfVersion, '1.7');
});

test('pdfinfo parsing detects an encrypted document and ignores unknown keys', () => {
  const info = parseDocumentInfo('Pages: 3\nEncrypted: yes (print:no)\nSomethingNew: value\n');
  assert.equal(info.encrypted, true);
  assert.equal(info.pages, 3);
});

// ---------------------------------------------------------------- error mapping

test('stderr classification maps the known Poppler dialects', () => {
  const cases: readonly [string, string][] = [
    ['Command Line Error: Incorrect password', EngineErrorCode.INPUT_ENCRYPTED],
    ['Error: May not be a PDF file (continuing anyway)', EngineErrorCode.INPUT_NOT_SUPPORTED],
    ['Error: PDF file is damaged - attempting to reconstruct xref table', EngineErrorCode.INPUT_CORRUPT],
    ['Error: Wrong page range given', EngineErrorCode.INPUT_PAGE_OUT_OF_RANGE],
    ['Error: Out of memory', EngineErrorCode.ENGINE_RESOURCE_EXHAUSTED],
    ['Error: Unrecognized option "-tiff"', EngineErrorCode.ENGINE_UNSUPPORTED_OPERATION],
  ];
  for (const [stderr, expected] of cases) {
    assert.equal(classifyPopplerStderr(stderr)?.code, expected, stderr);
  }
  assert.equal(classifyPopplerStderr('some unrelated noise'), undefined);
});

test('timeout and abort outcomes map before stderr inspection', async () => {
  const adapter = new PopplerAdapter();
  await assert.rejects(
    () => adapter.parse(result({ outcome: 'timeout', exitCode: null }), ok()),
    (error: unknown) => isEngineError(error) && error.code === EngineErrorCode.ENGINE_TIMEOUT,
  );
  await assert.rejects(
    () => adapter.parse(result({ outcome: 'aborted', exitCode: null }), ok()),
    (error: unknown) => isEngineError(error) && error.code === EngineErrorCode.ENGINE_ABORTED,
  );
});

test('engine errors never carry raw stderr text', async () => {
  const adapter = new PopplerAdapter();
  await assert.rejects(
    () => adapter.parse(result({ outcome: 'failed', exitCode: 1, stderr: 'Error: /secret/path/doc.pdf is damaged' }), ok()),
    (error: unknown) => isEngineError(error) && !error.message.includes('/secret/path'),
  );
});

// ---------------------------------------------------------------- adapter behaviour

test('parse throws ENGINE_EMPTY_OUTPUT when a successful run wrote nothing', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'poppler-empty-out-'));
  try {
    const adapter = new PopplerAdapter();
    await assert.rejects(
      () => adapter.parse(result(), ok({ outputDir: dir })),
      (error: unknown) => isEngineError(error) && error.code === EngineErrorCode.ENGINE_EMPTY_OUTPUT,
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('parse throws page out of range when a requested page is missing', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'poppler-partial-'));
  try {
    await writeFile(path.join(dir, 'page-1.png'), 'a');
    const adapter = new PopplerAdapter();
    await assert.rejects(
      () => adapter.parse(result(), ok({ outputDir: dir, firstPage: 1, lastPage: 2 })),
      (error: unknown) => isEngineError(error) && error.code === EngineErrorCode.INPUT_PAGE_OUT_OF_RANGE,
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('parse returns the verified output for a good run', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'poppler-good-'));
  try {
    await writeFile(path.join(dir, 'page-1.png'), 'aaa');
    const adapter = new PopplerAdapter();
    const output = await adapter.parse(result(), ok({ outputDir: dir, firstPage: 1, lastPage: 1 }));
    assert.equal(output.pageCount, 1);
    assert.equal(output.format, 'png');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('plan rejects a format the installed build lacks', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'poppler-plan-'));
  try {
    const binary = path.join(dir, 'pdftoppm');
    await writeFile(binary, '#!/bin/sh\n');
    await chmod(binary, 0o755);
    const runner = new FakeRunner((request) =>
      request.args.includes('-v')
        ? result({ stderr: 'pdftoppm version 22.0.0' })
        : result({ stdout: 'Usage: pdftoppm\n  -png : png\n  -r <fp> : resolution\n' }),
    );
    const adapter = new PopplerAdapter({ locator: new PopplerBinaryLocator(dir), runner });
    await assert.rejects(
      () => adapter.plan(ok({ format: 'tiff' })),
      (error: unknown) =>
        isEngineError(error) && error.code === EngineErrorCode.ENGINE_UNSUPPORTED_OPERATION,
    );
    const planned = await adapter.plan(ok());
    assert.equal(planned.binary, binary);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('plan throws ENGINE_NOT_INSTALLED when pdftoppm is absent', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'poppler-none-'));
  try {
    const adapter = new PopplerAdapter({ locator: new PopplerBinaryLocator(dir) });
    await assert.rejects(
      () => adapter.plan(ok()),
      (error: unknown) => isEngineError(error) && error.code === EngineErrorCode.ENGINE_NOT_INSTALLED,
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('execute plans, runs and parses in one call', async () => {
  const binDir = await mkdtemp(path.join(tmpdir(), 'poppler-exec-bin-'));
  const outDir = await mkdtemp(path.join(tmpdir(), 'poppler-exec-out-'));
  try {
    const binary = path.join(binDir, 'pdftoppm');
    await writeFile(binary, '#!/bin/sh\n');
    await chmod(binary, 0o755);
    const runner = new FakeRunner((request) => {
      if (request.args.includes('-v')) return result({ stderr: 'pdftoppm version 24.02.0' });
      if (request.args.includes('-h')) return result({ stdout: HELP_OUTPUT });
      return result();
    });
    await writeFile(path.join(outDir, 'page-1.png'), 'aa');
    const adapter = new PopplerAdapter({ locator: new PopplerBinaryLocator(binDir), runner });
    const output = await adapter.execute(ok({ outputDir: outDir }), runner);
    assert.equal(output.pageCount, 1);
    assert.ok(runner.requests.some((request) => request.label === 'poppler.pdftoppm'));
  } finally {
    await rm(binDir, { recursive: true, force: true });
    await rm(outDir, { recursive: true, force: true });
  }
});

test('inspect parses pdfinfo output and rejects a zero page document', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'poppler-inspect-'));
  try {
    const binary = path.join(dir, 'pdfinfo');
    await writeFile(binary, '#!/bin/sh\n');
    await chmod(binary, 0o755);
    const locator = new PopplerBinaryLocator(dir);
    const good = new FakeRunner(() => result({ stdout: 'Pages: 4\nEncrypted: no\n' }));
    const adapter = new PopplerAdapter({ locator });
    const info = await adapter.inspect(
      { inputPath: '/ws/a/doc.pdf', cwd: '/ws/a', timeoutMs: 5_000 },
      good,
    );
    assert.equal(info.pages, 4);

    const empty = new FakeRunner(() => result({ stdout: 'Pages: 0\n' }));
    await assert.rejects(
      () => adapter.inspect({ inputPath: '/ws/a/doc.pdf', cwd: '/ws/a', timeoutMs: 5_000 }, empty),
      (error: unknown) => isEngineError(error) && error.code === EngineErrorCode.INPUT_CORRUPT,
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------- health

test('health reports installed with a version and build capabilities', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'poppler-health-'));
  try {
    for (const name of ['pdftoppm', 'pdfinfo']) {
      const binary = path.join(dir, name);
      await writeFile(binary, '#!/bin/sh\n');
      await chmod(binary, 0o755);
    }
    const runner = healthyRunner();
    const probe = new PopplerHealthProbe({ locator: new PopplerBinaryLocator(dir) });
    const report = await probe.check(runner);
    assert.equal(report.installed, true);
    assert.equal(report.version, '24.02.0');
    assert.equal(report.binaries['pdftoppm'], path.join(dir, 'pdftoppm'));
    assert.deepEqual([...report.build.formats], ['png', 'jpeg', 'tiff']);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('health reports not installed with a safe detail when the binary is missing', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'poppler-health-none-'));
  try {
    const probe = new PopplerHealthProbe({ locator: new PopplerBinaryLocator(dir) });
    const report = await probe.check(healthyRunner());
    assert.equal(report.installed, false);
    assert.equal(report.version, '');
    assert.ok((report.detail ?? '').includes('pdftoppm'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('health caches within the cache window and reprobes after reset', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'poppler-health-cache-'));
  try {
    const binary = path.join(dir, 'pdftoppm');
    await writeFile(binary, '#!/bin/sh\n');
    await chmod(binary, 0o755);
    const runner = healthyRunner();
    const probe = new PopplerHealthProbe({ locator: new PopplerBinaryLocator(dir) });
    await probe.check(runner);
    const afterFirst = runner.requests.length;
    await probe.check(runner);
    assert.equal(runner.requests.length, afterFirst, 'second check used the cache');
    probe.reset();
    await probe.check(runner);
    assert.ok(runner.requests.length > afterFirst);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('adapter health without a runner reports the missing probe honestly', async () => {
  const report = await new PopplerAdapter().health();
  assert.equal(report.installed, false);
  assert.equal(report.engineId, 'poppler');
});

// ---------------------------------------------------------------- registry

test('registry rejects duplicate engine ids', () => {
  const adapter = new PopplerAdapter() as never;
  assert.throws(() => new EngineRegistry([adapter, adapter]));
});

test('registry resolves poppler and lists capability providers', () => {
  const runner = healthyRunner();
  const registry = createEngineRegistry(runner);
  assert.equal(registry.size(), 6);
  assert.equal(registry.has('poppler'), true);
  assert.equal(registry.require('poppler').id, 'poppler');
  const rasterProviders = registry.providersOf('pdf.raster').map((adapter) => adapter.id);
  assert.ok(rasterProviders.includes('poppler'));
  assert.ok(rasterProviders.includes('ghostscript'));
});

test('registry require throws for an unknown engine and healthAll never rejects', async () => {
  const registry = createEngineRegistry(healthyRunner());
  assert.throws(
    () => registry.require('unknown' as never),
    (error: unknown) => isEngineError(error) && error.code === EngineErrorCode.ENGINE_NOT_INSTALLED,
  );
  const reports = await registry.healthAll();
  assert.equal(reports.length, 6);
  assert.deepEqual(
    reports.map((report) => report.engineId),
    ['ghostscript', 'imagemagick', 'libreoffice', 'poppler', 'qpdf', 'tesseract'],
  );
});

test('reserved engines stay unimplemented but compliant', async () => {
  const registry = createEngineRegistry(healthyRunner());
  const ghostscript = registry.require('ghostscript');
  const health = await ghostscript.health();
  assert.equal(health.installed, false);
  assert.throws(
    () => ghostscript.validate(undefined as never),
    (error: unknown) =>
      isEngineError(error) && error.code === EngineErrorCode.ENGINE_UNSUPPORTED_OPERATION,
  );
});
