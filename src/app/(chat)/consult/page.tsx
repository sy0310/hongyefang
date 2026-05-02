import { ConsultClient } from './ConsultClient';

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
    <main className="min-h-screen bg-background px-4 py-16">
      <div className="max-w-[1000px] mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-black text-foreground mb-4">人工咨询服务</h1>
          <p className="text-lg font-medium text-foreground/60 max-w-2xl mx-auto leading-relaxed">
            根据您的创业评估结果，我们为您精选了以下咨询方案，助您更稳健地开启创业之旅。
          </p>
        </header>

        <ConsultClient plans={PLANS} />

        <footer className="text-center mt-16 border-t border-border/50 pt-8">
          <p className="text-sm font-medium text-foreground/40 italic">
            所有咨询服务均通过线上进行。支付完成后，我们的专业顾问将在 24 小时内与您取得联系。
          </p>
        </footer>
      </div>
    </main>
  );
}
