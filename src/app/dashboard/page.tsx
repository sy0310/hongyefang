import { createClient } from '@/lib/supabase/server'
import { NavHeader } from '@/components/ui/NavHeader'
import { BottomNav } from '@/components/ui/BottomNav'
import Link from 'next/link'

export const runtime = 'edge'

const FUNNEL_STEPS = [
  { label: 'AI 体检', desc: '智能收集画像', status: 'active', step: 1, href: '/assessment' },
  { label: '付费咨询', desc: '精准匹配顾问', status: 'available', step: 2, href: '/consult' },
  { label: 'DIY 交付', desc: '标准资料包', status: 'locked', step: 3, href: '#' },
  { label: '全权托管', desc: '深度介入', status: 'locked', step: 4, href: '#' },
  { label: '代运营', desc: '规模化扩张', status: 'locked', step: 5, href: '#' },
]

const STATS = [
  { label: '体检次数', value: '1', icon: '📋' },
  { label: '综合评分', value: '—', icon: '⭐' },
  { label: '评估等级', value: '待评估', icon: '🎯' },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex-1 flex flex-col bg-bg overflow-y-auto pb-16">
      <NavHeader userEmail={user?.email} />

      <div className="flex-1 p-7 flex flex-col gap-5">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-text" style={{ letterSpacing: '-0.3px' }}>欢迎回来 👋</h1>
            <p className="text-[14px] text-text-3 mt-1">{user?.email || 'user@example.com'}</p>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold border" style={{ background: 'var(--accent-light)', color: 'var(--accent-text)', borderColor: 'oklch(88% 0.07 32)' }}>
            MVP 体验版
          </span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          {STATS.map((s) => (
            <div key={s.label} className="bg-surface rounded-[var(--radius)] border border-border-light shadow-sm p-4">
              <div className="text-[22px] mb-2">{s.icon}</div>
              <div className="text-[20px] font-bold text-text" style={{ fontFamily: 'var(--font-display)' }}>{s.value}</div>
              <div className="text-[12px] text-text-3 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Main CTA card */}
        <div
          className="rounded-[var(--radius)] p-7 border"
          style={{
            background: 'linear-gradient(135deg, var(--accent-light) 0%, oklch(97% 0.035 60) 100%)',
            borderColor: 'oklch(88% 0.07 32)',
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-[17px] font-bold text-text mb-2">AI 创业体检</h2>
              <p className="text-[13px] text-text-2 leading-relaxed mb-5" style={{ maxWidth: 280 }}>
                通过 AI 对话收集您的资金状况、时间投入、预期回报，生成精准创业适配评估报告。
              </p>
              <Link
                href="/assessment"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-[var(--radius-sm)] bg-accent text-white text-[14px] font-medium hover:opacity-90 transition-opacity"
                style={{ boxShadow: '0 2px 8px oklch(52% 0.19 32 / 0.28)' }}
              >
                开始体检
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--accent-light)', border: '2px solid oklch(85% 0.1 32)' }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                <path d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V9l-6-6z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 3v6h6M9 13h6M9 17h4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Service funnel */}
        <div className="bg-surface rounded-[var(--radius)] border border-border-light shadow-sm p-6">
          <h3 className="text-[15px] font-semibold text-text mb-4">服务漏斗</h3>
          <div className="flex flex-col gap-2">
            {FUNNEL_STEPS.map((item) => {
              const isActive = item.status === 'active'
              const isAvailable = item.status === 'available'
              const isLocked = item.status === 'locked'

              return (
                <div
                  key={item.step}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-[var(--radius-sm)]"
                  style={{
                    background: isActive
                      ? 'var(--accent-light)'
                      : isAvailable
                      ? 'var(--green-light)'
                      : 'var(--surface-2)',
                    border: `1px solid ${isActive ? 'oklch(88% 0.07 32)' : isAvailable ? 'oklch(88% 0.07 158)' : 'var(--border-light)'}`,
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isActive
                        ? 'var(--accent)'
                        : isAvailable
                        ? 'var(--green)'
                        : 'var(--border)',
                    }}
                  >
                    <span
                      className="text-[12px] font-bold"
                      style={{ color: isLocked ? 'var(--text-3)' : '#fff' }}
                    >
                      {item.step}
                    </span>
                  </div>
                  <div className="flex-1">
                    <span
                      className="text-[13px] font-semibold"
                      style={{ color: isLocked ? 'var(--text-3)' : 'var(--text)' }}
                    >
                      {item.label}
                    </span>
                    <span className="text-[12px] text-text-3 ml-2">{item.desc}</span>
                  </div>
                  {isLocked && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-3)' }}>
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" />
                    </svg>
                  )}
                  {isActive && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold border" style={{ background: 'var(--accent-light)', color: 'var(--accent-text)', borderColor: 'oklch(88% 0.07 32)' }}>
                      进行中
                    </span>
                  )}
                  {isAvailable && (
                    <Link
                      href={item.href}
                      className="text-[12px] font-semibold hover:underline"
                      style={{ color: 'var(--green-text)' }}
                    >
                      查看 →
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
