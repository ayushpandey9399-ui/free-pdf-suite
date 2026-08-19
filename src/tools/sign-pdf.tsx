import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import * as pdfjsLib from "pdfjs-dist";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { downloadBlob } from "@/lib/download";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";
import { SignatureCreator } from "@/components/sign-pdf/SignatureCreator";
import { SignWorkspace } from "@/components/sign-pdf/SignWorkspace";
import { Loader2 } from "lucide-react";
import confetti from "canvas-confetti";

// CRITICAL: Set worker source correctly
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
  const [screen, setScreen] = useState<Screen>("UPLOAD");
  const [file, setFile] = useState<File | null>(null);
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [signature, setSignature] = useState<SignatureData | null>(null);
  const [initials, setInitials] = useState<SignatureData | undefined>(undefined);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [placementsCount, setPlacementsCount] = useState(0);

  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setFile(selectedFile);
        setPdfBuffer(reader.result as ArrayBuffer);
        setScreen("CREATION");
      };
      reader.onerror = () => {
        toast.error("Failed to read PDF file.");
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const handleSignatureApplied = (sig: SignatureData, inits?: SignatureData) => {
    setSignature(sig);
    setInitials(inits);
    setScreen("EDITOR");
  };

  const handleSign = async (placements: Placement[]) => {
    if (!pdfBuffer || !signature || !file) return;
    
    setPlacementsCount(placements.length);
    setScreen("PROCESSING");

    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      pdfDoc.registerFontkit(fontkit);

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
        
        const pdfX = (p.x / 100) * width;
        const pdfY = height - ((p.y / 100) * height) - ((p.height / 100) * height);
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
          page.drawText(p.content, {
            x: pdfX,
            y: pdfY + (pdfH / 4),
            size: 14,
            color: rgb(0, 0, 0),
          });
        }
      }

      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      
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
    setPdfBuffer(null);
    setSignature(null);
    setInitials(undefined);
    setResult(null);
    setScreen("UPLOAD");
  };

  return (
    <div className="min-h-[600px]">
      {screen === "UPLOAD" && (
        <div className="mx-auto max-w-4xl py-12 px-4">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900">Sign PDF Online</h1>
            <p className="text-lg text-gray-600">
              Add your signature to any PDF document in seconds. 100% browser-based.
            </p>
          </div>
          <div className="bg-[#F7F7F8] p-8 rounded-3xl border border-gray-100 shadow-sm">
            <FileDropzone
              files={file ? [file] : []}
              onFilesChange={(files) => handleFileUpload(files)}
              accept="application/pdf"
              multiple={false}
            />
          </div>
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
        <div className="mx-auto max-w-3xl py-12 px-4">
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
      
      <SignPdfSeo />
    </div>
  );
}

const SignPdfSeo = () => (
  <div className="container mx-auto px-4 py-16">
    <div className="mx-auto max-w-4xl space-y-12">
      <section>
        <h2 className="mb-6 text-3xl font-bold">How to Sign a PDF Online</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-600">1</div>
            <h3 className="text-xl font-bold">Upload Document</h3>
            <p className="text-gray-600">Select the PDF document you want to sign from your computer or mobile device.</p>
          </div>
          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-600">2</div>
            <h3 className="text-xl font-bold">Create Signature</h3>
            <p className="text-gray-600">Draw your signature, type it using professional fonts, or upload an image of your physical signature.</p>
          </div>
          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-600">3</div>
            <h3 className="text-xl font-bold">Place and Download</h3>
            <p className="text-gray-600">Drag your signature onto the document, adjust the size, and download your securely signed PDF.</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-gray-50 p-8">
        <h2 className="mb-6 text-2xl font-bold">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-bold">Is it safe to sign my documents here?</h4>
            <p className="text-gray-600">Yes. Unlike other tools, we process your signature and PDF entirely in your browser. Your sensitive documents and signatures are never uploaded to any server.</p>
          </div>
          <div>
            <h4 className="text-lg font-bold">Can I add initials as well?</h4>
            <p className="text-gray-600">Absolutely. You can create both a full signature and initials, then place them multiple times throughout the document as needed.</p>
          </div>
          <div>
            <h4 className="text-lg font-bold">Do I need to pay or create an account?</h4>
            <p className="text-gray-600">No. Our PDF signing tool is 100% free and requires no registration. You can sign as many documents as you need without any watermarks.</p>
          </div>
        </div>
      </section>
    </div>
  </div>
);

export { SignPdfSeo };
