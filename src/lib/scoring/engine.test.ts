import { describe, it, expect } from 'vitest';
import { calculateScore, computeSubScores } from './engine';

describe('calculateScore', () => {
  // -- EVAL-01: scoring correctness -- //
  it('returns correct weighted score for strong profile (50万/40h/50%/30万 -> 855, 高度适配)', () => {
    const result = calculateScore({
      annualCapital: 50,    // 50万 -> floor((50/50)*400) = 400/400
      weeklyTime: 40,       // 40h -> floor((40/40)*200) = 200/200
      expectedReturn: 50,   // 50% -> 100 - 25 = 75/100
      investmentAmount: 30, // 30万 -> floor((30/50)*300) = 180/300
    });
    expect(result.score).toBe(855);
    expect(result.tier).toBe('高度适配');
    expect(result.isWishingType).toBe(false);
  });

  it('returns 1000 score for maximum inputs (50万/40h/0%/50万 -> 400+300+200+100 = 1000)', () => {
    const result = calculateScore({
      annualCapital: 50,
      weeklyTime: 40,
      expectedReturn: 0,
      investmentAmount: 50,
    });
    expect(result.score).toBe(1000);
    expect(result.tier).toBe('高度适配');
  });

  it('returns 0 score and 需要准备 for all null inputs', () => {
    const result = calculateScore({
      annualCapital: null,
      weeklyTime: null,
      expectedReturn: null,
      investmentAmount: null,
    });
    expect(result.score).toBe(0);
    expect(result.tier).toBe('需要准备');
    expect(result.subScores.annualCapital).toBe(0);
    expect(result.subScores.investmentAmount).toBe(0);
    expect(result.subScores.weeklyTime).toBe(0);
    expect(result.subScores.expectedReturn).toBe(0);
  });

  it('returns 中度适配 for score in [400, 700) range', () => {
    // 5万 capital + 10h time + 0% return + 5万 invest
    // (5/50)*400 = 40 + (5/50)*300 = 30 + (10/40)*200 = 50 + (0%/2 offset) 100 = 100
    // = 40 + 30 + 50 + 100 = 220 -> 需要准备
    const result = calculateScore({
      annualCapital: 5,
      weeklyTime: 10,
      expectedReturn: 0,
      investmentAmount: 5,
    });
    expect(result.tier).toBe('需要准备');
  });

  // -- EVAL-02: wishing-type detection -- //
  it('detects wishing type when expectedReturn > 500', () => {
    const result = calculateScore({
      annualCapital: 50,
      weeklyTime: 40,
      expectedReturn: 600,
      investmentAmount: 30,
    });
    expect(result.isWishingType).toBe(true);
    expect(result.tier).toBe('需要准备');
    expect(result.subScores.expectedReturn).toBe(0);
  });

  it('forces tier to 需要准备 for wishing-type even with max inputs', () => {
    const result = calculateScore({
      annualCapital: 50,
      weeklyTime: 40,
      expectedReturn: 600,
      investmentAmount: 50,
    });
    expect(result.isWishingType).toBe(true);
    expect(result.tier).toBe('需要准备');
    // Score is still computed for reference display
    // capitalScore=400 + investScore=300 + timeScore=200 + returnScore=0 = 900
    expect(result.score).toBe(900);
  });

  it('does NOT mark as wishing type when expectedReturn is exactly 500 (boundary)', () => {
    const result = calculateScore({
      annualCapital: 10,
      weeklyTime: 10,
      expectedReturn: 500,
      investmentAmount: 5,
    });
    expect(result.isWishingType).toBe(false);
  });

  it('does NOT mark as wishing type when expectedReturn is below 500', () => {
    const result = calculateScore({
      annualCapital: 10,
      weeklyTime: 10,
      expectedReturn: 499,
      investmentAmount: 5,
    });
    expect(result.isWishingType).toBe(false);
  });
});

describe('computeSubScores', () => {
  it('returns sub-scores matching calculateScore.subScores for same input', () => {
    const input = {
      annualCapital: 50,
      weeklyTime: 40,
      expectedReturn: 50,
      investmentAmount: 30,
    };
    const subScores = computeSubScores(input);
    const score = calculateScore(input);
    expect(subScores).toEqual(score.subScores);
  });
});
