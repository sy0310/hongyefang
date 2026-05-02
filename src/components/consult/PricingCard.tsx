import { Button } from '@/components/ui/Button';

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
      className={`relative bg-card rounded-2xl shadow-sm p-8 flex flex-col justify-between min-h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        isRecommended
          ? 'border-2 border-primary ring-4 ring-primary/5'
          : 'border border-border/50'
      }`}
      aria-label={`${name} 套餐, ¥${price.toLocaleString()}`}
    >
      {isRecommended && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-4 py-1 rounded-full whitespace-nowrap uppercase tracking-widest shadow-lg shadow-primary/30">
          推荐方案
        </span>
      )}

      <div>
        <h3 className="text-xl font-black text-foreground mb-4">{name}</h3>

        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold text-foreground/40">¥</span>
          <span className="text-4xl font-black text-foreground tracking-tighter">{price.toLocaleString()}</span>
          <span className="text-sm font-bold text-foreground/40">/ 套餐</span>
        </div>

        <p className="text-sm font-medium text-foreground/60 mt-4 leading-relaxed">{description}</p>

        <ul className="mt-8 space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3 text-sm font-medium text-foreground/80">
              <svg
                className="w-5 h-5 text-primary flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <Button variant="primary" onClick={onSelect}>
          选择方案
        </Button>
      </div>
    </article>
  );
}
