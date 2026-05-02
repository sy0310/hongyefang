'use client';

import { useState } from 'react';
import { PricingCard } from '@/components/consult/PricingCard';
import { PaymentModal } from '@/components/consult/PaymentModal';

interface Plan {
  name: string;
  price: number;
  description: string;
  features: string[];
  isRecommended: boolean;
}

interface ConsultClientProps {
  plans: Plan[];
}

export function ConsultClient({ plans }: ConsultClientProps) {
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: number } | null>(null);

  return (
    <>
      <div className="flex flex-col gap-6">
        {plans.map((plan) => (
          <div key={plan.name} className="relative">
            <PricingCard
              name={plan.name}
              price={plan.price}
              description={plan.description}
              features={plan.features}
              isRecommended={plan.isRecommended}
              onSelect={() => setSelectedPlan({ name: plan.name, price: plan.price })}
            />
          </div>
        ))}
      </div>

      <PaymentModal
        isOpen={selectedPlan !== null}
        planName={selectedPlan?.name ?? ''}
        amount={selectedPlan?.price ?? 0}
        onCancel={() => setSelectedPlan(null)}
      />
    </>
  );
}
