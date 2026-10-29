
"use client";

import { ArrowLeft, Edit, ImageUp, RefreshCw, Loader2, Check, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages, ImagePlaceholder } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState, useEffect, useCallback } from "react";
import { ImageManagementDialog } from "@/components/admin/ImageManagementDialog";
import {
  uploadBase64Image,
  saveImageMetadata,
  getMergedImages,
  initializeImagesInFirestore,
  type StoredImage,
} from "@/lib/image-service";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { Input } from "@/components/ui/input";
import { getBassRepairsCampaign, setBassRepairsCampaign } from "@/lib/bass-repairs-campaign";

export default function AdminImagesPage() {
  const { toast } = useToast();
  const [images, setImages] = useState<StoredImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bass Repairs Campaign State
  const [bassRaised, setBassRaised] = useState<number>(1000);
  const [bassGoal, setBassGoal] = useState<number>(2800);
  const [isSavingBass, setIsSavingBass] = useState(false);
  
  // Dialog states
  const [selectedImage, setSelectedImage] = useState<StoredImage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"change" | "edit">("change");

  // Load images from Firebase on mount
  const loadImages = useCallback(async () => {
    console.log("[AdminImagesPage] loadImages started");
    setIsLoading(true);
    setError(null);
    try {
      console.log("[AdminImagesPage] Calling getMergedImages...");
      const mergedImages = await getMergedImages(PlaceHolderImages);
      console.log("[AdminImagesPage] getMergedImages completed", { count: mergedImages.length });
      setImages(mergedImages);

      // Load Bass Repairs
      const bassData = await getBassRepairsCampaign();
      setBassRaised(bassData.raised);
      setBassGoal(bassData.goal);
    } catch (err) {
      console.error("[AdminImagesPage] Failed to load images:", err);
      setError("Failed to load images from database. Using default images.");
      // Fallback to default images
      setImages(PlaceHolderImages.map(img => ({ ...img, originalUrl: img.imageUrl })));
    } finally {
      console.log("[AdminImagesPage] loadImages finished");
      setIsLoading(false);
    }
  }, []);

  // Initialize Firestore with default images
  const initializeFirestore = async () => {
    setIsInitializing(true);
    try {
      await initializeImagesInFirestore(PlaceHolderImages);
      await loadImages();
      toast({
        title: "Success",
        description: "Images initialized in database successfully!",
      });
    } catch (err) {
      console.error("Failed to initialize Firestore:", err);
      toast({
        title: "Error",
        description: "Failed to initialize images in database.",
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const groupedImages = useMemo(() => {
    return images.reduce((acc, image) => {
      const category = image.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(image);
      return acc;
    }, {} as Record<string, StoredImage[]>);
  }, [images]);

  const categories = Object.keys(groupedImages).sort();

  const handleOpenDialog = (image: StoredImage, mode: "change" | "edit") => {
    setSelectedImage(image);
    setDialogMode(mode);
    setDialogOpen(true);
  };

  const handleSaveImage = async (
    imageId: string,
    newImageUrl: string,
    metadata?: Partial<StoredImage>
  ) => {
    console.log("[AdminImagesPage] handleSaveImage started", { 
      imageId, 
      isBase64: newImageUrl.startsWith("data:"),
      urlLength: newImageUrl.length,
      metadata 
    });
    try {
      let finalImageUrl = newImageUrl;

      // If it's a base64 image, try to upload to Firebase Storage
      // If that fails (CORS), the function will return the base64 data directly
      if (newImageUrl.startsWith("data:")) {
        console.log("[AdminImagesPage] Uploading base64 image to storage...");
        try {
          finalImageUrl = await uploadBase64Image(newImageUrl, imageId);
          console.log("[AdminImagesPage] Base64 upload result:", { 
            isStillBase64: finalImageUrl.startsWith("data:"),
            resultLength: finalImageUrl.length 
          });
        } catch (storageError) {
          console.warn("[AdminImagesPage] Storage upload failed, using base64 directly:", storageError);
          // Keep the base64 data - it will be stored in Firestore
          finalImageUrl = newImageUrl;
        }
      }

      // Find the original image data
      const originalImage = images.find((img) => img.id === imageId);
      if (!originalImage) {
        console.error("[AdminImagesPage] Image not found:", imageId);
        throw new Error("Image not found");
      }
      console.log("[AdminImagesPage] Original image found:", originalImage.id);

      // Save metadata to Firestore
      const updatedImage: StoredImage = {
        ...originalImage,
        ...metadata,
        imageUrl: finalImageUrl,
        originalUrl: originalImage.originalUrl || originalImage.imageUrl,
      };

      console.log("[AdminImagesPage] Saving image metadata to Firestore...");
      await saveImageMetadata(updatedImage);
      console.log("[AdminImagesPage] Metadata saved successfully");

      // Update local state
      setImages((prev) =>
        prev.map((img) => (img.id === imageId ? updatedImage : img))
      );
      console.log("[AdminImagesPage] Local state updated");

      toast({
        title: "Success",
        description: "Image updated successfully!",
      });
      console.log("[AdminImagesPage] handleSaveImage completed successfully");
    } catch (err) {
      console.error("[AdminImagesPage] Failed to save image:", err);
      throw err;
    }
  };

  const handleResetImage = async (image: StoredImage) => {
    if (!image.originalUrl) return;

    try {
      const resetImage: StoredImage = {
        ...image,
        imageUrl: image.originalUrl,
      };

      await saveImageMetadata(resetImage);

      setImages((prev) =>
        prev.map((img) => (img.id === image.id ? resetImage : img))
      );

      toast({
        title: "Success",
        description: "Image reset to original successfully!",
      });
    } catch (err) {
      console.error("Failed to reset image:", err);
      toast({
        title: "Error",
        description: "Failed to reset image.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading images...</span>
        </div>
      </div>
    );
  }

  const handleSaveBassRepairs = async () => {
    setIsSavingBass(true);
    try {
      await setBassRepairsCampaign(bassRaised, bassGoal);
      toast({
        title: "Success",
        description: "Bass Repairs progress bar figures updated!",
      });
    } catch (err) {
      console.error("Failed to update Bass Repairs campaign:", err);
      toast({
        title: "Error",
        description: "Failed to update Bass Repairs campaign.",
        variant: "destructive",
      });
    } finally {
      setIsSavingBass(false);
    }
  };

  return (
    <div className="container mx-auto py-12">
      <div className="mb-8 flex items-center justify-between">
        <Button asChild variant="outline">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadImages}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="secondary"
            onClick={initializeFirestore}
            disabled={isInitializing}
          >
            {isInitializing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Sync to Database
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upbeat! Holiday Gift Catalogue - Seasonal Controls */}
      <Card className="mb-12 border-primary/40 bg-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-primary text-white">Seasonal</Badge>
                <CardTitle className="font-headline text-2xl">Upbeat! Holiday Gift Catalogue</CardTitle>
              </div>
              <CardDescription className="mt-1">
                Manage the live Bass Repairs campaign progress bar ($1,000 / $2,800) and catalogue image assets below under <strong>Gift Catalogue (Seasonal)</strong>.
              </CardDescription>
            </div>
            <Button
              onClick={handleSaveBassRepairs}
              disabled={isSavingBass}
              className="bg-primary text-white"
            >
              {isSavingBass ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Progress Bar"
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">
                Current Amount Raised (CAD)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={bassRaised}
                onChange={(e) => setBassRaised(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">
                Goal Amount (CAD)
              </label>
              <Input
                type="number"
                step="0.01"
                min="1"
                value={bassGoal}
                onChange={(e) => setBassGoal(parseFloat(e.target.value) || 2800)}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Note: Donations made through Stripe for Bass Repairs automatically increment this total in real-time. You can also adjust it manually at any time.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-12">
        {categories.map(category => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{category}</CardTitle>
              <CardDescription>Manage your website's images and media assets for this category.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {groupedImages[category].map((image) => (
                  <Card key={image.id} className="flex flex-col">
                    <CardHeader>
                      <div className="relative aspect-video rounded-md overflow-hidden group">
                        <Image
                          src={image.imageUrl}
                          alt={image.description}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          data-ai-hint={image.imageHint}
                        />
                        {image.originalUrl && image.imageUrl !== image.originalUrl && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="text-xs">
                              Modified
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                      <Badge variant="outline" className="font-mono">{image.id}</Badge>
                      <p className="text-sm text-muted-foreground">{image.description}</p>
                      {image.updatedAt && (
                        <p className="text-xs text-muted-foreground">
                          Updated: {new Date(image.updatedAt).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                      <div className="flex gap-2 w-full">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleOpenDialog(image, "change")}
                        >
                          <ImageUp className="mr-2 h-4 w-4" />
                          Change
                        </Button>
                        <Button
                          variant="secondary"
                          className="flex-1"
                          onClick={() => handleOpenDialog(image, "edit")}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                      {image.originalUrl && image.imageUrl !== image.originalUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-muted-foreground"
                          onClick={() => handleResetImage(image)}
                        >
                          <RefreshCw className="mr-2 h-3 w-3" />
                          Reset to Original
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Image Management Dialog */}
      {selectedImage && (
        <ImageManagementDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          image={selectedImage}
          onSave={handleSaveImage}
          mode={dialogMode}
        />
      )}
    </div>
  );
}
