import { UpdatePasswordForm } from '@/components/auth/UpdatePasswordForm'

export default function UpdatePasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-2 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text">设置新密码</h1>
          <p className="text-sm text-text-3 mt-1">请输入您的新密码</p>
        </div>
        <div className="bg-surface rounded-lg shadow-sm p-6">
          <UpdatePasswordForm />
        </div>
      </div>
    </div>
  )
}
