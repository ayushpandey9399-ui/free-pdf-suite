import { useEffect, useMemo, useState } from "react";
import { PDFDocument, PageSizes, StandardFonts } from "pdf-lib";
import { toast } from "sonner";
import { FileText, X } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace, InfoTip } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { downloadBlob } from "@/lib/download";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";

type PageSize = "a4" | "letter";
type FontSizeOpt = "small" | "medium" | "large";
type MarginOpt = "small" | "normal" | "big";
type LineSpacing = "1.0" | "1.15" | "1.5";

const FONT_PT: Record<FontSizeOpt, number> = { small: 10, medium: 12, large: 14 };
const MARGIN_PT: Record<MarginOpt, number> = { small: 36, normal: 54, big: 90 };
const LINE_MULT: Record<LineSpacing, number> = { "1.0": 1.0, "1.15": 1.15, "1.5": 1.5 };
const PAGE_DIMS: Record<PageSize, [number, number]> = { a4: PageSizes.A4, letter: PageSizes.Letter };

// Standard PDF Helvetica supports WinAnsi (Latin-1) only.
function hasNonLatinChars(s: string): boolean {
  // Anything beyond U+00FF is a red flag for the WinAnsi encoder.
  for (let i = 0; i < s.length; i++) if (s.charCodeAt(i) > 0xff) return true;
  return false;
}

// Break a line by pixel width — force-break long unbroken tokens.
function wrapLine(
  text: string,
  font: import("pdf-lib").PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  if (text === "") return [""];
  const words = text.split(/(\s+)/); // keep spaces as tokens
  const out: string[] = [];
  let current = "";
  const widthOf = (s: string) => {
    try { return font.widthOfTextAtSize(s, size); } catch { return s.length * size * 0.5; }
  };
  const pushForceBreak = (word: string) => {
    let buf = "";
    for (const ch of word) {
      const candidate = buf + ch;
      if (widthOf(current + candidate) > maxWidth) {
        if (current + buf) out.push(current + buf);
        current = "";
        buf = ch;
      } else {
        buf = candidate;
      }
    }
    current += buf;
  };
  for (const w of words) {
    if (!w) continue;
    if (widthOf(current + w) <= maxWidth) {
      current += w;
    } else {
      if (current.trim().length) out.push(current.trimEnd());
      current = "";
      if (widthOf(w) > maxWidth) {
        pushForceBreak(w);
      } else {
        current = w.trimStart();
      }
    }
  }
  if (current.length) out.push(current.trimEnd());
  return out.length ? out : [""];
}

async function buildPdfFromText(
  text: string,
  opts: { pageSize: PageSize; fontSize: FontSizeOpt; margin: MarginOpt; lineSpacing: LineSpacing },
): Promise<{ bytes: Uint8Array; sanitized: boolean }> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const [pw, ph] = PAGE_DIMS[opts.pageSize];
  const margin = MARGIN_PT[opts.margin];
  const size = FONT_PT[opts.fontSize];
  const lineHeight = size * LINE_MULT[opts.lineSpacing];
  const maxWidth = pw - margin * 2;

  // Replace unencodable chars with '?' so pdf-lib doesn't throw.
  let sanitized = false;
  const safeText = text.replace(/[^\u0000-\u00ff]/g, () => { sanitized = true; return "?"; });

  const rawLines = safeText.replace(/\r\n?/g, "\n").split("\n");
  const wrapped: string[] = [];
  for (const line of rawLines) wrapped.push(...wrapLine(line, font, size, maxWidth));

  const linesPerPage = Math.max(1, Math.floor((ph - margin * 2) / lineHeight));
  for (let i = 0; i < wrapped.length; i += linesPerPage) {
    const page = doc.addPage([pw, ph]);
    const slice = wrapped.slice(i, i + linesPerPage);
    let y = ph - margin - size;
    for (const l of slice) {
      page.drawText(l, { x: margin, y, size, font });
      y -= lineHeight;
    }
  }
  if (!wrapped.length) doc.addPage([pw, ph]);

  const bytes = await doc.save();
  return { bytes, sanitized };
}

