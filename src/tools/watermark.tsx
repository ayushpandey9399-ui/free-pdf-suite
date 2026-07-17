import { useState } from "react";
import { StandardFonts, degrees, rgb } from "pdf-lib";
import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { ActionBar } from "@/components/ActionBar";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { downloadBlob } from "@/lib/download";
import { loadPdfLibDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";

export default function Watermark() {
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<"text" | "image">("text");
  const [text, setText] = useState("CONFIDENTIAL");
  const [size, setSize] = useState(48);
  const [opacity, setOpacity] = useState(0.3);
  const [angle, setAngle] = useState(-30);
  const [color, setColor] = useState("#ff0000");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const { protectedName, reset } = usePdfPasswordCheck(files, () => setFiles([]));

  const resetAll = () => {
    setFiles([]);
    setMode("text");
    setText("CONFIDENTIAL");
    setSize(48);
    setOpacity(0.3);
    setAngle(-30);
    setColor("#ff0000");
    setImageFile(null);
    setResult(null);
  };

  const run = async () => {
    const file = files[0];
    if (!file) return;
    setLoading(true);
    try {
      const doc = await loadPdfLibDoc(await file.arrayBuffer());
      const pages = doc.getPages();

      if (mode === "text") {
        const font = await doc.embedFont(StandardFonts.HelveticaBold);
        const [r, g, b] = hexToRgb(color);
        for (const page of pages) {
          const { width, height } = page.getSize();
          const w = font.widthOfTextAtSize(text, size);
          page.drawText(text, {
            x: (width - w) / 2,
            y: height / 2,
            size,
            font,
            color: rgb(r, g, b),
            opacity,
            rotate: degrees(angle),
          });
        }
      } else {
        if (!imageFile) throw new Error("Choose an image file");
        const buf = await imageFile.arrayBuffer();
        const isPng = imageFile.type.includes("png") || imageFile.name.toLowerCase().endsWith(".png");
        const img = isPng ? await doc.embedPng(buf) : await doc.embedJpg(buf);
        for (const page of pages) {
          const { width, height } = page.getSize();
          const scale = Math.min(width, height) * 0.5 / Math.max(img.width, img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          page.drawImage(img, {
            x: (width - w) / 2,
            y: (height - h) / 2,
            width: w,
            height: h,
            opacity,
            rotate: degrees(angle),
          });
        }
      }
      const bytes = await doc.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      setResult({ blob, filename: `${file.name.replace(/\.pdf$/i, "")}-watermarked.pdf` });
      toast.success("Watermark applied");
    } catch (e) {
      if (isPdfPasswordError(e)) toast.error("PDF is password-protected");
      else toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <ToolSuccessScreen
        heading="Watermark applied!"
        subheading="Your PDF has been stamped."
        downloadLabel="Download Watermarked PDF"
        onDownload={() => downloadBlob(result.blob, result.filename, "application/pdf")}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS.watermark}
      />
    );
  }

  return (
    <div>
      <FileDropzone accept="application/pdf" files={files} onFilesChange={setFiles} />
      {protectedName ? (
        <PasswordProtectedNotice fileName={protectedName} onReset={reset} />
      ) : (
        <>
          {files[0] && (
            <div className="mt-6 rounded-xl border bg-card p-4">
              <Tabs value={mode} onValueChange={(v) => setMode(v as never)}>
                <TabsList>
                  <TabsTrigger value="text">Text</TabsTrigger>
                  <TabsTrigger value="image">Image</TabsTrigger>
                </TabsList>
                <TabsContent value="text" className="grid gap-4 sm:grid-cols-2 mt-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="wm-text">Text</Label>
                    <Input id="wm-text" value={text} onChange={(e) => setText(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Size: {size}pt</Label>
                    <Slider value={[size]} min={12} max={144} step={2} onValueChange={(v) => setSize(v[0])} className="mt-3" />
                  </div>
                  <div>
                    <Label>Angle: {angle}°</Label>
                    <Slider value={[angle]} min={-90} max={90} step={5} onValueChange={(v) => setAngle(v[0])} className="mt-3" />
                  </div>
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input id="color" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="mt-1 h-10 w-full" />
                  </div>
                  <div>
                    <Label>Opacity: {Math.round(opacity * 100)}%</Label>
                    <Slider value={[opacity * 100]} min={5} max={100} step={5} onValueChange={(v) => setOpacity(v[0] / 100)} className="mt-3" />
                  </div>
                </TabsContent>
                <TabsContent value="image" className="grid gap-4 sm:grid-cols-2 mt-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="img">Watermark image (PNG/JPG)</Label>
                    <Input id="img" type="file" accept="image/png,image/jpeg" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Angle: {angle}°</Label>
                    <Slider value={[angle]} min={-90} max={90} step={5} onValueChange={(v) => setAngle(v[0])} className="mt-3" />
                  </div>
                  <div>
                    <Label>Opacity: {Math.round(opacity * 100)}%</Label>
                    <Slider value={[opacity * 100]} min={5} max={100} step={5} onValueChange={(v) => setOpacity(v[0] / 100)} className="mt-3" />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <ActionBar
            onRun={run}
            disabled={!files.length}
            loading={loading}
            label={loading ? "Applying watermark…" : "Apply Watermark"}
          />
        </>
      )}
    </div>
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "").match(/^([0-9a-f]{6})$/i);
  if (!m) return [0, 0, 0];
  const int = parseInt(m[1], 16);
  return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255];
}
