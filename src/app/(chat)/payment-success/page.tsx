import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { CheckCircle2, ChevronRight, QrCode } from 'lucide-react'
import { BottomNav } from '@/components/ui/BottomNav'

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
    <div className="flex-1 pb-24 bg-background">
      <div className="px-6 pt-16 pb-12 text-center">
        <div className="w-20 h-20 mx-auto bg-success/10 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
          <CheckCircle2 className="w-10 h-10 text-success" strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-black text-foreground mb-2">支付成功</h1>
        <p className="text-[13px] text-muted italic">感谢您的信任，创业之旅正式开启</p>
      </div>

      <div className="px-6 space-y-6">
        <div className="bg-white rounded-3xl border border-border p-8 space-y-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">购买方案</span>
              <span className="text-sm font-black text-foreground">{order.plan_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">实付金额</span>
              <span className="text-2xl font-black text-primary tracking-tighter">{formattedAmount}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-50">
              <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">订单编号</span>
              <span className="text-[10px] font-mono text-muted uppercase">{shortOrderId}</span>
            </div>
          </div>

          <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
            <h3 className="text-xs font-black text-primary uppercase tracking-wider mb-2">专属服务承诺</h3>
            <p className="text-[11px] font-bold text-primary/70 leading-relaxed italic">
              “我们将根据您的体检画像深度定制咨询大纲。顾问将在 24 小时内通过系统消息与您对接，请保持关注。”
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-border p-8 text-center space-y-4">
          <div className="w-32 h-32 mx-auto bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-border/50 group hover:border-primary transition-colors cursor-help">
            <QrCode className="w-12 h-12 text-muted group-hover:text-primary transition-colors" strokeWidth={1.5} />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-black text-foreground uppercase tracking-widest">添加顾问微信</p>
            <p className="text-[10px] text-muted italic">扫码或长按保存图片，获取即时支持</p>
          </div>
        </div>

        <Link href="/dashboard" className="block">
          <Button variant="primary" className="py-5 text-sm font-black uppercase tracking-widest shadow-2xl shadow-primary/20 group">
            返回控制台
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>

      <BottomNav />
    </div>
  );
}
