import React from 'react'

const STEPS = ['AI 体检', '评估结果', '咨询套餐', '支付完成']

interface FunnelProgressBarProps {
  currentStep: 1 | 2 | 3 | 4
}

export function FunnelProgressBar({ currentStep }: FunnelProgressBarProps) {
  return (
    <div className="flex items-center px-6 py-3 bg-surface border-b border-border-light flex-shrink-0">
      {STEPS.map((label, i) => {
        const stepNum = i + 1
        const done = stepNum < currentStep
        const active = stepNum === currentStep

        return (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0"
                style={{
                  background: done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--surface-2)',
                  border: `2px solid ${done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span
                    className="text-[11px] font-bold"
                    style={{ color: active ? '#fff' : 'var(--text-3)' }}
                  >
                    {stepNum}
                  </span>
                )}
              </div>
              <span
                className="text-[11px] whitespace-nowrap"
                style={{
                  color: done ? 'var(--green-text)' : active ? 'var(--accent-text)' : 'var(--text-3)',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="flex-1 h-0.5 mb-3.5 transition-all duration-300"
                style={{ background: done ? 'var(--green)' : 'var(--border-light)' }}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
