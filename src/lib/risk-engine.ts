export interface RiskAssessmentInput {
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  nearbyCases: number;
  mortality: number;
  vaccinationGap: boolean;
  historicalTrendScore: number; // 0-10
  environmentalContextScore: number; // 0-5
}

export interface RiskAssessmentOutput {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  factors: string[];
  recommendedAction: string;
}

export function calculateRisk(input: RiskAssessmentInput): RiskAssessmentOutput {
  let score = 0;
  const factors: string[] = [];

  // Symptom severity: 0-25
  if (input.severity === 'SEVERE') {
    score += 25;
    factors.push('Severe symptoms reported');
  } else if (input.severity === 'MODERATE') {
    score += 15;
    factors.push('Moderate symptoms reported');
  } else {
    score += 5;
  }

  // Nearby cases: 0-25
  if (input.nearbyCases > 0) {
    const caseScore = Math.min(input.nearbyCases * 5, 25);
    score += caseScore;
    factors.push(`${input.nearbyCases} nearby cases detected`);
  }

  // Mortality: 0-20
  if (input.mortality > 0) {
    const deathScore = Math.min(input.mortality * 10, 20);
    score += deathScore;
    factors.push(`${input.mortality} mortalities reported`);
  }

  // Vaccination gap: 0-15
  if (input.vaccinationGap) {
    score += 15;
    factors.push('Low vaccination coverage in area');
  }

  // Historical trend: 0-10
  const trendScore = Math.min(input.historicalTrendScore, 10);
  score += trendScore;
  if (trendScore > 5) factors.push('Increasing historical trend');

  // Environmental context: 0-5
  const envScore = Math.min(input.environmentalContextScore, 5);
  score += envScore;

  // Cap score at 100
  const finalScore = Math.min(Math.max(score, 0), 100);

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  let recommendedAction = 'Standard monitoring';

  if (finalScore >= 61) {
    riskLevel = 'HIGH';
    recommendedAction = 'Veterinary inspection recommended immediately.';
  } else if (finalScore >= 31) {
    riskLevel = 'MEDIUM';
    recommendedAction = 'Observe animal closely. Consider consultation if symptoms persist.';
  }

  return {
    riskScore: finalScore,
    riskLevel,
    factors,
    recommendedAction
  };
}
