'use client';

import { Button } from '@/components/ui/Button';

interface ResultCTAProps {
  isWishingType: boolean;
}

export function ResultCTA({ isWishingType }: ResultCTAProps) {
  const label = isWishingType ? '准备好后预约顾问' : '立即预约专属顾问';
  return (
    <div className="mt-8">
      <a href="mailto:consult@hongyefang.com?subject=创业咨询预约">
        <Button variant="primary">{label}</Button>
      </a>
    </div>
  );
}
