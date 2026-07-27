import { useCallback, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, ServerCog, X } from "lucide-react";
import { UploadDropzone } from "@/components/UploadDropzone";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";

import { saveAs } from "@/lib/saveFile";
import {
  PDF_TO_WORD_ENDPOINT,
  PDF_TO_WORD_TIMEOUT_MS,
  DOCX_MIME,
  buildPdfToWordForm,
  docxNameFor,
  messageForStatus,
  shouldOfferUnlockLink,
  validatePdfSelection,
} from "@/lib/pdfToWord";

type Phase = "idle" | "uploading" | "converting" | "done" | "error";

const TRUST_NOTE =
  "This tool uploads your PDF to our server, converts it, and deletes it within minutes.";

export default function PdfToWord() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [percent, setPercent] = useState(0);
  const [error, setError] = useState<{ message: string; unlock: boolean } | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string; sizeMb: string } | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const resetAll = useCallback(() => {
    xhrRef.current?.abort();
    xhrRef.current = null;
    setPhase("idle");
    setPercent(0);
    setError(null);
    setResult(null);
  }, []);

  const upload = useCallback((file: File) => {
    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    const form = new FormData();
    form.append("file", file);

    xhr.open("POST", PDF_TO_WORD_ENDPOINT, true);
    xhr.responseType = "blob";

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        setPercent(pct);
        if (pct >= 100) setPhase("converting");
      }
    };
    xhr.upload.onload = () => {
      setPercent(100);
      setPhase("converting");
    };
    xhr.onerror = () => {
      xhrRef.current = null;
      setError({ message: messageForStatus("network"), unlock: false });
      setPhase("error");
    };
    xhr.ontimeout = () => {
      xhrRef.current = null;
      setError({ message: messageForStatus(504), unlock: false });
      setPhase("error");
    };
    xhr.onload = () => {
      xhrRef.current = null;
      if (xhr.status === 200) {
        const name = docxNameFor(file.name);
        const blob = new Blob([xhr.response], { type: DOCX_MIME });
        setResult({ blob, name, sizeMb: (blob.size / 1024 / 1024).toFixed(2) });
        setPhase("done");
        return;
      }
      setError({
        message: messageForStatus(xhr.status),
        unlock: shouldOfferUnlockLink(xhr.status),
      });
      setPhase("error");
    };

    setPercent(0);
    setPhase("uploading");
    xhr.send(form);
  }, []);

  const onFiles = useCallback(
    async (incoming: FileList | File[]) => {
      const file = Array.from(incoming)[0];
      if (!file) return;
      setError(null);

      const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
      const check = validatePdfSelection({ name: file.name, size: file.size, header });
      if (!check.ok) {
        setError({ message: check.message, unlock: false });
        setPhase("error");
        return;
      }

      // The encrypted check needs pdf-lib, so it is loaded lazily and only
      // after a file has been picked. Nothing is uploaded until it passes.
      try {
        const { isPdfPasswordProtected } = await import("@/lib/pdfGuard");
        if (await isPdfPasswordProtected(file)) {
          setError({
            message: messageForStatus(422),
            unlock: true,
          });
          setPhase("error");
          return;
        }
      } catch {
        // If the guard itself fails to load we let the server decide.
      }

      upload(file);
    },
    [upload],
  );

  if (phase === "done" && result) {
    return (
      <ToolSuccessScreen
        heading="Your Word file is ready"
        subheading={`${result.name}, ${result.sizeMb} MB. Your PDF has been deleted from our server.`}
        downloadLabel="Download .docx"
        onDownload={() => saveAs(result.blob, result.name)}
        onReset={resetAll}
        resetLabel="Convert another file"
        suggestedSlugs={TOOL_SUGGESTIONS["pdf-to-word"] ?? []}
        trustBadge={
          <div
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-[13px] font-semibold"
            style={{ backgroundColor: "#f6f4f9", color: "#5a5a66" }}
          >
            <ServerCog className="h-4 w-4" aria-hidden />
            Your PDF was converted on our server and deleted right after this download was sent.
          </div>
        }
      >
        <p className="text-center text-[13px]" style={{ color: "#8b8b96" }}>
          Works best on text based PDFs. Scanned pages come through as images, not editable text.
        </p>
      </ToolSuccessScreen>

    );
  }

  if (phase === "uploading" || phase === "converting") {
    const uploading = phase === "uploading";
    return (
      <div className="mx-auto w-full max-w-[520px] px-1">
        <div
          className="rounded-2xl bg-white p-6 text-center"
          style={{ border: "1px solid #ececef" }}
        >
          <div className="flex items-center justify-center gap-2 text-[15px] font-semibold text-[#33333c]">
            {uploading ? (
              <ServerCog className="h-4 w-4 text-[#e5322d]" aria-hidden />
            ) : (
              <Loader2 className="h-4 w-4 animate-spin text-[#e5322d]" aria-hidden />
            )}
            {uploading ? "Uploading your PDF" : "Converting on our server"}
          </div>

          <div
            className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#f1f1f4]"
            role="progressbar"
            aria-label={uploading ? "Upload progress" : "Conversion in progress"}
            aria-valuenow={uploading ? percent : undefined}
            aria-valuemin={uploading ? 0 : undefined}
            aria-valuemax={uploading ? 100 : undefined}
          >
            <div
              className={`h-full rounded-full bg-[#e5322d] ${uploading ? "transition-[width] duration-200" : "animate-pulse"}`}
              style={{ width: uploading ? `${percent}%` : "100%" }}
            />
          </div>

          <p aria-live="polite" className="mt-3 text-[13px]" style={{ color: "#6B7280" }}>
            {uploading
              ? `Uploading, ${percent}% complete.`
              : "Upload complete. Converting on our server, this usually takes a few seconds."}
          </p>

          <button
            type="button"
            onClick={resetAll}
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[14px] font-semibold text-[#5a5a66] transition-colors hover:bg-[#f6f4f9] hover:text-[#e5322d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e5322d]"
          >
            <X className="h-4 w-4" aria-hidden />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <UploadDropzone
        accept=".pdf,application/pdf"
        buttonLabel="Select PDF file"
        hint="or drop a PDF here"
        onFiles={onFiles}
        trustNote={TRUST_NOTE}
      />

      <div aria-live="polite" className="px-4">
        {error ? (
          <div
            className="mx-auto max-w-[520px] rounded-xl p-4 text-[14px]"
            style={{ backgroundColor: "#fdeceb", border: "1px solid #f6c7c5", color: "#8f1f1c" }}
          >
            <p>{error.message}</p>
            {error.unlock ? (
              <p className="mt-2">
                <Link
                  to="/tools/$slug"
                  params={{ slug: "unlock-pdf" }}
                  className="font-semibold underline"
                >
                  Open Unlock PDF
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <p className="mx-auto mt-8 max-w-[520px] px-4 text-center text-[13px]" style={{ color: "#8b8b96" }}>
        Works best on text based PDFs. Scanned pages come through as images, not editable text.
      </p>
    </div>
  );
}
