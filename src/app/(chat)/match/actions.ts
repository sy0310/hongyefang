'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const joinSchema = z.object({
  assessmentId: z.string().uuid(),
  projectDesc: z.string().min(10).max(200),
});

export async function joinMatchPool(input: z.infer<typeof joinSchema>) {
  const { assessmentId, projectDesc } = joinSchema.parse(input);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase.from('partner_profiles').upsert({
    user_id: user.id,
    assessment_id: assessmentId,
    project_desc: projectDesc,
    is_active: true,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  if (error) throw new Error(error.message);

  revalidatePath('/match');
  revalidatePath('/result');
}

export async function leaveMatchPool() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('partner_profiles')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);

  revalidatePath('/match');
  revalidatePath('/result');
}

export async function submitInterest(toUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  if (user.id === toUserId) throw new Error('Cannot connect with self');

  const { error } = await supabase.from('partner_interests').insert({
    from_user_id: user.id,
    to_user_id: toUserId,
    status: 'pending',
  });

  // Ignore unique constraint violations (already submitted)
  if (error && !error.message.includes('unique')) throw new Error(error.message);
}

export async function getMyPoolStatus() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('partner_profiles')
    .select('id, is_active, project_desc, assessment_id')
    .eq('user_id', user.id)
    .maybeSingle();

  return data;
}
