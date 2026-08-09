
export const COMPRESS_IMAGE_ENDPOINT = "https://api.freepdfhub.in/v1/tools/compress-image/jobs";
export const COMPRESS_IMAGE_API_ORIGIN = "https://api.freepdfhub.in";
export const COMPRESS_IMAGE_TIMEOUT_MS = 180_000;

export type CompressImageFormat = "jpg" | "png" | "webp" | "svg" | "gif";

export interface CompressImageRequest {
  readonly file: File;
}

export interface CompressImageReady {
  readonly url: string;
  readonly filename: string;
  readonly contentType: string;
  readonly sizeBytes: number;
}

export interface CompressImageProgress {
  readonly phase: "uploading" | "converting" | "downloading";
  readonly percent: number | null;
}

export class CompressImageError extends Error {
  public readonly status: number | "network";
  constructor(status: number | "network", message?: string) {
    super(message ?? "Something went wrong. Please try again.");
    this.name = "CompressImageError";
    this.status = status;
  }
}

export function requestCompressImage(
  request: CompressImageRequest,
  handlers: {
    readonly onProgress?: (progress: CompressImageProgress) => void;
    readonly signal?: AbortSignal;
  } = {},
): Promise<CompressImageReady> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", COMPRESS_IMAGE_ENDPOINT, true);
    xhr.responseType = "text";
    xhr.timeout = COMPRESS_IMAGE_TIMEOUT_MS;

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
      reject(new CompressImageError("network"));
    };
    xhr.ontimeout = () => {
      done();
      reject(new CompressImageError("network", "The request timed out. Please try a smaller image."));
    };
    xhr.onload = () => {
      done();
      const raw = typeof xhr.response === "string" ? xhr.response : "";
      let payload: any;
      try { payload = JSON.parse(raw); } catch { }
      
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new CompressImageError(xhr.status));
        return;
      }
      
      const download = payload?.download;
      if (!download?.url) {
        reject(new CompressImageError(500));
        return;
      }
      
      resolve({
        url: download.url,
        filename: download.filename || "compressed-image",
        contentType: download.contentType || "application/octet-stream",
        sizeBytes: download.sizeBytes || 0
      });
    };

    const form = new FormData();
    form.append("file", request.file, request.file.name);
    xhr.send(form);
  });
}

export async function fetchCompressImageResult(
  ready: CompressImageReady,
  handlers: { readonly onProgress?: (percent: number | null) => void; readonly signal?: AbortSignal } = {},
): Promise<Blob> {
  const href = /^https?:\/\//i.test(ready.url) ? ready.url : `${COMPRESS_IMAGE_API_ORIGIN}${ready.url}`;
  const response = await fetch(href, {
    method: "GET",
    signal: handlers.signal,
  });
  
  if (!response.ok) throw new CompressImageError(response.status);

  const body = response.body;
  const total = ready.sizeBytes;
  if (body === null || total === 0) {
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
