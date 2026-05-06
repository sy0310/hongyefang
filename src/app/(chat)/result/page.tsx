import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ScoreBanner } from '@/components/result/ScoreBanner';
import { DimensionCard } from '@/components/result/DimensionCard';
import { ResultCTA } from '@/components/result/ResultCTA';
import { JoinPoolCTA } from '@/components/result/JoinPoolCTA';
import { computeSubScores } from '@/lib/scoring/engine';
import { NavHeader } from '@/components/ui/NavHeader';
import { FunnelProgressBar } from '@/components/ui/FunnelProgressBar';
import { BottomNav } from '@/components/ui/BottomNav';

const DIMENSION_CONFIG = [
  { label: '弹性资金', dbField: 'annual_capital', maxScore: 250, goodTag: '充裕', moderateTag: '良好', lowTag: '偏低', veryLowTag: '不足' },
  { label: '投入时间', dbField: 'weekly_time', maxScore: 250, goodTag: '充分', moderateTag: '中等', lowTag: '有限', veryLowTag: '很少' },
  { label: '行业经验', dbField: 'industry_experience', maxScore: 200, goodTag: '资深', moderateTag: '一般', lowTag: '较少', veryLowTag: '无' },
  { label: '投入金额', dbField: 'investment_amount', maxScore: 150, goodTag: '充足', moderateTag: '适中', lowTag: '偏低', veryLowTag: '不足' },
  { label: '预期回报', dbField: 'expected_return', maxScore: 100, goodTag: '合理', moderateTag: '偏高', lowTag: '过高', veryLowTag: '极高' },
  { label: '债务压力', dbField: 'monthly_debt', maxScore: 50, goodTag: '无压力', moderateTag: '适中', lowTag: '较重', veryLowTag: '沉重' },
];

const FIELD_TO_SUBSCORE_KEY: Record<string, string> = {
  annual_capital: 'annualCapital',
  investment_amount: 'investmentAmount',
  weekly_time: 'weeklyTime',
  expected_return: 'expectedReturn',
  industry_experience: 'industryExperience',
  monthly_debt: 'debtPressure',
};

export default async function ResultPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: assessment } = await supabase
    .from('assessments')
    .select('id, score, tier, is_wishing_type, ai_narrative, annual_capital, weekly_time, expected_return, investment_amount, industry_experience, monthly_debt')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!assessment || !assessment.score || !assessment.tier) {
    redirect('/dashboard');
  }

  const { data: poolProfile } = await supabase
    .from('partner_profiles')
    .select('id, is_active')
    .eq('user_id', user.id)
    .maybeSingle();

  const isInPool = poolProfile?.is_active === true;

  const subScores = computeSubScores({
    annualCapital: assessment.annual_capital,
    weeklyTime: assessment.weekly_time,
    expectedReturn: assessment.expected_return,
    investmentAmount: assessment.investment_amount,
    industryExperience: assessment.industry_experience,
    debtPressure: assessment.monthly_debt,
  });

  return (
    <div className="flex-1 flex flex-col bg-bg overflow-y-auto pb-16">
      <NavHeader userEmail={user.email} />
      <FunnelProgressBar currentStep={2} />

      <div className="flex-1 px-5 py-6 flex flex-col gap-4">
        <ScoreBanner
          score={assessment.score}
          tier={assessment.tier}
          isWishingType={assessment.is_wishing_type ?? false}
        />

        <section className="bg-surface rounded-[var(--radius)] border border-border-light shadow-sm p-6">
          <h3 className="text-[15px] font-bold text-text mb-5">维度详情</h3>
          <div className="space-y-4">
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

        <section className="bg-surface rounded-[var(--radius)] border border-border-light shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[14px] font-semibold text-text">AI 顾问分析</span>
          </div>
          {assessment.ai_narrative && (
            <p className="text-[14px] text-text-2 leading-[1.8] whitespace-pre-line mb-6">
              {assessment.ai_narrative}
            </p>
          )}
          <ResultCTA isWishingType={assessment.is_wishing_type ?? false} tier={assessment.tier} />
        </section>

        <section className="bg-surface rounded-[var(--radius)] border border-border-light shadow-sm p-6">
          <h3 className="text-[15px] font-bold text-text mb-4">合伙人匹配</h3>
          <JoinPoolCTA assessmentId={assessment.id} isInPool={isInPool} />
        </section>
      </div>
      <BottomNav />
    </div>
  );
}
