import { useState } from "react";
import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { ActionBar } from "@/components/ActionBar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { ensurePdfWorker } from "@/lib/pdfWorker";
import { downloadBlob } from "@/lib/download";

export default function PdfToText() {
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  const run = async () => {
    const file = files[0];
    if (!file) return;
    setLoading(true);
    setProgress(0);
    setText("");
    try {
      const pdfjs = ensurePdfWorker();
      const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      const chunks: string[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((it) => ("str" in it ? it.str : "")).join(" ");
        chunks.push(`--- Page ${i} ---\n${pageText}`);
        setProgress((i / doc.numPages) * 100);
      }
      setText(chunks.join("\n\n"));
      toast.success("Text extracted");
    } catch (e) {
      toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  return (
    <div>
      <FileDropzone accept="application/pdf" files={files} onFilesChange={setFiles} />
      <ActionBar onRun={run} disabled={!files.length} loading={loading} progress={progress} label="Extract Text" />
      {text && (
        <div className="mt-6">
          <Textarea value={text} readOnly rows={16} className="font-mono text-sm" />
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                await navigator.clipboard.writeText(text);
                toast.success("Copied to clipboard");
              }}
            >
              <Copy className="h-4 w-4 mr-2" /> Copy
            </Button>
            <Button
              onClick={() => downloadBlob(new Blob([text], { type: "text/plain" }), `${files[0].name.replace(/\.pdf$/i, "")}.txt`)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" /> Download .txt
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
