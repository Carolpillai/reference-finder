import { NextResponse } from "next/server";
import { createApi } from "unsplash-js";

export async function POST(request: Request) {
  try {
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      return NextResponse.json(
        { error: "Unsplash API key is not configured. Please add it to your .env.local file." },
        { status: 500 }
      );
    }

    const unsplash = createApi({
      accessKey: process.env.UNSPLASH_ACCESS_KEY,
    });

    const { keywords } = await request.json();

    if (!keywords || !Array.isArray(keywords)) {
      return NextResponse.json(
        { error: "Keywords array is required" },
        { status: 400 }
      );
    }

    // To prevent hitting rate limits too quickly, we will take the top 2 keywords
    // and fetch 4 images per keyword, yielding up to 8 images with fewer API calls.
    const topKeywords = keywords.slice(0, 2);

    const imagePromises = topKeywords.map(async (keyword) => {
      const result = await unsplash.search.getPhotos({
        query: keyword,
        perPage: 4,
        orientation: "landscape",
      });

      if (result.type === "success") {
        return result.response.results.map((photo) => ({
          id: photo.id,
          url: photo.urls.regular,
          alt_description: photo.alt_description,
          width: photo.width,
          height: photo.height,
        }));
      } else {
        console.error("Unsplash error:", result.errors);
        throw new Error(`Unsplash API error: ${result.errors?.[0] || "Unknown error"}`);
      }
    });

    const resultsArray = await Promise.all(imagePromises);
    
    // Flatten and deduplicate images by ID
    const imagesMap = new Map();
    resultsArray.flat().forEach((img) => {
      if (!imagesMap.has(img.id)) {
        imagesMap.set(img.id, img);
      }
    });

    const images = Array.from(imagesMap.values());

    return NextResponse.json({ images });
  } catch (error: any) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch images" },
      { status: error.message?.includes("Rate Limit") || error.message?.includes("Rate limit") ? 429 : 500 }
    );
  }
}
