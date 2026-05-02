'use client';

import { ShieldCheck, AlertCircle, TrendingUp } from 'lucide-react'

interface ScoreBannerProps {
  score: number;
  tier: '高度适配' | '中度适配' | '需要准备';
  isWishingType: boolean;
}

const TIER_BADGE_STYLES: Record<string, string> = {
  '高度适配': 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600',
  '中度适配': 'bg-primary/10 border-primary/20 text-primary',
  '需要准备': 'bg-foreground/5 border-foreground/10 text-foreground/60',
};

const SUBTITLES: Record<string, string> = {
  '高度适配': '您的各项条件与创业要求高度匹配，建议尽快与顾问深入交流。',
  '中度适配': '您已具备一定的创业基础，顾问可帮助您找到最佳切入点。',
  '需要准备': '当前阶段还有一些准备工作，打好基础会让创业之路更顺畅。',
};

const TIER_ICONS: Record<string, any> = {
  '高度适配': ShieldCheck,
  '中度适配': TrendingUp,
  '需要准备': AlertCircle,
};

export function ScoreBanner({ score, tier, isWishingType }: ScoreBannerProps) {
  const subtitle = isWishingType
    ? '创业热情是好事，当前阶段建议先做好准备，时机成熟后再出发。'
    : SUBTITLES[tier];
    
  const Icon = TIER_ICONS[tier];

  return (
    <section className="bg-white rounded-3xl border border-border shadow-[0_10px_40px_rgba(0,0,0,0.02)] p-8 relative overflow-hidden text-center">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full -ml-16 -mb-16 blur-3xl" />
      
      <div className="relative z-10 space-y-6">
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 flex items-center justify-center mb-2">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="60"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-100"
              />
              <circle
                cx="64"
                cy="64"
                r="60"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={377}
                strokeDashoffset={377 - (377 * score) / 1000}
                className="text-primary transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-foreground leading-none">{score}</span>
              <span className="text-[10px] font-black text-muted uppercase tracking-widest mt-1">Score</span>
            </div>
          </div>
          
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-black uppercase tracking-wider ${TIER_BADGE_STYLES[tier]}`}>
            <Icon size={12} />
            {tier}
          </div>
        </div>

        <div className="max-w-xs mx-auto">
          <p className="text-[15px] font-bold text-foreground leading-relaxed">{subtitle}</p>
          {isWishingType && (
            <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100">
              <p className="text-[11px] font-bold text-red-600 italic">
                检测到“许愿型”倾向，系统已触发风险管控机制
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
