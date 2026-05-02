'use client';

import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import type { Tier } from '@/types/assessment';
import { ChevronRight } from 'lucide-react'

interface ResultCTAProps {
  isWishingType: boolean;
  tier: Tier;
}

export function ResultCTA({ isWishingType, tier }: ResultCTAProps) {
  const router = useRouter();
  const { label, subLabel } = getCTADetails(isWishingType, tier);

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1 mb-6">
        <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em]">下一步建议</h3>
        <p className="text-[13px] text-muted italic">{subLabel}</p>
      </div>
      
      <Button 
        variant="primary" 
        onClick={() => router.push('/consult')} 
        className="py-5 text-lg font-black shadow-2xl shadow-primary/30 group"
      >
        {label}
        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </Button>
      
      <Button 
        variant="ghost" 
        onClick={() => router.push('/dashboard')} 
        className="py-4 text-sm font-bold text-muted hover:text-foreground"
      >
        返回控制台
      </Button>
    </div>
  );
}

function getCTADetails(isWishingType: boolean, tier: Tier): {
  label: string;
  subLabel: string;
} {
  if (isWishingType) {
    return { 
      label: '了解标准版方案', 
      subLabel: '建议从认知补齐开始，打好基础' 
    };
  }
  if (tier === '高度适配') {
    return { 
      label: '开启 1对1 旗舰咨询', 
      subLabel: '专家深度介入，加速项目落地' 
    };
  }
  return { 
    label: '查看咨询方案', 
    subLabel: '根据您的评分匹配最佳服务' 
  };
}
