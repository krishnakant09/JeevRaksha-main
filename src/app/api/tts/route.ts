import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, language_code = "hi-IN" } = await req.json();

    if (!process.env.SARVAM_API_KEY) {
      return NextResponse.json(
        { error: "SARVAM_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": process.env.SARVAM_API_KEY || "",
        "Authorization": `Bearer ${process.env.SARVAM_API_KEY}`,
      },
      body: JSON.stringify({
        text: text.substring(0, 2500), // Max 2500 chars for bulbul:v3
        language_code: language_code, // "hi-IN" handles code-mixing well
        model: "bulbul:v3",
        speaker: "shubh",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Sarvam TTS API Error:", data);
      return NextResponse.json({ error: "Failed to convert text to speech", details: data }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("TTS API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
