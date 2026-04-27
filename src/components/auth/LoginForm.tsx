'use client'

import { useFormStatus } from 'react-dom'
import { login } from '@/app/(auth)/login/actions'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useState, useActionState } from 'react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return <Button type="submit" loading={pending}>登录</Button>
}

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)

  async function formAction(prev: any, formData: FormData) {
    const result = await login(formData)
    if (result?.error) setError(result.error)
    return result
  }

  const [, formActionFn] = useActionState(formAction, null)

  return (
    <form action={formActionFn} className="space-y-4">
      <Input label="邮箱" name="email" type="email" required placeholder="your@email.com" autoComplete="email" />
      <Input label="密码" name="password" type="password" required placeholder="输入密码" autoComplete="current-password" minLength={6} />
      <SubmitButton />
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
    </form>
  )
}
