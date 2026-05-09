export type ParameterKey = 'annualCapital' | 'weeklyTime' | 'expectedReturn' | 'investmentAmount' | 'industryExperience' | 'debtPressure' | 'targetIndustry' | 'handsOffPreference' | 'setupAversion';

export type AssessmentStatus = 'in_progress' | 'completed';

export interface Assessment {
  id: string;
  userId: string;
  annualCapital: number | null;
  weeklyTime: number | null;
  expectedReturn: number | null;
  investmentAmount: number | null;
  industryExperience: number | null;
  debtPressure: number | null;
  targetIndustry: string | null;
  handsOffPreference: number | null;
  setupAversion: number | null;
  status: AssessmentStatus;
  score: number | null;
  tier: Tier | null;
  isWishingType: boolean | null;
  aiNarrative: string | null;
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
  industryExperience: '行业经验',
  debtPressure: '债务压力',
  targetIndustry: '意向方向',
  handsOffPreference: '托管意愿度',
  setupAversion: '筹备抗拒度',
};

export const PARAMETER_UNITS: Record<ParameterKey, string> = {
  annualCapital: '万元',
  weeklyTime: '小时',
  expectedReturn: '%',
  investmentAmount: '万元',
  industryExperience: '年',
  debtPressure: '万元/月',
  targetIndustry: '',
  handsOffPreference: '分',
  setupAversion: '分',
};

export type Tier = '高度适配' | '中度适配' | '需要准备';

export interface ScoringInput {
  annualCapital: number | null;
  weeklyTime: number | null;
  expectedReturn: number | null;
  investmentAmount: number | null;
  industryExperience: number | null;
  debtPressure: number | null;
  handsOffPreference?: number | null;
  setupAversion?: number | null;
}

export interface SubScores {
  annualCapital: number;
  investmentAmount: number;
  weeklyTime: number;
  expectedReturn: number;
  industryExperience: number;
  debtPressure: number;
  handsOffPreference: number;
  setupAversion: number;
}

export interface ScoringResult {
  score: number;
  tier: Tier;
  isWishingType: boolean;
  subScores: SubScores;
}
