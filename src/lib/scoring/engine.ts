import type { ScoringInput, ScoringResult, SubScores } from '@/types/assessment';

// Piecewise linear interpolation; clamps to first/last y value outside range.
function piecewise(x: number, pts: [number, number][]): number {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (x <= pts[i][0]) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
    }
  }
  return pts[pts.length - 1][1];
}

// annualCapital: 25% weight = 250 pts max
// Breakpoints in 万元: steep at low end, soft ceiling at 100万
function scoreCapital(v: number): number {
  return Math.round(piecewise(v, [[0, 0], [5, 50], [20, 150], [50, 220], [100, 250]]));
}

// weeklyTime: 25% weight = 250 pts max
// <10h penalised heavily; full-time ~40h hits near-max
function scoreTime(v: number): number {
  return Math.round(piecewise(v, [[0, 0], [10, 30], [20, 120], [40, 220], [60, 250]]));
}

// industryExperience: 20% weight = 200 pts max
// Step function by years — experience is qualitative, not linear
function scoreExperience(years: number): number {
  if (years >= 10) return 200;
  if (years >= 5) return 180;
  if (years >= 3) return 140;
  if (years >= 1) return 80;
  if (years > 0) return 30;
  return 0;
}

// investmentAmount: 15% weight = 150 pts max
// Breakpoints in 万元: viable from 3万, good from 10万
function scoreInvestment(v: number): number {
  return Math.round(piecewise(v, [[0, 0], [3, 30], [10, 90], [50, 130], [100, 150]]));
}

// expectedReturn: 10% weight = 100 pts max
// Inverted-U: optimal 15-100%; >500% triggers wishing-type (caller handles)
function scoreReturn(v: number): number {
  if (v > 500) return 0;
  return Math.round(piecewise(v, [[0, 60], [15, 100], [100, 100], [300, 50], [500, 20]]));
}

// debtPressure: 5% weight = 50 pts max
// Lower monthly debt = higher score; >5万/月 is severe pressure
function scoreDebt(monthlyDebt: number): number {
  return Math.round(piecewise(monthlyDebt, [[0, 50], [1, 40], [3, 25], [5, 5]]));
}

export function computeSubScores(input: ScoringInput): SubScores {
  const annualCapital = input.annualCapital ?? 0;
  const weeklyTime = input.weeklyTime ?? 0;
  const expectedReturn = input.expectedReturn ?? 0;
  const investmentAmount = input.investmentAmount ?? 0;
  const industryExperience = input.industryExperience ?? 0;
  const debtPressure = input.debtPressure ?? 0;

  return {
    annualCapital: scoreCapital(annualCapital),
    weeklyTime: scoreTime(weeklyTime),
    industryExperience: scoreExperience(industryExperience),
    investmentAmount: scoreInvestment(investmentAmount),
    expectedReturn: scoreReturn(expectedReturn),
    debtPressure: scoreDebt(debtPressure),
  };
}

export function calculateScore(input: ScoringInput): ScoringResult {
  const expectedReturn = input.expectedReturn ?? 0;
  const isWishingType = expectedReturn > 500;

  const subScores = computeSubScores(input);

  const totalScore = Math.round(
    subScores.annualCapital +
    subScores.weeklyTime +
    subScores.industryExperience +
    subScores.investmentAmount +
    subScores.expectedReturn +
    subScores.debtPressure
  );

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

  return { score: totalScore, tier, isWishingType, subScores };
}
