import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AssessmentChat } from '@/components/chat/AssessmentChat';
import { NavHeader } from '@/components/ui/NavHeader';
import { FunnelProgressBar } from '@/components/ui/FunnelProgressBar';

export const runtime = 'edge'

export default async function AssessmentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-bg">
      <NavHeader userEmail={user.email} />
      <FunnelProgressBar currentStep={1} />
      <AssessmentChat />
    </div>
  );
}
