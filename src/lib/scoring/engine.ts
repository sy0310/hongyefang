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

// annualCapital: 20% weight = 200 pts max
function scoreCapital(v: number): number {
  return Math.round(piecewise(v, [[0, 0], [5, 40], [20, 120], [50, 180], [100, 200]]));
}

// weeklyTime: 20% weight = 200 pts max
function scoreTime(v: number): number {
  return Math.round(piecewise(v, [[0, 0], [10, 25], [20, 100], [40, 180], [60, 200]]));
}

// investmentAmount: 20% weight = 200 pts max
function scoreInvestment(v: number): number {
  return Math.round(piecewise(v, [[0, 0], [3, 40], [10, 120], [50, 180], [100, 200]]));
}

// industryExperience: 10% weight = 100 pts max
function scoreExperience(years: number): number {
  if (years >= 10) return 100;
  if (years >= 5) return 80;
  if (years >= 3) return 60;
  if (years >= 1) return 40;
  if (years > 0) return 15;
  return 0;
}

// expectedReturn: 10% weight = 100 pts max
function scoreReturn(v: number): number {
  if (v > 500) return 0;
  return Math.round(piecewise(v, [[0, 60], [15, 100], [100, 100], [300, 50], [500, 20]]));
}

// debtPressure: 5% weight = 50 pts max
function scoreDebt(monthlyDebt: number): number {
  return Math.round(piecewise(monthlyDebt, [[0, 50], [1, 40], [3, 25], [5, 5]]));
}

// handsOffPreference: 10% weight = 100 pts max
// Higher score = better fit for our turnkey / B-end matchmaking service
function scoreHandsOff(v: number): number {
  return Math.round(piecewise(v, [[1, 20], [5, 60], [8, 90], [10, 100]]));
}

// setupAversion: 5% weight = 50 pts max
// Higher score = better fit for our 0-60 setup service
function scoreSetupAversion(v: number): number {
  return Math.round(piecewise(v, [[1, 10], [5, 30], [8, 45], [10, 50]]));
}

// targetIndustryFit: adjusts score based on heavy/light asset vs available funds
function scoreIndustryFit(industry: string | null, capital: number, investment: number): number {
  if (!industry || industry === '暂无' || industry === '未知') return 0;
  
  const totalFunds = capital + investment;
  const heavyKeywords = ['实体', '店', '餐饮', '厂', '重资产', '线下', '加盟'];
  const lightKeywords = ['自媒体', '电商', '设计', '代运营', '轻资产', '线上', '网'];

  const isHeavy = heavyKeywords.some(kw => industry.includes(kw));
  const isLight = lightKeywords.some(kw => industry.includes(kw));

  // If heavy asset but funds are very low (< 5w), huge mismatch (-50 pts)
  if (isHeavy && totalFunds < 5) return -50;
  // If heavy asset and funds are low (< 10w), moderate mismatch (-20 pts)
  if (isHeavy && totalFunds < 10) return -20;
  // If heavy asset and funds are sufficient, good fit
  if (isHeavy && totalFunds >= 30) return 20;

  // Light asset generally fits well with low funds
  if (isLight) return 20;

  return 0; // neutral
}

export function computeSubScores(input: ScoringInput): SubScores {
  const annualCapital = input.annualCapital ?? 0;
  const weeklyTime = input.weeklyTime ?? 0;
  const expectedReturn = input.expectedReturn ?? 0;
  const investmentAmount = input.investmentAmount ?? 0;
  const industryExperience = input.industryExperience ?? 0;
  const debtPressure = input.debtPressure ?? 0;
  const handsOffPreference = input.handsOffPreference ?? 1;
  const setupAversion = input.setupAversion ?? 1;
  const targetIndustry = input.targetIndustry ?? null;

  return {
    annualCapital: scoreCapital(annualCapital),
    weeklyTime: scoreTime(weeklyTime),
    industryExperience: scoreExperience(industryExperience),
    investmentAmount: scoreInvestment(investmentAmount),
    expectedReturn: scoreReturn(expectedReturn),
    debtPressure: scoreDebt(debtPressure),
    handsOffPreference: scoreHandsOff(handsOffPreference),
    setupAversion: scoreSetupAversion(setupAversion),
    targetIndustryFit: scoreIndustryFit(targetIndustry, annualCapital, investmentAmount),
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
    subScores.debtPressure +
    subScores.handsOffPreference +
    subScores.setupAversion +
    subScores.targetIndustryFit
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
