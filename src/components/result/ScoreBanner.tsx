'use client';

interface ScoreBannerProps {
  score: number;
  tier: '高度适配' | '中度适配' | '需要准备';
  isWishingType: boolean;
}

const TIER_BADGE_STYLES: Record<string, string> = {
  '高度适配': 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  '中度适配': 'bg-primary/10 border-primary/20 text-primary',
  '需要准备': 'bg-foreground/5 border-foreground/10 text-foreground/60',
};

const SUBTITLES: Record<string, string> = {
  '高度适配': '您的各项条件与创业要求高度匹配，建议尽快与顾问深入交流。',
  '中度适配': '您已具备一定的创业基础，顾问可帮助您找到最佳切入点。',
  '需要准备': '当前阶段还有一些准备工作，打好基础会让创业之路更顺畅。',
};

export function ScoreBanner({ score, tier, isWishingType }: ScoreBannerProps) {
  const subtitle = isWishingType
    ? '创业热情是好事，当前阶段建议先做好准备，时机成熟后再出发。'
    : SUBTITLES[tier];

  return (
    <section className="bg-card rounded-2xl border border-border/50 shadow-sm p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
      <p className="text-sm font-bold text-foreground/40 mb-3 uppercase tracking-wider">您的创业适配评分</p>
      <div className="flex items-center gap-4">
        <span
          className="text-6xl font-black text-primary"
          aria-label={`综合评分 ${score} 分`}
        >
          {score}
        </span>
        <span
          role="status"
          className={`text-xs font-bold px-3 py-1 rounded-lg border uppercase tracking-wide ${TIER_BADGE_STYLES[tier]}`}
        >
          {tier}
        </span>
      </div>
      {isWishingType && (
        <p className="text-xs font-medium text-primary/60 mt-2 italic">
          （参考分数，综合适配等级以标签为准）
        </p>
      )}
      <p className="text-base font-medium text-foreground/80 mt-4 leading-relaxed max-w-md">{subtitle}</p>
    </section>
  );
}
