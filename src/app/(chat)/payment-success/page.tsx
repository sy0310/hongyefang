import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { QrCode } from 'lucide-react'
import { NavHeader } from '@/components/ui/NavHeader';
import { FunnelProgressBar } from '@/components/ui/FunnelProgressBar';
import { BottomNav } from '@/components/ui/BottomNav';

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
    <div className="flex-1 flex flex-col bg-bg overflow-y-auto pb-16">
      <NavHeader userEmail={user.email} />
      <FunnelProgressBar currentStep={4} />

      <div className="flex-1 px-5 py-8">
        <div className="max-w-[440px] mx-auto">
          <div className="bg-surface rounded-[var(--radius-lg)] border border-border-light shadow-sm p-9 text-center">
            {/* Success icon */}
            <div
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: 'var(--green-light)', border: '3px solid var(--green)' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h1 className="text-[22px] font-bold text-text mb-2">支付成功</h1>
            <p className="text-[14px] mb-7" style={{ color: 'var(--text-3)' }}>您的咨询套餐已购买成功</p>

            {/* Order details */}
            <div
              className="rounded-[var(--radius-sm)] p-[18px] text-left mb-7 flex flex-col gap-3"
              style={{ background: 'var(--surface-2)' }}
            >
              {[
                { label: '套餐', value: order.plan_name },
                { label: '金额', value: formattedAmount, large: true },
                { label: '订单号', value: shortOrderId, mono: true },
              ].map((row, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center"
                  style={i < 2 ? { borderBottom: '1px solid var(--border)', paddingBottom: 12 } : {}}
                >
                  <span className="text-[13px]" style={{ color: 'var(--text-3)' }}>{row.label}</span>
                  <span
                    className={row.mono ? 'font-mono' : ''}
                    style={{
                      fontSize: row.large ? 18 : 14,
                      fontWeight: row.large ? 700 : 600,
                      fontFamily: row.large ? 'var(--font-display)' : 'inherit',
                      color: 'var(--text)',
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Next steps */}
            <div
              className="rounded-[var(--radius)] p-5 mb-6 text-left"
              style={{ background: 'var(--accent-light)', border: '1px solid oklch(88% 0.07 32)' }}
            >
              <h2 className="text-[15px] font-bold text-text mb-1.5">我们将在24小时内联系您</h2>
              <p className="text-[13px] text-text-2 leading-relaxed">专员将通过您注册时使用的联系方式与您对接，请保持通讯畅通。</p>
            </div>

            {/* QR placeholder */}
            <div className="mb-6">
              <div
                className="w-[120px] h-[120px] mx-auto mb-2 rounded-xl flex flex-col items-center justify-center gap-1"
                style={{ background: 'var(--surface-2)', border: '1px dashed var(--border)' }}
              >
                <QrCode className="w-8 h-8" style={{ color: 'var(--text-3)' }} strokeWidth={1.5} />
                <span className="text-[10px] font-mono" style={{ color: 'var(--text-3)' }}>微信二维码</span>
              </div>
              <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>扫码添加专属顾问微信</p>
            </div>

            <Link href="/dashboard" className="block">
              <Button variant="primary" className="py-4 text-sm font-semibold">
                返回首页
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
