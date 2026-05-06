import { describe, it, expect } from 'vitest';
import { calculateScore, computeSubScores } from './engine';

// Shared strong profile for multiple tests
const STRONG_PROFILE = {
  annualCapital: 50,       // 220/250
  weeklyTime: 40,          // 220/250
  expectedReturn: 50,      // 100/100 (optimal range)
  investmentAmount: 30,    // piecewise(30,[0,0],[3,30],[10,90],[50,130]) = 110/150
  industryExperience: 5,   // 180/200
  debtPressure: 0,         // 50/50
};

describe('calculateScore', () => {
  it('returns 高度适配 for a strong profile', () => {
    const result = calculateScore(STRONG_PROFILE);
    // 220+220+100+110+180+50 = 880
    expect(result.score).toBe(880);
    expect(result.tier).toBe('高度适配');
    expect(result.isWishingType).toBe(false);
  });

  it('returns 1000 for maximum inputs', () => {
    const result = calculateScore({
      annualCapital: 100,
      weeklyTime: 60,
      expectedReturn: 50,
      investmentAmount: 100,
      industryExperience: 10,
      debtPressure: 0,
    });
    expect(result.score).toBe(1000);
    expect(result.tier).toBe('高度适配');
  });

  it('returns 110 and 需要准备 for all null inputs', () => {
    // null→0 defaults: capital=0, time=0, return=0→60pts, invest=0, experience=0, debt=0→50pts
    const result = calculateScore({
      annualCapital: null,
      weeklyTime: null,
      expectedReturn: null,
      investmentAmount: null,
      industryExperience: null,
      debtPressure: null,
    });
    expect(result.score).toBe(110);
    expect(result.tier).toBe('需要准备');
    expect(result.subScores.annualCapital).toBe(0);
    expect(result.subScores.weeklyTime).toBe(0);
    expect(result.subScores.expectedReturn).toBe(60);
    expect(result.subScores.investmentAmount).toBe(0);
    expect(result.subScores.industryExperience).toBe(0);
    expect(result.subScores.debtPressure).toBe(50);
  });

  it('returns 中度适配 for a mid-range profile', () => {
    const result = calculateScore({
      annualCapital: 10,   // piecewise→90
      weeklyTime: 15,      // piecewise→75
      expectedReturn: 30,  // piecewise→100
      investmentAmount: 5, // piecewise→50
      industryExperience: 1, // step→80
      debtPressure: 1,     // piecewise→40
    });
    // 83+75+100+47+80+40 = 425
    expect(result.score).toBe(425);
    expect(result.tier).toBe('中度适配');
  });

  it('returns 需要准备 for a weak profile', () => {
    const result = calculateScore({
      annualCapital: 2,
      weeklyTime: 5,
      expectedReturn: 200,
      investmentAmount: 1,
      industryExperience: 0,
      debtPressure: 4,
    });
    expect(result.tier).toBe('需要准备');
    expect(result.score).toBeLessThan(400);
  });

  it('detects wishing type when expectedReturn > 500', () => {
    const result = calculateScore({ ...STRONG_PROFILE, expectedReturn: 600 });
    expect(result.isWishingType).toBe(true);
    expect(result.tier).toBe('需要准备');
    expect(result.subScores.expectedReturn).toBe(0);
  });

  it('forces tier to 需要准备 for wishing-type even with max other inputs', () => {
    const result = calculateScore({
      annualCapital: 100,
      weeklyTime: 60,
      expectedReturn: 600,
      investmentAmount: 100,
      industryExperience: 10,
      debtPressure: 0,
    });
    expect(result.isWishingType).toBe(true);
    expect(result.tier).toBe('需要准备');
    // Score still computed: 250+250+0+150+200+50 = 900
    expect(result.score).toBe(900);
  });

  it('does NOT mark as wishing type at exactly 500%', () => {
    const result = calculateScore({ ...STRONG_PROFILE, expectedReturn: 500 });
    expect(result.isWishingType).toBe(false);
    expect(result.subScores.expectedReturn).toBe(20);
  });

  it('industryExperience step function - boundary at 3 years', () => {
    const at3 = calculateScore({ ...STRONG_PROFILE, industryExperience: 3 });
    const at2 = calculateScore({ ...STRONG_PROFILE, industryExperience: 2 });
    expect(at3.subScores.industryExperience).toBe(140);
    expect(at2.subScores.industryExperience).toBe(80);
  });

  it('debtPressure: 0 debt = max points, heavy debt = low points', () => {
    const noDebt = calculateScore({ ...STRONG_PROFILE, debtPressure: 0 });
    const heavyDebt = calculateScore({ ...STRONG_PROFILE, debtPressure: 10 });
    expect(noDebt.subScores.debtPressure).toBe(50);
    expect(heavyDebt.subScores.debtPressure).toBe(5);
  });
});

describe('computeSubScores', () => {
  it('matches calculateScore.subScores for same input', () => {
    const subScores = computeSubScores(STRONG_PROFILE);
    const result = calculateScore(STRONG_PROFILE);
    expect(subScores).toEqual(result.subScores);
  });
});
