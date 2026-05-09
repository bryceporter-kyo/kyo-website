
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { uploadImage } from "@/lib/image-service";
import { useToast } from "@/hooks/use-toast";

interface QuestionImageEditorProps {
  imageUrl?: string;
  questionId: string;
  onChange: (url: string | undefined) => void;
}

export function QuestionImageEditor({
  imageUrl,
  questionId,
  onChange,
}: QuestionImageEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Use a unique name for the question image
      const storageId = `question_${questionId}`;
      const downloadURL = await uploadImage(file, storageId);
      onChange(downloadURL);
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully.",
      });
    } catch (err) {
      console.error("Upload failed:", err);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = () => {
    onChange(undefined);
  };

  return (
    <div className="space-y-2 pt-2 border-t mt-4">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
        <ImageIcon className="h-3 w-3" /> Question Image
      </label>

      {imageUrl ? (
        <div className="relative aspect-video w-full rounded-lg overflow-hidden border group bg-muted">
          <img
            src={imageUrl}
            alt="Question"
            className="object-contain w-full h-full"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Change
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={removeImage}
              disabled={isUploading}
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full h-24 border-dashed flex flex-col gap-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <>
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Upload Question Image
              </span>
            </>
          )}
        </Button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
