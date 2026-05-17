import { describe, it, expect } from 'vitest';
import { calculateScore, computeSubScores } from './engine';

// Shared strong profile for multiple tests
const STRONG_PROFILE = {
  annualCapital: 50,       // 180/200
  weeklyTime: 40,          // 180/200
  expectedReturn: 50,      // 100/100
  investmentAmount: 50,    // 180/200
  industryExperience: 5,   // 80/100
  debtPressure: 0,         // 50/50
  handsOffPreference: 5,   // 60/100
  setupAversion: 5,        // 30/50
  targetIndustry: '自媒体', // 20/20
};

describe('calculateScore', () => {
  it('returns 高度适配 for a strong profile', () => {
    const result = calculateScore(STRONG_PROFILE);
    // 180+180+80+180+100+50+60+30+20 = 880
    expect(result.score).toBe(880);
    expect(result.tier).toBe('高度适配');
    expect(result.isWishingType).toBe(false);
  });

  it('returns maximum possible score for max inputs', () => {
    const result = calculateScore({
      annualCapital: 100,
      weeklyTime: 60,
      expectedReturn: 50,
      investmentAmount: 100,
      industryExperience: 10,
      debtPressure: 0,
      handsOffPreference: 10,
      setupAversion: 10,
      targetIndustry: '自媒体', // +20
    });
    // 200+200+100+200+100+50+100+50+20 = 1020
    expect(result.score).toBe(1020);
    expect(result.tier).toBe('高度适配');
  });

  it('returns 需要准备 for all null inputs', () => {
    const result = calculateScore({
      annualCapital: null,
      weeklyTime: null,
      expectedReturn: null,
      investmentAmount: null,
      industryExperience: null,
      debtPressure: null,
      handsOffPreference: null,
      setupAversion: null,
      targetIndustry: null,
    });
    expect(result.score).toBe(140);
    expect(result.tier).toBe('需要准备');
    expect(result.subScores.annualCapital).toBe(0);
    expect(result.subScores.weeklyTime).toBe(0);
    expect(result.subScores.expectedReturn).toBe(60);
    expect(result.subScores.investmentAmount).toBe(0);
    expect(result.subScores.industryExperience).toBe(0);
    expect(result.subScores.debtPressure).toBe(50);
    expect(result.subScores.handsOffPreference).toBe(20);
    expect(result.subScores.setupAversion).toBe(10);
    expect(result.subScores.targetIndustryFit).toBe(0);
  });

  it('detects wishing type when expectedReturn > 500', () => {
    const result = calculateScore({ ...STRONG_PROFILE, expectedReturn: 600 });
    expect(result.isWishingType).toBe(true);
    expect(result.tier).toBe('需要准备');
    expect(result.subScores.expectedReturn).toBe(0);
  });

  it('industryExperience step function - boundary at 3 years', () => {
    const at3 = calculateScore({ ...STRONG_PROFILE, industryExperience: 3 });
    const at2 = calculateScore({ ...STRONG_PROFILE, industryExperience: 2 });
    expect(at3.subScores.industryExperience).toBe(60);
    expect(at2.subScores.industryExperience).toBe(40);
  });

  it('targetIndustry score changes based on industry match', () => {
    // Heavy asset with low capital
    const heavyLow = calculateScore({ ...STRONG_PROFILE, targetIndustry: '线下餐饮店', annualCapital: 2, investmentAmount: 2 });
    expect(heavyLow.subScores.targetIndustryFit).toBe(-50);

    // Heavy asset with med capital
    const heavyMed = calculateScore({ ...STRONG_PROFILE, targetIndustry: '实体店', annualCapital: 4, investmentAmount: 4 });
    expect(heavyMed.subScores.targetIndustryFit).toBe(-20);

    // Heavy asset with sufficient capital
    const heavyHigh = calculateScore({ ...STRONG_PROFILE, targetIndustry: '餐饮', annualCapital: 15, investmentAmount: 20 });
    expect(heavyHigh.subScores.targetIndustryFit).toBe(20);

    // Light asset
    const lightAsset = calculateScore({ ...STRONG_PROFILE, targetIndustry: '电商平台', annualCapital: 1, investmentAmount: 1 });
    expect(lightAsset.subScores.targetIndustryFit).toBe(20);
  });
});

describe('computeSubScores', () => {
  it('matches calculateScore.subScores for same input', () => {
    const subScores = computeSubScores(STRONG_PROFILE);
    const result = calculateScore(STRONG_PROFILE);
    expect(subScores).toEqual(result.subScores);
  });
});
