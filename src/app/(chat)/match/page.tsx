import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { NavHeader } from '@/components/ui/NavHeader';
import { BottomNav } from '@/components/ui/BottomNav';
import { PartnerCard } from '@/components/match/PartnerCard';
import { JoinPoolCTA } from '@/components/result/JoinPoolCTA';
import { computeSubScores } from '@/lib/scoring/engine';
import { complementarityScore, capitalLabel, timeLabel, expLabel } from '@/lib/match/algorithm';
import type { ScoringInput } from '@/types/assessment';
import { leaveMatchPool } from './actions';

interface AssessmentRow {
  score: number | null;
  tier: string | null;
  annual_capital: number | null;
  weekly_time: number | null;
  expected_return: number | null;
  investment_amount: number | null;
  industry_experience: number | null;
  monthly_debt: number | null;
}

interface CandidateRow {
  user_id: string;
  project_desc: string;
  assessments: AssessmentRow | AssessmentRow[] | null;
}

function toScoringInput(row: AssessmentRow): ScoringInput {
  return {
    annualCapital: row.annual_capital,
    weeklyTime: row.weekly_time,
    expectedReturn: row.expected_return,
    investmentAmount: row.investment_amount,
    industryExperience: row.industry_experience,
    debtPressure: row.monthly_debt,
  };
}

export default async function MatchPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get current user's latest completed assessment
  const { data: myAssessment } = await supabase
    .from('assessments')
    .select('id, score, tier, annual_capital, weekly_time, expected_return, investment_amount, industry_experience, monthly_debt')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!myAssessment) redirect('/assessment');

  const mySubScores = computeSubScores(toScoringInput(myAssessment));

  // Check pool status
  const { data: myProfile } = await supabase
    .from('partner_profiles')
    .select('id, is_active, project_desc')
    .eq('user_id', user.id)
    .maybeSingle();

  const isInPool = myProfile?.is_active === true;

  if (!isInPool) {
    return (
      <div className="flex-1 flex flex-col bg-bg overflow-y-auto pb-16">
        <NavHeader userEmail={user.email} />
        <div className="flex-1 px-5 py-8 flex flex-col gap-5">
          <div>
            <h1 className="text-[20px] font-bold text-text mb-1">合伙人匹配</h1>
            <p className="text-[13px] text-text-3">加入匹配池，系统为您推荐互补型合伙人</p>
          </div>
          <div className="bg-surface rounded-[var(--radius)] border border-border-light shadow-sm p-6">
            <JoinPoolCTA assessmentId={myAssessment.id} isInPool={false} />
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Fetch candidates: all active profiles except self, with their assessments
  const { data: rawCandidates } = await supabase
    .from('partner_profiles')
    .select(`
      user_id,
      project_desc,
      assessments!assessment_id (
        score, tier,
        annual_capital, weekly_time, expected_return,
        investment_amount, industry_experience, monthly_debt
      )
    `)
    .eq('is_active', true)
    .neq('user_id', user.id)
    .limit(50);

  // Fetch which interests the current user has already submitted
  const { data: myInterests } = await supabase
    .from('partner_interests')
    .select('to_user_id')
    .eq('from_user_id', user.id);

  const interestSet = new Set((myInterests ?? []).map((r) => r.to_user_id));

  // Compute and sort by complementarity
  const candidates = ((rawCandidates ?? []) as CandidateRow[])
    .filter((c) => {
      const a = Array.isArray(c.assessments) ? c.assessments[0] : c.assessments;
      return a !== null && a !== undefined;
    })
    .map((c) => {
      const a = (Array.isArray(c.assessments) ? c.assessments[0] : c.assessments) as AssessmentRow;
      const subScores = computeSubScores(toScoringInput(a));
      const score = complementarityScore(mySubScores, subScores);
      return { c, a, subScores, score };
    })
    .sort((x, y) => y.score - x.score)
    .slice(0, 10);

  return (
    <div className="flex-1 flex flex-col bg-bg overflow-y-auto pb-16">
      <NavHeader userEmail={user.email} />

      <div className="flex-1 px-5 py-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-text mb-1">合伙人匹配</h1>
            <p className="text-[13px] text-text-3">按互补度排序，最多显示 10 位候选人</p>
          </div>
          <form action={leaveMatchPool}>
            <button
              type="submit"
              className="text-[12px] text-text-3 border border-border-light rounded-[var(--radius-sm)] px-3 py-1.5 bg-surface hover:bg-surface-2 transition-colors"
            >
              退出匹配池
            </button>
          </form>
        </div>

        {/* Current pool status */}
        <div
          className="rounded-[var(--radius-sm)] px-4 py-3 flex items-center gap-2"
          style={{ background: 'var(--green-light)', border: '1px solid oklch(88% 0.07 158)' }}
        >
          <span className="text-[14px]">✓</span>
          <p className="text-[13px] font-medium" style={{ color: 'var(--green-text)' }}>
            您已加入匹配池 · {myProfile.project_desc.slice(0, 40)}{myProfile.project_desc.length > 40 ? '…' : ''}
          </p>
        </div>

        {/* Candidate cards */}
        {candidates.length === 0 ? (
          <div className="bg-surface rounded-[var(--radius)] border border-border-light shadow-sm p-10 text-center">
            <div className="text-[32px] mb-3">🔍</div>
            <p className="text-[14px] font-semibold text-text mb-1">暂无匹配候选人</p>
            <p className="text-[13px] text-text-3">目前匹配池人数较少，请稍后再来查看</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {candidates.map(({ c, a, subScores, score }) => {
              const shortId = c.user_id.slice(-4).toUpperCase();
              const pct = Math.round(Math.min(score * 100, 100));
              return (
                <PartnerCard
                  key={c.user_id}
                  userId={c.user_id}
                  shortId={shortId}
                  tier={a.tier ?? '需要准备'}
                  capitalLabel={capitalLabel(subScores.annualCapital)}
                  timeLabel={timeLabel(subScores.weeklyTime)}
                  expLabel={expLabel(subScores.industryExperience)}
                  projectDesc={c.project_desc}
                  hasInterest={interestSet.has(c.user_id)}
                  complementarityPct={pct}
                />
              );
            })}
          </div>
        )}

        {/* Back link */}
        <Link
          href="/result"
          className="text-center text-[13px] text-text-3 hover:text-text transition-colors py-2"
        >
          ← 返回评估结果
        </Link>
      </div>

      <BottomNav />
    </div>
  );
}
