import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { downloadBlob } from "@/lib/download";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";
import { useIsMobile } from "@/hooks/use-mobile";
import { SignatureCreator } from "@/components/sign-pdf/SignatureCreator";
import { SignWorkspace } from "@/components/sign-pdf/SignWorkspace";
import { Loader2 } from "lucide-react";
import confetti from "canvas-confetti";

type Screen = "UPLOAD" | "CREATION" | "EDITOR" | "PROCESSING" | "SUCCESS";

interface SignatureData {
  dataUrl: string;
  width: number;
  height: number;
}

interface Placement {
  id: string;
  type: "signature" | "initials" | "date" | "name" | "text" | "stamp";
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  rotation: number;
}

export default function SignPdf() {
  const isMobile = useIsMobile();
  const [screen, setScreen] = useState<Screen>("UPLOAD");
  const [file, setFile] = useState<File | null>(null);
  const [signature, setSignature] = useState<SignatureData | null>(null);
  const [initials, setInitials] = useState<SignatureData | undefined>(undefined);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [placementsCount, setPlacementsCount] = useState(0);

  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setScreen("CREATION");
    }
  };

  const handleSignatureApplied = (sig: SignatureData, inits?: SignatureData) => {
    setSignature(sig);
    setInitials(inits);
    setScreen("EDITOR");
  };

  const handleSign = async (placements: Placement[]) => {
    if (!file || !signature) return;
    
    setPlacementsCount(placements.length);
    setScreen("PROCESSING");

    try {
      const pdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      pdfDoc.registerFontkit(fontkit);

      // Embed signature and initials images if they exist
      const embeddedImages: Record<string, any> = {};
      
      const sigImageBytes = await fetch(signature.dataUrl).then(res => res.arrayBuffer());
      embeddedImages.signature = await pdfDoc.embedPng(sigImageBytes);

      if (initials) {
        const initImageBytes = await fetch(initials.dataUrl).then(res => res.arrayBuffer());
        embeddedImages.initials = await pdfDoc.embedPng(initImageBytes);
      }

      const pages = pdfDoc.getPages();

      for (const p of placements) {
        const page = pages[p.pageIndex];
        const { width, height } = page.getSize();
        
        // Convert percentage coordinates to PDF points
        // In PDF, (0,0) is bottom-left. In browser, it's top-left.
        const pdfX = (p.x / 100) * width;
        const pdfY = height - ((p.y / 100) * height) - ((p.height / 100) * height);
        
        // Scale dimensions
        const pdfW = (p.width / 100) * width;
        const pdfH = (p.height / 100) * height;

        if (p.type === "signature" || p.type === "initials") {
          const img = p.type === "signature" ? embeddedImages.signature : embeddedImages.initials;
          if (img) {
            page.drawImage(img, {
              x: pdfX,
              y: pdfY,
              width: pdfW,
              height: pdfH,
              rotate: degrees(-p.rotation)
            });
          }
        } else {
          // Simplified text drawing for now (Standard fonts)
          page.drawText(p.content, {
            x: pdfX,
            y: pdfY + (pdfH / 4), // Adjust baseline
            size: 14,
            color: rgb(0, 0, 0),
          });
        }
      }

      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes.buffer], { type: "application/pdf" });
      
      setResult({
        blob,
        filename: `signed_${file.name}`
      });
      
      setScreen("SUCCESS");
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e5322d', '#ffffff', '#000000']
      });
    } catch (error) {
      console.error("Signing failed:", error);
      toast.error("Failed to sign PDF. Please try again.");
      setScreen("EDITOR");
    }
  };

  const reset = () => {
    setFile(null);
    setSignature(null);
    setInitials(undefined);
    setResult(null);
    setScreen("UPLOAD");
  };

  return (
    <div className="min-h-[600px]">
      {screen === "UPLOAD" && (
        <div className="mx-auto max-w-4xl py-12">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900">Sign PDF Online</h1>
            <p className="text-lg text-gray-600">
              Add your signature to any PDF document in seconds. 100% browser-based.
            </p>
          </div>
          <FileDropzone
            onFilesAdded={handleFileUpload}
            accept=".pdf"
            multiple={false}
            description="Select your PDF file to start signing"
          />
        </div>
      )}

      {screen === "CREATION" && (
        <div className="py-8">
          <SignatureCreator 
            onApply={handleSignatureApplied} 
            initialName="" 
          />
        </div>
      )}

      {screen === "EDITOR" && file && signature && (
        <SignWorkspace
          pdfFile={file}
          signature={signature}
          initials={initials}
          userName=""
          onSign={handleSign}
          onEditSignature={() => setScreen("CREATION")}
        />
      )}

      {screen === "PROCESSING" && (
        <div className="flex h-[600px] flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-4 border-gray-100 border-t-red-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-red-500 animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Applying your signature...</h2>
            <p className="mt-2 text-gray-500">Embedding signature into PDF locally on your device.</p>
          </div>
        </div>
      )}

      {screen === "SUCCESS" && result && (
        <div className="mx-auto max-w-3xl py-12">
          <ToolSuccessScreen
            heading="Your PDF has been signed!"
            subheading={`Successfully embedded ${placementsCount} field${placementsCount !== 1 ? 's' : ''} into "${result.filename}"`}
            downloadLabel="Download Signed PDF"
            onDownload={() => downloadBlob(result.blob, result.filename)}
            onReset={reset}
            suggestedSlugs={TOOL_SUGGESTIONS["sign-pdf"]}
          >
            <div className="mt-8 rounded-xl bg-blue-50 p-4 text-center text-sm text-blue-700 border border-blue-100">
              <strong>Security note:</strong> Your signature has been permanently embedded into the PDF. 
              Everything was processed locally in your browser.
            </div>
          </ToolSuccessScreen>
        </div>
      )}
    </div>
  );
}
