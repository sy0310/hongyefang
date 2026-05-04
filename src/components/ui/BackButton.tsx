'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className = '' }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={`group flex items-center justify-center w-10 h-10 rounded-full bg-surface border border-border shadow-sm hover:bg-surface-2 active:scale-95 transition-all ${className}`}
      aria-label="返回上一页"
    >
      <ChevronLeft className="w-5 h-5 text-text group-hover:-translate-x-0.5 transition-transform" />
    </button>
  );
}
