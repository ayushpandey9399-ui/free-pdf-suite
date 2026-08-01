/**
 * Client for the server side PDF to Images tool.
 *
 * Rasterising a PDF in the browser cost one canvas per page and fell over on long or heavy
 * documents, so the work now runs on the API and this module is the only place that knows the
 * wire format. It stays free of React and of the DOM so the validation, the naming and the error
 * wording can be reasoned about, and tested, on their own.
 */

export const PDF_TO_IMAGES_ENDPOINT = "https://api.freepdfhub.in/v1/tools/pdf-to-images/jobs";

/** Root the relative download link returned by the API is resolved against. */
export const PDF_TO_IMAGES_API_ORIGIN = "https://api.freepdfhub.in";

/** Server side limit for this tool, 25 MB. */
export const PDF_TO_IMAGES_MAX_BYTES = 25 * 1024 * 1024;

/** Client side request timeout for the conversion, 150 seconds. */
export const PDF_TO_IMAGES_TIMEOUT_MS = 150_000;

export const PDF_TO_IMAGES_TIMEOUT_MESSAGE =
  "This file is taking too long. Please try a smaller PDF or fewer pages.";

/** Densities the API accepts. Anything else is refused before an upload starts. */
export const PDF_TO_IMAGES_DPI = [72, 150, 300, 600] as const;
export type PdfToImagesDpi = (typeof PDF_TO_IMAGES_DPI)[number];

/** JPEG quality steps the API accepts. */
export const PDF_TO_IMAGES_QUALITY = [70, 80, 90, 95] as const;
export type PdfToImagesQuality = (typeof PDF_TO_IMAGES_QUALITY)[number];

export type PdfToImagesFormat = "png" | "jpg";

export interface PdfToImagesRequest {
  readonly file: File;
  readonly format: PdfToImagesFormat;
  readonly dpi: PdfToImagesDpi;
  readonly quality: PdfToImagesQuality;
  /** Page expression such as "1-3,8". Empty or omitted means every page. */
  readonly pages?: string;
}

/** What the API hands back once the images exist and a download link has been minted. */
export interface PdfToImagesReady {
  readonly imageCount: number;
  readonly url: string;
  readonly filename: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly kind: "file" | "archive";
}

/** Progress of the two transfers, each between 0 and 100. */
export interface PdfToImagesProgress {
  readonly phase: "uploading" | "converting" | "downloading";
  readonly percent: number | null;
}

export type ValidationResult = { ok: true } | { ok: false; message: string };

/** The first five bytes of every valid PDF spell "%PDF-". */
export function hasPdfMagic(header: Uint8Array): boolean {
  const magic = [0x25, 0x50, 0x44, 0x46, 0x2d];
  if (header.length < magic.length) return false;
  return magic.every((b, i) => header[i] === b);
}

/**
 * Client side gate that runs before any upload starts.
 * `header` is the first five bytes of the file.
 */
export function validatePdfSelection(input: {
  name: string;
  size: number;
  header: Uint8Array;
}): ValidationResult {
  const { name, size, header } = input;
  if (size === 0) {
    return { ok: false, message: "That file is empty. Please pick a PDF with content in it." };
  }
  if (!/\.pdf$/i.test(name)) {
    return { ok: false, message: "Please select a PDF file. Only .pdf files can be converted to images." };
  }
  if (size > PDF_TO_IMAGES_MAX_BYTES) {
    return { ok: false, message: "That file is over our 25 MB limit for this tool." };
  }
  if (!hasPdfMagic(header)) {
    return { ok: false, message: "That file does not look like a real PDF, so we did not upload it." };
  }
  return { ok: true };
}

/** Page expressions are checked here so an obvious typo never costs an upload. */
export function validatePageExpression(expression: string): ValidationResult {
  const trimmed = expression.trim();
  if (trimmed.length === 0) return { ok: true };
  if (!/^[0-9]+(\s*-\s*[0-9]+)?(\s*,\s*[0-9]+(\s*-\s*[0-9]+)?)*$/.test(trimmed)) {
    return { ok: false, message: 'Use page numbers like "1", "2-5" or "1,4-6".' };
  }
  for (const group of trimmed.split(",")) {
    const [start, end] = group.split("-").map((part) => Number(part.trim()));
    if (!Number.isFinite(start) || start < 1) {
      return { ok: false, message: "Page numbers start at 1." };
    }
    if (end !== undefined && (!Number.isFinite(end) || end < start)) {
      return { ok: false, message: "In a page range the second number must not be smaller than the first." };
    }
  }
  return { ok: true };
}

/** Maps an HTTP status, or a network failure, to friendly English. */
export function messageForStatus(status: number | "network"): string {
  switch (status) {
    case 400:
      return "We could not read those settings. Please check the page range and try again.";
    case 410:
      return "That download link has expired. Please convert the file again.";
    case 413:
      return "This file is larger than 25 MB.";
    case 415:
      return "That file is not a PDF we can read.";
    case 422:
      return "We could not convert this PDF. It may be scanned, protected or damaged.";
    case 429:
      return "Too many requests. Please wait a minute and try again.";
    case 503:
      return "Our server is busy right now. Please try again in a minute.";
    default:
      return "Something went wrong. Please try again.";
  }
}

