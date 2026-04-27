import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import Link from 'next/link'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">重置密码</h1>
          <p className="text-sm text-gray-500 mt-1">输入注册邮箱，我们将发送重置链接</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <ResetPasswordForm />
          <div className="mt-4 text-center">
            <Link href="/login" className="text-sm text-blue-600 hover:underline">返回登录</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
