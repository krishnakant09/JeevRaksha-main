export interface RiskFactors {
  severity: string;
  deaths: number;
  nearbyCases: number;
  vaccinationGap: boolean;
}

export function calculateRisk(factors: RiskFactors): { score: number; level: string; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Severity 0-25
  if (factors.severity === "Severe") {
    score += 25;
    reasons.push("Severe symptoms reported.");
  } else if (factors.severity === "Moderate") {
    score += 15;
  } else {
    score += 5;
  }

  // Deaths 0-20
  if (factors.deaths > 0) {
    const deathScore = Math.min(factors.deaths * 10, 20);
    score += deathScore;
    reasons.push(`${factors.deaths} mortality reported.`);
  }

  // Nearby cases 0-25
  if (factors.nearbyCases > 0) {
    const clusterScore = Math.min(factors.nearbyCases * 5, 25);
    score += clusterScore;
    reasons.push(`${factors.nearbyCases} similar cases reported nearby.`);
  }

  // Vaccination gap 0-15
  if (factors.vaccinationGap) {
    score += 15;
    reasons.push("Vaccination coverage gap detected.");
  }

  // Base environmental context buffer
  score += 5;

  let level = "LOW";
  if (score >= 61) {
    level = "HIGH";
  } else if (score >= 31) {
    level = "MEDIUM";
  }

  return { score: Math.min(score, 100), level, reasons };
}
