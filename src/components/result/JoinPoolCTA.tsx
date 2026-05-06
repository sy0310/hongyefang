'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { joinMatchPool, leaveMatchPool } from '@/app/(chat)/match/actions';

interface JoinPoolCTAProps {
  assessmentId: string;
  isInPool: boolean;
}

export function JoinPoolCTA({ assessmentId, isInPool: initialIsInPool }: JoinPoolCTAProps) {
  const [isInPool, setIsInPool] = useState(initialIsInPool);
  const [projectDesc, setProjectDesc] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleJoin() {
    setError('');
    if (projectDesc.trim().length < 10) {
      setError('请至少输入 10 个字描述您的项目');
      return;
    }
    startTransition(async () => {
      try {
        await joinMatchPool({ assessmentId, projectDesc: projectDesc.trim() });
        setIsInPool(true);
      } catch {
        setError('加入失败，请稍后重试');
      }
    });
  }

  function handleLeave() {
    startTransition(async () => {
      try {
        await leaveMatchPool();
        setIsInPool(false);
        setProjectDesc('');
      } catch {
        setError('操作失败，请稍后重试');
      }
    });
  }

  if (isInPool) {
    return (
      <div
        className="rounded-[var(--radius)] p-5 text-center"
        style={{ background: 'var(--green-light)', border: '1px solid oklch(88% 0.07 158)' }}
      >
        <div className="text-[20px] mb-2">🤝</div>
        <h3 className="text-[14px] font-bold text-text mb-1">您已加入合伙人匹配池</h3>
        <p className="text-[12px] text-text-2 mb-4">系统将根据您的评估数据为您推荐互补型合伙人</p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/match"
            className="px-5 py-2 rounded-[var(--radius-sm)] text-[13px] font-semibold text-white"
            style={{ background: 'var(--green)', boxShadow: '0 2px 8px oklch(55% 0.18 158 / 0.3)' }}
          >
            查看匹配 →
          </Link>
          <button
            onClick={handleLeave}
            disabled={isPending}
            className="px-4 py-2 rounded-[var(--radius-sm)] text-[12px] text-text-3 border border-border-light bg-surface hover:bg-surface-2 transition-colors disabled:opacity-50"
          >
            {isPending ? '处理中…' : '退出匹配池'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-[var(--radius)] p-6"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border-light)' }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--accent-light)', border: '1px solid oklch(85% 0.1 32)' }}
        >
          <span className="text-[18px]">🤝</span>
        </div>
        <div>
          <h3 className="text-[14px] font-bold text-text mb-0.5">寻找互补合伙人</h3>
          <p className="text-[12px] text-text-2 leading-relaxed">
            系统将根据您的六维评估数据，为您匹配资源互补的潜在合伙人
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-[12px] font-semibold text-text-2 mb-1.5">
            描述您想做的项目
            <span className="font-normal text-text-3 ml-1">（10–200字）</span>
          </label>
          <textarea
            value={projectDesc}
            onChange={(e) => setProjectDesc(e.target.value)}
            maxLength={200}
            rows={3}
            placeholder="例如：我想在三线城市开一家餐饮连锁，已有选址经验，资金较充裕，但缺乏运营时间…"
            className="w-full rounded-[var(--radius-sm)] border border-border px-3 py-2.5 text-[13px] text-text placeholder:text-text-3 bg-surface resize-none focus:outline-none focus:border-accent transition-colors"
          />
          <div className="flex justify-between mt-1">
            {error && <p className="text-[11px] text-red-500">{error}</p>}
            <span className="text-[11px] text-text-3 ml-auto">{projectDesc.length}/200</span>
          </div>
        </div>

        <button
          onClick={handleJoin}
          disabled={isPending}
          className="w-full py-2.5 rounded-[var(--radius-sm)] text-[13px] font-semibold text-white transition-all disabled:opacity-50"
          style={{ background: 'var(--accent)', boxShadow: '0 2px 8px oklch(52% 0.19 32 / 0.25)' }}
        >
          {isPending ? '加入中…' : '加入匹配池'}
        </button>
      </div>
    </div>
  );
}
