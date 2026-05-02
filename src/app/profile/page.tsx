import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/(auth)/login/actions';
import { BottomNav } from '@/components/ui/BottomNav';
import { User as UserIcon, LogOut, ChevronRight, Shield, Bell, CreditCard, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const runtime = 'edge';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const menuItems = [
    { icon: CreditCard, label: '我的订单', href: '#' },
    { icon: Bell, label: '消息通知', href: '#' },
    { icon: Shield, label: '账号安全', href: '#' },
    { icon: HelpCircle, label: '帮助与反馈', href: '#' },
  ];

  return (
    <div className="flex-1 pb-24 bg-background">
      {/* Header */}
      <header className="px-6 pt-16 pb-8 bg-white border-b border-border">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 shadow-inner">
            <UserIcon className="text-primary w-10 h-10" />
          </div>
          <h1 className="text-xl font-black text-foreground uppercase tracking-tight mb-1">
            {user?.email?.split('@')[0] || '创业者'}
          </h1>
          <p className="text-xs text-muted font-bold uppercase tracking-widest">
            {user?.email}
          </p>
        </div>
      </header>

      {/* Menu List */}
      <div className="px-6 py-8 space-y-3">
        {menuItems.map((item, i) => (
          <button
            key={i}
            className="w-full flex items-center justify-between p-5 bg-white rounded-2xl border border-border transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                <item.icon size={20} className="text-foreground/70" />
              </div>
              <span className="text-[15px] font-bold text-foreground">{item.label}</span>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <div className="px-6 mt-4">
        <form action={logout}>
          <Button
            variant="outline"
            className="w-full py-4 text-red-600 border-red-100 hover:bg-red-50 hover:border-red-200 font-bold transition-colors"
          >
            <LogOut size={18} className="mr-2" />
            退出登录
          </Button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}
