"use client";

import React, { useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Download, Copy, X } from "lucide-react";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export interface UnsplashImage {
  id: string;
  url: string;
  alt_description: string | null;
  width: number;
  height: number;
}

interface ImageGridProps {
  images: UnsplashImage[];
  isLoading: boolean;
  onImageClick?: (image: UnsplashImage) => void;
}

export default function ImageGrid({ images, isLoading, onImageClick }: ImageGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 w-full max-w-7xl mx-auto px-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/3] bg-neutral-900 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!images || images.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 w-full max-w-7xl mx-auto px-4 pb-20">
      {images.map((image) => (
        <ImageCard 
          key={image.id} 
          image={image} 
          onClick={() => onImageClick?.(image)} 
        />
      ))}
    </div>
  );
}

function ImageCard({ image, onClick }: { image: UnsplashImage; onClick: () => void }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
      onClick={onClick}
      className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900 group cursor-pointer"
    >
      {/* Fallback skeleton if image takes time to load */}
      {!isLoaded && <div className="absolute inset-0 animate-pulse bg-neutral-800" />}
      
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt={image.alt_description || "Reference image"}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "object-cover w-full h-full transition-all duration-700 ease-out group-hover:scale-105",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
    </div>
  );
}


