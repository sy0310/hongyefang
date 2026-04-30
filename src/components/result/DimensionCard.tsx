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
  if (clampedPct >= 80) {
    tag = goodTag;
  } else if (clampedPct >= 50) {
    tag = moderateTag;
  } else if (clampedPct >= 20) {
    tag = lowTag;
  } else {
    tag = veryLowTag;
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-bold text-gray-700">{label}</span>
        <span className="text-sm font-normal text-gray-500">{tag}</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={clampedPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} ${clampedPct}%`}
        className="h-2 bg-gray-100 rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-blue-600 rounded-full transition-all"
          style={{ width: `${clampedPct}%` }}
        />
      </div>
    </div>
  );
}
