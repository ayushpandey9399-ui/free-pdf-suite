import { useState } from "react";
import { diffLines } from "diff";
import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { ActionBar } from "@/components/ActionBar";
import { loadPdfJsDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { cn } from "@/lib/utils";

async function extractText(file: File): Promise<string> {
  const doc = await loadPdfJsDoc(await file.arrayBuffer());
  const chunks: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    chunks.push(content.items.map((it) => ("str" in it ? it.str : "")).join(" "));
  }
  return chunks.join("\n");
}

export default function Compare() {
  const [a, setA] = useState<File[]>([]);
  const [b, setB] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ left: { text: string; kind: "same" | "removed" }[]; right: { text: string; kind: "same" | "added" }[] } | null>(null);
  const guardA = usePdfPasswordCheck(a, () => setA([]));
  const guardB = usePdfPasswordCheck(b, () => setB([]));
  const anyProtected = guardA.protectedName || guardB.protectedName;

  const run = async () => {
    if (!a[0] || !b[0]) {
      toast.error("Upload two PDFs to compare");
      return;
    }
    setLoading(true);
    try {
      const [ta, tb] = await Promise.all([extractText(a[0]), extractText(b[0])]);
      const parts = diffLines(ta, tb);
      const left: { text: string; kind: "same" | "removed" }[] = [];
      const right: { text: string; kind: "same" | "added" }[] = [];
      for (const p of parts) {
        if (p.added) right.push({ text: p.value, kind: "added" });
        else if (p.removed) left.push({ text: p.value, kind: "removed" });
        else {
          left.push({ text: p.value, kind: "same" });
          right.push({ text: p.value, kind: "same" });
        }
      }
      setResult({ left, right });
      toast.success("Comparison ready");
    } catch (e) {
      if (isPdfPasswordError(e)) toast.error("One of the PDFs is password-protected");
      else toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium mb-2">Original</p>
          <FileDropzone accept="application/pdf" files={a} onFilesChange={setA} />
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Modified</p>
          <FileDropzone accept="application/pdf" files={b} onFilesChange={setB} />
        </div>
      </div>
      {anyProtected ? (
        <PasswordProtectedNotice
          fileName={guardA.protectedName ?? guardB.protectedName ?? undefined}
          onReset={() => { guardA.reset(); guardB.reset(); }}
        />
      ) : (
        <>
          <ActionBar onRun={run} disabled={!a[0] || !b[0]} loading={loading} label="Compare PDFs" />
          {result && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <DiffPane title="Original" chunks={result.left} />
              <DiffPane title="Modified" chunks={result.right} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DiffPane({ title, chunks }: { title: string; chunks: { text: string; kind: "same" | "added" | "removed" }[] }) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="border-b px-3 py-2 text-sm font-medium">{title}</div>
      <pre className="p-3 text-xs whitespace-pre-wrap font-mono max-h-[500px] overflow-auto">
        {chunks.map((c, i) => (
          <span
            key={i}
            className={cn(
              c.kind === "added" && "bg-green-100 dark:bg-green-950/50",
              c.kind === "removed" && "bg-red-100 dark:bg-red-950/50",
            )}
          >
            {c.text}
          </span>
        ))}
      </pre>
    </div>
  );
}
