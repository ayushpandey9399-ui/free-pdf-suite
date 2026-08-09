
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
  const isDev = import.meta.env.DEV || true; // Force logging for debugging
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", COMPRESS_IMAGE_ENDPOINT, true);
    xhr.responseType = "text";
    xhr.timeout = COMPRESS_IMAGE_TIMEOUT_MS;

    console.log("[CompressAPI] Starting request for:", request.file.name, "size:", request.file.size);

    const abort = (): void => {
      console.warn("[CompressAPI] Request Aborted");
      xhr.abort();
    };
    
    if (handlers.signal) {
      if (handlers.signal.aborted) {
        return reject(new DOMException("Aborted", "AbortError"));
      }
      handlers.signal.addEventListener("abort", abort, { once: true });
    }
    
    const done = (): void => {
      if (handlers.signal) {
        handlers.signal.removeEventListener("abort", abort);
      }
    };

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const pct = (event.loaded / event.total) * 100;
        console.log(`[CompressAPI] Upload Progress: ${pct.toFixed(2)}%`);
        handlers.onProgress?.({ phase: "uploading", percent: pct });
      } else {
        handlers.onProgress?.({ phase: "uploading", percent: null });
      }
    };

    xhr.upload.onload = () => {
      console.log("[CompressAPI] Upload finished, now optimizing...");
      handlers.onProgress?.({ phase: "converting", percent: null });
    };

    xhr.onerror = (e) => {
      done();
      console.error("[CompressAPI] Network error event:", e);
      reject(new CompressImageError("network", "Network error. Please check your connection or the API status."));
    };
    
    xhr.ontimeout = () => {
      done();
      console.error("[CompressAPI] Timeout reached");
      reject(new CompressImageError("network", "The request timed out. The server might be busy or the file too large."));
    };

    xhr.onload = () => {
      done();
      const raw = typeof xhr.response === "string" ? xhr.response : "";
      console.log("[CompressAPI] Response received. Status:", xhr.status);
      console.log("[CompressAPI] Raw Response:", raw.substring(0, 500));

      let payload: any;
      try { 
        payload = JSON.parse(raw); 
      } catch (e) {
        console.error("[CompressAPI] JSON Parsing failed for response:", raw);
      }
      
      if (xhr.status < 200 || xhr.status >= 300) {
        const serverMsg = payload?.message || payload?.error || `HTTP ${xhr.status}`;
        console.error("[CompressAPI] Server returned error:", serverMsg, payload);
        
        let friendly: string = `Server Error (${xhr.status}): ${serverMsg}`;
        if (xhr.status === 413) friendly = "File is too large for the compression service.";
        
        reject(new CompressImageError(xhr.status, friendly));
        return;
      }
      
      const download = payload?.download || payload;
      const url = download?.url;

      if (typeof url !== "string" || url.length === 0) {
        console.error("[CompressAPI] Success status but no URL in payload:", payload);
        reject(new CompressImageError(500, "Unexpected response: Missing download URL."));
        return;
      }

      console.log("[CompressAPI] Success! URL:", url);
      
      resolve({
        url: url,
        filename: download?.filename || payload?.filename || "compressed-image",
        contentType: download?.contentType || payload?.contentType || "application/octet-stream",
        sizeBytes: download?.sizeBytes || payload?.sizeBytes || 0
      });
    };

    const form = new FormData();
    // The backend for compress-image expects the field name to be 'file'
    // but let's be extra careful about how it's appended.
    form.append("file", request.file);
    
    console.log("[CompressAPI] FormData prepared with file field. Size:", request.file.size);
    
    try {
      console.log("[CompressAPI] Sending request to:", COMPRESS_IMAGE_ENDPOINT);
      xhr.send(form);
    } catch (err) {
      console.error("[CompressAPI] XHR send failed immediately:", err);
      reject(err);
    }
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
  const chunks: any[] = [];
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
