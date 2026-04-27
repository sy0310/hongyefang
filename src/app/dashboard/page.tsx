import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/(auth)/login/actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">红叶坊</h1>
          <form action={logout}>
            <button type="submit" className="text-sm text-gray-600 hover:text-gray-800">退出登录</button>
          </form>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium mb-2">欢迎，{user?.email}</h2>
          <p className="text-sm text-gray-500">AI 创业体检功能即将上线，敬请期待。</p>
        </div>
      </main>
    </div>
  )
}
