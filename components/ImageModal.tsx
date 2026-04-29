"use client";

import React, { useState } from "react";
import { Download, Copy, X } from "lucide-react";
import { UnsplashImage } from "./ImageGrid";

interface ImageModalProps {
  image: UnsplashImage;
  onClose: () => void;
}

export default function ImageModal({ image, onClose }: ImageModalProps) {
  const [isCopying, setIsCopying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `reference-${image.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error("Failed to download image", e);
      alert("Failed to download image.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = async () => {
    setIsCopying(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = image.url;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get 2d context");
      ctx.drawImage(img, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Could not create blob");

      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob
        })
      ]);
      alert("Image copied to clipboard!");
    } catch (e) {
      console.error("Failed to copy image", e);
      alert("Failed to copy image. Your browser might not support this feature.");
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-[101] w-full max-w-5xl max-h-[90vh] flex flex-col items-center justify-center rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl">
        <button 
          onClick={onClose}
          suppressHydrationWarning={true}
          className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-md z-[102]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-full flex-1 min-h-0 overflow-hidden flex items-center justify-center bg-black/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.url}
            alt={image.alt_description || "Expanded reference"}
            className="w-full h-full object-contain max-h-[75vh]"
          />
        </div>

        <div className="w-full p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-900/90 backdrop-blur-md">
          <p className="text-neutral-300 text-sm truncate max-w-md">
            {image.alt_description || "Reference image"}
          </p>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              suppressHydrationWarning={true}
              disabled={isCopying}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-xl transition-colors text-sm font-medium disabled:opacity-50"
            >
              <Copy className="w-4 h-4" />
              {isCopying ? "Copying..." : "Copy Image"}
            </button>
            <button
              onClick={handleDownload}
              suppressHydrationWarning={true}
              disabled={isDownloading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-neutral-200 text-black rounded-xl transition-colors text-sm font-medium disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? "Downloading..." : "Download"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
