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

/** The API accepts png and jpeg only, and normalises "jpg" to "jpeg" on its side. */
export type PdfToImagesFormat = "png" | "jpg";

export interface PdfToImagesRequest {
  readonly file: File;
  readonly format: PdfToImagesFormat;
  readonly dpi: PdfToImagesDpi;
  readonly quality: PdfToImagesQuality;
  /** Page expression such as "1-3,8". Empty or omitted means every page. */
  readonly pages?: string;
}

/** Conversion facts the API reports, used by the success screen. */
export interface PdfToImagesMetrics {
  readonly durationMs: number;
  readonly pagesConverted: number;
  readonly dpi: number;
  readonly format: string;
  readonly outputBytes: number;
}

/** What the API hands back once the images exist and a download link has been minted. */
export interface PdfToImagesReady {
  readonly imageCount: number;
  readonly url: string;
  readonly filename: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly kind: "file" | "archive";
  readonly metrics?: PdfToImagesMetrics;
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

/**
 * Friendly copy for every stable reason the API can report in its error envelope.
 * The API messages themselves are never shown: they describe fields and engines, not people.
 */
const REASON_MESSAGES: Record<string, string> = {
  INVALID_FILE: "This file is not a valid PDF.",
  INVALID_PDF: "This file is not a valid PDF.",
  INVALID_DPI: "That resolution is not supported. Please pick 72, 150, 300 or 600 DPI.",
  INVALID_FORMAT: "That image format is not supported.",
  INVALID_QUALITY: "That quality setting is not supported.",
  INVALID_OPTIONS: "One of the conversion settings is not valid.",
  INVALID_PAGE_RANGE: "The page range is invalid.",
  PASSWORD_REQUIRED: "This PDF is password protected.",
  PASSWORD_INCORRECT: "This PDF is password protected.",
  CONVERSION_TIMEOUT: "The conversion took too long.",
  CONVERSION_CANCELLED: "The conversion was cancelled.",
  CONVERSION_FAILED: "Something went wrong during conversion.",
  OUTPUT_EMPTY: "No pages matched your page range.",
  OUTPUT_INVALID: "Something went wrong during conversion.",
  RESOURCE_EXHAUSTED: "Server is temporarily busy.",
  ENGINE_UNAVAILABLE: "Server is temporarily busy.",
  UPLOAD_FAILED: "The upload did not finish. Please try again.",
  WORKSPACE_FAILED: "Something went wrong during conversion.",
  TOOL_DISABLED: "This tool is temporarily unavailable.",
  TOOL_NOT_REGISTERED: "This tool is temporarily unavailable.",
};

/** Friendly copy for a reason, or undefined when the reason is unknown to this build. */
export function messageForReason(reason: string | undefined): string | undefined {
  if (reason === undefined) return undefined;
  return REASON_MESSAGES[reason];
}

/** Pulls the stable reason out of the API error envelope, ignoring anything unexpected. */
export function readErrorReason(payload: unknown): string | undefined {
  if (typeof payload !== "object" || payload === null) return undefined;
  const error = (payload as Record<string, unknown>)["error"];
  if (typeof error !== "object" || error === null) return undefined;
  const details = (error as Record<string, unknown>)["details"];
  if (typeof details !== "object" || details === null) return undefined;
  const reason = (details as Record<string, unknown>)["reason"];
  return typeof reason === "string" ? reason : undefined;
}

/** True when the error state should offer a link to the Unlock PDF tool. */
export function shouldOfferUnlockLink(status: number | "network", reason?: string): boolean {
  return status === 422 || reason === "PASSWORD_REQUIRED" || reason === "PASSWORD_INCORRECT";
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
  /** Stable machine readable reason from the API, when one was returned. */
  public readonly reason?: string;
  constructor(status: number | "network", message?: string, reason?: string) {
    super(message ?? messageForReason(reason) ?? messageForStatus(status));
    this.name = "PdfToImagesError";
    this.status = status;
    if (reason !== undefined) this.reason = reason;
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
    // Text, not "json": a body the browser refuses to parse must still be readable and loggable.
    xhr.responseType = "text";
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
      console.error("[pdf-to-images] network error contacting", PDF_TO_IMAGES_ENDPOINT);
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
      const raw = typeof xhr.response === "string" ? xhr.response : "";
      const payload = parseJson(raw);
      if (xhr.status < 200 || xhr.status >= 300) {
        console.error("[pdf-to-images] API responded", xhr.status, payload ?? raw);
        reject(new PdfToImagesError(xhr.status, undefined, readErrorReason(payload)));
        return;
      }
      const ready = readReady(payload);
      if (ready === undefined) {
        console.error("[pdf-to-images] unexpected success payload", payload ?? raw);
        reject(new PdfToImagesError(500));
        return;
      }
      resolve(ready);
    };

    xhr.send(buildForm(request));
  });
}

/** Reads a JSON body without throwing, so an unexpected body can still be logged. */
function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
}


function readMetrics(value: unknown): PdfToImagesMetrics | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const m = value as Record<string, unknown>;
  const num = (key: string): number => (typeof m[key] === "number" ? (m[key] as number) : 0);
  return {
    durationMs: num("durationMs"),
    pagesConverted: num("pagesConverted"),
    dpi: num("dpi"),
    format: typeof m["format"] === "string" ? (m["format"] as string) : "",
    outputBytes: num("outputBytes"),
  };
}

/**
 * The response is trusted once the download link is present. Only `download.url` is essential:
 * every other field has a safe fallback, so a field the API renames can never turn a finished
 * conversion into an error screen.
 */
export function readReady(payload: unknown): PdfToImagesReady | undefined {
  if (typeof payload !== "object" || payload === null) return undefined;
  const body = payload as Record<string, unknown>;
  const download = body["download"];
  if (typeof download !== "object" || download === null) return undefined;
  const d = download as Record<string, unknown>;
  const url = d["url"];
  if (typeof url !== "string" || url.length === 0) return undefined;
  const filename = typeof d["filename"] === "string" ? (d["filename"] as string) : "download";
  const contentType =
    typeof d["contentType"] === "string" ? (d["contentType"] as string) : "application/octet-stream";
  const sizeBytes = typeof d["sizeBytes"] === "number" ? (d["sizeBytes"] as number) : 0;
  const imageCount = body["imageCount"];
  const rawKind = d["kind"];
  const kind: "file" | "archive" =
    rawKind === "file" || rawKind === "archive"
      ? rawKind
      : /zip/i.test(contentType) || /\.zip$/i.test(filename)
        ? "archive"
        : "file";
  const metrics = readMetrics(body["metrics"]);
  return {
    imageCount: typeof imageCount === "number" ? imageCount : 1,
    url,
    filename,
    contentType,
    sizeBytes,
    kind,
    ...(metrics === undefined ? {} : { metrics }),
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
  const href = absoluteDownloadUrl(ready.url);
  const response = await fetch(href, {
    method: "GET",
    signal: handlers.signal,
  }).catch((error: unknown) => {
    console.error("[pdf-to-images] could not fetch the finished artefact", href, error);
    throw new PdfToImagesError("network");
  });
  if (!response.ok) {
    console.error("[pdf-to-images] artefact request failed", response.status, href);
    throw new PdfToImagesError(response.status);
  }


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
