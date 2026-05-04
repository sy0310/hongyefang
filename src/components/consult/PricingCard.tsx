'use client';

import { Button } from '@/components/ui/Button';
import { Check } from 'lucide-react';

interface PricingCardProps {
  name: string;
  price: number;
  description: string;
  features: string[];
  isRecommended: boolean;
  onSelect: () => void;
}

export function PricingCard({
  name,
  price,
  description,
  features,
  isRecommended,
  onSelect,
}: PricingCardProps) {
  return (
    <article
      className={`relative bg-surface rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] ${
        isRecommended
          ? 'border-2 border-accent shadow-[0_20px_50px_rgba(176,43,14,0.1)]'
          : 'border border-border'
      }`}
    >
      {isRecommended && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-black px-4 py-1.5 rounded-full whitespace-nowrap uppercase tracking-[0.2em] shadow-lg shadow-accent/30">
          Most Popular
        </span>
      )}

      <div>
        <div className="text-center mb-8">
          <h3 className="text-xs font-black text-text-2 uppercase tracking-[0.2em] mb-2">{name}</h3>
          <div className="flex items-center justify-center gap-1">
            <span className="text-xl font-black text-text">¥</span>
            <span className="text-5xl font-black text-text tracking-tighter">{price.toLocaleString()}</span>
          </div>
          <p className="text-[13px] text-text-2 italic mt-4 px-4 leading-relaxed">{description}</p>
        </div>

        <div className="w-full h-px bg-surface-2 my-8" />

        <ul className="space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3 text-sm font-bold text-text/80">
              <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-accent" strokeWidth={4} />
              </div>
              <span className="leading-tight">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10">
        <Button 
          variant={isRecommended ? 'primary' : 'outline'} 
          onClick={onSelect}
          className="py-4 text-sm font-black uppercase tracking-widest"
        >
          立即预约
        </Button>
      </div>
    </article>
  );
}
