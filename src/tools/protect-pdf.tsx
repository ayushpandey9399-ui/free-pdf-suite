import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace, InfoTip } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { SelectedFileCard } from "@/components/SelectedFileCard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { downloadBlob } from "@/lib/download";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { usePdfStats } from "@/hooks/usePdfStats";
import { loadMupdf } from "@/lib/mupdfLoader";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";

function scorePassword(pw: string): { label: string; pct: number; color: string } {
  if (!pw) return { label: "", pct: 0, color: "#ececef" };
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { label: "Weak", pct: 33, color: "#e5322d" };
  if (s <= 3) return { label: "Medium", pct: 66, color: "#f28c1e" };
  return { label: "Strong", pct: 100, color: "#1f9d55" };
}

export default function ProtectPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);

  const { protectedName, reset } = usePdfPasswordCheck(files, () => setFiles([]));
  const { pageCount } = usePdfStats(files[0]);

  useEffect(() => {
    // preload wasm in background as soon as a file is selected
    if (files[0]) loadMupdf().catch(() => {});
  }, [files]);

  const strength = useMemo(() => scorePassword(pw1), [pw1]);
  const tooShort = pw1.length > 0 && pw1.length < 4;
  const mismatch = pw1.length >= 4 && pw2.length > 0 && pw1 !== pw2;
  const valid = pw1.length >= 4 && pw1 === pw2;

  const resetAll = () => {
    setFiles([]); setPw1(""); setPw2(""); setResult(null);
  };

  const run = async () => {
    const file = files[0];
    if (!file || !valid) return;
    setLoading(true);
    try {
      const mupdf = await loadMupdf();
      const bytes = new Uint8Array(await file.arrayBuffer());
      const doc = mupdf.PDFDocument.openDocument(bytes, "application/pdf") as unknown as import("mupdf").PDFDocument;
      const buf = doc.saveToBuffer({
        encrypt: "aes-256",
        "user-password": pw1,
        "owner-password": pw1,
      });
      const out = buf.asUint8Array();
      // Copy into a plain ArrayBuffer to detach from wasm memory.
      const copy = new Uint8Array(out.length);
      copy.set(out);
      const base = file.name.replace(/\.pdf$/i, "");
      setResult({
        blob: new Blob([copy], { type: "application/pdf" }),
        filename: `${base}-protected.pdf`,
      });
      toast.success("PDF protected");
    } catch (e) {
      toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <ToolSuccessScreen
        heading="PDF protected!"
        subheading="Your password-protected PDF is ready to download."
        downloadLabel="Download PDF"
        onDownload={() => downloadBlob(result.blob, result.filename, "application/pdf")}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS["protect-pdf"] ?? []}
      />
    );
  }

  if (!files.length) {
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

  if (protectedName) {
    return <PasswordProtectedNotice onReset={reset} fileName={protectedName} />;
  }

  return (
    <ToolWorkspace
      title="Protect PDF"
      actionLabel="Protect PDF"
      onAction={run}
      actionDisabled={!valid}
      loading={loading}
      loadingLabel="Encrypting…"
      sidebar={
        <>
          <PwField
            label="Set password"
            value={pw1}
            onChange={setPw1}
            show={show}
            onToggle={() => setShow((v) => !v)}
          />
          {strength.label && (
            <div>
              <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "#ececef" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${strength.pct}%`, backgroundColor: strength.color }}
                />
              </div>
              <p className="mt-1 text-[12px] font-semibold" style={{ color: strength.color }}>
                {strength.label}
              </p>
            </div>
          )}
          {tooShort && (
            <p className="text-[12.5px] font-medium" style={{ color: "#e5322d" }}>
              Password must be at least 4 characters.
            </p>
          )}
          <PwField
            label="Repeat password"
            value={pw2}
            onChange={setPw2}
            show={show}
            onToggle={() => setShow((v) => !v)}
          />
          {mismatch && (
            <p className="text-[12.5px] font-medium" style={{ color: "#e5322d" }}>
              Passwords do not match.
            </p>
          )}
          <InfoTip>
            Your file is encrypted with AES-256 in your browser. We never see your file or your
            password. If you forget the password, it cannot be recovered.
          </InfoTip>
        </>
      }
    >
      <SelectedFileCard file={files[0]} pageCount={pageCount || undefined} onRemove={() => setFiles([])} />
    </ToolWorkspace>
  );
}

function PwField({
  label, value, onChange, show, onToggle,
}: { label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12.5px] font-bold uppercase" style={{ color: "#5a5a66", letterSpacing: "0.06em" }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border bg-white px-3 py-2.5 pr-10 text-[14px] outline-none focus:border-[#e5322d]"
          style={{ borderColor: "#ececef", color: "#33333c" }}
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-md text-[#5a5a66] hover:bg-[#f6f4f9]"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
