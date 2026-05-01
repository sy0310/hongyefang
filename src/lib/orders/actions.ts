'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Creates a simulated payment order record.
 * Called by the PaymentModal confirm flow in Plan 03.
 * Returns orderId on success for redirect to /payment-success.
 */
export async function createOrder(
  planName: string,
  amount: number
): Promise<{ orderId: string } | { error: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'unauthenticated' };
  }

  if (!planName || typeof planName !== 'string' || planName.trim().length === 0) {
    return { error: 'plan name is required' };
  }
  if (!Number.isInteger(amount) || amount <= 0) {
    return { error: 'amount must be a positive integer' };
  }

  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      plan_name: planName.trim(),
      amount,
      status: 'completed',
    })
    .select('id')
    .single();

  if (error) {
    return { error: error.message };
  }

  return { orderId: data.id };
}

/**
 * Retrieves an order by ID, scoped to the authenticated user.
 * Called by the payment-success page (Plan 02) to display order details.
 */
export async function getOrder(orderId: string): Promise<{
  order: { id: string; plan_name: string; amount: number; created_at: string } | null;
} | { error: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'unauthenticated' };
  }

  const { data, error } = await supabase
    .from('orders')
    .select('id, plan_name, amount, created_at')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned - order not found or not owned by user
      return { order: null };
    }
    return { error: error.message };
  }

  return { order: data };
}
