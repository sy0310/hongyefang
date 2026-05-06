import type { SubScores } from '@/types/assessment';

// Returns 0–1 score: higher = more complementary (better match)
// Weights: capital diff 40%, time diff 40%, combined experience synergy 20%
export function complementarityScore(a: SubScores, b: SubScores): number {
  const capitalDiff = Math.abs(a.annualCapital / 250 - b.annualCapital / 250);
  const timeDiff = Math.abs(a.weeklyTime / 250 - b.weeklyTime / 250);
  const expSynergy = (a.industryExperience + b.industryExperience) / 400;
  return capitalDiff * 0.4 + timeDiff * 0.4 + expSynergy * 0.2;
}

export function capitalLabel(score: number): string {
  if (score >= 200) return '充裕';
  if (score >= 120) return '良好';
  if (score >= 50) return '偏低';
  return '不足';
}

export function timeLabel(score: number): string {
  if (score >= 200) return '充分';
  if (score >= 100) return '中等';
  if (score >= 30) return '有限';
  return '很少';
}

export function expLabel(score: number): string {
  if (score >= 180) return '资深';
  if (score >= 100) return '一般';
  if (score >= 50) return '较少';
  return '无';
}
