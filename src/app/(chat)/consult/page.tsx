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
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-[960px] mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-xl font-bold text-gray-900">人工咨询服务</h1>
          <p className="text-sm text-gray-500 mt-2">
            根据您的创业评估结果，我们为您推荐以下咨询方案
          </p>
        </header>

        <ConsultClient plans={PLANS} />

        <footer className="text-center mt-8">
          <p className="text-sm text-gray-400">
            所有咨询服务均通过线上进行。支付完成后，专员将在24小时内与您联系。
          </p>
        </footer>
      </div>
    </main>
  );
}
