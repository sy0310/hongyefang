'use server';

import { createClient } from '@/lib/supabase/server';
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

  const { error } = await supabase
    .from('assessments')
    .update({ status: 'completed' })
    .eq('id', assessmentId)
    .eq('user_id', user.id);

  if (error) {
    return { error: error.message };
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
