
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
  const isDev = import.meta.env.DEV;
  if (isDev) {
    console.group(`[CompressAPI] Request Started: ${request.file.name}`);
    console.log("Endpoint:", COMPRESS_IMAGE_ENDPOINT);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", COMPRESS_IMAGE_ENDPOINT, true);
    xhr.responseType = "text";
    xhr.timeout = COMPRESS_IMAGE_TIMEOUT_MS;

    const abort = (): void => {
      if (isDev) console.warn("[CompressAPI] Request Aborted by user");
      xhr.abort();
    };
    handlers.signal?.addEventListener("abort", abort, { once: true });
    const done = (): void => handlers.signal?.removeEventListener("abort", abort);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const pct = (event.loaded / event.total) * 100;
        if (isDev && pct % 25 === 0) console.log(`[CompressAPI] Upload Progress: ${pct.toFixed(1)}%`);
        handlers.onProgress?.({ phase: "uploading", percent: pct });
      } else {
        handlers.onProgress?.({ phase: "uploading", percent: null });
      }
    };

    xhr.upload.onload = () => {
      if (isDev) console.log("[CompressAPI] Upload Finished, backend processing...");
      // We switch to converting (processing) state only after upload is truly finished
      handlers.onProgress?.({ phase: "converting", percent: null });
    };

    xhr.onerror = () => {
      done();
      if (isDev) console.error("[CompressAPI] Network Error");
      reject(new CompressImageError("network"));
    };

    xhr.ontimeout = () => {
      done();
      if (isDev) console.error("[CompressAPI] Timeout reached");
      reject(new CompressImageError("network", "The request timed out. Please try a smaller image."));
    };

    xhr.onload = () => {
      done();
      const raw = typeof xhr.response === "string" ? xhr.response : "";
      
      if (isDev) {
        console.log(`[CompressAPI] HTTP Status: ${xhr.status}`);
        console.log(`[CompressAPI] Content-Type: ${xhr.getResponseHeader("content-type")}`);
        console.log("[CompressAPI] Raw Response:", raw.substring(0, 500));
      }

      let payload: any;
      try { 
        payload = JSON.parse(raw); 
      } catch (e) { 
        if (isDev) console.error("[CompressAPI] JSON Parse Error", e);
      }
      
      if (xhr.status < 200 || xhr.status >= 300) {
        const msg = payload?.message || payload?.error || `Server returned ${xhr.status}`;
        reject(new CompressImageError(xhr.status, msg));
        if (isDev) console.groupEnd();
        return;
      }
      
      // Handle the specific structure returned by api.freepdfhub.in
      // If the backend returns { download: { url: ... } } or just { url: ... }
      const download = payload?.download || payload;
      const url = download?.url || payload?.url;

      if (!url) {
        if (isDev) console.error("[CompressAPI] Missing URL in response", payload);
        reject(new CompressImageError(500, "Invalid response from server (missing download URL)"));
        if (isDev) console.groupEnd();
        return;
      }

      if (isDev) {
        console.log("[CompressAPI] Success! Download URL:", url);
        console.groupEnd();
      }
      
      resolve({
        url: url,
        filename: download.filename || payload.filename || "compressed-image",
        contentType: download.contentType || payload.contentType || "application/octet-stream",
        sizeBytes: download.sizeBytes || payload.sizeBytes || 0
      });
    };

    const form = new FormData();
    // The backend expects field "file"
    form.append("file", request.file, request.file.name);
    
    if (isDev) console.log("[CompressAPI] Sending XHR...");
    xhr.send(form);
  });
}

export async function fetchCompressImageResult(
  ready: CompressImageReady,
  handlers: { readonly onProgress?: (percent: number | null) => void; readonly signal?: AbortSignal } = {},
): Promise<Blob> {
  const isDev = import.meta.env.DEV;
  const href = /^https?:\/\//i.test(ready.url) ? ready.url : `${COMPRESS_IMAGE_API_ORIGIN}${ready.url}`;
  
  if (isDev) console.log(`[CompressAPI] Fetching blob from: ${href}`);

  const response = await fetch(href, {
    method: "GET",
    signal: handlers.signal,
  });
  
  if (!response.ok) {
    if (isDev) console.error(`[CompressAPI] Blob download failed: ${response.status}`);
    throw new CompressImageError(response.status, `Failed to download compressed file (${response.status})`);
  }

  const body = response.body;
  const total = ready.sizeBytes || parseInt(response.headers.get("content-length") || "0");
  
  if (body === null) {
    const blob = await response.blob();
    if (isDev) console.log(`[CompressAPI] Download finished (no stream). Size: ${blob.size}`);
    return blob;
  }

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;
  
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.byteLength;
    if (total > 0) {
      handlers.onProgress?.(Math.min(100, (loaded / total) * 100));
    } else {
      handlers.onProgress?.(null);
    }
  }

  const finalBlob = new Blob(chunks, { type: ready.contentType || response.headers.get("content-type") || "application/octet-stream" });
  if (isDev) console.log(`[CompressAPI] Download complete. Final blob size: ${finalBlob.size}`);
  
  return finalBlob;
}
