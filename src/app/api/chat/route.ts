import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.SARVAM_API_KEY) {
      return NextResponse.json(
        { error: "SARVAM_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const systemPrompt = {
      role: "system",
      content: "You are an expert veterinary assistant for JeevRaksha (Animal Health Surveillance System in India). You must answer farmers' questions about their livestock health issues. KEEP YOUR ANSWERS VERY SHORT AND TO THE POINT (2-3 sentences max). Suggest immediate home remedies or when to call a vet. Reply in the same language the user uses (Hindi or English).",
    };

    const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": process.env.SARVAM_API_KEY || "",
        "Authorization": `Bearer ${process.env.SARVAM_API_KEY}`,
      },
      body: JSON.stringify({
        model: "sarvam-105b-conversations",
        messages: [systemPrompt, ...messages],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Sarvam API Error:", data);
      return NextResponse.json({ error: "Failed to get AI response", details: data }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
