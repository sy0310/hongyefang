'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PARAMETER_LABELS, PARAMETER_UNITS, type ParameterKey } from '@/types/assessment';
import { parameterSchemas } from '@/lib/chat/validation';

interface ParameterCardProps {
  parameterKey: ParameterKey;
  value: number | null;
  onSubmit: (value: number) => void;
}

export function ParameterCard({ parameterKey, value, onSubmit }: ParameterCardProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (value !== null) {
    return (
      <div className="my-2 mx-auto max-w-sm p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
        <span className="text-sm text-emerald-700">
          {PARAMETER_LABELS[parameterKey]}: <strong>{value}</strong> {PARAMETER_UNITS[parameterKey]}
        </span>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const num = parseFloat(input);
    if (isNaN(num)) {
      setError('请输入有效数字');
      return;
    }

    const schema = parameterSchemas[parameterKey];
    const result = schema.safeParse(num);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    onSubmit(num);
    setInput('');
  };

  return (
    <div className="my-2 mx-auto max-w-sm p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-sm font-medium text-blue-800 mb-2">{PARAMETER_LABELS[parameterKey]}</p>
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="flex-1">
          <input
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请输入..."
            className={`w-full px-3 py-2 border rounded-md text-sm ${
              error ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
        <span className="text-sm text-gray-500 pb-2">{PARAMETER_UNITS[parameterKey]}</span>
        <Button type="submit" variant="primary" className="w-auto px-4">确认</Button>
      </form>
    </div>
  );
}
