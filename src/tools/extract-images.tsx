import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import JSZip from "jszip";
import {
  PDFArray,
  PDFDict,
  PDFName,
  PDFRawStream,
  PDFRef,
} from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace, InfoTip } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { SelectedFileCard } from "@/components/SelectedFileCard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { downloadBlob } from "@/lib/download";
import { loadPdfLibDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";
import { cn } from "@/lib/utils";

interface ExtractedImage {
  id: string;
  page: number;
  width: number;
  height: number;
  ext: "jpg" | "png" | "jp2";
  mime: string;
  blob: Blob;
  url: string;
}

type Result = { count: number; single?: ExtractedImage; zip?: Blob; filename: string };

async function inflateFlate(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(
    new DecompressionStream("deflate"),
  );
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

function decodeAscii85(data: Uint8Array): Uint8Array {
  // Strip whitespace and the optional "<~" prefix / "~>" suffix wrapper.
  // Do NOT strip stray '<' chars — '<' (0x3C) is a valid ASCII85 digit.
  let start = 0;
  if (data.length >= 2 && data[0] === 0x3c && data[1] === 0x7e) start = 2;
  const chars: number[] = [];
  for (let i = start; i < data.length; i++) {
    const c = data[i];
    if (c === 0x7e) break; // '~>' end marker
    if (c <= 0x20) continue; // whitespace
    chars.push(c);
  }
  const out: number[] = [];
  let i = 0;
  while (i < chars.length) {
    if (chars[i] === 0x7a) { // 'z' = 4 zero bytes
      out.push(0, 0, 0, 0);
      i++;
      continue;
    }
    const group: number[] = [];
    while (group.length < 5 && i < chars.length) {
      group.push(chars[i++] - 33);
    }
    const pad = 5 - group.length;
    while (group.length < 5) group.push(84); // 'u' - 33
    let num = 0;
    for (let k = 0; k < 5; k++) num = num * 85 + group[k];
    // Avoid 32-bit bitwise wrap: num can be up to 85^5 = 4.4e9.
    const bytes = [
      Math.floor(num / 16777216) & 0xff,
      Math.floor(num / 65536) & 0xff,
      Math.floor(num / 256) & 0xff,
      num & 0xff,
    ];
    for (let k = 0; k < 4 - pad; k++) out.push(bytes[k]);
  }
  return new Uint8Array(out);
}

function decodeAsciiHex(data: Uint8Array): Uint8Array {
  const hex: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const c = data[i];
    if (c === 0x3e) break; // '>'
    if (c <= 0x20) continue;
    hex.push(c);
  }
  const out = new Uint8Array(Math.floor(hex.length / 2));
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(String.fromCharCode(hex[i * 2], hex[i * 2 + 1]), 16);
  }
  return out;
}


