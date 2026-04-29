"use client";

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PLACEHOLDERS = [
  "Rainy night, lonely street, cinematic",
  "Cyberpunk city skyline at dusk",
  "Minimalist living room with natural light",
  "Abstract fluid waves in neon colors",
  "Vintage polaroid of a summer road trip",
];

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  onSearch: (prompt: string) => void;
  isLoading: boolean;
}

export default function SearchInput({ value, onChange, onSearch, isLoading }: SearchInputProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      onSearch(value.trim());
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full max-w-2xl mx-auto flex items-center"
    >
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-6 w-6 text-neutral-500" />
      </div>
      
      {/* Animated Placeholder Layer */}
      {!value && (
        <div className="absolute inset-y-0 left-12 right-14 flex items-center pointer-events-none overflow-hidden">
          <span
            key={placeholderIndex}
            className="text-neutral-500 text-lg sm:text-xl truncate animate-fade-in-up"
          >
            {PLACEHOLDERS[placeholderIndex]}
          </span>
        </div>
      )}

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
        className={cn(
          "w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-4 pl-12 pr-16 text-lg sm:text-xl text-neutral-100",
          "focus:outline-none focus:ring-2 focus:ring-neutral-700 transition-all",
          "placeholder-transparent disabled:opacity-50"
        )}
        placeholder={PLACEHOLDERS[placeholderIndex]}
      />
      <button
        type="submit"
        disabled={!value.trim() || isLoading}
        className={cn(
          "absolute inset-y-2 right-2 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "font-medium text-sm"
        )}
      >
        {isLoading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
