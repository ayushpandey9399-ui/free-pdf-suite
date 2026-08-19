import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  ZoomIn, ZoomOut, Maximize, MousePointer2, 
  Signature as SignatureIcon, Calendar, Type, 
  Building2, Trash2, Undo, Redo, 
  ChevronLeft, ChevronRight, X, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";

interface Placement {
  id: string;
  type: "signature" | "initials" | "date" | "name" | "text" | "stamp";
  pageIndex: number;
  x: number; // Percentage
  y: number; // Percentage
  width: number;
  height: number;
  content: string; // dataUrl or text
  rotation: number;
}

interface SignWorkspaceProps {
  pdfFile: File;
  signature: { dataUrl: string; width: number; height: number };
  initials?: { dataUrl: string; width: number; height: number };
  userName: string;
  onSign: (placements: Placement[]) => void;
  onEditSignature: () => void;
}

export function SignWorkspace({ 
  pdfFile, 
  signature, 
  initials, 
  userName, 
  onSign, 
  onEditSignature 
}: SignWorkspaceProps) {
  const [pages, setPages] = useState<{ url: string; width: number; height: number }[]>([]);
  const [zoom, setZoom] = useState(1);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<Placement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // --- PDF RENDERING ---
  useEffect(() => {
    let cancelled = false;
    const renderPdf = async () => {
      try {
        const { loadPdfJsDoc } = await import("@/lib/pdfGuard");
        const pdfjs = await import("pdfjs-dist");
        
        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdf = await loadPdfJsDoc(arrayBuffer);
        
        if (cancelled) return;

        const renderedPages = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2 }); // High res
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d")!;
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ 
            canvasContext: context, 
            viewport,
            canvas,
            intent: 'display'
          }).promise;
          
          if (cancelled) return;

          renderedPages.push({
            url: canvas.toDataURL("image/png"),
            width: viewport.width,
            height: viewport.height
          });
        }
        
        if (!cancelled) {
          setPages(renderedPages);
        }
      } catch (error) {
        console.error("PDF rendering failed:", error);
      }
    };

    renderPdf();
    return () => {
      cancelled = true;
    };
  }, [pdfFile]);

  // --- PLACEMENT LOGIC ---
  const addPlacement = (type: Placement["type"]) => {
    let content = "";
    let width = 150;
    let height = 50;

    switch (type) {
      case "signature":
        content = signature.dataUrl;
        width = signature.width / 4;
        height = signature.height / 4;
        break;
      case "initials":
        content = initials?.dataUrl || "";
        width = initials ? initials.width / 4 : 80;
        height = initials ? initials.height / 4 : 40;
        break;
      case "date":
        content = format(new Date(), "dd/MM/yyyy");
        break;
      case "name":
        content = userName;
        break;
      case "text":
        content = "Enter text...";
        break;
      case "stamp":
        // Logic for stamp upload could go here
        return;
    }

    const newPlacement: Placement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      pageIndex: 0, // Default to first page for now
      x: 50, // Center
      y: 50,
      width,
      height,
      content,
      rotation: 0
    };

    const newPlacements = [...placements, newPlacement];
    updateHistory(newPlacements);
  };

  const updateHistory = (newPlacements: Placement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPlacements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setPlacements(newPlacements);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPlacements(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPlacements(history[historyIndex + 1]);
    }
  };

  const removePlacement = (id: string) => {
    const newPlacements = placements.filter(p => p.id !== id);
    updateHistory(newPlacements);
    setSelectedId(null);
  };

  // --- INTERACTION ---
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    setSelectedId(id);
    setIsDragging(true);
    const placement = placements.find(p => p.id === id);
    if (placement) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    e.stopPropagation();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedId || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - containerRect.left - dragOffset.x) / containerRect.width) * 100;
    const y = ((e.clientY - containerRect.top - dragOffset.y) / containerRect.height) * 100;

    setPlacements(prev => prev.map(p => 
      p.id === selectedId ? { ...p, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } : p
    ));
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      updateHistory(placements);
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] w-full overflow-hidden bg-[#F7F7F8]">
      {/* Document Viewer */}
      <div 
        className="flex-1 overflow-auto p-8"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div className="mx-auto flex flex-col items-center gap-8" style={{ width: `${zoom * 100}%`, maxWidth: '1000px' }}>
          {pages.length === 0 ? (
            <div className="flex h-[600px] w-full flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-red-500" />
              <p className="text-gray-500 font-medium">Loading PDF pages...</p>
            </div>
          ) : (
            pages.map((page, idx) => (
              <div 
                key={idx} 
                className="relative shadow-lg bg-white"
                style={{ width: '100%', aspectRatio: `${page.width}/${page.height}` }}
                ref={idx === 0 ? containerRef : null}
              >
                <img src={page.url} alt={`Page ${idx + 1}`} className="h-full w-full object-contain pointer-events-none" />
                <div className="absolute top-full left-0 right-0 py-2 text-center text-xs text-gray-400">
                  Page {idx + 1} of {pages.length}
                </div>

                {/* Placements for this page */}
                {placements.filter(p => p.pageIndex === idx).map(p => (
                  <div
                    key={p.id}
                    onMouseDown={(e) => handleMouseDown(e, p.id)}
                    className={cn(
                      "absolute cursor-move border-2 transition-all",
                      selectedId === p.id ? "border-red-500 border-dashed bg-red-50/20" : "border-transparent hover:border-blue-400 hover:border-dashed"
                    )}
                    style={{
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      width: `${p.width}px`,
                      height: `${p.height}px`,
                      transform: `rotate(${p.rotation}deg)`
                    }}
                  >
                    {p.type === "signature" || p.type === "initials" ? (
                      <img src={p.content} alt={p.type} className="h-full w-full object-contain pointer-events-none" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center p-2 text-center font-medium">
                        {p.content}
                      </div>
                    )}
                    
                    {selectedId === p.id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removePlacement(p.id); }}
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sidebar Controls */}
      <aside className="w-80 border-l bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-500">Signing Fields</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="flex h-auto flex-col items-center gap-2 py-4 hover:border-red-200 hover:bg-red-50"
            onClick={() => addPlacement("signature")}
          >
            <SignatureIcon className="h-6 w-6 text-red-500" />
            <span className="text-xs font-semibold">Signature</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex h-auto flex-col items-center gap-2 py-4 hover:border-red-200 hover:bg-red-50"
            onClick={() => addPlacement("initials")}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded border-2 border-red-500 font-bold text-red-500 text-[10px]">IN</div>
            <span className="text-xs font-semibold">Initials</span>
          </Button>

          <Button
            variant="outline"
            className="flex h-auto flex-col items-center gap-2 py-4 hover:border-red-200 hover:bg-red-50"
            onClick={() => addPlacement("date")}
          >
            <Calendar className="h-6 w-6 text-red-500" />
            <span className="text-xs font-semibold">Date</span>
          </Button>

          <Button
            variant="outline"
            className="flex h-auto flex-col items-center gap-2 py-4 hover:border-red-200 hover:bg-red-50"
            onClick={() => addPlacement("name")}
          >
            <Type className="h-6 w-6 text-red-500" />
            <span className="text-xs font-semibold">Name</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex h-auto flex-col items-center gap-2 py-4 hover:border-red-200 hover:bg-red-50"
            onClick={() => addPlacement("text")}
          >
            <div className="flex h-6 w-6 items-center justify-center font-serif text-xl font-bold text-red-500">T</div>
            <span className="text-xs font-semibold">Free Text</span>
          </Button>

          <Button
            variant="outline"
            className="flex h-auto flex-col items-center gap-2 py-4 hover:border-red-200 hover:bg-red-50"
            onClick={() => addPlacement("stamp")}
          >
            <Building2 className="h-6 w-6 text-red-500" />
            <span className="text-xs font-semibold">Stamp</span>
          </Button>
        </div>

        <div className="mt-auto pt-8 space-y-4">
          <div className="flex justify-between border-t pt-4">
            <Button variant="ghost" size="sm" onClick={undo} disabled={historyIndex === 0}>
              <Undo className="mr-2 h-4 w-4" /> Undo
            </Button>
            <Button variant="ghost" size="sm" onClick={redo} disabled={historyIndex === history.length - 1}>
              <Redo className="mr-2 h-4 w-4" /> Redo
            </Button>
          </div>

          <Button variant="outline" className="w-full text-gray-600" onClick={onEditSignature}>
            Edit Signature
          </Button>
          
          <Button variant="outline" className="w-full text-red-500 hover:bg-red-50" onClick={() => updateHistory([])}>
            <Trash2 className="mr-2 h-4 w-4" /> Clear All
          </Button>

          <div className="pt-4">
            <Button 
                className="w-full bg-[#e5322d] py-6 text-lg font-bold uppercase text-white hover:bg-[#c72620]"
                disabled={placements.length === 0}
                onClick={() => onSign(placements)}
            >
                Sign and Download
            </Button>
            <p className="mt-2 text-center text-xs text-gray-400">
                {placements.length} field{placements.length !== 1 ? 's' : ''} placed
            </p>
          </div>
        </div>
      </aside>

      {/* Floating Toolbar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-2xl border border-gray-100 z-50">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}><ZoomOut className="h-4 w-4" /></Button>
                </TooltipTrigger>
                <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>
            
            <div className="px-2 text-sm font-bold w-12 text-center">{Math.round(zoom * 100)}%</div>
            
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(2, z + 0.1))}><ZoomIn className="h-4 w-4" /></Button>
                </TooltipTrigger>
                <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>
            
            <div className="h-4 w-px bg-gray-200 mx-2" />
            
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setZoom(1)}><Maximize className="h-4 w-4" /></Button>
                </TooltipTrigger>
                <TooltipContent>Fit to Width</TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
