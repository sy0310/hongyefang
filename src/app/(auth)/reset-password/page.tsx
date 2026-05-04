import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import Link from 'next/link'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-accent tracking-tight">重置密码</h1>
          <p className="text-sm text-text/60 mt-2">输入注册邮箱，我们将发送重置链接</p>
        </div>
        <div className="bg-surface rounded-2xl shadow-sm border border-border/50 p-8">
          <ResetPasswordForm />
          <div className="mt-4 text-center">
            <Link href="/login" className="text-sm text-accent hover:underline font-medium">返回登录</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
