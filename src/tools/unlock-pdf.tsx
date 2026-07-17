import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Lock } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace, InfoTip } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { SelectedFileCard } from "@/components/SelectedFileCard";
import { downloadBlob } from "@/lib/download";
import { loadMupdf } from "@/lib/mupdfLoader";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";

type Status =
  | { kind: "checking" }
  | { kind: "unprotected" }
  | { kind: "needs-password" }
  | { kind: "unlocked" } // owner-only, opens without a password
  | { kind: "invalid"; message: string };

export default function UnlockPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>({ kind: "checking" });
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);

  const file = files[0];

  useEffect(() => {
    let cancelled = false;
    setStatus({ kind: "checking" });
    setPw(""); setPwError(null);
    if (!file) return;
    (async () => {
      try {
        const mupdf = await loadMupdf();
        const bytes = new Uint8Array(await file.arrayBuffer());
        const doc = mupdf.PDFDocument.openDocument(bytes, "application/pdf") as unknown as import("mupdf").PDFDocument;
        if (cancelled) return;
        if (doc.needsPassword()) setStatus({ kind: "needs-password" });
        else {
          const enc = doc.getMetaData(mupdf.Document.META_ENCRYPTION);
          if (enc && enc !== "None" && enc !== "None ") setStatus({ kind: "unlocked" });
          else setStatus({ kind: "unprotected" });
        }
      } catch (e) {
        if (!cancelled) setStatus({ kind: "invalid", message: (e as Error).message || "Could not read PDF" });
      }
    })();
    return () => { cancelled = true; };
  }, [file]);

  const resetAll = () => {
    setFiles([]); setPw(""); setPwError(null); setResult(null); setStatus({ kind: "checking" });
  };

  const run = async () => {
    if (!file) return;
    setLoading(true); setPwError(null);
    try {
      const mupdf = await loadMupdf();
      const bytes = new Uint8Array(await file.arrayBuffer());
      const doc = mupdf.PDFDocument.openDocument(bytes, "application/pdf") as unknown as import("mupdf").PDFDocument;
      if (doc.needsPassword()) {
        const ok = doc.authenticatePassword(pw);
        // mupdf returns: 0 = failed; >0 = success (bit 1 user, bit 2 owner)
        if (!ok) {
          setPwError("Incorrect password. Please try again.");
          setLoading(false);
          return;
        }
      }
      const buf = doc.saveToBuffer({ encrypt: "none" });
      const out = buf.asUint8Array();
      const copy = new Uint8Array(out.length);
      copy.set(out);
      const base = file.name.replace(/\.pdf$/i, "");
      setResult({
        blob: new Blob([copy], { type: "application/pdf" }),
        filename: `${base}-unlocked.pdf`,
      });
      toast.success("PDF unlocked");
    } catch (e) {
      toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <ToolSuccessScreen
        heading="PDF unlocked!"
        subheading="Your password-free PDF is ready to download."
        downloadLabel="Download PDF"
        onDownload={() => downloadBlob(result.blob, result.filename, "application/pdf")}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS["unlock-pdf"] ?? []}
      />
    );
  }

  if (!file) {
    return (
      <FileDropzone
        accept="application/pdf"
        multiple={false}
        files={files}
        onFilesChange={setFiles}
        buttonLabel="Select PDF file"
      />
    );
  }

  const canRun =
    status.kind === "needs-password" ? pw.length > 0 :
    status.kind === "unlocked" ? true :
    false;

  return (
    <ToolWorkspace
      title="Unlock PDF"
      actionLabel="Unlock PDF"
      onAction={run}
      actionDisabled={!canRun}
      loading={loading}
      loadingLabel="Unlocking…"
      sidebar={
        <>
          {status.kind === "needs-password" && (
            <div>
              <label className="mb-1.5 block text-[12.5px] font-bold uppercase" style={{ color: "#7a7a86", letterSpacing: "0.06em" }}>
                Current password
              </label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={pw}
                  onChange={(e) => { setPw(e.target.value); setPwError(null); }}
                  className="w-full rounded-lg border bg-white px-3 py-2.5 pr-10 text-[14px] outline-none focus:border-[#e5322d]"
                  style={{ borderColor: pwError ? "#e5322d" : "#ececef", color: "#33333c" }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-md text-[#7a7a86] hover:bg-[#f6f4f9]"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {pwError && (
                <p className="mt-1.5 text-[12.5px] font-medium" style={{ color: "#e5322d" }}>{pwError}</p>
              )}
            </div>
          )}

          {status.kind === "unlocked" && (
            <InfoTip>
              This PDF has owner restrictions but no open password. Click Unlock PDF to remove the
              restrictions.
            </InfoTip>
          )}

          {status.kind === "unprotected" && (
            <InfoTip>This PDF has no open password — nothing to unlock.</InfoTip>
          )}

          {status.kind === "invalid" && (
            <p className="text-[13px]" style={{ color: "#e5322d" }}>{status.message}</p>
          )}

          <InfoTip>Only unlock files you own or have the right to modify.</InfoTip>
        </>
      }
      hideAction={status.kind === "unprotected" || status.kind === "invalid" || status.kind === "checking"}
    >
      {status.kind === "needs-password" ? (
        <LockedFileCard file={file} onRemove={() => setFiles([])} />
      ) : (
        <SelectedFileCard file={file} onRemove={() => setFiles([])} />
      )}
    </ToolWorkspace>
  );
}

function LockedFileCard({ file, onRemove }: { file: File; onRemove: () => void }) {
  const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-5" style={{ border: "1px solid #ececef" }}>
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl text-white" style={{ backgroundColor: "#e5322d" }}>
        <Lock className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold" style={{ color: "#33333c" }}>{file.name}</p>
        <p className="mt-0.5 text-[12.5px]" style={{ color: "#7a7a86" }}>
          {sizeMb} MB · Password-protected
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#7a7a86] transition-colors hover:bg-[#fbecec] hover:text-[#e5322d]"
        aria-label="Remove file"
      >
        ×
      </button>
    </div>
  );
}
