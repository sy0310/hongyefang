'use client';

import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import type { Tier } from '@/types/assessment';

interface ResultCTAProps {
  isWishingType: boolean;
  tier: Tier;
}

export function ResultCTA({ isWishingType, tier }: ResultCTAProps) {
  const router = useRouter();
  const { label, variant } = getCTADetails(isWishingType, tier);

  return (
    <div className="mt-8">
      <Button variant={variant} onClick={() => router.push('/consult')}>
        {label}
      </Button>
    </div>
  );
}

function getCTADetails(isWishingType: boolean, tier: Tier): {
  label: string;
  variant: 'primary' | 'secondary';
} {
  if (isWishingType) {
    return { label: '了解更多 →', variant: 'secondary' };
  }
  if (tier === '需要准备') {
    return { label: '了解付费咨询服务 →', variant: 'secondary' };
  }
  return { label: '查看咨询方案', variant: 'primary' };
}
