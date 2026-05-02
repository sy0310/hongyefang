import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export const runtime = 'edge'

interface PaymentSuccessPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const params = await searchParams;
  const orderId = params.id;

  if (!orderId) {
    redirect('/consult');
  }

  const { data: order } = await supabase
    .from('orders')
    .select('id, plan_name, amount, created_at')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  if (!order) {
    redirect('/consult');
  }

  const formattedAmount = `¥${order.amount.toLocaleString()}`;
  const shortOrderId = order.id.slice(0, 8).toUpperCase();

  return (
    <main className="min-h-screen bg-background px-4 py-16" aria-label="支付成功">
      <div className="max-w-[480px] mx-auto">
        <div className="bg-card rounded-2xl shadow-xl border border-border/50 p-10 text-center">
          {/* Green checkmark icon */}
          <div className="w-20 h-20 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center border-4 border-emerald-500/5">
            <svg
              className="w-10 h-10 text-emerald-600 dark:text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-black text-foreground mt-8">支付成功</h1>
          <p className="text-sm font-normal text-gray-500 mt-2">
            您的咨询套餐已购买成功
          </p>

          <div className="mt-10 space-y-4 text-sm text-left border-t border-border/50 pt-8">
            <div className="flex justify-between items-center">
              <span className="font-bold text-foreground/40 uppercase tracking-widest text-xs">购买套餐</span>
              <span className="text-foreground font-black">{order.plan_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-foreground/40 uppercase tracking-widest text-xs">实付金额</span>
              <span className="text-primary font-black text-2xl tracking-tighter">{formattedAmount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-foreground/40 uppercase tracking-widest text-xs">订单编号</span>
              <span className="text-foreground/60 font-mono text-sm">{shortOrderId}</span>
            </div>
          </div>

          <div className="mt-10 bg-primary/5 rounded-2xl p-6 border border-primary/10">
            <h2 className="text-lg font-black text-primary">
              24 小时内为您对接顾问
            </h2>
            <p className="text-sm font-medium text-primary/70 mt-2">
              我们的专属顾问将根据您的评估结果进行预案准备，并主动与您取得联系。
            </p>
          </div>

          {/* WeChat QR code placeholder */}
          <div className="mt-10">
            <div className="w-36 h-36 mx-auto bg-background rounded-2xl flex items-center justify-center border-2 border-dashed border-border/50">
              <span className="text-xs font-bold text-foreground/20 uppercase tracking-widest">
                微信咨询码
              </span>
            </div>
            <p className="text-xs font-bold text-foreground/40 mt-4 uppercase tracking-widest">扫码添加专属顾问微信</p>
          </div>

          <div className="mt-8">
            <Link href="/dashboard">
              <Button variant="primary">返回首页</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