async function rawPixelsToPng(
  data: Uint8Array,
  w: number,
  h: number,
  channels: 1 | 3,
): Promise<Blob | null> {
  const need = w * h * channels;
  if (data.length < need) return null;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const imgData = ctx.createImageData(w, h);
  const px = imgData.data;
  if (channels === 3) {
    for (let i = 0, j = 0, k = 0; i < w * h; i++) {
      px[j++] = data[k++];
      px[j++] = data[k++];
      px[j++] = data[k++];
      px[j++] = 255;
    }
  } else {
    for (let i = 0, j = 0; i < w * h; i++) {
      const v = data[i];
      px[j++] = v;
      px[j++] = v;
      px[j++] = v;
      px[j++] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return await new Promise<Blob | null>((res) =>
    canvas.toBlob((b) => res(b), "image/png"),
  );
}

function filterNames(dict: PDFDict): string[] {
  const f = dict.lookup(PDFName.of("Filter"));
  if (!f) return [];
  if (f instanceof PDFName) return [f.asString()];
  if (f instanceof PDFArray) {
    const out: string[] = [];
    for (let i = 0; i < f.size(); i++) {
      const item = f.lookup(i);
      if (item instanceof PDFName) out.push(item.asString());
    }
    return out;
  }
  return [];
}

function colorSpaceName(dict: PDFDict): string | null {
  const cs = dict.lookup(PDFName.of("ColorSpace"));
  if (cs instanceof PDFName) return cs.asString();
  if (cs instanceof PDFArray && cs.size() > 0) {
    const first = cs.lookup(0);
    if (first instanceof PDFName) return first.asString();
  }
  return null;
}

function numberFrom(dict: PDFDict, key: string): number {
  const v = dict.lookup(PDFName.of(key));
  return v && "asNumber" in v ? (v as { asNumber: () => number }).asNumber() : 0;
}

async function scanImages(
  file: File,
  onProgress: (done: number, total: number) => void,
): Promise<ExtractedImage[]> {
  const bytes = await file.arrayBuffer();
  const doc = await loadPdfLibDoc(bytes);

  // Map image ref -> first page it appears on.
  const pageRefMap = new Map<string, number>();
  const pages = doc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const resources = pages[i].node.Resources();
    if (!resources) continue;
    let xobjects: PDFDict | undefined;
    try {
      xobjects = resources.lookup(PDFName.of("XObject"), PDFDict);
    } catch {
      xobjects = undefined;
    }
    if (!xobjects) continue;
    const entries = xobjects.entries();
    for (const [, val] of entries) {
      if (val instanceof PDFRef) {
        const key = `${val.objectNumber}-${val.generationNumber}`;
        if (!pageRefMap.has(key)) pageRefMap.set(key, i + 1);
      }
    }
  }

  const all = doc.context.enumerateIndirectObjects();
  const images: [PDFRef, PDFRawStream][] = [];
  for (const [ref, obj] of all) {
    if (!(obj instanceof PDFRawStream)) continue;
    const subtype = obj.dict.lookup(PDFName.of("Subtype"));
    if (!(subtype instanceof PDFName) || subtype.asString() !== "/Image") continue;
    images.push([ref, obj]);
  }

  const results: ExtractedImage[] = [];
  const seen = new Set<string>();

  for (let idx = 0; idx < images.length; idx++) {
    onProgress(idx, images.length);
    // Yield to keep UI responsive.
    await new Promise((r) => setTimeout(r, 0));

    const [ref, stream] = images[idx];
    const key = `${ref.objectNumber}-${ref.generationNumber}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const dict = stream.dict;
    const width = numberFrom(dict, "Width");
    const height = numberFrom(dict, "Height");
    if (!width || !height || width < 16 || height < 16) continue;

    const filters = filterNames(dict);
    const page = pageRefMap.get(key) ?? 1;
    let blob: Blob | null = null;
    let ext: ExtractedImage["ext"] = "png";
    let mime = "image/png";

    try {
      // Walk filter chain left-to-right, decoding wrappers (Flate/LZW/ASCII*)
      // until we hit an image codec (DCT/JPX) or raw pixel data.
      let data: Uint8Array = stream.contents;
      let terminal: string | null = null;
      let skip = false;
      for (let fi = 0; fi < filters.length; fi++) {
        const f = filters[fi];
        if (f === "/DCTDecode" || f === "/JPXDecode") {
          terminal = f;
          break;
        } else if (f === "/FlateDecode" || f === "/Fl") {
          data = await inflateFlate(data);
        } else if (f === "/ASCII85Decode" || f === "/A85") {
          data = decodeAscii85(data);
        } else if (f === "/ASCIIHexDecode" || f === "/AHx") {
          data = decodeAsciiHex(data);
        } else {
          // Unsupported wrapper (LZW, CCITTFax, JBIG2, RunLength) — skip.
          skip = true;
          break;
        }
      }
      if (skip) continue;

      if (terminal === "/DCTDecode") {
        // Require a valid JPEG SOI marker (0xFFD8FF).
        if (data.length < 3 || data[0] !== 0xff || data[1] !== 0xd8 || data[2] !== 0xff) continue;
        blob = new Blob([data as BlobPart], { type: "image/jpeg" });
        ext = "jpg";
        mime = "image/jpeg";
      } else if (terminal === "/JPXDecode") {
        blob = new Blob([data as BlobPart], { type: "image/jp2" });
        ext = "jp2";
        mime = "image/jp2";
      } else {
        // Raw pixel data (possibly Flate-decoded above).
        const decodeParms = dict.lookup(PDFName.of("DecodeParms"));
        let predictor = 1;
        if (decodeParms instanceof PDFDict) predictor = numberFrom(decodeParms, "Predictor") || 1;
        if (predictor >= 10) continue;
        const cs = colorSpaceName(dict);
        const bpc = numberFrom(dict, "BitsPerComponent") || 8;
        if (bpc !== 8) continue;
        const channels: 1 | 3 | null =
          cs === "/DeviceRGB" || cs === "/CalRGB"
            ? 3
            : cs === "/DeviceGray" || cs === "/CalGray"
              ? 1
              : null;
        if (!channels) continue;
        blob = await rawPixelsToPng(data, width, height, channels);
        if (blob) {
          const head = new Uint8Array(await blob.slice(0, 8).arrayBuffer());
          if (head[0] !== 0x89 || head[1] !== 0x50 || head[2] !== 0x4e || head[3] !== 0x47) blob = null;
        }
      }
    } catch {
      blob = null;
    }

    if (!blob) continue;
    results.push({
      id: key,
      page,
      width,
      height,
      ext,
      mime,
      blob,
      url: URL.createObjectURL(blob),
    });
  }

  // Order by page then size (larger first) for nicer grid.
  results.sort((a, b) => a.page - b.page || b.width * b.height - a.width * a.height);
  onProgress(images.length, images.length);
  return results;
}

export default function ExtractImages() {
  const [files, setFiles] = useState<File[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<{ done: number; total: number } | null>(null);
  const [images, setImages] = useState<ExtractedImage[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [packaging, setPackaging] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const scanTokenRef = useRef(0);

  const { protectedName, reset } = usePdfPasswordCheck(files, () => setFiles([]));

  const file = files[0];

  const resetAll = useCallback(() => {
    for (const img of images) URL.revokeObjectURL(img.url);
    setFiles([]);
    setImages([]);
    setSelected(new Set());
    setResult(null);
    setScanProgress(null);
    setScanning(false);
  }, [images]);

  // Trigger scan when file changes.
  useEffect(() => {
    if (!file || protectedName) return;
    const token = ++scanTokenRef.current;
    setScanning(true);
    setScanProgress({ done: 0, total: 0 });
    setImages([]);
    setSelected(new Set());
    (async () => {
      try {
        const found = await scanImages(file, (done, total) => {
          if (scanTokenRef.current === token) setScanProgress({ done, total });
        });
        if (scanTokenRef.current !== token) {
          for (const img of found) URL.revokeObjectURL(img.url);
          return;
        }
        setImages(found);
        setSelected(new Set(found.map((i) => i.id)));
      } catch (e) {
        if (isPdfPasswordError(e)) toast.error("PDF is password-protected");
        else toast.error(`Failed to scan: ${(e as Error).message}`);
      } finally {
        if (scanTokenRef.current === token) {
          setScanning(false);
          setScanProgress(null);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, protectedName]);

  // Cleanup object URLs on unmount.
  useEffect(() => {
    return () => {
      for (const img of images) URL.revokeObjectURL(img.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allSelected = images.length > 0 && selected.size === images.length;
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(images.map((i) => i.id)));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const chosen = useMemo(() => images.filter((i) => selected.has(i.id)), [images, selected]);

  const run = async () => {
    if (chosen.length === 0 || !file) return;
    setPackaging(true);
    try {
      const base = file.name.replace(/\.pdf$/i, "");
      if (chosen.length === 1) {
        const img = chosen[0];
        setResult({
          count: 1,
          single: img,
          filename: `${base}-image-1.${img.ext}`,
        });
      } else {
        const zip = new JSZip();
        const pad = (n: number) => n.toString().padStart(2, "0");
        chosen.forEach((img, i) => {
          zip.file(`image-${pad(i + 1)}.${img.ext}`, img.blob);
        });
        const zipBlob = await zip.generateAsync({ type: "blob" });
        setResult({
          count: chosen.length,
          zip: zipBlob,
          filename: `${base}-images.zip`,
        });
      }
      toast.success(`${chosen.length} image${chosen.length > 1 ? "s" : ""} ready`);
    } catch (e) {
      toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setPackaging(false);
    }
  };

  if (result) {
    return (
      <ToolSuccessScreen
        heading={`${result.count} image${result.count > 1 ? "s" : ""} extracted!`}
        subheading={
          result.zip
            ? "Your images have been packaged into a ZIP archive."
            : "Your image is ready to download."
        }
        downloadLabel={result.zip ? "Download ZIP" : "Download Image"}
        onDownload={() =>
          result.zip
            ? downloadBlob(result.zip, result.filename, "application/zip")
            : downloadBlob(result.single!.blob, result.filename, result.single!.mime)
        }
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS["extract-images"] ?? []}
      />
    );
  }

  if (files.length === 0) {
    return (
      <FileDropzone
        accept="application/pdf"
        files={files}
        onFilesChange={setFiles}
        buttonLabel="Select PDF file"
      />
    );
  }

  if (protectedName) return <PasswordProtectedNotice fileName={protectedName} onReset={reset} />;

  const noImages = !scanning && images.length === 0;

  return (
    <ToolWorkspace
      title="Extract Images"
      actionLabel="Extract Images"
      loadingLabel={packaging ? "Packaging…" : "Working…"}
      loading={packaging}
      onAction={run}
      actionDisabled={chosen.length === 0 || scanning}
      sidebar={
        <>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={toggleAll}
              disabled={images.length === 0}
              className="text-[13px] font-semibold text-[#e5322d] hover:underline disabled:opacity-40"
            >
              {allSelected ? "Deselect all" : "Select all"}
            </button>
            <span className="text-[12.5px]" style={{ color: "#7a7a86" }}>
              {chosen.length} of {images.length} selected
            </span>
          </div>
          <InfoTip>
            Images are extracted in their original quality — no re-compression for JPEGs.
          </InfoTip>
        </>
      }
    >
      <div className="space-y-4">
        <SelectedFileCard file={file} onRemove={resetAll} />

        {scanning && (
          <div
            className="flex items-center gap-3 rounded-2xl bg-white p-5"
            style={{ border: "1px solid #ececef" }}
          >
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#e5322d" }} />
            <div className="text-[14px]" style={{ color: "#33333c" }}>
              {scanProgress && scanProgress.total > 0
                ? `Scanning image ${Math.min(scanProgress.done + 1, scanProgress.total)} of ${scanProgress.total}…`
                : "Scanning PDF…"}
            </div>
          </div>
        )}

        {noImages && (
          <div
            className="rounded-2xl bg-white p-8 text-center"
            style={{ border: "1px solid #ececef" }}
          >
            <p className="text-[15px] font-semibold" style={{ color: "#33333c" }}>
              No embedded images were found in this PDF.
            </p>
            <p className="mt-2 text-[13px]" style={{ color: "#7a7a86" }}>
              If your PDF is a scan, try the <span className="font-semibold">PDF to Image</span>{" "}
              tool instead to save whole pages as images.
            </p>
          </div>
        )}

        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {images.map((img) => {
              const on = selected.has(img.id);
              return (
                <button
                  type="button"
                  key={img.id}
                  onClick={() => toggleOne(img.id)}
                  className={cn(
                    "group relative overflow-hidden rounded-xl bg-white text-left transition-all",
                    on ? "ring-2 ring-[#e5322d]" : "ring-1 ring-[#ececef] hover:ring-[#d0d0d6]",
                  )}
                >
                  <div
                    className="flex aspect-square w-full items-center justify-center"
                    style={{ backgroundColor: "#f7f7f8" }}
                  >
                    <img
                      src={img.url}
                      alt={`Page ${img.page}`}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div
                    className={cn(
                      "absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full text-white transition-all",
                      on ? "bg-[#e5322d]" : "bg-white/90 text-transparent ring-1 ring-[#d0d0d6]",
                    )}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <div className="p-2.5">
                    <p
                      className="truncate text-[12.5px] font-semibold"
                      style={{ color: "#33333c" }}
                    >
                      {img.width}×{img.height}
                    </p>
                    <p className="text-[11.5px]" style={{ color: "#7a7a86" }}>
                      Page {img.page} · {img.ext.toUpperCase()}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </ToolWorkspace>
  );
}
