import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AssessmentChat } from '@/components/chat/AssessmentChat';
import { NavHeader } from '@/components/ui/NavHeader';
import { FunnelProgressBar } from '@/components/ui/FunnelProgressBar';
import { BottomNav } from '@/components/ui/BottomNav';

export default async function AssessmentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // If user already has a completed assessment, show results
  const { data: completed } = await supabase
    .from('assessments')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .limit(1)
    .maybeSingle();

  if (completed) {
    redirect('/result');
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-bg">
      <NavHeader userEmail={user.email} />
      <FunnelProgressBar currentStep={1} />
      <AssessmentChat />
      <BottomNav />
    </div>
  );
}
