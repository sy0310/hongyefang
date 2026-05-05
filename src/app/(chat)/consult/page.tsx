import { ConsultClient } from './ConsultClient';
import { NavHeader } from '@/components/ui/NavHeader';
import { FunnelProgressBar } from '@/components/ui/FunnelProgressBar';
import { BottomNav } from '@/components/ui/BottomNav';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

const PLANS = [
  {
    name: '标准版',
    price: 2999,
    description: '基础诊断 — 适合初步验证方向',
    features: [
      '1次深度沟通（60分钟）',
      'AI评估报告详细解读',
      '创业方向可行性分析',
      '个性化建议文档',
    ],
    isRecommended: false,
  },
  {
    name: '专业版',
    price: 6999,
    description: '深度方案 — 适合有明确方向者',
    features: [
      '3次深度沟通（每次60分钟）',
      '包含标准版所有内容',
      '商业计划框架梳理',
      '行业竞争分析',
      '资源配置优化建议',
    ],
    isRecommended: true,
  },
  {
    name: '旗舰版',
    price: 14999,
    description: '全程陪跑 — 适合需要全面辅导者',
    features: [
      '8次深度沟通（每次60分钟）',
      '包含专业版所有内容',
      '全流程落地指导',
      '关键决策咨询',
      '专属顾问一对一',
    ],
    isRecommended: false,
  },
];

export default async function ConsultPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="flex-1 flex flex-col bg-bg overflow-y-auto pb-16">
      <NavHeader userEmail={user.email} />
      <FunnelProgressBar currentStep={3} />

      <div className="flex-1 px-5 py-6">
        <div className="text-center mb-7">
          <h1 className="text-[22px] font-bold text-text" style={{ letterSpacing: '-0.3px' }}>人工咨询服务</h1>
          <p className="text-[14px] mt-2" style={{ color: 'var(--text-3)' }}>根据您的创业评估结果，为您推荐以下方案</p>
        </div>

        <ConsultClient plans={PLANS} />

        <p className="text-[13px] text-center mt-6" style={{ color: 'var(--text-3)' }}>
          所有咨询均通过线上进行。支付完成后，专员将在24小时内联系您。
        </p>
      </div>
      <BottomNav />
    </div>
  );
}
