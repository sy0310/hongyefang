'use client';

import { useState } from 'react';
import { submitInterest } from '@/app/(chat)/match/actions';

interface PartnerCardProps {
  userId: string;
  shortId: string;
  tier: string;
  capitalLabel: string;
  timeLabel: string;
  expLabel: string;
  projectDesc: string;
  hasInterest: boolean;
  complementarityPct: number;
}

const TIER_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  '高度适配': { bg: 'var(--green-light)', color: 'var(--green-text)', border: 'oklch(88% 0.07 158)' },
  '中度适配': { bg: 'var(--accent-light)', color: 'var(--accent-text)', border: 'oklch(88% 0.07 32)' },
  '需要准备': { bg: 'var(--surface-2)', color: 'var(--text-3)', border: 'var(--border-light)' },
};

const RESOURCE_TAGS = [
  { key: 'capital', label: '资金', icon: '💰' },
  { key: 'time', label: '时间', icon: '⏰' },
  { key: 'exp', label: '经验', icon: '🧠' },
] as const;

export function PartnerCard({
  userId,
  shortId,
  tier,
  capitalLabel,
  timeLabel,
  expLabel,
  projectDesc,
  hasInterest: initialHasInterest,
  complementarityPct,
}: PartnerCardProps) {
  const [submitted, setSubmitted] = useState(initialHasInterest);
  const [loading, setLoading] = useState(false);

  const tierStyle = TIER_STYLES[tier] ?? TIER_STYLES['需要准备'];

  async function handleConnect() {
    if (submitted || loading) return;
    setLoading(true);
    try {
      await submitInterest(userId);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  const labels: Record<typeof RESOURCE_TAGS[number]['key'], string> = {
    capital: capitalLabel,
    time: timeLabel,
    exp: expLabel,
  };

  return (
    <div
      className="bg-surface rounded-[var(--radius)] border border-border-light shadow-sm p-5 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold"
            style={{ background: 'var(--accent-light)', color: 'var(--accent-text)' }}
          >
            {shortId.slice(-2).toUpperCase()}
          </div>
          <span className="text-[14px] font-semibold text-text">创业者 #{shortId}</span>
        </div>
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border"
          style={{ background: tierStyle.bg, color: tierStyle.color, borderColor: tierStyle.border }}
        >
          {tier}
        </span>
      </div>

      {/* Resource tags */}
      <div className="flex gap-2 flex-wrap">
        {RESOURCE_TAGS.map(({ key, label, icon }) => (
          <span
            key={key}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium border"
            style={{ background: 'var(--surface-2)', color: 'var(--text-2)', borderColor: 'var(--border-light)' }}
          >
            {icon} {label}：{labels[key]}
          </span>
        ))}
      </div>

      {/* Project desc */}
      <p className="text-[13px] text-text-2 leading-relaxed line-clamp-2">
        {projectDesc.length > 100 ? projectDesc.slice(0, 100) + '…' : projectDesc}
      </p>

      {/* Complementarity bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-text-3">互补度</span>
          <span className="text-[11px] font-semibold" style={{ color: 'var(--accent-text)' }}>
            {complementarityPct}%
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${complementarityPct}%`, background: 'var(--accent)' }}
          />
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleConnect}
        disabled={submitted || loading}
        className="w-full py-2.5 rounded-[var(--radius-sm)] text-[13px] font-semibold transition-all"
        style={submitted
          ? { background: 'var(--surface-2)', color: 'var(--text-3)', cursor: 'default' }
          : { background: 'var(--accent)', color: '#fff', boxShadow: '0 2px 8px oklch(52% 0.19 32 / 0.25)' }
        }
      >
        {loading ? '提交中…' : submitted ? '✓ 已申请连接' : '发起连接'}
      </button>
    </div>
  );
}
