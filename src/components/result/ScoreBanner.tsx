'use client';

interface ScoreBannerProps {
  score: number;
  tier: '高度适配' | '中度适配' | '需要准备';
  isWishingType: boolean;
}

const TIER_BADGE: Record<string, { bg: string; color: string; border: string }> = {
  '高度适配': { bg: 'var(--green-light)', color: 'var(--green-text)', border: 'oklch(85% 0.07 158)' },
  '中度适配': { bg: 'var(--amber-light)', color: 'var(--amber-text)', border: 'oklch(88% 0.07 70)' },
  '需要准备': { bg: 'var(--surface-2)', color: 'var(--text-2)', border: 'var(--border)' },
};

const SUBTITLES: Record<string, string> = {
  '高度适配': '您的各项条件与创业要求高度匹配，建议尽快与顾问深入交流。',
  '中度适配': '您已具备一定的创业基础，顾问可帮助您找到最佳切入点。',
  '需要准备': '当前阶段还有一些准备工作，打好基础会让创业之路更顺畅。',
};

export function ScoreBanner({ score, tier, isWishingType }: ScoreBannerProps) {
  const badge = TIER_BADGE[tier];
  const subtitle = isWishingType
    ? '创业热情是好事，当前阶段建议先做好准备，时机成熟后再出发。'
    : SUBTITLES[tier];
  const gaugePct = Math.min(Math.max(score / 10, 0), 100);

  return (
    <section className="bg-surface rounded-[var(--radius)] border border-border-light shadow-sm p-7">
      <p className="text-[13px] mb-2.5" style={{ color: 'var(--text-3)' }}>您的创业适配评分</p>

      {/* Score + badge row */}
      <div className="flex items-center gap-3 mb-3">
        <span
          className="font-bold leading-none"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 52,
            color: 'var(--text)',
            letterSpacing: '-2px',
          }}
        >
          {score}
        </span>
        <div className="flex flex-col gap-1.5">
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold border whitespace-nowrap"
            style={{ background: badge.bg, color: badge.color, borderColor: badge.border }}
          >
            {tier}
          </span>
          <span className="text-[12px]" style={{ color: 'var(--text-3)' }}>满分 1000</span>
        </div>
      </div>

      {/* Gauge bar */}
      <div className="relative h-2 rounded-full overflow-hidden mb-1.5" style={{ background: 'var(--surface-2)' }}>
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-[width] duration-1000 ease-out"
          style={{
            width: `${gaugePct}%`,
            background: 'linear-gradient(90deg, var(--green) 0%, var(--amber) 100%)',
          }}
        />
      </div>
      <div className="flex justify-between mb-5">
        <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>0 需要准备</span>
        <span className="text-[11px]" style={{ color: 'var(--amber-text)' }}>500 中度适配</span>
        <span className="text-[11px]" style={{ color: 'var(--green-text)' }}>800+ 高度适配</span>
      </div>

      {/* Subtitle */}
      <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-2)' }}>{subtitle}</p>

      {isWishingType && (
        <div
          className="mt-4 p-3 rounded-xl border"
          style={{ background: 'oklch(97% 0.03 20)', borderColor: 'oklch(90% 0.06 20)' }}
        >
          <p className="text-[12px] font-medium" style={{ color: 'oklch(45% 0.18 20)' }}>
            检测到"许愿型"倾向，系统已触发风险管控机制
          </p>
        </div>
      )}
    </section>
  );
}
