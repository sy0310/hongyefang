'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PARAMETER_LABELS, PARAMETER_UNITS, type ParameterKey } from '@/types/assessment';
import { parameterSchemas } from '@/lib/chat/validation';
import { CheckCircle2 } from 'lucide-react'

interface ParameterCardProps {
  parameterKey: ParameterKey;
  value: number | null;
  onSubmit: (value: number) => void;
}

export function ParameterCard({ parameterKey, value, onSubmit }: ParameterCardProps) {
  const [inputValue, setInputValue] = useState(value?.toString() ?? '');
  const [error, setError] = useState<string | null>(null);
  const isSubmitted = value !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseFloat(inputValue);
    const schema = parameterSchemas[parameterKey];
    const result = schema.safeParse(numValue);

    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setError(null);
    onSubmit(numValue);
  };

  return (
    <div className={`p-6 rounded-3xl border transition-all duration-500 ${
      isSubmitted 
        ? 'bg-success/5 border-success/20' 
        : 'bg-white border-primary shadow-lg shadow-primary/5'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xs font-black text-muted uppercase tracking-[0.2em] mb-1">
            {PARAMETER_LABELS[parameterKey]}
          </h3>
          <p className="text-[10px] text-muted italic font-medium">请确认以下核心业务参数</p>
        </div>
        {isSubmitted && <CheckCircle2 className="text-success w-5 h-5" />}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="number"
            value={isSubmitted ? value : inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isSubmitted}
            className={`w-full bg-gray-50 border rounded-2xl px-5 py-4 text-2xl font-black tracking-tighter transition-all focus:outline-none focus:ring-4 ${
              isSubmitted 
                ? 'border-transparent text-success' 
                : error 
                  ? 'border-red-500 focus:ring-red-500/10 text-red-500' 
                  : 'border-border focus:ring-primary/10 focus:border-primary text-foreground'
            }`}
            placeholder="0.00"
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-black text-muted italic uppercase">
            {PARAMETER_UNITS[parameterKey]}
          </span>
        </div>

        {error && <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest">{error}</p>}

        {!isSubmitted && (
          <Button type="submit" variant="primary" className="py-4 text-sm font-black uppercase tracking-widest">
            确认并更新画像
          </Button>
        )}
      </form>
    </div>
  );
}
