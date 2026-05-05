'use client'

import { AuthTabs } from '@/components/auth/AuthTabs'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { LeafIcon } from '@/components/ui/LeafIcon'

export default function LoginPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 bg-bg overflow-y-auto">
      <div className="w-full max-w-[400px]">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <LeafIcon size={26} />
            <span
              className="text-[26px] font-bold text-accent"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}
            >
              弘业坊
            </span>
          </div>
          <p className="text-[14px] text-text-3">AI 精准识别优质创业者</p>
        </header>

        <Card className="p-7 shadow-md">
          <AuthTabs />
        </Card>

        <footer className="mt-5 text-center">
          <p className="text-[12px] text-text-3">
            注册即代表同意{' '}
            <Link href="/terms" className="text-accent hover:underline">服务条款</Link>
            {' '}与{' '}
            <Link href="/privacy" className="text-accent hover:underline">隐私政策</Link>
          </p>
        </footer>
      </div>
    </main>
  )
}
