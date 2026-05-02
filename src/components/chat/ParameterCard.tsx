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
      <div className="my-4 mx-auto max-w-sm p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
        <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          {PARAMETER_LABELS[parameterKey]}: {value} {PARAMETER_UNITS[parameterKey]}
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
    <div className="my-4 mx-auto max-w-sm p-6 bg-card border border-primary/20 rounded-2xl shadow-md">
      <p className="text-sm font-bold text-foreground mb-4">{PARAMETER_LABELS[parameterKey]}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <input
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请输入数值..."
            className={`w-full pr-12 pl-4 py-3 bg-background border rounded-xl text-base font-medium transition-all ${
              error ? 'border-red-500 ring-1 ring-red-500' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
            } focus:outline-none`}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-foreground/40">
            {PARAMETER_UNITS[parameterKey]}
          </span>
        </div>
        {error && <p className="text-xs text-red-600 font-medium px-1">{error}</p>}
        <Button type="submit" variant="primary" className="py-3 font-bold shadow-lg shadow-primary/20">确认提交</Button>
      </form>
    </div>
  );
}
