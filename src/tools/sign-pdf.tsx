import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import * as pdfjsLib from "pdfjs-dist";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { downloadBlob } from "@/lib/download";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";
import { 
  Loader2, Plus, PenLine, Type, Upload, X, 
  Signature as SignatureIcon, Calendar, Building2,
  Trash2, Undo, Redo, ZoomIn, ZoomOut, Maximize,
  ChevronLeft, ChevronRight
} from "lucide-react";
import confetti from "canvas-confetti";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useDropzone } from "react-dropzone";

// Font preloads
import "@fontsource/dancing-script/600.css";
import "@fontsource/great-vibes/400.css";
import "@fontsource/caveat/600.css";
import "@fontsource/sacramento/400.css";
import "@fontsource/pacifico/400.css";
import "@fontsource/satisfy/400.css";
import "@fontsource/alex-brush/400.css";
import "@fontsource/allura/400.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type Screen = "UPLOAD" | "WORKAREA" | "PROCESSING" | "SUCCESS";

export default function SignPdf() {
  const [screen, setScreen] = useState<Screen>("UPLOAD");
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="min-h-[600px]">
      {screen === "UPLOAD" && (
        <div className="mx-auto max-w-4xl py-12 px-4 text-center">
            <h1 className="text-4xl font-bold mb-8">Sign PDF Online</h1>
            <FileDropzone
              files={file ? [file] : []}
              onFilesChange={(files) => {
                  if (files.length > 0) {
                      setFile(files[0]);
                      setScreen("WORKAREA");
                  }
              }}
              accept="application/pdf"
              multiple={false}
            />
        </div>
      )}
      
      {screen === "WORKAREA" && file && (
          <div className="flex h-[calc(100vh-120px)] w-full overflow-hidden bg-[#F7F7F8]">
              {/* Left sidebar (thumbnails) */}
              <div className="w-40 border-r bg-[#F1F1F1] p-2 overflow-y-auto">
                  <div className="text-center py-4 text-gray-500 text-sm italic">Thumbnails...</div>
              </div>
              
              {/* Main content */}
              <div className="flex-1 flex flex-col">
                  {/* Top bar */}
                  <div className="bg-white border-b px-4 py-2 flex items-center gap-4">
                      <Button variant="ghost" size="icon"><ChevronLeft /></Button>
                      <span className="font-medium">1 / 1</span>
                      <Button variant="ghost" size="icon"><ChevronRight /></Button>
                      <span className="text-gray-400 mx-auto">{file.name}</span>
                  </div>
                  {/* PDF Viewer area */}
                  <div className="flex-1 overflow-auto bg-[#E5E5E5] flex items-center justify-center p-8">
                      <div className="bg-white p-12 shadow-lg min-h-[800px] w-full max-w-[600px]">
                          PDF Preview area
                      </div>
                  </div>
              </div>
              
              {/* Right sidebar */}
              <aside className="w-80 border-l bg-white p-6 shadow-sm">
                  <h3 className="font-bold uppercase text-gray-500 mb-6">Signing Options</h3>
                  <Button className="w-full bg-[#e5322d] py-6" onClick={() => setScreen("PROCESSING")}>Sign and Download</Button>
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
            <Button onClick={() => { setFile(null); setScreen("UPLOAD"); }}>Sign another</Button>
        </div>
      )}
    </div>
  );
}