/** True when the error state should offer a link to the Unlock PDF tool. */
export function shouldOfferUnlockLink(status: number | "network"): boolean {
  return status === 422;
}

/** Absolute URL for a download path the API returned. */
export function absoluteDownloadUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `${PDF_TO_IMAGES_API_ORIGIN}${url}`;
}

/** foo.pdf becomes foo-images.zip or foo-page-0001.png, depending on what came back. */
export function outputNameFor(pdfName: string, ready: PdfToImagesReady): string {
  const base = pdfName.replace(/\.pdf$/i, "") || "document";
  return ready.kind === "archive" ? `${base}-images.zip` : `${base}-${ready.filename}`;
}

/** Thrown so the UI can map a failure onto its own copy without parsing a message. */
export class PdfToImagesError extends Error {
  public readonly status: number | "network";
  constructor(status: number | "network", message?: string) {
    super(message ?? messageForStatus(status));
    this.name = "PdfToImagesError";
    this.status = status;
  }
}

function buildForm(request: PdfToImagesRequest): FormData {
  const form = new FormData();
  // Fields come before the file so the server can reject bad options without reading the body.
  form.append("format", request.format);
  form.append("dpi", String(request.dpi));
  form.append("quality", String(request.quality));
  const pages = request.pages?.trim();
  if (pages !== undefined && pages.length > 0) form.append("pages", pages);
  form.append("file", request.file, request.file.name);
  return form;
}

/**
 * Start a conversion and resolve once the API has produced the images and a download link.
 * XMLHttpRequest is used rather than fetch because it is the only way to observe upload
 * progress, which is the part of this request a user actually waits on.
 */
export function requestPdfToImages(
  request: PdfToImagesRequest,
  handlers: {
    readonly onProgress?: (progress: PdfToImagesProgress) => void;
    readonly signal?: AbortSignal;
  } = {},
): Promise<PdfToImagesReady> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", PDF_TO_IMAGES_ENDPOINT, true);
    xhr.responseType = "json";
    xhr.timeout = PDF_TO_IMAGES_TIMEOUT_MS;

    const abort = (): void => xhr.abort();
    handlers.signal?.addEventListener("abort", abort, { once: true });
    const done = (): void => handlers.signal?.removeEventListener("abort", abort);

    xhr.upload.onprogress = (event) => {
      handlers.onProgress?.({
        phase: "uploading",
        percent: event.lengthComputable ? (event.loaded / event.total) * 100 : null,
      });
    };
    xhr.upload.onload = () => handlers.onProgress?.({ phase: "converting", percent: null });

    xhr.onerror = () => {
      done();
      reject(new PdfToImagesError("network"));
    };
    xhr.ontimeout = () => {
      done();
      reject(new PdfToImagesError("network", PDF_TO_IMAGES_TIMEOUT_MESSAGE));
    };
    xhr.onabort = () => {
      done();
      reject(new DOMException("Conversion cancelled", "AbortError"));
    };
    xhr.onload = () => {
      done();
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new PdfToImagesError(xhr.status));
        return;
      }
      const ready = readReady(xhr.response);
      if (ready === undefined) {
        reject(new PdfToImagesError(500));
        return;
      }
      resolve(ready);
    };

    xhr.send(buildForm(request));
  });
}

/** The response is only trusted once every field the UI depends on is present. */
export function readReady(payload: unknown): PdfToImagesReady | undefined {
  if (typeof payload !== "object" || payload === null) return undefined;
  const body = payload as Record<string, unknown>;
  const download = body["download"];
  if (typeof download !== "object" || download === null) return undefined;
  const d = download as Record<string, unknown>;
  const url = d["url"];
  const filename = d["filename"];
  const contentType = d["contentType"];
  const kind = d["kind"];
  const sizeBytes = d["sizeBytes"];
  const imageCount = body["imageCount"];
  if (typeof url !== "string" || url.length === 0) return undefined;
  if (typeof filename !== "string" || typeof contentType !== "string") return undefined;
  if (kind !== "file" && kind !== "archive") return undefined;
  return {
    imageCount: typeof imageCount === "number" ? imageCount : 1,
    url,
    filename,
    contentType,
    sizeBytes: typeof sizeBytes === "number" ? sizeBytes : 0,
    kind,
  };
}

/**
 * Fetch the finished artefact. The link is single use on the server, so this runs once, right
 * after the conversion, and the blob is what the success screen saves.
 */
export async function fetchPdfToImagesResult(
  ready: PdfToImagesReady,
  handlers: { readonly onProgress?: (percent: number | null) => void; readonly signal?: AbortSignal } = {},
): Promise<Blob> {
  const response = await fetch(absoluteDownloadUrl(ready.url), {
    method: "GET",
    signal: handlers.signal,
  }).catch(() => {
    throw new PdfToImagesError("network");
  });
  if (!response.ok) throw new PdfToImagesError(response.status);

  const body = response.body;
  const total = ready.sizeBytes;
  if (body === null || total === 0) {
    handlers.onProgress?.(null);
    return response.blob();
  }

  const reader = body.getReader();
  const chunks: BlobPart[] = [];
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value as BlobPart);
    loaded += value.byteLength;
    handlers.onProgress?.(Math.min(100, (loaded / total) * 100));
  }
  return new Blob(chunks, { type: ready.contentType });
}
