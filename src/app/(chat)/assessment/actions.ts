'use server';

import { createClient } from '@/lib/supabase/server';
import { calculateScore } from '@/lib/scoring/engine';
import { buildDeepSeekPrompt, getFallbackNarrative } from '@/lib/scoring/deepseek-prompt';
import { redirect } from 'next/navigation';

export async function createAssessment(): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data, error } = await supabase
    .from('assessments')
    .insert({
      user_id: user.id,
      status: 'in_progress',
    })
    .select('id')
    .single();

  if (error) {
    return { error: error.message };
  }

  return { id: data.id };
}

// LOCKED DECISION: 随时退出 -- support browser back + auto-save params to Supabase, resume next time
export async function getInProgressAssessment(): Promise<{
  assessment: {
    id: string;
    annual_capital: number | null;
    weekly_time: number | null;
    expected_return: number | null;
    investment_amount: number | null;
  } | null;
} | { error: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'unauthenticated' };
  }

  const { data, error } = await supabase
    .from('assessments')
    .select('id, annual_capital, weekly_time, expected_return, investment_amount')
    .eq('user_id', user.id)
    .eq('status', 'in_progress')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { assessment: data };
}

export async function completeAssessment(assessmentId: string): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'unauthenticated' };
  }

  const { data: check } = await supabase
    .from('assessments')
    .select('score')
    .eq('id', assessmentId)
    .eq('user_id', user.id)
    .single();

  if (!check) {
    return { error: 'assessment not found' };
  }

  if (check.score !== null) {
    return { success: true };
  }

  const { data: assessment, error: fetchError } = await supabase
    .from('assessments')
    .select('annual_capital, weekly_time, expected_return, investment_amount')
    .eq('id', assessmentId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !assessment) {
    return { error: 'assessment not found' };
  }

  const scoring = calculateScore({
    annualCapital: assessment.annual_capital,
    weeklyTime: assessment.weekly_time,
    expectedReturn: assessment.expected_return,
    investmentAmount: assessment.investment_amount,
  });

  let aiNarrative: string;
  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY not configured');
    }

    const { createDeepSeek } = await import('@ai-sdk/deepseek');
    const { generateText } = await import('ai');

    const deepseek = createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY });

    const { system, user } = buildDeepSeekPrompt(
      {
        annualCapital: assessment.annual_capital,
        weeklyTime: assessment.weekly_time,
        expectedReturn: assessment.expected_return,
        investmentAmount: assessment.investment_amount,
      },
      scoring.tier,
      scoring.isWishingType
    );

    const { text } = await generateText({
      model: deepseek('deepseek-v4-flash'),
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });

    aiNarrative = text;
  } catch {
    aiNarrative = getFallbackNarrative(scoring.tier, scoring.isWishingType);
  }

  const { error: updateError } = await supabase
    .from('assessments')
    .update({
      status: 'completed',
      score: scoring.score,
      tier: scoring.tier,
      is_wishing_type: scoring.isWishingType,
      ai_narrative: aiNarrative,
    })
    .eq('id', assessmentId)
    .eq('user_id', user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  return { success: true };
}

export async function saveChatMessages(
  assessmentId: string,
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'unauthenticated' };
  }

  // Verify user owns this assessment before batch insert
  const { data: assessment, error: checkError } = await supabase
    .from('assessments')
    .select('id')
    .eq('id', assessmentId)
    .eq('user_id', user.id)
    .single();

  if (checkError || !assessment) {
    return { error: 'assessment not found or not owned by user' };
  }

  const rows = messages.map(m => ({
    assessment_id: assessmentId,
    role: m.role,
    content: m.content,
  }));

  const { error } = await supabase
    .from('chat_messages')
    .insert(rows);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
