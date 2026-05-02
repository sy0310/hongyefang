import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ScoreBanner } from '@/components/result/ScoreBanner';
import { DimensionCard } from '@/components/result/DimensionCard';
import { ResultCTA } from '@/components/result/ResultCTA';
import { computeSubScores } from '@/lib/scoring/engine';

export const runtime = 'edge'

const DIMENSION_CONFIG = [
  { label: '弹性资金', dbField: 'annual_capital', maxScore: 400, goodTag: '充裕', moderateTag: '良好', lowTag: '偏低', veryLowTag: '不足' },
  { label: '投入金额', dbField: 'investment_amount', maxScore: 300, goodTag: '充足', moderateTag: '适中', lowTag: '偏低', veryLowTag: '不足' },
  { label: '投入时间', dbField: 'weekly_time', maxScore: 200, goodTag: '充分', moderateTag: '中等', lowTag: '有限', veryLowTag: '很少' },
  { label: '预期回报', dbField: 'expected_return', maxScore: 100, goodTag: '合理', moderateTag: '偏高', lowTag: '过高', veryLowTag: '极高' },
];

const FIELD_TO_SUBSCORE_KEY: Record<string, string> = {
  annual_capital: 'annualCapital',
  investment_amount: 'investmentAmount',
  weekly_time: 'weeklyTime',
  expected_return: 'expectedReturn',
};

