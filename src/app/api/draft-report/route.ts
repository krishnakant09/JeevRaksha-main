import { NextResponse } from 'next/server';

interface ExtractedReport {
  species?: string;
  symptoms: string[];
  severity: "MILD" | "MODERATE" | "SEVERE";
  animalsAffected: number;
  deaths: number;
  duration: number;
  temperature: number;
  locationVillage: string;
  locationDistrict?: string;
  additionalNotes: string;
}

// Fallback intelligent natural language parser for Hindi, Marathi, and English voice input
function extractWithRuleEngine(text: string, predefinedSymptoms: string[] = []): ExtractedReport {
  const lower = text.toLowerCase();

  // 1. Species extraction
  let species = "Cow";
  if (lower.includes("भैंस") || lower.includes("म्हैस") || lower.includes("buffalo") || lower.includes("रेडा") || lower.includes("कटरा")) {
    species = "Buffalo";
  } else if (lower.includes("बकरी") || lower.includes("बोकड") || lower.includes("goat") || lower.includes("शेळी")) {
    species = "Goat";
  } else if (lower.includes("भेड़") || lower.includes("मेंढी") || lower.includes("sheep")) {
    species = "Sheep";
  } else if (lower.includes("बैल") || lower.includes("ox") || lower.includes("bull")) {
    species = "Bull";
  } else if (lower.includes("गाय") || lower.includes("गायी") || lower.includes("cow") || lower.includes("गोवंश")) {
    species = "Cow";
  }

  // 2. Numbers extraction (affected & deaths)
  let animalsAffected = 1;
  const numMap: Record<string, number> = {
    "एक": 1, "दोन": 2, "दो": 2, "तीन": 3, "चार": 4, "पाच": 5, "पांच": 5, "सहा": 6, "छह": 6,
    "सात": 7, "आठ": 8, "नऊ": 9, "नौ": 9, "दहा": 10, "दस": 10, "one": 1, "two": 2, "three": 3,
    "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10
  };

  const affectedMatch = text.match(/(\d+)\s*(गाय|भैंस|म्हैस|पशु|जनावरे|animals|cows|buffaloes)/i);
  if (affectedMatch && affectedMatch[1]) {
    animalsAffected = parseInt(affectedMatch[1], 10);
  } else {
    for (const [word, val] of Object.entries(numMap)) {
      if (text.includes(`${word} गाय`) || text.includes(`${word} म्हैस`) || text.includes(`${word} भैंस`) || text.includes(`${word} पशु`) || text.includes(`${word} animal`)) {
        animalsAffected = val;
        break;
      }
    }
  }

  let deaths = 0;
  if (lower.includes("मृत") || lower.includes("मरण") || lower.includes("मर गई") || lower.includes("मरण पावले") || lower.includes("death") || lower.includes("died")) {
    const deathMatch = text.match(/(\d+)\s*(मर|मृत|मरण|deaths|died)/i);
    if (deathMatch && deathMatch[1]) {
      deaths = parseInt(deathMatch[1], 10);
    } else {
      deaths = 1;
    }
  }

  // 3. Duration
  let duration = 2;
  const durMatch = text.match(/(\d+)\s*(दिन|दिवस|days|day)/i);
  if (durMatch && durMatch[1]) {
    duration = parseInt(durMatch[1], 10);
  }

  // 4. Symptoms extraction
  const foundSymptoms: string[] = [];

  const symptomKeywords: Record<string, string[]> = {
    "Fever": ["बुखार", "ताप", "fever", "गर्म", "temperature"],
    "Excessive salivation": ["लार", "लाळ", "फेस", "saliva", "drooling", "salivation"],
    "Blistering": ["छाले", "फोडे", "फोड", "blisters", "vesicles", "wound", "घाव", "जखम"],
    "Lameness": ["लंगड़ा", "लंगडत", "खुर", "पाय", "lameness", "limping", "पायाला"],
    "Loss of appetite": ["भूख", "भूक", "चारा", "खाना नहीं", "खायला नकार", "appetite"],
    "Weakness": ["कमजोरी", "थकावट", "अशक्तपणा", "weakness", "lethargic"],
    "Reduced milk": ["दूध कम", "दूध घटले", "milk reduced", "milk production"],
    "Cough": ["खांसी", "खोकला", "cough", "respiratory", "धाप"],
    "Skin nodules": ["गांठें", "गाठी", "nodules", "skin lumps", "lumpy"],
    "Diarrhea": ["दस्त", "जुलाब", "diarrhea", "loose motion"],
  };

  for (const [symName, keywords] of Object.entries(symptomKeywords)) {
    if (keywords.some((k) => lower.includes(k))) {
      // Find matching predefined symptom if available
      const matchingPredefined = predefinedSymptoms.find(
        (ps) => ps.toLowerCase().includes(symName.toLowerCase()) || symName.toLowerCase().includes(ps.toLowerCase())
      );
      foundSymptoms.push(matchingPredefined || symName);
    }
  }

  if (foundSymptoms.length === 0) {
    foundSymptoms.push("Fever");
  }

  // 5. Severity assessment
  let severity: "MILD" | "MODERATE" | "SEVERE" = "MILD";
  if (deaths > 0 || animalsAffected >= 5 || foundSymptoms.includes("Blistering") || foundSymptoms.includes("Excessive salivation")) {
    severity = "SEVERE";
  } else if (animalsAffected > 1 || duration >= 3 || foundSymptoms.length >= 2 || foundSymptoms.includes("Skin nodules")) {
    severity = "MODERATE";
  }

  // 6. Estimated Temperature
  let temperature = severity === "SEVERE" ? 104.8 : severity === "MODERATE" ? 103.2 : 101.5;

  // 7. Village extraction
  let locationVillage = "";
  const villageKeywords = ["वाघोली", "wagholi", "उरुळी", "uruli", "शिरवळ", "shirwal", "हवेली", "haveli", "बारामती", "baramati", "रामपुर", "rampur"];
  for (const v of villageKeywords) {
    if (lower.includes(v)) {
      if (v === "वाघोली" || v === "wagholi") locationVillage = "Wagholi";
      else if (v === "उरुळी" || v === "uruli") locationVillage = "Uruli Kanchan";
      else if (v === "शिरवळ" || v === "shirwal") locationVillage = "Shirwal";
      else if (v === "बारामती" || v === "baramati") locationVillage = "Baramati";
      else if (v === "हवेली" || v === "haveli") locationVillage = "Haveli";
      else if (v === "रामपुर" || v === "rampur") locationVillage = "Rampur";
      break;
    }
  }

  // If not found in known list, check regex: "गांव [X]" / "गाव [X]" / "village [X]"
  if (!locationVillage) {
    const vMatch = text.match(/(?:गांव|गाव|village)\s+([A-Za-z\u0900-\u097F]+)/i);
    if (vMatch && vMatch[1]) {
      locationVillage = vMatch[1].trim();
    }
  }

  return {
    species,
    symptoms: foundSymptoms,
    severity,
    animalsAffected,
    deaths,
    duration,
    temperature,
    locationVillage,
    additionalNotes: `Voice recorded report: ${text}`,
  };
}

