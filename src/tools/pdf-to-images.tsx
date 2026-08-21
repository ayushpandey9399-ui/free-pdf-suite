import { useState, useRef, useEffect } from "react";
import { 
  ArrowRight, 
  Check, 
  Download, 
  FileImage, 
  Loader2, 
  RotateCcw,
  Zap,
  LayoutGrid,
  Type,
  Maximize,
  CheckCircle2,
  Trash2,
  Lock,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

import { ToolWorkspace } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { PdfDropzone } from "@/components/pdf-to-images/PdfDropzone";
import { Progress } from "@/components/ui/progress";
import { ToolErrorCard } from "@/components/pdf-to-images/ToolErrorCard";

import { loadPdfJs, loadJSZip } from "@/lib/lazyLibs";
import { downloadBlob } from "@/lib/download";
import { cn } from "@/lib/utils";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


type Quality = "low" | "medium" | "high";
type Format = "jpg" | "png";
type DownloadAs = "individual" | "zip";
type Screen = "upload" | "workspace" | "processing" | "success";

interface PageThumbnail {
  index: number;
  dataUrl: string;
}

interface Result {
  images: string[];
  format: Format;
  quality: Quality;
  downloadAs: DownloadAs;
  filenamePrefix: string;
}


export default function PdfToImages() {
  const [screen, setScreen] = useState<Screen>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
  
  const [format, setFormat] = useState<Format>("jpg");
  const [quality, setQuality] = useState<Quality>("medium");
  const [downloadAs, setDownloadAs] = useState<DownloadAs>("zip");
  const [filenamePrefix, setFilenamePrefix] = useState("page");
  
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentProcessingPage, setCurrentProcessingPage] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  
  const [error, setError] = useState<{ message: string; isPassword?: boolean } | null>(null);


  const pdfInstance = useRef<any>(null);

  // 1. UPLOAD HANDLING
  const handleFile = async (next: File) => {
    setError(null);
    try {
      const buffer = await next.arrayBuffer();
      const pdfjs = await loadPdfJs();
      
      // Setup worker
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

      try {
        const loadingTask = pdfjs.getDocument({ data: buffer.slice(0) });
        const pdf = await loadingTask.promise;
        
        pdfInstance.current = pdf;
        setFile(next);
        setArrayBuffer(buffer);
        setTotalPages(pdf.numPages);
        setSelectedPages(Array.from({ length: pdf.numPages }, (_, i) => i));
        setScreen("workspace");
        
        // Start rendering thumbnails
        renderThumbnails(pdf);
      } catch (err: any) {
        if (err.name === 'PasswordException') {
          setError({ message: "This PDF is password protected.", isPassword: true });
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load PDF file.");
    }
  };

  const renderThumbnails = async (pdf: any) => {
    const newThumbnails: PageThumbnail[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.3 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
      newThumbnails.push({ index: i - 1, dataUrl: canvas.toDataURL() });
      setThumbnails([...newThumbnails]);
    }
  };

  // 2. WORKSPACE ACTIONS
  const togglePage = (index: number) => {
    setSelectedPages(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index].sort((a, b) => a - b)
    );
  };

  const toggleAll = () => {
    if (selectedPages.length === totalPages) {
      setSelectedPages([]);
    } else {
      setSelectedPages(Array.from({ length: totalPages }, (_, i) => i));
    }
  };

  // 3. CONVERSION LOGIC
  const runConversion = async () => {
    if (selectedPages.length === 0) {
      toast.error("Please select at least one page.");
      return;
    }

    setScreen("processing");
    setProcessing(true);
    setProgress(0);
    const results: string[] = [];

    const scaleMap = { low: 1.0, medium: 2.0, high: 4.0 };
    const scale = scaleMap[quality];

    try {
      const pdf = pdfInstance.current;
      for (let i = 0; i < selectedPages.length; i++) {
        const pageIdx = selectedPages[i];
        setCurrentProcessingPage(i + 1);
        
        const page = await pdf.getPage(pageIdx + 1);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        
        await page.render({ canvasContext: ctx, viewport }).promise;
        
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        const imgQuality = format === 'jpg' ? 0.92 : undefined;
        results.push(canvas.toDataURL(mimeType, imgQuality));
        
        setProgress(Math.round(((i + 1) / selectedPages.length) * 100));
      }

      const conversionResult = {
        images: results,
        format,
        quality,
        downloadAs,
        filenamePrefix
      };
      
      setResult(conversionResult);
      setScreen("success");
      
      if (downloadAs === "zip") {
        await handleZipDownload(results);
      }
    } catch (err) {
      console.error(err);
      toast.error("Conversion failed.");
      setScreen("workspace");
    } finally {
      setProcessing(false);
    }
  };

  const handleZipDownload = async (images: string[]) => {
    const JSZip = await loadJSZip();
    const zip = new JSZip();
    const ext = format === 'png' ? 'png' : 'jpg';

    images.forEach((dataUrl, i) => {
      const base64 = dataUrl.split(',')[1];
      const pageNum = selectedPages[i] + 1;
      zip.file(`${filenamePrefix}-${pageNum}.${ext}`, base64, { base64: true });
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, `${filenamePrefix}-images.zip`);
  };

  const downloadIndividual = async (dataUrl: string, index: number) => {
    const ext = format === 'png' ? 'png' : 'jpg';
    const pageNum = selectedPages[index] + 1;
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    downloadBlob(blob, `${filenamePrefix}-${pageNum}.${ext}`);
  };

  const reset = () => {
    setFile(null);
    setArrayBuffer(null);
    setThumbnails([]);
    setSelectedPages([]);
    setResult(null);
    setScreen("upload");
    setError(null);
    pdfInstance.current = null;
  };


  // RENDER UPLOAD
  if (screen === "upload") {
    if (error?.isPassword) {
      return (
        <ToolErrorCard
          message={error.message}
          offerUnlock={true}
          onRetry={reset}
          retryLabel="Try another PDF"
        />
      );
    }
    return <PdfDropzone onFile={handleFile} maxSizeLabel="50 MB" />;
  }

  // RENDER PROCESSING
  if (screen === "processing") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-8 relative">
          <div className="h-24 w-24 rounded-full border-4 border-neutral-100 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#e5322d]" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-neutral-800">Converting your PDF...</h2>
        <p className="mt-2 text-neutral-500">Converting page {currentProcessingPage} of {selectedPages.length}...</p>
        
        <div className="mt-10 w-full max-w-md mx-auto">
          <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-100">
            <div 
              className="h-full bg-[#e5322d] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-sm font-bold text-[#e5322d]">{progress}%</p>
        </div>
      </div>
    );
  }

  // RENDER SUCCESS
  if (screen === "success" && result) {
    return (
      <ToolSuccessScreen
        heading="Your images are ready!"
        onReset={reset}
        resetLabel="Convert another PDF"
        suggestedSlugs={["compress", "merge", "images-to-pdf", "extract-images"]}
      >
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-neutral-400">Images</dt>
                <dd className="mt-1 text-lg font-bold text-neutral-800">{result.images.length}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-neutral-400">Format</dt>
                <dd className="mt-1 text-lg font-bold text-neutral-800 uppercase">{result.format}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-neutral-400">Quality</dt>
                <dd className="mt-1 text-lg font-bold text-neutral-800 capitalize">{result.quality}</dd>
              </div>
            </div>
          </div>

          {result.downloadAs === "zip" ? (
            <button
              onClick={() => handleZipDownload(result.images)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e5322d] py-4 text-lg font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
            >
              <Download className="h-6 w-6" />
              Download ZIP Archive
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {result.images.map((img, i) => (
                <div key={i} className="group relative overflow-hidden rounded-xl border bg-neutral-50 p-2 text-center transition-all hover:border-[#e5322d]">
                  <img src={img} className="aspect-square w-full rounded-lg object-cover shadow-sm" alt={`Page ${selectedPages[i] + 1}`} />
                  <p className="mt-2 text-xs font-medium text-neutral-500">Page {selectedPages[i] + 1}</p>
                  <button 
                    onClick={() => downloadIndividual(img, i)}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#e5322d] hover:underline"
                  >
                    <Download className="h-3 w-3" /> Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </ToolSuccessScreen>
    );
  }


  // WORKSPACE RENDER
  return (
    <ToolWorkspace
      title="PDF to Image options"
      actionLabel="Convert to Images"
      onAction={runConversion}
      actionDisabled={selectedPages.length === 0}
      disabledReason="Select at least one page"
      sidebar={
        <div className="space-y-6">
          {/* Output Format */}
          <div>
            <label className="text-[13px] font-bold uppercase tracking-wider text-neutral-500">Output Format</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["jpg", "png"] as Format[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={cn(
                    "flex h-10 items-center justify-center rounded-lg border text-sm font-bold uppercase transition-all",
                    format === f 
                      ? "border-[#e5322d] bg-[#e5322d] text-white" 
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Image Quality */}
          <div>
            <label className="text-[13px] font-bold uppercase tracking-wider text-neutral-500">Image Quality</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["low", "medium", "high"] as Quality[]).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={cn(
                    "flex h-10 items-center justify-center rounded-lg border text-[13px] font-bold capitalize transition-all",
                    quality === q 
                      ? "border-[#e5322d] bg-[#e5322d] text-white" 
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                  )}
                >
                  {q}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-neutral-400 italic">
              {quality === 'high' && "High quality = larger file sizes"}
              {quality === 'medium' && "150 DPI - balanced resolution"}
              {quality === 'low' && "72 DPI - smallest files"}
            </p>
          </div>

          {/* Download Options */}
          <div>
            <label className="text-[13px] font-bold uppercase tracking-wider text-neutral-500">Download As</label>
            <div className="mt-3 space-y-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-100 bg-neutral-50/50 p-3 transition-colors hover:bg-neutral-50">
                <input 
                  type="radio" 
                  className="h-4 w-4 accent-[#e5322d]" 
                  checked={downloadAs === 'zip'} 
                  onChange={() => setDownloadAs('zip')} 
                />
                <span className="text-sm font-semibold text-neutral-700">ZIP Archive</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-100 bg-neutral-50/50 p-3 transition-colors hover:bg-neutral-50">
                <input 
                  type="radio" 
                  className="h-4 w-4 accent-[#e5322d]" 
                  checked={downloadAs === 'individual'} 
                  onChange={() => setDownloadAs('individual')} 
                />
                <span className="text-sm font-semibold text-neutral-700">Individual images</span>
              </label>
            </div>
          </div>

          {/* Filename Prefix */}
          <div>
            <label className="text-[13px] font-bold uppercase tracking-wider text-neutral-500">Filename Prefix</label>
            <div className="mt-2 relative">
              <input
                type="text"
                value={filenamePrefix}
                onChange={(e) => setFilenamePrefix(e.target.value)}
                placeholder="Prefix..."
                className="h-11 w-full rounded-lg border border-neutral-200 px-4 text-sm font-medium focus:border-[#e5322d] focus:outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 uppercase">
                .{format}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-neutral-400">
              Files named: {filenamePrefix}-1.{format}, {filenamePrefix}-2.{format}...
            </p>
          </div>
        </div>
      }
      extraSidebarButton={
        <div className="mt-4 border-t pt-4">
          <p className="text-[12px] font-medium text-neutral-500">
            {totalPages} pages — <span className="font-bold text-[#e5322d]">{selectedPages.length} selected</span>
          </p>
        </div>
      }
    >
      <div className="bg-[#F7F7F8] rounded-2xl p-6 min-h-[600px]">
        {/* Selection Toolbar */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={toggleAll}
            className="text-xs font-bold uppercase tracking-wide text-neutral-500 hover:text-[#e5322d]"
          >
            {selectedPages.length === totalPages ? "Deselect All" : "Select All"}
          </button>
          <span className="text-[11px] font-bold text-neutral-400 uppercase">
            Click to select/deselect pages
          </span>
        </div>

        {/* Thumbnails Grid */}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: totalPages }).map((_, i) => {
            const thumb = thumbnails.find(t => t.index === i);
            const isSelected = selectedPages.includes(i);
            
            return (
              <div
                key={i}
                onClick={() => togglePage(i)}
                className={cn(
                  "group relative cursor-pointer overflow-hidden rounded-xl bg-white transition-all duration-200 shadow-sm",
                  isSelected 
                    ? "ring-2 ring-[#e5322d] shadow-md -translate-y-0.5" 
                    : "hover:shadow-md hover:-translate-y-0.5"
                )}
              >
                {/* Thumbnail Preview */}
                <div className="aspect-[3/4] w-full bg-neutral-100 flex items-center justify-center overflow-hidden">
                  {thumb ? (
                    <img src={thumb.dataUrl} alt={`Page ${i + 1}`} className="w-full h-full object-contain" />
                  ) : (
                    <Loader2 className="h-5 w-5 animate-spin text-neutral-300" />
                  )}
                </div>

                {/* Info Bar */}
                <div className="bg-white p-2 text-center border-t border-neutral-50">
                  <p className={cn("text-[11px] font-bold uppercase", isSelected ? "text-[#e5322d]" : "text-neutral-500")}>
                    Page {i + 1}
                  </p>
                </div>

                {/* Selection Overlay */}
                <div className={cn(
                  "absolute top-2 left-2 flex h-5 w-5 items-center justify-center rounded-md transition-all",
                  isSelected ? "bg-[#e5322d] scale-100" : "bg-white/90 scale-0 group-hover:scale-75 shadow-sm border border-neutral-200"
                )}>
                  {isSelected && <Check className="h-3 w-3 text-white" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ToolWorkspace>
  );
}

function SidebarOptions({ 
  format, setFormat, 
  quality, setQuality, 
  downloadAs, setDownloadAs, 
  filenamePrefix, setFilenamePrefix 
}: {
  format: Format; setFormat: (f: Format) => void;
  quality: Quality; setQuality: (q: Quality) => void;
  downloadAs: DownloadAs; setDownloadAs: (d: DownloadAs) => void;
  filenamePrefix: string; setFilenamePrefix: (p: string) => void;
}) {
  return (
    <div className="space-y-6 text-left">
      {/* Output Format */}
      <div>
        <label className="text-[13px] font-bold uppercase tracking-wider text-neutral-500">Output Format</label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(["jpg", "png"] as Format[]).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={cn(
                "flex h-10 items-center justify-center rounded-lg border text-sm font-bold uppercase transition-all",
                format === f 
                  ? "border-[#e5322d] bg-[#e5322d] text-white" 
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Image Quality */}
      <div>
        <label className="text-[13px] font-bold uppercase tracking-wider text-neutral-500">Image Quality</label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(["low", "medium", "high"] as Quality[]).map((q) => (
            <button
              key={q}
              onClick={() => setQuality(q)}
              className={cn(
                "flex h-10 items-center justify-center rounded-lg border text-[13px] font-bold capitalize transition-all",
                quality === q 
                  ? "border-[#e5322d] bg-[#e5322d] text-white" 
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
              )}
            >
              {q}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-neutral-400 italic">
          {quality === 'high' && "High quality = 300 DPI (print)"}
          {quality === 'medium' && "150 DPI - balanced resolution"}
          {quality === 'low' && "72 DPI - smallest files"}
        </p>
      </div>

      {/* Download Options */}
      <div>
        <label className="text-[13px] font-bold uppercase tracking-wider text-neutral-500">Download As</label>
        <div className="mt-3 space-y-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-100 bg-neutral-50/50 p-3 transition-colors hover:bg-neutral-50">
            <input 
              type="radio" 
              name="download-method"
              className="h-4 w-4 accent-[#e5322d]" 
              checked={downloadAs === 'zip'} 
              onChange={() => setDownloadAs('zip')} 
            />
            <span className="text-sm font-semibold text-neutral-700">ZIP Archive</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-100 bg-neutral-50/50 p-3 transition-colors hover:bg-neutral-50">
            <input 
              type="radio" 
              name="download-method"
              className="h-4 w-4 accent-[#e5322d]" 
              checked={downloadAs === 'individual'} 
              onChange={() => setDownloadAs('individual')} 
            />
            <span className="text-sm font-semibold text-neutral-700">Individual images</span>
          </label>
        </div>
      </div>

      {/* Filename Prefix */}
      <div>
        <label className="text-[13px] font-bold uppercase tracking-wider text-neutral-500">Filename Prefix</label>
        <div className="mt-2 relative">
          <input
            type="text"
            value={filenamePrefix}
            onChange={(e) => setFilenamePrefix(e.target.value)}
            placeholder="Prefix..."
            className="h-11 w-full rounded-lg border border-neutral-200 px-4 text-sm font-medium focus:border-[#e5322d] focus:outline-none"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 uppercase">
            .{format}
          </span>
        </div>
        <p className="mt-2 text-[11px] text-neutral-400">
          Files named: {filenamePrefix}-1.{format}, {filenamePrefix}-2.{format}...
        </p>
      </div>
    </div>
  );
}
