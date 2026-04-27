'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export function UpdatePasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      setLoading(false)
      return
    }
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) setError(error.message)
    else { router.push('/login'); router.refresh() }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="新密码" type="password" required placeholder="至少6位密码" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} />
      <Input label="确认密码" type="password" required placeholder="再次输入新密码" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} />
      <Button type="submit" loading={loading}>更新密码</Button>
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
    </form>
  )
}
