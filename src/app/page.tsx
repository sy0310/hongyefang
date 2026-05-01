import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const runtime = 'edge'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  redirect('/login')
}
