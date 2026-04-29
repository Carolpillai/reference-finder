import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(request: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq API key is not configured. Please add it to your .env.local file." },
        { status: 500 }
      );
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a creative director. Convert the user's abstract idea into 4–6 concrete, specific image search queries. Return ONLY a JSON array of strings. No explanation. No markdown. Example output: ["wet cobblestone street night", "neon reflection puddle", "solitary figure fog streetlight"]`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
    });

    const text = completion.choices[0]?.message?.content?.trim() || "";

    // The model might still wrap in markdown or return extra text, so we parse it safely
    const jsonMatch = text.match(/\[([\s\S]*?)\]/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON array from response");
    }

    const keywords = JSON.parse(`[${jsonMatch[1]}]`);

    return NextResponse.json({ keywords });
  } catch (error: any) {
    console.error("Error generating keywords:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate keywords" },
      { status: 500 }
    );
  }
}
