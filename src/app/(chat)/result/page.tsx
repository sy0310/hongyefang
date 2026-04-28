import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default async function ResultPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">评估完成</h1>
        <p className="text-gray-600 mb-6">
          详细结果将在后续版本展示。
        </p>
        <Link href="/dashboard">
          <Button variant="primary">返回仪表盘</Button>
        </Link>
      </div>
    </main>
  );
}
