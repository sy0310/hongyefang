import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ScoreBanner } from '@/components/result/ScoreBanner';
import { DimensionCard } from '@/components/result/DimensionCard';
import { ResultCTA } from '@/components/result/ResultCTA';
import { computeSubScores } from '@/lib/scoring/engine';
import { BottomNav } from '@/components/ui/BottomNav';

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
    <div className="flex-1 pb-24 bg-gray-50">
      <header className="px-6 pt-12 pb-6">
        <h1 className="text-xs font-black text-muted uppercase tracking-[0.2em] mb-1">评估报告 (Assessment Report)</h1>
        <h2 className="text-2xl font-black text-foreground">体检结果详情</h2>
      </header>

      <div className="px-6 space-y-6">
        <ScoreBanner
          score={assessment.score}
          tier={assessment.tier}
          isWishingType={assessment.is_wishing_type ?? false}
        />

        <section className="bg-white rounded-3xl border border-border p-8 shadow-sm">
          <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em] mb-8">画像维度 (Dimensions)</h3>
          <div className="space-y-2">
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
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-border p-8 shadow-sm">
          <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em] mb-6">AI 综合评述 (Narrative)</h3>
          {assessment.ai_narrative && (
            <p className="text-[13px] font-bold text-foreground/70 leading-relaxed italic mb-10 pb-6 border-b border-gray-50">
              “{assessment.ai_narrative}”
            </p>
          )}
          <ResultCTA isWishingType={assessment.is_wishing_type ?? false} tier={assessment.tier} />
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
