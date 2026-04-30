import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ScoreBanner } from '@/components/result/ScoreBanner';
import { DimensionCard } from '@/components/result/DimensionCard';
import { ResultCTA } from '@/components/result/ResultCTA';
import { computeSubScores } from '@/lib/scoring/engine';

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

export default async function ResultPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: assessment } = await supabase
    .from('assessments')
    .select('score, tier, is_wishing_type, ai_narrative, annual_capital, weekly_time, expected_return, investment_amount')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!assessment || !assessment.score || !assessment.tier) {
    redirect('/dashboard');
  }

  const subScores = computeSubScores({
    annualCapital: assessment.annual_capital,
    weeklyTime: assessment.weekly_time,
    expectedReturn: assessment.expected_return,
    investmentAmount: assessment.investment_amount,
  });

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-[640px] mx-auto space-y-8">
        <ScoreBanner
          score={assessment.score}
          tier={assessment.tier}
          isWishingType={assessment.is_wishing_type ?? false}
        />

        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">维度详情</h2>
          {DIMENSION_CONFIG.map((dim) => {
            const subScoreKey = FIELD_TO_SUBSCORE_KEY[dim.dbField];
            const subScore = subScores[subScoreKey as keyof typeof subScores];
            return (
              <DimensionCard
                key={dim.dbField}
                label={dim.label}
                subScore={subScore}
                maxScore={dim.maxScore}
                goodTag={dim.goodTag}
                moderateTag={dim.moderateTag}
                lowTag={dim.lowTag}
                veryLowTag={dim.veryLowTag}
              />
            );
          })}
        </section>

        <section className="bg-white rounded-xl shadow-sm p-6">
          {assessment.ai_narrative && (
            <p className="text-sm font-normal text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">
              {assessment.ai_narrative}
            </p>
          )}
          <ResultCTA isWishingType={assessment.is_wishing_type ?? false} />
        </section>
      </div>
    </main>
  );
}
