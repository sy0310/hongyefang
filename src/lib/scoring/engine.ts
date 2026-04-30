import type { ScoringInput, ScoringResult, SubScores } from '@/types/assessment';

/**
 * Pure scoring engine for entrepreneurship fitness assessment.
 *
 * D-01: Rule-based weighted scoring, 0-1000 range (not AI-generated).
 * D-02: Weights -- annualCapital 40%, investmentAmount 30%, weeklyTime 20%, expectedReturn 10%.
 *   Max sub-scores: capital=400, invest=300, time=200, return=100.
 * D-04: Wishing-type detection: expectedReturn > 500 -> isWishingType = true.
 * D-05: Wishing-type forces tier to 需要准备, bypassing normal weighted scoring for tier.
 */

const CAPITAL_MAX = 400;
const INVEST_MAX = 300;
const TIME_MAX = 200;
const RETURN_MAX = 100;

// Input ceilings at which each dimension reaches its max sub-score
const CAPITAL_CEILING = 50;  // 50万元
const INVEST_CEILING = 50;  // 50万元
const TIME_CEILING = 40;    // 40小时/周

/**
 * Compute per-dimension sub-scores using the canonical formula.
 * Exported separately so the result page can import it as single source of truth
 * -- avoids sub-score formula duplication between scoring engine and result page.
 */
export function computeSubScores(input: ScoringInput): SubScores {
  const annualCapital = input.annualCapital ?? 0;
  const weeklyTime = input.weeklyTime ?? 0;
  const expectedReturn = input.expectedReturn ?? 0;
  const investmentAmount = input.investmentAmount ?? 0;

  // Sub-score calculations
  const capitalScore = Math.min(CAPITAL_MAX, Math.round((annualCapital / CAPITAL_CEILING) * CAPITAL_MAX));
  const investScore = Math.min(INVEST_MAX, Math.round((investmentAmount / INVEST_CEILING) * INVEST_MAX));
  const timeScore = Math.min(TIME_MAX, Math.round((weeklyTime / TIME_CEILING) * TIME_MAX));

  // D-05: wishing-type sets returnScore to 0
  // expectedReturn formula: lower = better. 100 - (expectedReturn / 2), clamped 0-100
  const returnScore = expectedReturn > 500
    ? 0
    : Math.min(RETURN_MAX, Math.max(0, Math.round(100 - (expectedReturn / 2))));

  return {
    annualCapital: capitalScore,
    investmentAmount: investScore,
    weeklyTime: timeScore,
    expectedReturn: returnScore,
  };
}

export function calculateScore(input: ScoringInput): ScoringResult {
  const expectedReturn = input.expectedReturn ?? 0;

  // D-04: wishing-type detection
  const isWishingType = expectedReturn > 500;

  // Use shared sub-score computation (single source of truth)
  const subScores = computeSubScores(input);

  const totalScore = Math.round(
    subScores.annualCapital + subScores.investmentAmount + subScores.weeklyTime + subScores.expectedReturn
  );

  // Tier assignment
  // D-05: wishing-type forces 需要准备 regardless of score
  let tier: ScoringResult['tier'];
  if (isWishingType) {
    tier = '需要准备';
  } else if (totalScore >= 700) {
    tier = '高度适配';
  } else if (totalScore >= 400) {
    tier = '中度适配';
  } else {
    tier = '需要准备';
  }

  return {
    score: totalScore,
    tier,
    isWishingType,
    subScores,
  };
}
