'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function AssessmentEntryButton() {
  return (
    <Link href="/assessment" className="block">
      <Button variant="primary">开始创业体检</Button>
    </Link>
  );
}
