'use client';

interface ScoreBannerProps {
  score: number;
  tier: '高度适配' | '中度适配' | '需要准备';
  isWishingType: boolean;
}

const TIER_BADGE_STYLES: Record<string, string> = {
  '高度适配': 'bg-emerald-50 border border-emerald-200 text-emerald-700',
  '中度适配': 'bg-amber-50 border border-amber-200 text-amber-700',
  '需要准备': 'bg-gray-100 border border-gray-200 text-gray-600',
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
    <section className="bg-white rounded-xl shadow-sm p-6">
      <p className="text-sm text-gray-500 mb-2">您的创业适配评分</p>
      <div className="flex items-end gap-2">
        <span
          className="text-4xl font-bold text-gray-900"
          aria-label={`综合评分 ${score} 分`}
        >
          {score}
        </span>
        <span
          role="status"
          className={`text-sm font-bold px-2 py-1 rounded-full border ${TIER_BADGE_STYLES[tier]}`}
        >
          {tier}
        </span>
      </div>
      {isWishingType && (
        <p className="text-xs text-gray-400 mt-1">
          （参考分数，综合适配等级以标签为准）
        </p>
      )}
      <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
    </section>
  );
}
