"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const skipSuggestionsRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (skipSuggestionsRef.current) {
      skipSuggestionsRef.current = false;
      return;
    }

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(async () => {
      setIsSuggesting(true);
      try {
        const res = await fetch("/api/suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: value }),
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions);
          setShowSuggestions(true);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Failed to fetch suggestions", err);
        }
      } finally {
        setIsSuggesting(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      abortControllerRef.current?.abort();
      setShowSuggestions(false);
      setSuggestions([]);
      onSearch(value.trim());
    }
  };

  return (
    <form
      ref={formRef}
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
        suppressHydrationWarning={true}
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
        suppressHydrationWarning={true}
        disabled={!value.trim() || isLoading}
        className={cn(
          "absolute inset-y-2 right-2 px-6 bg-white hover:bg-neutral-200 text-black rounded-xl transition-colors shadow-lg font-semibold",
          "disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        )}
      >
        {isLoading ? "Searching..." : "Search"}
      </button>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl z-50 animate-fade-in-up">
          <ul className="py-2">
            {suggestions.map((suggestion, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => {
                    skipSuggestionsRef.current = true;
                    abortControllerRef.current?.abort();
                    setSuggestions([]);
                    setShowSuggestions(false);
                    onChange(suggestion);
                    onSearch(suggestion);
                  }}
                  className="w-full text-left px-4 py-3 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 transition-colors flex items-center gap-3 text-sm sm:text-base cursor-pointer"
                >
                  <Search className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                  <span className="truncate">{suggestion}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
