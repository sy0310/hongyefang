import { z } from 'zod';

export const annualCapitalSchema = z.number().min(0, '年度弹性资金必须大于0').max(100000, '数值超出合理范围');
export const weeklyTimeSchema = z.number().min(0, '每周投入时间必须大于0').max(168, '每周最多168小时');
export const expectedReturnSchema = z.number().min(0, '预期回报必须大于0').max(100, '预期回报不能超过100%');
export const investmentAmountSchema = z.number().min(0, '投入金额必须大于0').max(100000, '数值超出合理范围');

export const parameterSchemas: Record<string, z.ZodNumber> = {
  annualCapital: annualCapitalSchema,
  weeklyTime: weeklyTimeSchema,
  expectedReturn: expectedReturnSchema,
  investmentAmount: investmentAmountSchema,
};
