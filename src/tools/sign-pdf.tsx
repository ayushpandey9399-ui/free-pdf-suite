import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  ZoomIn, ZoomOut, Maximize, MousePointer2, 
  Signature as SignatureIcon, Calendar, Type, 
  Building2, Trash2, Undo, Redo, 
  ChevronLeft, ChevronRight, X, Loader2, Plus, Edit2, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileDropzone } from "@/components/FileDropzone";
import * as pdfjsLib from "pdfjs-dist";
import { loadPdfJsDoc } from "@/lib/pdfGuard";
import { PDFDocument } from "pdf-lib";
import { downloadBlob } from "@/lib/download";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type Screen = "UPLOAD" | "WORKAREA" | "PROCESSING" | "SUCCESS";

interface Placement {
  id: string;
  type: "signature" | "initials" | "date" | "name" | "text" | "stamp";
  pageIndex: number;
  x: number;
  y: number;
}

export default function SignPdf() {
  const [screen, setScreen] = useState<Screen>("UPLOAD");
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<{ url: string; width: number; height: number }[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [activePage, setActivePage] = useState(0);

  const handleFileUpload = async (files: File[]) => {
      if (files.length > 0) {
          const selectedFile = files[0];
          setFile(selectedFile);
          
          try {
              const arrayBuffer = await selectedFile.arrayBuffer();
              const pdf = await loadPdfJsDoc(arrayBuffer);
              
              const renderedPages = [];
              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d")!;
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport, canvas }).promise;
                renderedPages.push({
                    url: canvas.toDataURL("image/png"),
                    width: viewport.width,
                    height: viewport.height
                });
              }
              setPages(renderedPages);
              setScreen("WORKAREA");
          } catch (e) {
              console.error(e);
          }
      }
  };

  const addPlacement = (type: Placement['type']) => {
    setPlacements(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      type,
      pageIndex: activePage,
      x: 50,
      y: 50 + (placements.length * 20)
    }]);
  };

  const downloadSignedPdf = async () => {
    setScreen("PROCESSING");
    const arrayBuffer = await file!.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    // Simplistic placement overlay demo logic
    placements.forEach(p => {
        // Here we would use pdfDoc.getPage(p.pageIndex).drawText(...)
    });

    const pdfBytes = await pdfDoc.save();
    downloadBlob(new Blob([pdfBytes], { type: "application/pdf" }), "signed.pdf");
    setScreen("SUCCESS");
  };

  return (
    <div className="min-h-[600px]">
      {screen === "UPLOAD" && (
        <div className="mx-auto max-w-4xl py-12 px-4 text-center">
            <h1 className="text-4xl font-bold mb-8">Sign PDF Online</h1>
            <FileDropzone
              files={file ? [file] : []}
              onFilesChange={handleFileUpload}
              accept="application/pdf"
              multiple={false}
            />
        </div>
      )}
      
      {screen === "WORKAREA" && file && (
          <div className="flex h-[calc(100vh-120px)] w-full overflow-hidden bg-[#F7F7F8]">
              {/* Left sidebar (thumbnails) */}
              <div className="w-40 border-r bg-[#F1F1F1] p-4 overflow-y-auto flex flex-col gap-4">
                  {pages.map((p, i) => (
                      <div key={i} onClick={() => setActivePage(i)} className={cn("bg-white p-1 shadow-sm border-2 cursor-pointer hover:border-red-500", activePage === i ? "border-red-500" : "border-gray-200")}>
                          <img src={p.url} alt={`Page ${i+1}`} className="w-full h-auto" />
                          <p className="text-[10px] text-center mt-1">{i+1}</p>
                      </div>
                  ))}
              </div>
              
              {/* Main content */}
              <div className="flex-1 flex flex-col">
                  {/* Top bar */}
                  <div className="bg-white border-b px-4 py-2 flex items-center gap-4">
                      <Button variant="ghost" size="icon" onClick={() => setActivePage(p => Math.max(0, p-1))}><ChevronLeft /></Button>
                      <span className="font-medium text-sm">{activePage + 1} / {pages.length}</span>
                      <Button variant="ghost" size="icon" onClick={() => setActivePage(p => Math.min(pages.length - 1, p+1))}><ChevronRight /></Button>
                      <span className="text-gray-400 mx-auto text-sm">{file.name}</span>
                  </div>
                  {/* PDF Viewer area */}
                  <div className="flex-1 overflow-auto bg-[#E5E5E5] p-8 flex justify-center relative">
                      <div className="bg-white shadow-lg p-2 relative" style={{ width: 600, height: 850 }}>
                          <img src={pages[activePage].url} alt={`Page ${activePage+1}`} className="w-full h-full" />
                          {placements.filter(p => p.pageIndex === activePage).map(p => (
                              <div key={p.id} className="absolute border border-dashed border-red-500 bg-red-500/10 cursor-move text-xs flex items-center p-1" style={{ left: p.x, top: p.y }}>
                                  {p.type}
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
              
              {/* Right sidebar */}
              <aside className="w-80 border-l bg-white p-6 shadow-sm overflow-y-auto">
                  <h3 className="font-bold text-lg mb-6">Signing options</h3>
                  
                  <div className="text-xs font-bold text-gray-500 uppercase mb-4">Required fields</div>
                  <div className="border rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:border-red-500 transition-colors" onClick={() => addPlacement("signature")}>
                      <div className="text-gray-400 font-bold">⠿</div>
                      <SignatureIcon className="text-red-500 h-5 w-5" />
                      <span className="font-medium flex-1">Signature</span>
                      <Edit2 className="h-4 w-4 text-gray-400" />
                  </div>
                  
                  <div className="text-xs font-bold text-gray-500 uppercase my-6">Optional fields</div>
                  <div className="space-y-4">
                      {[
                        { label: "Initials", id: "initials" },
                        { label: "Name", id: "name" },
                        { label: "Date", id: "date" },
                        { label: "Text", id: "text" },
                        { label: "Company Stamp", id: "stamp" }
                      ].map(t => (
                          <div key={t.id} className="border rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:border-red-500 transition-colors" onClick={() => addPlacement(t.id as any)}>
                            <div className="text-gray-400 font-bold">⠿</div>
                            <span className="text-sm font-medium flex-1">{t.label}</span>
                          </div>
                      ))}
                  </div>

                  <div className="mt-12">
                      <Button className="w-full bg-[#e5322d] py-6 text-white font-bold" onClick={downloadSignedPdf}>Sign and Download</Button>
                  </div>
              </aside>
          </div>
      )}

      {screen === "PROCESSING" && (
        <div className="flex h-[600px] flex-col items-center justify-center space-y-6">
          <Loader2 className="h-16 w-16 animate-spin text-red-500" />
          <h2 className="text-2xl font-bold">Processing...</h2>
        </div>
      )}

      {screen === "SUCCESS" && (
        <div className="py-12 text-center">
            <h2 className="text-2xl font-bold">Signed!</h2>
            <Button onClick={() => { setFile(null); setScreen("UPLOAD"); setPlacements([]); }}>Sign another</Button>
        </div>
      )}
    </div>
  );
}
