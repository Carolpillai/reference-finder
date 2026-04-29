"use client";

import React, { useState } from "react";
import SearchInput from "@/components/SearchInput";
import KeywordTags from "@/components/KeywordTags";
import DomeGallery from "@/components/DomeGallery";
import ImageGrid, { UnsplashImage } from "@/components/ImageGrid";
import ImageModal from "@/components/ImageModal";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingImages, setIsFetchingImages] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [domeImages, setDomeImages] = useState<UnsplashImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null);

  React.useEffect(() => {
    const fetchDefaultDomeImages = async () => {
      try {
        const res = await fetch("/api/images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keywords: ["creative", "minimalist", "cinematic", "aesthetic"] }),
        });
        if (res.ok) {
          const data = await res.json();
          setDomeImages(data.images);
        }
      } catch (err) {
        console.error("Failed to load default dome images", err);
      }
    };
    fetchDefaultDomeImages();
  }, []);

  React.useEffect(() => {
    if (prompt.trim() === "") {
      setImages([]);
      setKeywords([]);
      setError(null);
    }
  }, [prompt]);

  const handleSearch = async (searchQuery: string) => {
    setPrompt(searchQuery);
    setIsSearching(true);
    setError(null);
    setKeywords([]);
    setImages([]);

    try {
      // Step 1: Generate keywords from Claude
      const keywordRes = await fetch("/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: searchQuery }),
      });

      if (!keywordRes.ok) {
        const errorData = await keywordRes.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate keywords");
      }

      const keywordData = await keywordRes.json();
      setKeywords(keywordData.keywords);

      // Step 2: Fetch images from Unsplash
      setIsFetchingImages(true);
      const imageRes = await fetch("/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: keywordData.keywords }),
      });

      if (!imageRes.ok) {
        const errorData = await imageRes.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch images. Please try again later.");
      }

      const imageData = await imageRes.json();
      setImages(imageData.images);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSearching(false);
      setIsFetchingImages(false);
    }
  };

  const showGrid = images.length > 0 || isSearching || isFetchingImages;

  const handleImageClick = (img: any) => {
    // Map to UnsplashImage format if it's from DomeGallery
    const formattedImg = {
      id: img.id || Math.random().toString(),
      url: img.src || img.url,
      alt_description: img.alt || img.alt_description || "",
      width: img.width || 1000,
      height: img.height || 1000
    };
    setSelectedImage(formattedImg);
    if (formattedImg.alt_description) {
      handleSearch(formattedImg.alt_description);
    }
  };

  return (
    <main className={`flex flex-col items-center pt-12 sm:pt-20 bg-[#0a0a0a] ${showGrid ? "min-h-screen pb-20" : "h-screen overflow-hidden"}`}>
      <div className="w-full max-w-4xl text-center mb-8 px-4 sm:px-6 z-40 relative">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4 text-neutral-100">
          Reference Finder
        </h1>
        <p className="text-neutral-400 text-lg">
          Describe an abstract idea. We&apos;ll translate it into visual keywords and find the right references.
        </p>
      </div>

      <div className="w-full flex flex-col items-center z-40 relative px-4 sm:px-6">
        <SearchInput
          value={prompt}
          onChange={setPrompt}
          onSearch={handleSearch}
          isLoading={isSearching && !isFetchingImages}
        />
        
        {error && (
          <p className="mt-4 text-red-400 text-sm">{error}</p>
        )}

        <KeywordTags keywords={keywords} onTagClick={handleSearch} />
      </div>

      {showGrid ? (
        <div className="w-full relative z-0">
          <ImageGrid images={images} isLoading={isFetchingImages || isSearching} onImageClick={handleImageClick} />
        </div>
      ) : (
        <div className="flex-1 w-full relative z-0 mt-8">
          <DomeGallery 
            images={domeImages.length > 0 ? domeImages.map(img => ({ src: img.url, alt: img.alt_description || "" })) : undefined}
            fit={1.5}
            fitBasis="width"
            onImageClick={handleImageClick}
          />
        </div>
      )}

      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </main>
  );
}
