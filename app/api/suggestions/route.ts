import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(request: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq API key is not configured." },
        { status: 500 }
      );
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const { input } = await request.json();

    if (!input || input.trim() === "") {
      return NextResponse.json({ suggestions: [] });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a creative search assistant. The user is typing a query for an image reference finder. 
Guess what they are trying to say and suggest 4-5 full, evocative, and visually descriptive creative prompts.
The suggestions should build upon or be highly relevant to what the user has typed.
Return ONLY a JSON array of strings. No explanation. No markdown.
Example input: "rain"
Example output: ["Rainy cyberpunk street at night", "Walking in the rain cinematic", "Raindrops on a window pane close up", "Soft rain in a Japanese garden"]`,
        },
        {
          role: "user",
          content: input,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 150,
    });

    const text = completion.choices[0]?.message?.content?.trim() || "";

    // Parse the JSON array safely
    const jsonMatch = text.match(/\[([\s\S]*?)\]/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON array from response");
    }

    const suggestions = JSON.parse(`[${jsonMatch[1]}]`);

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error("Error generating suggestions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
