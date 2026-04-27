'use client'

import { AuthTabs } from '@/components/auth/AuthTabs'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">红叶坊</h1>
          <p className="text-sm text-gray-500 mt-1">AI 精准筛选优质创业项目</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <AuthTabs />
          <div className="mt-4 text-center">
            <Link href="/reset-password" className="text-sm text-blue-600 hover:underline">忘记密码？</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
