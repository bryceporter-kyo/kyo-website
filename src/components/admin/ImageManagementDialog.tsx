"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageEditor } from "./ImageEditor";
import { Upload, Link, Edit, Loader2, Check, X } from "lucide-react";
import Image from "next/image";
import type { StoredImage } from "@/lib/image-service";

interface ImageManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: StoredImage;
  onSave: (imageId: string, newImageUrl: string, metadata?: Partial<StoredImage>) => Promise<void>;
  mode: "change" | "edit";
}

export function ImageManagementDialog({
  open,
  onOpenChange,
  image,
  onSave,
  mode: initialMode,
}: ImageManagementDialogProps) {
  const [mode, setMode] = useState<"change" | "edit">(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // For image upload
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // For metadata editing
  const [description, setDescription] = useState(image.description);
  const [imageHint, setImageHint] = useState(image.imageHint);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
      setError(null);
    };
    reader.onerror = () => {
      setError("Failed to read the file");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleUrlSubmit = useCallback(() => {
    if (!urlInput.trim()) {
      setError("Please enter a URL");
      return;
    }

    try {
      new URL(urlInput);
      setUploadedImage(urlInput);
      setError(null);
    } catch {
      setError("Please enter a valid URL");
    }
  }, [urlInput]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please drop an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedImage(result);
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSaveNewImage = async () => {
    if (!uploadedImage) return;

    console.log("[ImageManagementDialog] handleSaveNewImage started", { imageId: image.id });
    setIsLoading(true);
    setError(null);

    try {
      console.log("[ImageManagementDialog] Calling onSave...", { 
        imageId: image.id, 
        isBase64: uploadedImage.startsWith("data:"),
        uploadedImageLength: uploadedImage.length 
      });
      await onSave(image.id, uploadedImage, {
        description,
        imageHint,
      });
      console.log("[ImageManagementDialog] onSave completed successfully");
      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
        setUploadedImage(null);
      }, 1000);
    } catch (err) {
      console.error("[ImageManagementDialog] handleSaveNewImage failed:", err);
      setError(err instanceof Error ? err.message : "Failed to save image");
    } finally {
      console.log("[ImageManagementDialog] handleSaveNewImage finished");
      setIsLoading(false);
    }
  };

  const handleEditorSave = async (editedImageData: string) => {
    console.log("[ImageManagementDialog] handleEditorSave started", { 
      imageId: image.id,
      dataLength: editedImageData.length 
    });
    setIsLoading(true);
    setError(null);

    try {
      console.log("[ImageManagementDialog] Calling onSave from editor...");
      await onSave(image.id, editedImageData, {
        description,
        imageHint,
      });
      console.log("[ImageManagementDialog] Editor save completed successfully");
      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
      }, 1000);
    } catch (err) {
      console.error("[ImageManagementDialog] handleEditorSave failed:", err);
      setError(err instanceof Error ? err.message : "Failed to save image");
    } finally {
      console.log("[ImageManagementDialog] handleEditorSave finished");
      setIsLoading(false);
    }
  };

  const handleEditorCancel = () => {
    setMode("change");
  };

  const resetDialog = () => {
    setUploadedImage(null);
    setUrlInput("");
    setError(null);
    setSuccess(false);
    setDescription(image.description);
    setImageHint(image.imageHint);
  };

  React.useEffect(() => {
    if (open) {
      setMode(initialMode);
      resetDialog();
    }
  }, [open, initialMode, image]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={mode === "edit" ? "max-w-6xl h-[90vh] flex flex-col" : "max-w-2xl max-h-[90vh] flex flex-col"}>
        {mode === "edit" ? (
          <>
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Edit Image: {image.id}</DialogTitle>
              <DialogDescription>
                Crop, resize, and apply effects to your image
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              <ImageEditor
                imageUrl={image.imageUrl}
                onSave={handleEditorSave}
                onCancel={handleEditorCancel}
              />
            </div>
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
          </>
        ) : (
          <>
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Change Image: {image.id}</DialogTitle>
              <DialogDescription>
                Upload a new image or provide a URL to replace the current one
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 overflow-y-auto flex-1 pr-2">
              {/* Current Image Preview */}
              <div className="space-y-2">
                <Label>Current Image</Label>
                <div className="relative aspect-video w-full max-w-xs rounded-md overflow-hidden border">
                  <Image
                    src={image.imageUrl}
                    alt={image.description}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Upload Options */}
              <Tabs defaultValue="upload">
                <TabsList className="w-full">
                  <TabsTrigger value="upload" className="flex-1">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="url" className="flex-1">
                    <Link className="h-4 w-4 mr-2" />
                    URL
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-4">
                  <div
                    className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Drag and drop an image here, or click to select
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports: JPG, PNG, GIF, WebP
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="url" className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                    />
                    <Button onClick={handleUrlSubmit}>Load</Button>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Preview of new image */}
              {uploadedImage && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>New Image Preview</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadedImage(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="relative aspect-video w-full max-w-xs rounded-md overflow-hidden border">
                    <Image
                      src={uploadedImage}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized={uploadedImage.startsWith("data:")}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Set the uploaded image as the current image temporarily and switch to edit mode
                      setMode("edit");
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Before Saving
                  </Button>
                </div>
              )}

              {/* Metadata */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the image..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageHint">Image Hint (for AI)</Label>
                  <Input
                    id="imageHint"
                    value={imageHint}
                    onChange={(e) => setImageHint(e.target.value)}
                    placeholder="Keywords for AI..."
                  />
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Success message */}
              {success && (
                <div className="bg-green-500/10 text-green-600 text-sm p-3 rounded-md flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Image saved successfully!
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-background">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveNewImage}
                  disabled={!uploadedImage || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Image"
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
