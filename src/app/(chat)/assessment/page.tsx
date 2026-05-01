import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AssessmentChat } from '@/components/chat/AssessmentChat';

export const runtime = 'edge'

export default async function AssessmentPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <AssessmentChat />
    </main>
  );
}
