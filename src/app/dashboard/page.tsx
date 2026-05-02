import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/(auth)/login/actions'
import { AssessmentEntryButton } from '@/components/dashboard/AssessmentEntryButton'
import { BottomNav } from '@/components/ui/BottomNav'
import { LogOut, User as UserIcon, Settings, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export const runtime = 'edge'

const FUNNEL_STEPS = [
  { id: '01', title: 'AI 创业体检', desc: '全方位评估项目可行性', status: 'ready', href: '/assessment' },
  { id: '02', title: '深度咨询方案', desc: '1对1 专家诊断与方案匹配', status: 'locked', href: '/consult' },
  { id: '03', title: '资源精准对接', desc: '行业上下游核心资源导入', status: 'locked', href: '#' },
  { id: '04', title: '关键指标调优', desc: '运营模型与转化率深度优化', status: 'locked', href: '#' },
  { id: '05', title: '代运营/陪跑', desc: '全流程托管，加速项目落地', status: 'locked', href: '#' },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex-1 pb-24 bg-gray-50">
      {/* Top Header */}
      <header className="px-6 pt-12 pb-8 bg-white border-b border-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="text-primary w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted uppercase tracking-widest">Welcome Back</p>
              <h2 className="text-sm font-black text-foreground uppercase tracking-tight">{user?.email?.split('@')[0] || 'User'}</h2>
            </div>
          </div>
          <form action={logout}>
            <button className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors">
              <LogOut size={16} />
            </button>
          </form>
        </div>
        
        <div className="bg-primary p-6 rounded-3xl text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <h1 className="text-2xl font-black mb-2 relative z-10 leading-tight">精准筛选<br/>优质创业项目</h1>
          <p className="text-[11px] font-bold text-white/70 uppercase tracking-[0.2em] relative z-10">AI-Powered Optimization</p>
        </div>
      </header>

      {/* Service Funnel Section */}
      <section className="px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">服务漏斗 (Service Funnel)</h3>
          <Settings size={14} className="text-muted" />
        </div>

        <div className="space-y-4">
          {FUNNEL_STEPS.map((step) => (
            <Link 
              key={step.id} 
              href={step.href}
              className={`block bg-white rounded-2xl p-5 border transition-all active:scale-[0.98] ${
                step.status === 'ready' 
                  ? 'border-primary shadow-lg shadow-primary/5' 
                  : 'border-border opacity-60 grayscale cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className={`text-xl font-black ${step.status === 'ready' ? 'text-primary' : 'text-muted'}`}>
                    {step.id}
                  </span>
                  <div>
                    <h4 className="text-[15px] font-black text-foreground mb-0.5">{step.title}</h4>
                    <p className="text-[11px] text-muted font-medium italic">{step.desc}</p>
                  </div>
                </div>
                {step.status === 'ready' && <ChevronRight className="text-primary" size={18} />}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <BottomNav />
    </div>
  )
}
