import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, predefinedSymptoms } = await req.json();

    if (!text) {
      return NextResponse.json({ matched: [] });
    }

    const prompt = `Analyze this symptom description provided by a farmer (in Hindi or English): "${text}". 
    Map it to one or more of the following predefined symptoms: ${predefinedSymptoms.join(", ")}.
    Return ONLY a valid JSON array of strings containing the exact matches from the predefined list. If none match, return an empty array [].
    Do not include markdown tags.`;

    const aiRes = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": process.env.SARVAM_API_KEY || "",
      },
      body: JSON.stringify({
        model: "sarvam-105b-conversations",
        messages: [
          { role: "system", content: "You are a veterinary assistant. You output valid JSON arrays only." },
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
      return NextResponse.json({ matched: Array.isArray(parsed) ? parsed : [] });
    } else {
      console.error("Sarvam AI Error mapping symptoms", await aiRes.text());
      return NextResponse.json({ matched: [] });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ matched: [] }, { status: 500 });
  }
}
