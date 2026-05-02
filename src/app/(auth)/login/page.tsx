'use client'

import { AuthTabs } from '@/components/auth/AuthTabs'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">弘业坊</h1>
          <p className="text-sm text-foreground/60 mt-2">AI 精准筛选优质创业项目</p>
        </div>
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-8">
          <AuthTabs />
          <div className="mt-4 text-center">
            <Link href="/reset-password" className="text-sm text-blue-600 hover:underline">忘记密码？</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
