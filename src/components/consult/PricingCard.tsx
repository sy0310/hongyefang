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
      className={`relative bg-white rounded-xl shadow-sm p-6 flex flex-col justify-between min-h-full ${
        isRecommended
          ? 'border-2 border-amber-400 ring-1 ring-amber-400'
          : 'border border-gray-100'
      }`}
      aria-label={`${name} 套餐, ¥${price.toLocaleString()}`}
    >
      {isRecommended && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-50 border border-amber-400 text-amber-700 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
          推荐方案
        </span>
      )}

      <div>
        <h3 className="text-lg font-bold text-gray-900">{name}</h3>

        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-base font-normal text-gray-500">¥</span>
          <span className="text-3xl font-bold text-gray-900">{price.toLocaleString()}</span>
          <span className="text-base font-normal text-gray-500">元</span>
        </div>

        <p className="text-sm text-gray-500 mt-2">{description}</p>

        <ul className="mt-6 space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
              <svg
                className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5"
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
