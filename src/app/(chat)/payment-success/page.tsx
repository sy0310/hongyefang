import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

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
    <main className="min-h-screen bg-gray-50 px-4 py-12" aria-label="支付成功">
      <div className="max-w-[480px] mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          {/* Green checkmark icon */}
          <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mt-6">支付成功</h1>
          <p className="text-sm font-normal text-gray-500 mt-2">
            您的咨询套餐已购买成功
          </p>

          <div className="mt-8 space-y-3 text-sm text-left border-t border-gray-100 pt-6">
            <div className="flex justify-between">
              <span className="text-gray-500">套餐</span>
              <span className="text-gray-900 font-bold">{order.plan_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">金额</span>
              <span className="text-gray-900 font-bold text-lg">{formattedAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">订单号</span>
              <span className="text-gray-900 font-mono text-sm">{shortOrderId}</span>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-lg font-bold text-gray-900">
              我们将在24小时内联系您
            </h2>
            <p className="text-sm font-normal text-gray-500 mt-2">
              专员将通过您注册时使用的联系方式与您对接
            </p>
          </div>

          {/* WeChat QR code placeholder */}
          <div className="mt-6">
            <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
              <span className="text-xs text-gray-400" aria-label="微信二维码 占位">
                微信二维码
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">扫码添加专属顾问微信</p>
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
