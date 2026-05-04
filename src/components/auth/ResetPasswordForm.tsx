'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function ResetPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })
    setLoading(false)
    if (error) setError(error.message)
    else setSuccess(true)
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <p className="text-green-600">重置链接已发送到您的邮箱</p>
        <p className="text-sm text-text-3">请检查邮箱并点击链接设置新密码</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="邮箱" type="email" required placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Button type="submit" loading={loading}>发送重置链接</Button>
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
    </form>
  )
}
