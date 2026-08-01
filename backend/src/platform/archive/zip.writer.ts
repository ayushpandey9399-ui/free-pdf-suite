/**
 * Stored ZIP writer.
 * Responsibility: pack a fixed list of files into one ZIP archive on disk, and read the entry
 * names back out of a finished archive so the result can be verified before it is exposed.
 *
 * Architecture Notes
 * The platform packages artefacts that are already compressed (PNG and JPEG), so this writer
 * deliberately implements only the stored method: deflating a JPEG spends CPU on a worker to
 * make the payload slightly larger, and CPU on a worker is the scarce resource of this service.
 * It is written by hand rather than pulled from a dependency because an archiver is a small,
 * fully specified format and a third party one would add a streaming dependency to the trust
 * boundary that every user file passes through. Nothing here accepts a directory, a glob or a
 * client supplied name: the caller passes explicit absolute source paths plus the exact entry
 * name to store, which is what keeps "the archive contains only the generated images" a
 * property of the code. Files are streamed twice, once for the checksum and once for the
 * payload, so archive memory stays flat no matter how large a page raster becomes.
 */
import { createReadStream, createWriteStream } from 'node:fs';
import { open, stat } from 'node:fs/promises';
import { once } from 'node:events';
import type { Writable } from 'node:stream';

/** One file to pack. The entry name is what a client sees, the path is never exposed. */
export interface ZipSourceEntry {
  /** Name stored inside the archive, for example page-0001.png. */
  readonly name: string;
  /** Absolute path of the file to read. */
  readonly path: string;
}

export interface ZipWriteResult {
  readonly path: string;
  readonly sizeBytes: number;
  readonly entryCount: number;
  readonly entryNames: readonly string[];
}

/** Names allowed inside an archive this writer produces. No paths, no separators. */
const ENTRY_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

const SIGNATURE_LOCAL = 0x04034b50;
const SIGNATURE_CENTRAL = 0x02014b50;
const SIGNATURE_END = 0x06054b50;
const METHOD_STORED = 0;
/** Version 2.0, the lowest version that every extractor understands. */
const VERSION = 20;
/** Bit 11 marks the entry name as UTF-8. */
const FLAG_UTF8 = 0x0800;

const CRC_TABLE = buildCrcTable();

function buildCrcTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) === 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
}

function crc32Update(crc: number, chunk: Uint8Array): number {
  let value = crc;
  for (const byte of chunk) {
    value = (CRC_TABLE[(value ^ byte) & 0xff] as number) ^ (value >>> 8);
  }
  return value >>> 0;
}

/** CRC32 of a file, computed without holding the file in memory. */
async function crc32OfFile(filePath: string): Promise<number> {
  let crc = 0xffffffff;
  const stream = createReadStream(filePath);
  for await (const chunk of stream) crc = crc32Update(crc, chunk as Uint8Array);
  return (crc ^ 0xffffffff) >>> 0;
}

/** Write a buffer and respect back pressure, so a large archive never buffers in memory. */
async function write(target: Writable, chunk: Buffer): Promise<void> {
  if (!target.write(chunk)) await once(target, 'drain');
}

/** DOS date and time pair. A fixed timestamp keeps archives reproducible. */
const DOS_TIME = 0;
const DOS_DATE = 0x2100; // 1 January 1980, the ZIP epoch.

function localHeader(name: Buffer, crc: number, size: number): Buffer {
  const header = Buffer.alloc(30);
  header.writeUInt32LE(SIGNATURE_LOCAL, 0);
  header.writeUInt16LE(VERSION, 4);
  header.writeUInt16LE(FLAG_UTF8, 6);
  header.writeUInt16LE(METHOD_STORED, 8);
  header.writeUInt16LE(DOS_TIME, 10);
  header.writeUInt16LE(DOS_DATE, 12);
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(size, 18);
  header.writeUInt32LE(size, 22);
  header.writeUInt16LE(name.length, 26);
  header.writeUInt16LE(0, 28);
  return header;
}

function centralHeader(name: Buffer, crc: number, size: number, offset: number): Buffer {
  const header = Buffer.alloc(46);
  header.writeUInt32LE(SIGNATURE_CENTRAL, 0);
  header.writeUInt16LE(VERSION, 4);
  header.writeUInt16LE(VERSION, 6);
  header.writeUInt16LE(FLAG_UTF8, 8);
  header.writeUInt16LE(METHOD_STORED, 10);
  header.writeUInt16LE(DOS_TIME, 12);
  header.writeUInt16LE(DOS_DATE, 14);
  header.writeUInt32LE(crc, 16);
  header.writeUInt32LE(size, 20);
  header.writeUInt32LE(size, 24);
  header.writeUInt16LE(name.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(0, 38);
  header.writeUInt32LE(offset, 42);
  return header;
}

function endRecord(count: number, directorySize: number, directoryOffset: number): Buffer {
  const record = Buffer.alloc(22);
  record.writeUInt32LE(SIGNATURE_END, 0);
  record.writeUInt16LE(0, 4);
  record.writeUInt16LE(0, 6);
  record.writeUInt16LE(count, 8);
  record.writeUInt16LE(count, 10);
  record.writeUInt32LE(directorySize, 12);
  record.writeUInt32LE(directoryOffset, 16);
  record.writeUInt16LE(0, 20);
  return record;
}

/** Thrown for a caller mistake, so the caller can map it onto its own error vocabulary. */
export class ZipWriteError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = 'ZipWriteError';
  }
}

