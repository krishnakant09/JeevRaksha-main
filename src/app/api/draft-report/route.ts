import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, predefinedSymptoms } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const prompt = `Analyze this livestock health issue described by a farmer (in Hindi or English): "${text}".
You need to extract the following information and return ONLY a valid JSON object. Do not include markdown blocks or any other text.
Fields to extract:
1. "symptoms": Array of strings exactly matching these predefined symptoms: ${predefinedSymptoms.join(", ")}.
2. "severity": String, either "MILD", "MODERATE", or "SEVERE". (Default to MILD if unclear).
3. "animalsAffected": Number, count of affected animals mentioned. (Default to 1).
4. "deaths": Number, count of dead animals mentioned. (Default to 0).
5. "locationVillage": String, the name of the village or location mentioned. (Leave empty string if not mentioned).
6. "additionalNotes": String, any other context or summary of the problem.

Ensure the output is valid JSON.`;

    const aiRes = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": process.env.SARVAM_API_KEY || "",
      },
      body: JSON.stringify({
        model: "sarvam-105b-conversations",
        messages: [
          { role: "system", content: "You are a data extraction AI for veterinary reports. Only output raw valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
      }),
    });

    if (aiRes.ok) {
      const aiData = await aiRes.json();
      let rawOutput = aiData.choices[0].message.content.trim();
      if (rawOutput.startsWith("\`\`\`json")) rawOutput = rawOutput.slice(7, -3).trim();
      else if (rawOutput.startsWith("\`\`\`")) rawOutput = rawOutput.slice(3, -3).trim();
      
      const parsed = JSON.parse(rawOutput);
      return NextResponse.json(parsed);
    } else {
      console.error("Sarvam AI Error drafting report", await aiRes.text());
      return NextResponse.json({ error: "AI failed to process" }, { status: 500 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
