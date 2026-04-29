"use client";

import React from "react";

interface KeywordTagsProps {
  keywords: string[];
  onTagClick?: (keyword: string) => void;
}

export default function KeywordTags({ keywords, onTagClick }: KeywordTagsProps) {
  if (!keywords || keywords.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2 mt-6">
      {keywords.map((keyword, i) => (
        <button
          key={i}
          onClick={() => onTagClick?.(keyword)}
          className="px-4 py-1.5 bg-neutral-900 border border-neutral-800 text-neutral-300 text-sm rounded-full transition-colors hover:bg-neutral-800 hover:text-neutral-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-neutral-700"
        >
          {keyword}
        </button>
      ))}
    </div>
  );
}