/**
 * Pack the given files into targetPath.
 * Entry order is preserved exactly as given, so the caller controls the natural sort.
 */
export async function createStoredZip(
  entries: readonly ZipSourceEntry[],
  targetPath: string,
): Promise<ZipWriteResult> {
  if (entries.length === 0) throw new ZipWriteError('An archive needs at least one entry');

  const seen = new Set<string>();
  for (const entry of entries) {
    if (!ENTRY_NAME_PATTERN.test(entry.name)) {
      throw new ZipWriteError('An archive entry name is not allowed');
    }
    if (seen.has(entry.name)) throw new ZipWriteError('An archive entry name is duplicated');
    seen.add(entry.name);
  }

  const sink = createWriteStream(targetPath, { flags: 'wx' });
  const central: Buffer[] = [];
  let offset = 0;
  const names: string[] = [];

  try {
    for (const entry of entries) {
      const info = await stat(entry.path);
      if (!info.isFile()) throw new ZipWriteError('An archive entry is not a file');
      if (info.size === 0) throw new ZipWriteError('An archive entry is empty');

      const name = Buffer.from(entry.name, 'utf8');
      const crc = await crc32OfFile(entry.path);
      const header = localHeader(name, crc, info.size);

      await write(sink, header);
      await write(sink, name);

      let written = 0;
      const source = createReadStream(entry.path);
      for await (const chunk of source) {
        const buffer = chunk as Buffer;
        written += buffer.length;
        await write(sink, buffer);
      }
      if (written !== info.size) {
        throw new ZipWriteError('An archive entry changed size while it was packed');
      }

      // The central record and its name travel together, exactly as they do locally.
      central.push(Buffer.concat([centralHeader(name, crc, info.size, offset), name]));
      offset += header.length + name.length + info.size;
      names.push(entry.name);
    }

    const directoryOffset = offset;
    let directorySize = 0;
    for (const record of central) {
      await write(sink, record);
      directorySize += record.length;
    }

    await write(sink, endRecord(central.length, directorySize, directoryOffset));

    await new Promise<void>((resolve, reject) => {
      sink.end(() => resolve());
      sink.once('error', reject);
    });
  } catch (error) {
    sink.destroy();
    throw error instanceof ZipWriteError
      ? error
      : new ZipWriteError('The archive could not be written', error);
  }

  const finished = await stat(targetPath);
  return {
    path: targetPath,
    sizeBytes: finished.size,
    entryCount: names.length,
    entryNames: Object.freeze(names),
  };
}

/**
 * Entry names of a finished archive, read from its central directory.
 * Used to verify an archive before it is ever handed to a client.
 */
export async function readStoredZipEntryNames(archivePath: string): Promise<string[]> {
  const handle = await open(archivePath, 'r');
  try {
    const info = await handle.stat();
    if (info.size < 22) throw new ZipWriteError('The archive is too small to be valid');

    // The end record is the last 22 bytes when there is no archive comment.
    const tailLength = Math.min(info.size, 22 + 0xffff);
    const tail = Buffer.alloc(tailLength);
    await handle.read(tail, 0, tailLength, info.size - tailLength);

    let endAt = -1;
    for (let index = tail.length - 22; index >= 0; index -= 1) {
      if (tail.readUInt32LE(index) === SIGNATURE_END) {
        endAt = index;
        break;
      }
    }
    if (endAt < 0) throw new ZipWriteError('The archive has no end record');

    const count = tail.readUInt16LE(endAt + 10);
    const directorySize = tail.readUInt32LE(endAt + 12);
    const directoryOffset = tail.readUInt32LE(endAt + 16);
    if (directoryOffset + directorySize > info.size) {
      throw new ZipWriteError('The archive directory is out of bounds');
    }

    const directory = Buffer.alloc(directorySize);
    await handle.read(directory, 0, directorySize, directoryOffset);

    const names: string[] = [];
    let cursor = 0;
    for (let index = 0; index < count; index += 1) {
      if (cursor + 46 > directory.length) throw new ZipWriteError('The archive directory is truncated');
      if (directory.readUInt32LE(cursor) !== SIGNATURE_CENTRAL) {
        throw new ZipWriteError('The archive directory is malformed');
      }
      const nameLength = directory.readUInt16LE(cursor + 28);
      const extraLength = directory.readUInt16LE(cursor + 30);
      const commentLength = directory.readUInt16LE(cursor + 32);
      names.push(directory.subarray(cursor + 46, cursor + 46 + nameLength).toString('utf8'));
      cursor += 46 + nameLength + extraLength + commentLength;
    }
    return names;
  } finally {
    await handle.close().catch(() => undefined);
  }
}
