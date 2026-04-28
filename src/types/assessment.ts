export type ParameterKey = 'annualCapital' | 'weeklyTime' | 'expectedReturn' | 'investmentAmount';

export type AssessmentStatus = 'in_progress' | 'completed';

export interface Assessment {
  id: string;
  userId: string;
  annualCapital: number | null;
  weeklyTime: number | null;
  expectedReturn: number | null;
  investmentAmount: number | null;
  status: AssessmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  assessmentId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export const PARAMETER_LABELS: Record<ParameterKey, string> = {
  annualCapital: '年度弹性资金',
  weeklyTime: '每周投入时间',
  expectedReturn: '预期年化回报',
  investmentAmount: '投入金额',
};

export const PARAMETER_UNITS: Record<ParameterKey, string> = {
  annualCapital: '万元',
  weeklyTime: '小时',
  expectedReturn: '%',
  investmentAmount: '万元',
};
