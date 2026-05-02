import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/(auth)/login/actions'
import { AssessmentEntryButton } from '@/components/dashboard/AssessmentEntryButton'

export const runtime = 'edge'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">弘业坊</h1>
          <form action={logout}>
            <button type="submit" className="text-sm text-foreground/60 hover:text-foreground transition-colors">退出登录</button>
          </form>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-1">欢迎回来</h2>
          <p className="text-foreground/60 mb-6">{user?.email}</p>
          <div className="mt-4">
            <AssessmentEntryButton />
          </div>
        </div>
      </main>
    </div>
  )
}
