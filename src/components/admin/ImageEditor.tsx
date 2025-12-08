"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Crop,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Download,
  Undo2,
  Redo2,
  Sun,
  Contrast,
  Palette,
  Droplets,
  Sparkles,
} from "lucide-react";

export interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImageData: string) => void;
  onCancel: () => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageEffects {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: number;
  sepia: number;
  hueRotate: number;
}

const defaultEffects: ImageEffects = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  hueRotate: 0,
};

export function ImageEditor({ imageUrl, onSave, onCancel }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transform states
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [zoom, setZoom] = useState(100);

  // Crop states
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>("free");

  // Resize states
  const [resizeWidth, setResizeWidth] = useState<number>(0);
  const [resizeHeight, setResizeHeight] = useState<number>(0);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [originalAspectRatio, setOriginalAspectRatio] = useState(1);

  // Effects
  const [effects, setEffects] = useState<ImageEffects>(defaultEffects);

  // History for undo/redo
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      setResizeWidth(img.width);
      setResizeHeight(img.height);
      setOriginalAspectRatio(img.width / img.height);
      setIsLoading(false);
      // Save initial state to history
      setTimeout(() => {
        saveToHistory();
      }, 100);
    };
    img.onerror = () => {
      setError("Failed to load image. The image might have CORS restrictions.");
      setIsLoading(false);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Render canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate dimensions based on zoom
    const scaledWidth = (img.width * zoom) / 100;
    const scaledHeight = (img.height * zoom) / 100;

    // Set canvas size
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Apply filters
    const filterString = `
      brightness(${effects.brightness}%)
      contrast(${effects.contrast}%)
      saturate(${effects.saturation}%)
      blur(${effects.blur}px)
      grayscale(${effects.grayscale}%)
      sepia(${effects.sepia}%)
      hue-rotate(${effects.hueRotate}deg)
    `;
    ctx.filter = filterString;

    ctx.drawImage(
      img,
      -scaledWidth / 2,
      -scaledHeight / 2,
      scaledWidth,
      scaledHeight
    );
    ctx.restore();

    // Draw crop overlay if cropping
    if (cropArea) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Clear the crop area
      ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

      // Re-render the visible part
      ctx.save();
      ctx.beginPath();
      ctx.rect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
      ctx.clip();

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.filter = filterString;
      ctx.drawImage(
        img,
        -scaledWidth / 2,
        -scaledHeight / 2,
        scaledWidth,
        scaledHeight
      );
      ctx.restore();

      // Draw crop border
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    }
  }, [rotation, flipH, flipV, zoom, effects, cropArea]);

  useEffect(() => {
    if (!isLoading && imageRef.current) {
      renderCanvas();
    }
  }, [isLoading, renderCanvas]);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(dataUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      // Load previous state
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        renderCanvas();
      };
      img.src = history[historyIndex - 1];
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        renderCanvas();
      };
      img.src = history[historyIndex + 1];
    }
  };

  const handleRotate = (direction: "cw" | "ccw") => {
    setRotation((prev) => prev + (direction === "cw" ? 90 : -90));
  };

  const handleFlip = (axis: "h" | "v") => {
    if (axis === "h") setFlipH(!flipH);
    else setFlipV(!flipV);
  };

  const handleZoom = (direction: "in" | "out") => {
    setZoom((prev) => {
      const newZoom = direction === "in" ? prev + 10 : prev - 10;
      return Math.max(10, Math.min(200, newZoom));
    });
  };

  const handleEffectChange = (effect: keyof ImageEffects, value: number) => {
    setEffects((prev) => ({ ...prev, [effect]: value }));
  };

  const resetEffects = () => {
    setEffects(defaultEffects);
  };

  const handleResizeWidth = (width: number) => {
    setResizeWidth(width);
    if (maintainAspectRatio) {
      setResizeHeight(Math.round(width / originalAspectRatio));
    }
  };

  const handleResizeHeight = (height: number) => {
    setResizeHeight(height);
    if (maintainAspectRatio) {
      setResizeWidth(Math.round(height * originalAspectRatio));
    }
  };

  const applyResize = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    // Create a temporary canvas for resize
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = resizeWidth;
    tempCanvas.height = resizeHeight;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCtx.drawImage(canvas, 0, 0, resizeWidth, resizeHeight);

    // Load resized image back
    const resizedImg = new Image();
    resizedImg.onload = () => {
      imageRef.current = resizedImg;
      setZoom(100);
      renderCanvas();
      saveToHistory();
    };
    resizedImg.src = tempCanvas.toDataURL("image/png");
  };

  const handleCropMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCropping) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    setCropStart({
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    });
    setCropArea(null);
  };

  const handleCropMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCropping || !cropStart) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;

    let width = currentX - cropStart.x;
    let height = currentY - cropStart.y;

    // Apply aspect ratio constraints
    if (aspectRatio !== "free") {
      const [ratioW, ratioH] = aspectRatio.split(":").map(Number);
      const targetRatio = ratioW / ratioH;

      if (Math.abs(width) / Math.abs(height) > targetRatio) {
        width = Math.sign(width) * Math.abs(height) * targetRatio;
      } else {
        height = Math.sign(height) * Math.abs(width) / targetRatio;
      }
    }

    setCropArea({
      x: width > 0 ? cropStart.x : cropStart.x + width,
      y: height > 0 ? cropStart.y : cropStart.y + height,
      width: Math.abs(width),
      height: Math.abs(height),
    });
  };

  const handleCropMouseUp = () => {
    setCropStart(null);
  };

  const applyCrop = () => {
    if (!cropArea) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas for the cropped area
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = cropArea.width;
    tempCanvas.height = cropArea.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCtx.drawImage(
      canvas,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      0,
      0,
      cropArea.width,
      cropArea.height
    );

    // Load cropped image
    const croppedImg = new Image();
    croppedImg.onload = () => {
      imageRef.current = croppedImg;
      setResizeWidth(croppedImg.width);
      setResizeHeight(croppedImg.height);
      setOriginalAspectRatio(croppedImg.width / croppedImg.height);
      setCropArea(null);
      setIsCropping(false);
      setZoom(100);
      renderCanvas();
      saveToHistory();
    };
    croppedImg.src = tempCanvas.toDataURL("image/png");
  };

  const cancelCrop = () => {
    setCropArea(null);
    setIsCropping(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Render final image without crop overlay
    const finalCanvas = document.createElement("canvas");
    const img = imageRef.current;
    if (!img) return;

    finalCanvas.width = (img.width * zoom) / 100;
    finalCanvas.height = (img.height * zoom) / 100;
    const ctx = finalCanvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.translate(finalCanvas.width / 2, finalCanvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    const filterString = `
      brightness(${effects.brightness}%)
      contrast(${effects.contrast}%)
      saturate(${effects.saturation}%)
      blur(${effects.blur}px)
      grayscale(${effects.grayscale}%)
      sepia(${effects.sepia}%)
      hue-rotate(${effects.hueRotate}deg)
    `;
    ctx.filter = filterString;

    ctx.drawImage(
      img,
      -finalCanvas.width / 2,
      -finalCanvas.height / 2,
      finalCanvas.width,
      finalCanvas.height
    );
    ctx.restore();

    const dataUrl = finalCanvas.toDataURL("image/png");
    onSave(dataUrl);
  };

  const presetFilters = [
    { name: "None", effects: defaultEffects },
    { name: "Vintage", effects: { ...defaultEffects, sepia: 50, contrast: 110, saturation: 80 } },
    { name: "B&W", effects: { ...defaultEffects, grayscale: 100, contrast: 120 } },
    { name: "Warm", effects: { ...defaultEffects, saturation: 130, hueRotate: 15 } },
    { name: "Cool", effects: { ...defaultEffects, saturation: 110, hueRotate: -20 } },
    { name: "High Contrast", effects: { ...defaultEffects, contrast: 150, brightness: 110 } },
    { name: "Soft", effects: { ...defaultEffects, brightness: 110, contrast: 90, blur: 0.5 } },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={onCancel}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b p-4 bg-muted/50">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={undo}
            disabled={historyIndex <= 0}
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleRotate("ccw")}
            title="Rotate Counter-Clockwise"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleRotate("cw")}
            title="Rotate Clockwise"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleFlip("h")}
            title="Flip Horizontal"
          >
            <FlipHorizontal className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleFlip("v")}
            title="Flip Vertical"
          >
            <FlipVertical className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleZoom("out")}
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm w-12 text-center">{zoom}%</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleZoom("in")}
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Download className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas Area */}
        <div
          ref={containerRef}
          className="flex-1 flex items-center justify-center p-4 bg-muted overflow-auto"
        >
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full border shadow-lg cursor-crosshair"
            style={{ imageRendering: "pixelated" }}
            onMouseDown={handleCropMouseDown}
            onMouseMove={handleCropMouseMove}
            onMouseUp={handleCropMouseUp}
            onMouseLeave={handleCropMouseUp}
          />
        </div>

        {/* Side Panel */}
        <div className="w-80 border-l overflow-y-auto">
          <Tabs defaultValue="crop" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="crop" className="flex-1">
                <Crop className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="resize" className="flex-1">
                <ZoomIn className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="effects" className="flex-1">
                <Sparkles className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>

            {/* Crop Tab */}
            <TabsContent value="crop" className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Aspect Ratio</Label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                    <SelectItem value="4:3">4:3</SelectItem>
                    <SelectItem value="16:9">16:9</SelectItem>
                    <SelectItem value="3:2">3:2</SelectItem>
                    <SelectItem value="2:3">2:3 (Portrait)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!isCropping ? (
                <Button
                  className="w-full"
                  onClick={() => setIsCropping(true)}
                >
                  <Crop className="h-4 w-4 mr-2" />
                  Start Cropping
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Click and drag on the image to select crop area
                  </p>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={applyCrop}
                      disabled={!cropArea}
                    >
                      Apply Crop
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={cancelCrop}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Resize Tab */}
            <TabsContent value="resize" className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width (px)</Label>
                <Input
                  id="width"
                  type="number"
                  value={resizeWidth}
                  onChange={(e) => handleResizeWidth(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (px)</Label>
                <Input
                  id="height"
                  type="number"
                  value={resizeHeight}
                  onChange={(e) => handleResizeHeight(Number(e.target.value))}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="aspectRatio"
                  checked={maintainAspectRatio}
                  onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="aspectRatio">Maintain aspect ratio</Label>
              </div>
              <Button className="w-full" onClick={applyResize}>
                Apply Resize
              </Button>
            </TabsContent>

            {/* Effects Tab */}
            <TabsContent value="effects" className="p-4 space-y-4">
              {/* Preset Filters */}
              <div className="space-y-2">
                <Label>Presets</Label>
                <div className="grid grid-cols-3 gap-2">
                  {presetFilters.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => setEffects(preset.effects)}
                      className="text-xs"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <Label>Brightness: {effects.brightness}%</Label>
                  </div>
                  <Slider
                    value={[effects.brightness]}
                    onValueChange={([v]) => handleEffectChange("brightness", v)}
                    min={0}
                    max={200}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Contrast className="h-4 w-4" />
                    <Label>Contrast: {effects.contrast}%</Label>
                  </div>
                  <Slider
                    value={[effects.contrast]}
                    onValueChange={([v]) => handleEffectChange("contrast", v)}
                    min={0}
                    max={200}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    <Label>Saturation: {effects.saturation}%</Label>
                  </div>
                  <Slider
                    value={[effects.saturation]}
                    onValueChange={([v]) => handleEffectChange("saturation", v)}
                    min={0}
                    max={200}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4" />
                    <Label>Blur: {effects.blur}px</Label>
                  </div>
                  <Slider
                    value={[effects.blur]}
                    onValueChange={([v]) => handleEffectChange("blur", v)}
                    min={0}
                    max={20}
                    step={0.5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Grayscale: {effects.grayscale}%</Label>
                  <Slider
                    value={[effects.grayscale]}
                    onValueChange={([v]) => handleEffectChange("grayscale", v)}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sepia: {effects.sepia}%</Label>
                  <Slider
                    value={[effects.sepia]}
                    onValueChange={([v]) => handleEffectChange("sepia", v)}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Hue Rotate: {effects.hueRotate}°</Label>
                  <Slider
                    value={[effects.hueRotate]}
                    onValueChange={([v]) => handleEffectChange("hueRotate", v)}
                    min={-180}
                    max={180}
                    step={1}
                  />
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={resetEffects}
                >
                  Reset Effects
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
