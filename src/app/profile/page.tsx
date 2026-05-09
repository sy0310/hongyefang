import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/(auth)/login/actions';
import { BottomNav } from '@/components/ui/BottomNav';
import { User as UserIcon, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProfileClient } from '@/components/profile/ProfileClient';

export const runtime = 'edge';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex-1 pb-24 bg-bg min-h-screen">
      {/* Header */}
      <header className="px-6 pt-16 pb-8 bg-surface border-b border-border">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-4 shadow-inner border border-accent/5">
            <UserIcon className="text-accent w-10 h-10" />
          </div>
          <h1 className="text-xl font-black text-text uppercase tracking-tight mb-1">
            {user?.email?.split('@')[0] || '创业者'}
          </h1>
          <p className="text-xs text-text-3 font-bold uppercase tracking-widest">
            {user?.email}
          </p>
        </div>
      </header>

      {/* Menu List & Modals */}
      <ProfileClient />

      {/* Logout Button */}
      <div className="px-6 mt-4">
        <form action={logout}>
          <Button
            variant="outline"
            className="w-full py-4 text-red-500 border-red-100 hover:bg-red-50 hover:border-red-200 font-bold transition-all active:scale-[0.99]"
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
