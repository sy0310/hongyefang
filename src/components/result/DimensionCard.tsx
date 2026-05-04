'use client';

interface DimensionCardProps {
  label: string;
  subScore: number;
  maxScore: number;
  goodTag: string;
  moderateTag: string;
  lowTag: string;
  veryLowTag: string;
}

export function DimensionCard({
  label,
  subScore,
  maxScore,
  goodTag,
  moderateTag,
  lowTag,
  veryLowTag,
}: DimensionCardProps) {
  const pct = Math.round((subScore / maxScore) * 100);
  const clampedPct = Math.min(pct, 100);

  let tag: string;
  let tagColor: string;
  if (clampedPct >= 80) {
    tag = goodTag;
    tagColor = 'text-green';
  } else if (clampedPct >= 50) {
    tag = moderateTag;
    tagColor = 'text-amber';
  } else if (clampedPct >= 20) {
    tag = lowTag;
    tagColor = 'text-accent';
  } else {
    tag = veryLowTag;
    tagColor = 'text-text-2';
  }

  return (
    <div className="mb-6 last:mb-0">
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-text uppercase tracking-tight">{label}</span>
          <span className={`text-[10px] font-black uppercase tracking-widest ${tagColor}`}>{tag}</span>
        </div>
        <span className="text-xs font-black text-text-2">{clampedPct}%</span>
      </div>
      <div
        role="progressbar"
        className="h-2 bg-surface-2 rounded-full overflow-hidden"
      >
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${
            clampedPct >= 80 ? 'bg-green' : clampedPct >= 50 ? 'bg-amber' : 'bg-accent'
          }`}
          style={{ width: `${clampedPct}%` }}
        />
      </div>
    </div>
  );
}
