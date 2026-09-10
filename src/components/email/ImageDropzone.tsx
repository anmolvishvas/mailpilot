"use client";

import * as React from "react";
import { ImagePlus, X, FileImage, ClipboardPaste } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { ImageDataInput } from "@/types";

interface ImageDropzoneProps {
  images: ImageDataInput[];
  setImages: React.Dispatch<React.SetStateAction<ImageDataInput[]>>;
  maxImages?: number;
  label?: string;
  placeholder?: string;
}

export function ImageDropzone({
  images,
  setImages,
  maxImages = 3,
  label = "Upload Screenshot or Image",
  placeholder = "Drag & drop, click to browse, or paste screenshot (Ctrl+V)",
}: ImageDropzoneProps) {
  const { error } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      error("Only image files (.png, .jpg, .jpeg, .webp, .gif) are supported.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      error("Image size should be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImages((prev) => {
        if (prev.length >= maxImages) {
          error(`Maximum ${maxImages} images allowed.`);
          return prev;
        }
        return [
          ...prev,
          {
            base64,
            mimeType: file.type,
            name: file.name || `Screenshot-${Date.now()}.png`,
          },
        ];
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(processFile);
  };

  // Global & container paste listener
  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [maxImages]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <FileImage className="h-3.5 w-3.5" />
          <span>{label}</span>
        </label>
        {images.length > 0 && (
          <span className="text-[10px] text-muted-foreground font-mono">
            {images.length}/{maxImages} attached
          </span>
        )}
      </div>

      {/* Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg border border-dashed transition-all cursor-pointer text-center group ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-secondary/20 hover:bg-secondary/40 hover:border-foreground/20"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
          <ImagePlus className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
          <span className="font-medium text-foreground">{placeholder}</span>
        </div>
        <span className="text-[10px] text-muted-foreground mt-0.5">
          Supports screenshots from Slack, WhatsApp, email, receipts, invoices, or handwritten notes.
        </span>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative group flex items-center gap-2.5 rounded-lg border border-border bg-card p-2 shadow-sm overflow-hidden"
            >
              <div className="relative h-12 w-12 rounded-md overflow-hidden bg-secondary shrink-0 border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.base64}
                  alt={img.name || "Attached Screenshot"}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-medium text-foreground truncate">
                  {img.name || `Image #${idx + 1}`}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-mono">
                  {img.mimeType?.split("/")[1] || "Image"}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(idx);
                }}
                className="absolute right-1.5 top-1.5 h-6 w-6 rounded-md bg-background/80 border border-border text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors shadow-sm"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