export default function TxtToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasted, setPasted] = useState("");

  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [fontSize, setFontSize] = useState<FontSizeOpt>("medium");
  const [margin, setMargin] = useState<MarginOpt>("normal");
  const [lineSpacing, setLineSpacing] = useState<LineSpacing>("1.15");
  const [mergeAll, setMergeAll] = useState(true);

  const [loading, setLoading] = useState(false);
  const [result, setResult] =
    useState<{ blobs: { blob: Blob; filename: string }[]; sanitized: boolean } | null>(null);

  // Preview: load first file's text (or pasted).
  const [firstText, setFirstText] = useState("");
  useEffect(() => {
    if (pasteMode) { setFirstText(pasted); return; }
    const f = files[0];
    if (!f) { setFirstText(""); return; }
    let cancelled = false;
    f.text().then((t) => { if (!cancelled) setFirstText(t); }).catch(() => {});
    return () => { cancelled = true; };
  }, [files, pasted, pasteMode]);

  const hasContent = pasteMode ? pasted.trim().length > 0 : files.length > 0;
  const nonLatinWarn = useMemo(() => hasNonLatinChars(firstText), [firstText]);

  const resetAll = () => {
    setFiles([]); setPasted(""); setPasteMode(false); setResult(null);
    setPageSize("a4"); setFontSize("medium"); setMargin("normal"); setLineSpacing("1.15"); setMergeAll(true);
  };

  const run = async () => {
    if (!hasContent) return;
    setLoading(true);
    try {
      const opts = { pageSize, fontSize, margin, lineSpacing };
      let sanitizedAny = false;
      const outputs: { blob: Blob; filename: string }[] = [];

      if (pasteMode) {
        const { bytes, sanitized } = await buildPdfFromText(pasted, opts);
        sanitizedAny = sanitizedAny || sanitized;
        outputs.push({
          blob: new Blob([bytes as BlobPart], { type: "application/pdf" }),
          filename: "pasted-text.pdf",
        });
      } else if (mergeAll || files.length === 1) {
        const chunks: string[] = [];
        for (const f of files) chunks.push(await f.text());
        const combined = chunks.join("\n\n");
        const { bytes, sanitized } = await buildPdfFromText(combined, opts);
        sanitizedAny = sanitizedAny || sanitized;
        outputs.push({
          blob: new Blob([bytes as BlobPart], { type: "application/pdf" }),
          filename: files.length === 1
            ? files[0].name.replace(/\.txt$/i, "") + ".pdf"
            : "combined.pdf",
        });
      } else {
        for (const f of files) {
          const { bytes, sanitized } = await buildPdfFromText(await f.text(), opts);
          sanitizedAny = sanitizedAny || sanitized;
          outputs.push({
            blob: new Blob([bytes as BlobPart], { type: "application/pdf" }),
            filename: f.name.replace(/\.txt$/i, "") + ".pdf",
          });
        }
      }

      setResult({ blobs: outputs, sanitized: sanitizedAny });
      toast.success("PDF created");
    } catch (e) {
      toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <ToolSuccessScreen
        heading="Text converted to PDF!"
        subheading={
          (result.blobs.length === 1
            ? "Your PDF is ready."
            : `${result.blobs.length} PDFs are ready.`) +
          (result.sanitized ? " Some non-Latin characters were replaced with '?'." : "")
        }
        downloadLabel={result.blobs.length === 1 ? "Download PDF" : `Download ${result.blobs.length} PDFs`}
        onDownload={() => {
          for (const o of result.blobs) downloadBlob(o.blob, o.filename, "application/pdf");
        }}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS["txt-to-pdf"] ?? ["merge", "compress", "page-numbers", "watermark", "pdf-to-text", "images-to-pdf"]}
      />
    );
  }

  // Empty state: file dropzone + "or paste text" toggle.
  if (!pasteMode && files.length === 0) {
    return (
      <div className="space-y-4">
        <FileDropzone
          accept=".txt,text/plain"
          multiple
          files={files}
          onFilesChange={setFiles}
          buttonLabel="Select TXT files"
          hint="or drop .txt files here"
        />
        <div className="text-center">
          <button
            type="button"
            onClick={() => setPasteMode(true)}
            className="text-[14px] font-semibold underline underline-offset-4"
            style={{ color: "#e5322d" }}
          >
            Or paste text instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <ToolWorkspace
      title="TXT to PDF"
      actionLabel="Convert to PDF"
      loadingLabel="Converting…"
      onAction={run}
      actionDisabled={!hasContent}
      loading={loading}
      sidebar={
        <>
          <div>
            <Label className="text-[13px] font-semibold" style={{ color: "#33333c" }}>Page size</Label>
            <Select value={pageSize} onValueChange={(v) => setPageSize(v as PageSize)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="a4">A4</SelectItem>
                <SelectItem value="letter">Letter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-[13px] font-semibold" style={{ color: "#33333c" }}>Font size</Label>
            <Select value={fontSize} onValueChange={(v) => setFontSize(v as FontSizeOpt)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (10pt)</SelectItem>
                <SelectItem value="medium">Medium (12pt)</SelectItem>
                <SelectItem value="large">Large (14pt)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-[13px] font-semibold" style={{ color: "#33333c" }}>Margin</Label>
            <Select value={margin} onValueChange={(v) => setMargin(v as MarginOpt)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="big">Big</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-[13px] font-semibold" style={{ color: "#33333c" }}>Line spacing</Label>
            <Select value={lineSpacing} onValueChange={(v) => setLineSpacing(v as LineSpacing)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1.0">1.0</SelectItem>
                <SelectItem value="1.15">1.15</SelectItem>
                <SelectItem value="1.5">1.5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!pasteMode && files.length > 1 && (
            <div className="flex items-start justify-between gap-3 rounded-xl p-3" style={{ backgroundColor: "#f7f7f8" }}>
              <div className="min-w-0">
                <Label className="text-[13.5px] font-semibold" style={{ color: "#33333c" }}>Merge into one PDF</Label>
                <p className="mt-0.5 text-[12px]" style={{ color: "#7a7a86" }}>
                  {mergeAll ? "All files combined into combined.pdf." : "One PDF per file."}
                </p>
              </div>
              <Switch checked={mergeAll} onCheckedChange={setMergeAll} />
            </div>
          )}

          {nonLatinWarn && (
            <InfoTip>
              Non-Latin characters detected. The standard PDF font only supports Latin characters —
              unsupported characters will be replaced with "?" in the output.
            </InfoTip>
          )}
        </>
      }
    >
      {/* LEFT panel: source list + live preview */}
      <div className="space-y-4">
        {pasteMode ? (
          <div className="rounded-2xl bg-white p-5" style={{ border: "1px solid #ececef" }}>
            <div className="flex items-center justify-between">
              <Label className="text-[13px] font-semibold" style={{ color: "#33333c" }}>Paste your text</Label>
              <button
                type="button"
                onClick={() => { setPasteMode(false); setPasted(""); }}
                className="text-[12.5px] font-semibold"
                style={{ color: "#7a7a86" }}
              >
                Use a file instead
              </button>
            </div>
            <Textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder="Type or paste text here…"
              className="mt-3 min-h-[180px] font-mono text-[13px]"
            />
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-4" style={{ border: "1px solid #ececef" }}>
            <ul className="divide-y" style={{ borderColor: "#ececef" }}>
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`} className="flex items-center gap-3 py-2.5">
                  <FileText className="h-4 w-4" style={{ color: "#e5322d" }} />
                  <span className="truncate text-[14px]" style={{ color: "#33333c" }}>{f.name}</span>
                  <span className="ml-auto text-[12px]" style={{ color: "#7a7a86" }}>
                    {(f.size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${f.name}`}
                    onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                    className="grid h-7 w-7 place-items-center rounded-full text-[#7a7a86] hover:bg-[#fbecec] hover:text-[#e5322d]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Live preview */}
        <div className="rounded-2xl bg-white p-5" style={{ border: "1px solid #ececef" }}>
          <h3 className="text-[13px] font-bold uppercase" style={{ color: "#7a7a86", letterSpacing: "0.08em" }}>
            Preview
          </h3>
          <div className="mt-4 flex justify-center">
            <PagePreview
              text={firstText}
              pageSize={pageSize}
              fontSize={FONT_PT[fontSize]}
              margin={MARGIN_PT[margin]}
              lineHeight={FONT_PT[fontSize] * LINE_MULT[lineSpacing]}
            />
          </div>
        </div>
      </div>
    </ToolWorkspace>
  );
}

/** Scaled visual preview of the first PDF page. */
function PagePreview({
  text,
  pageSize,
  fontSize,
  margin,
  lineHeight,
}: {
  text: string;
  pageSize: PageSize;
  fontSize: number;
  margin: number;
  lineHeight: number;
}) {
  const [pwPt, phPt] = PAGE_DIMS[pageSize];
  const targetW = 320;
  const scale = targetW / pwPt;
  return (
    <div
      className="relative overflow-hidden bg-white"
      style={{
        width: pwPt * scale,
        height: phPt * scale,
        boxShadow: "0 8px 24px -12px rgba(20,20,43,0.25)",
        border: "1px solid #ececef",
      }}
    >
      <div
        className="whitespace-pre-wrap break-words font-serif"
        style={{
          position: "absolute",
          top: margin * scale,
          left: margin * scale,
          right: margin * scale,
          bottom: margin * scale,
          fontSize: fontSize * scale,
          lineHeight: `${lineHeight * scale}px`,
          color: "#33333c",
          overflow: "hidden",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        {text || <span style={{ color: "#c8c8ce" }}>Your text preview will appear here…</span>}
      </div>
    </div>
  );
}
