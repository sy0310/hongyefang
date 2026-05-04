'use client'

import { AuthTabs } from '@/components/auth/AuthTabs'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'

export default function LoginPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 bg-surface-2">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-black text-accent tracking-tighter uppercase mb-2">弘业坊</h1>
        <p className="text-xs font-bold text-text-2 uppercase tracking-[0.2em]">Hongyefang AI Engine</p>
      </header>

      <div className="w-full max-w-[400px]">
        <Card className="p-2 border-none shadow-xl bg-surface/80 backdrop-blur-xl">
          <AuthTabs />
        </Card>
      </div>

      <footer className="mt-8 text-center">
        <p className="text-[11px] text-text-2 font-bold uppercase tracking-widest leading-relaxed">
          登录即代表您同意<br/>
          <Link href="/terms" className="text-accent hover:underline">服务协议</Link> 和 <Link href="/privacy" className="text-accent hover:underline">隐私政策</Link>
        </p>
      </footer>
    </main>
  )
}
