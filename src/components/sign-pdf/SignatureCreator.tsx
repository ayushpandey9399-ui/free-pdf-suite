import React, { useRef, useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Undo2, Eraser, Type, PenLine, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";

// Preload fonts
import "@fontsource/dancing-script/600.css";
import "@fontsource/great-vibes/400.css";
import "@fontsource/caveat/600.css";
import "@fontsource/sacramento/400.css";
import "@fontsource/pacifico/400.css";
import "@fontsource/satisfy/400.css";
import "@fontsource/alex-brush/400.css";
import "@fontsource/allura/400.css";

const COLORS = [
  { name: "Black", value: "#000000" },
  { name: "Blue", value: "#0000FF" },
  { name: "Red", value: "#FF0000" },
  { name: "Green", value: "#008000" },
  { name: "Purple", value: "#800080" },
  { name: "Dark Gray", value: "#4B5563" },
];

const SIGNATURE_FONTS = [
  { name: "Dancing Script", family: "'Dancing Script', cursive" },
  { name: "Great Vibes", family: "'Great Vibes', cursive" },
  { name: "Caveat", family: "'Caveat', cursive" },
  { name: "Sacramento", family: "'Sacramento', cursive" },
  { name: "Pacifico", family: "'Pacifico', cursive" },
  { name: "Satisfy", family: "'Satisfy', cursive" },
  { name: "Alex Brush", family: "'Alex Brush', cursive" },
  { name: "Allura", family: "'Allura', cursive" },
];

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

interface SignatureData {
  dataUrl: string;
  width: number;
  height: number;
}

interface SignatureCreatorProps {
  onApply: (signature: SignatureData, initials?: SignatureData) => void;
  initialName?: string;
}

export function SignatureCreator({ onApply, initialName = "" }: SignatureCreatorProps) {
  const [activeTab, setActiveTab] = useState("draw");
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(COLORS[0].value);
  const [lineWidth, setLineWidth] = useState(2);
  const [selectedFont, setSelectedFont] = useState(SIGNATURE_FONTS[0]);
  const [fontSize, setFontSize] = useState(48);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [removeBackground, setRemoveBackground] = useState(false);
  
  // Initials state
  const [initialsText, setInitialsText] = useState(name ? name.split(" ").map(n => n[0]).join("").toUpperCase() : "");

  // Drawing Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // --- DRAWING LOGIC ---
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }
    
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCoordinates(e);
    setIsDrawing(true);
    setStrokes(prev => [...prev, { points: [coords], color, width: lineWidth }]);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const coords = getCoordinates(e);
    setStrokes(prev => {
      const last = prev[prev.length - 1];
      const others = prev.slice(0, -1);
      return [...others, { ...last, points: [...last.points, coords] }];
    });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    setStrokes([]);
  };

  const undoStroke = () => {
    setStrokes(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    strokes.forEach(stroke => {
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      
      if (stroke.points.length < 2) return;

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      
      for (let i = 1; i < stroke.points.length; i++) {
        // Use quadratic curve for smoothness
        const xc = (stroke.points[i].x + stroke.points[i - 1].x) / 2;
        const yc = (stroke.points[i].y + stroke.points[i - 1].y) / 2;
        ctx.quadraticCurveTo(stroke.points[i - 1].x, stroke.points[i - 1].y, xc, yc);
      }
      
      const last = stroke.points[stroke.points.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
    });
  }, [strokes]);

  // --- TYPE LOGIC ---
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setInitialsText(val.split(" ").map(n => n[0]).join("").toUpperCase());
  };

  // --- UPLOAD LOGIC ---
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false
  });

  const processImage = async (dataUrl: string, removeWhite: boolean): Promise<SignatureData> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);

        if (removeWhite) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i+1];
            const b = data[i+2];
            // Threshold for "white"
            if (r > 240 && g > 240 && b > 240) {
              data[i+3] = 0; // Transparent
            }
          }
          ctx.putImageData(imageData, 0, 0);
        }

        resolve({
          dataUrl: canvas.toDataURL("image/png"),
          width: canvas.width,
          height: canvas.height
        });
      };
      img.src = dataUrl;
    });
  };

  // --- FINAL APPLY ---
  const handleApply = async () => {
    let signature: SignatureData | null = null;
    
    if (activeTab === "draw") {
      const canvas = canvasRef.current;
      if (canvas && strokes.length > 0) {
        signature = {
          dataUrl: canvas.toDataURL("image/png"),
          width: canvas.width,
          height: canvas.height
        };
      }
    } else if (activeTab === "type") {
      if (name.trim()) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        ctx.font = `${fontSize * 2}px ${selectedFont.family}`;
        const metrics = ctx.measureText(name);
        canvas.width = metrics.width + 20;
        canvas.height = fontSize * 3;
        
        ctx.font = `${fontSize * 2}px ${selectedFont.family}`;
        ctx.fillStyle = color;
        ctx.textBaseline = "middle";
        ctx.fillText(name, 10, canvas.height / 2);
        
        signature = {
          dataUrl: canvas.toDataURL("image/png"),
          width: canvas.width,
          height: canvas.height
        };
      }
    } else if (activeTab === "upload" && uploadedImage) {
      signature = await processImage(uploadedImage, removeBackground);
    }

    if (!signature) {
      alert("Please create a signature first");
      return;
    }

    // Handle initials (simplified for now)
    let initials: SignatureData | undefined;
    if (initialsText.trim()) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        ctx.font = `60px ${selectedFont.family}`;
        const metrics = ctx.measureText(initialsText);
        canvas.width = metrics.width + 10;
        canvas.height = 80;
        ctx.font = `60px ${selectedFont.family}`;
        ctx.fillStyle = color;
        ctx.textBaseline = "middle";
        ctx.fillText(initialsText, 5, canvas.height / 2);
        initials = {
          dataUrl: canvas.toDataURL("image/png"),
          width: canvas.width,
          height: canvas.height
        };
    }

    onApply(signature, initials);
  };

  return (
    <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
      <div className="border-b bg-gray-50 px-6 py-4">
        <h2 className="text-xl font-bold text-gray-800">Create Your Signature</h2>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="draw" className="flex items-center gap-2">
              <PenLine className="h-4 w-4" /> Draw
            </TabsTrigger>
            <TabsTrigger value="type" className="flex items-center gap-2">
              <Type className="h-4 w-4" /> Type
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" /> Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="mt-6 space-y-4">
            <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-gray-200 bg-white">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="h-[200px] w-full touch-none cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {strokes.length === 0 && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-gray-400">
                  Draw your signature here
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setColor(c.value)}
                    className={cn(
                      "h-8 w-8 rounded-full border-2 transition-all",
                      color === c.value ? "scale-110 border-gray-400" : "border-transparent"
                    )}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-32 space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Thin</span>
                    <span>Thick</span>
                  </div>
                  <Slider
                    value={[lineWidth]}
                    onValueChange={(val) => setLineWidth(val[0])}
                    min={1}
                    max={6}
                    step={0.5}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={undoStroke} disabled={strokes.length === 0}>
                    <Undo2 className="mr-2 h-4 w-4" /> Undo
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearCanvas} disabled={strokes.length === 0}>
                    <Eraser className="mr-2 h-4 w-4" /> Clear
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="type" className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="sig-name">Type your name</Label>
              <Input
                id="sig-name"
                placeholder="John Doe"
                value={name}
                onChange={handleNameChange}
                className="text-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SIGNATURE_FONTS.map((font) => (
                <button
                  key={font.name}
                  onClick={() => setSelectedFont(font)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-lg border-2 p-3 transition-all",
                    selectedFont.name === font.name ? "border-red-500 bg-red-50" : "border-gray-100 hover:border-gray-200"
                  )}
                >
                  <span
                    className="truncate text-xl"
                    style={{ fontFamily: font.family, color: selectedFont.name === font.name ? "#e5322d" : color }}
                  >
                    {name || "Signature"}
                  </span>
                  <span className="mt-1 text-[10px] uppercase text-gray-400">{font.name}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
                <div className="flex items-center gap-2">
                    {COLORS.map((c) => (
                    <button
                        key={c.value}
                        onClick={() => setColor(c.value)}
                        className={cn(
                        "h-8 w-8 rounded-full border-2 transition-all",
                        color === c.value ? "scale-110 border-gray-400" : "border-transparent"
                        )}
                        style={{ backgroundColor: c.value }}
                    />
                    ))}
                </div>
                <div className="w-48 space-y-1">
                    <Label className="text-xs">Font Size</Label>
                    <Slider
                        value={[fontSize]}
                        onValueChange={(val) => setFontSize(val[0])}
                        min={24}
                        max={72}
                        step={2}
                    />
                </div>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="mt-6 space-y-4">
            {!uploadedImage ? (
              <div
                {...getRootProps()}
                className={cn(
                  "flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors",
                  isDragActive ? "bg-red-50 border-red-400" : "bg-gray-50 hover:bg-gray-100"
                )}
              >
                <input {...getInputProps()} />
                <Upload className="mb-2 h-10 w-10 text-gray-400" />
                <p className="text-sm text-gray-600">Drag & drop signature image here, or click to select</p>
                <p className="mt-1 text-xs text-gray-400">PNG, JPG, or SVG</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative mx-auto max-w-sm rounded-lg border bg-white p-4">
                  <img src={uploadedImage} alt="Uploaded signature" className="mx-auto max-h-40 object-contain" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => setUploadedImage(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remove-bg"
                    checked={removeBackground}
                    onCheckedChange={(checked) => setRemoveBackground(checked as boolean)}
                  />
                  <Label htmlFor="remove-bg">Remove white background</Label>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-8 border-t pt-6">
            <div className="mb-6 space-y-2">
                <Label className="text-sm font-semibold">Create Your Initials (Optional)</Label>
                <div className="flex gap-4">
                    <Input 
                        placeholder="JD" 
                        value={initialsText} 
                        onChange={(e) => setInitialsText(e.target.value.toUpperCase())}
                        className="max-w-[100px] text-center text-lg font-bold"
                        maxLength={3}
                    />
                    <div 
                        className="flex flex-1 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 px-4"
                        style={{ fontFamily: selectedFont.family, color: color, fontSize: '24px' }}
                    >
                        {initialsText || "Initials"}
                    </div>
                </div>
            </div>

            <Button
                onClick={handleApply}
                className="w-full bg-[#e5322d] py-6 text-lg font-bold uppercase text-white hover:bg-[#c72620]"
            >
                Apply and Sign Document
            </Button>
        </div>
      </div>
    </div>
  );
}
