'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { createOrder } from '@/lib/orders/actions';

interface PaymentModalProps {
  isOpen: boolean;
  planName: string;
  amount: number;
  onCancel: () => void;
}

export function PaymentModal({
  isOpen,
  planName,
  amount,
  onCancel,
}: PaymentModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    },
    [onCancel]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    const result = await createOrder(planName, amount);

    if ('error' in result) {
      setError('订单创建失败，请重试');
      setLoading(false);
      return;
    }

    router.push(`/payment-success?id=${result.orderId}`);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="确认支付"
    >
      {/* Backdrop -- does NOT dismiss on click */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal card */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        <h3 className="text-lg font-bold text-gray-900 text-center">确认支付</h3>

        <div className="mt-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">套餐</span>
            <span className="text-gray-900 font-bold">{planName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">金额</span>
            <span className="text-gray-900 font-bold text-lg">
              ¥{amount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Simulated payment notice */}
        <div className="mt-2 p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
          当前为模拟支付，不会产生实际扣款。
          正式上线后将接入微信支付/支付宝。
        </div>

        {/* Error state */}
        {error && (
          <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
        )}

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <Button variant="primary" onClick={handleConfirm} loading={loading} autoFocus>
            确认支付 ¥{amount.toLocaleString()}
          </Button>
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            取消
          </Button>
        </div>
      </div>
    </div>
  );
}
