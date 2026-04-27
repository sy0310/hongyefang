'use client'

import { useFormStatus } from 'react-dom'
import { register } from '@/app/(auth)/login/actions'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useState, useActionState } from 'react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return <Button type="submit" loading={pending}>注册</Button>
}

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function formAction(prev: any, formData: FormData) {
    const result = await register(formData)
    if (result?.error) setError(result.error)
    else if (result?.success) setSuccess(result.message ?? '注册成功')
    return result
  }

  const [, formActionFn] = useActionState(formAction, null)

  if (success) {
    return (
      <div className="text-center space-y-4">
        <p className="text-green-600">{success}</p>
        <p className="text-sm text-gray-500">请检查邮箱并点击确认链接完成注册</p>
      </div>
    )
  }

  return (
    <form action={formActionFn} className="space-y-4">
      <Input label="邮箱" name="email" type="email" required placeholder="your@email.com" autoComplete="email" />
      <Input label="密码" name="password" type="password" required placeholder="至少6位密码" autoComplete="new-password" minLength={6} />
      <SubmitButton />
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
    </form>
  )
}
