import { ConsultClient } from './ConsultClient';
import { BottomNav } from '@/components/ui/BottomNav';
import { BackButton } from '@/components/ui/BackButton';

const PLANS = [
  {
    name: '标准版',
    price: 2999,
    description: '基础诊断 — 适合创业想法初步验证',
    features: [
      '1次深度沟通（60分钟）',
      'AI创业评估报告详细解读',
      '创业方向可行性分析',
      '个性化建议文档',
    ],
    isRecommended: false,
  },
  {
    name: '专业版',
    price: 6999,
    description: '深度方案 — 适合有明确方向的创业者',
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
    description: '全流程陪跑 — 适合需要全面辅导的创业者',
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

export default function ConsultPage() {
  return (
    <div className="flex-1 pb-24 bg-background">
      <header className="px-6 pt-12 pb-8">
        <BackButton className="mb-6" />
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
            <span className="text-primary text-[10px] font-black uppercase">Vip</span>
          </div>
          <h2 className="text-xs font-black text-primary uppercase tracking-[0.2em]">咨询服务 (Consulting)</h2>
        </div>
        <h1 className="text-3xl font-black text-foreground mb-3 leading-tight">量身定制的<br/>创业辅导方案</h1>
        <p className="text-[13px] text-muted italic leading-relaxed">
          基于您的评估结果，我们为您匹配了以下梯度服务，助您规避风险。
        </p>
      </header>

      <div className="px-6">
        <ConsultClient plans={PLANS} />
      </div>

      <footer className="px-10 py-12 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 mb-2">
          <span className="text-muted text-xs">?</span>
        </div>
        <p className="text-[11px] text-muted italic leading-relaxed">
          支付完成后，专属顾问将在 24 小时内通过系统消息与您联系。<br/>
          如有疑问，请咨询 <span className="text-foreground underline">在线客服</span>。
        </p>
      </footer>
      
      <BottomNav />
    </div>
  );
}