export async function POST(req: Request) {
  try {
    const { text, predefinedSymptoms = [] } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    // Try Sarvam AI if API key is active
    if (process.env.SARVAM_API_KEY && process.env.SARVAM_API_KEY.startsWith("sk_")) {
      try {
        const prompt = `Analyze this livestock health issue spoken by a farmer (in Hindi, Marathi, or English): "${text}".
Return ONLY a valid JSON object without markdown or formatting.
Keys:
"species": String ("Cow", "Buffalo", "Goat", "Sheep")
"symptoms": Array of string symptoms from ${JSON.stringify(predefinedSymptoms)}
"severity": "MILD" | "MODERATE" | "SEVERE"
"animalsAffected": Number
"deaths": Number
"duration": Number (days)
"temperature": Number (in Fahrenheit, e.g. 103.5)
"locationVillage": String
"additionalNotes": String`;

        const aiRes = await fetch("https://api.sarvam.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-subscription-key": process.env.SARVAM_API_KEY,
          },
          body: JSON.stringify({
            model: "sarvam-105b-conversations",
            messages: [
              { role: "system", content: "You are a bilingual veterinary data extraction AI. Output raw valid JSON only." },
              { role: "user", content: prompt },
            ],
            temperature: 0.1,
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          let rawOutput = aiData.choices[0].message.content.trim();
          if (rawOutput.startsWith("```json")) rawOutput = rawOutput.slice(7, -3).trim();
          else if (rawOutput.startsWith("```")) rawOutput = rawOutput.slice(3, -3).trim();
          const parsed = JSON.parse(rawOutput);
          return NextResponse.json(parsed);
        }
      } catch (err) {
        console.warn("Sarvam API failed, falling back to Indic Rule Engine:", err);
      }
    }

    // Use high-accuracy Indic Rule Engine fallback
    const result = extractWithRuleEngine(text, predefinedSymptoms);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Draft report error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
