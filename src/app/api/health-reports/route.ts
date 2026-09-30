import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateRisk } from '@/lib/risk-engine';

export async function GET() {
  try {
    const reports = await prisma.healthReport.findMany({
      include: { animal: true, symptoms: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json(reports);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      animalId,
      reporterId,
      symptoms,
      severity,
      deaths,
      animalsAffected,
      vaccinatedCount,
      locationVillage,
      locationBlock,
      locationDistrict,
      latitude,
      longitude,
      temperature,
      duration,
      additionalNotes,
    } = body;

    if (!animalId || !reporterId || !locationVillage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Count nearby cases in the same village in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const nearbyCases = await prisma.healthReport.count({
      where: {
        locationVillage,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    // Calculate baseline risk using local epidemiological engine
    const baselineRisk = calculateRisk({
      severity: (severity as 'MILD' | 'MODERATE' | 'SEVERE') || 'MILD',
      nearbyCases,
      mortality: deaths ? parseInt(deaths.toString()) || 0 : 0,
      vaccinationGap: !vaccinatedCount || (parseInt(animalsAffected?.toString() || '1') > parseInt(vaccinatedCount?.toString() || '0')),
      historicalTrendScore: 5,
      environmentalContextScore: 3,
    });

    let riskResult = {
      riskLevel: baselineRisk.riskLevel,
      riskScore: baselineRisk.riskScore,
      factors: baselineRisk.factors.length > 0 ? baselineRisk.factors : ["Local Clinical Triage"],
      recommendedAction: baselineRisk.recommendedAction,
    };

    if (deaths && parseInt(deaths.toString()) > 0) {
      riskResult = {
        riskLevel: "HIGH",
        riskScore: Math.max(baselineRisk.riskScore, 75),
        factors: ["Mortality Reported", ...baselineRisk.factors],
        recommendedAction: "Isolate carcass immediately and contact authorities for quarantine and diagnostic testing.",
      };
    } else if (process.env.SARVAM_API_KEY) {
      try {
        const prompt = `Analyze this livestock health report. Symptoms: ${(symptoms || []).join(", ")}. Severity: ${severity}. Affected: ${animalsAffected}. Location: ${locationVillage}. Nearby cases last 30 days: ${nearbyCases}. 
Return ONLY a valid JSON object without any markdown tags or backticks. Required fields: "riskLevel" (String: LOW, MEDIUM, or HIGH), "riskScore" (Number: 0 to 100), and "recommendedAction" (String: short actionable advice).`;
        
        const aiRes = await fetch("https://api.sarvam.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-subscription-key": process.env.SARVAM_API_KEY,
          },
          body: JSON.stringify({
            model: "sarvam-105b-conversations",
            messages: [{ role: "system", content: "You are a veterinary AI. Always respond in valid JSON only." }, { role: "user", content: prompt }],
            temperature: 0.1,
          }),
        });
        
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          let rawOutput = aiData.choices[0].message.content.trim();
          if (rawOutput.startsWith("```json")) rawOutput = rawOutput.slice(7, -3).trim();
          else if (rawOutput.startsWith("```")) rawOutput = rawOutput.slice(3, -3).trim();
          
          const parsed = JSON.parse(rawOutput);
          riskResult = {
            riskLevel: parsed.riskLevel || baselineRisk.riskLevel,
            riskScore: parsed.riskScore !== undefined ? parsed.riskScore : baselineRisk.riskScore,
            factors: ["Sarvam AI", ...(symptoms || [])],
            recommendedAction: parsed.recommendedAction || baselineRisk.recommendedAction,
          };
        }
      } catch (e) {
        console.error("Sarvam AI Error:", e);
      }
    }

    // Create report + symptoms in a transaction
    const report = await prisma.$transaction(async (tx: any) => {
      const newReport = await tx.healthReport.create({
        data: {
          animalId,
          reporterId,
          severity: severity || 'MILD',
          deaths: deaths || 0,
          animalsAffected: animalsAffected || 1,
          vaccinatedCount: vaccinatedCount || 0,
          locationVillage,
          locationBlock: locationBlock || '',
          locationDistrict: locationDistrict || '',
          latitude: latitude || null,
          longitude: longitude || null,
          temperature: temperature ? parseFloat(temperature) : null,
          duration: duration ? parseInt(duration) : null,
          additionalNotes: additionalNotes || null,
          riskScore: riskResult.riskScore,
          riskLevel: riskResult.riskLevel,
          riskFactors: riskResult.factors.join(', '),
          recommendedAction: riskResult.recommendedAction,
        },
      });

      // Save symptoms
      if (symptoms && symptoms.length > 0) {
        await tx.symptom.createMany({
          data: symptoms.map((name: string) => ({
            name,
            healthReportId: newReport.id,
          })),
        });
      }

      // Create a case automatically
      await tx.case.create({
        data: {
          animalId,
          healthReportId: newReport.id,
          status: 'NEW',
        },
      });

      // If HIGH risk, create an alert
      if (riskResult.riskLevel === 'HIGH') {
        await tx.alert.create({
          data: {
            type: 'HIGH_RISK',
            message: `Possible health risk detected in ${locationVillage}. Risk score: ${riskResult.riskScore}/100. Factors: ${riskResult.factors.join(', ')}.`,
            village: locationVillage,
            block: locationBlock || null,
            district: locationDistrict || null,
          },
        });
      }

      return newReport;
    });

    return NextResponse.json(report, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}
