import React from 'react';
import { Card } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  change?: number;
  changePeriod?: string;
  description: string;
  icon: LucideIcon;
  variant?: 'default' | 'gold' | 'navy' | 'info';
}

export function StatCard({
  title,
  value,
  change,
  changePeriod = 'vs last month',
  description,
  icon: Icon,
  variant = 'default',
}: StatCardProps) {
  const isPositive = typeof change === 'number' && change >= 0;

  const iconStyles = {
    default: 'bg-[#F6F2EA] text-[#171717]',
    gold: 'bg-[#C7A46A]/15 text-[#7A5D33]',
    navy: 'bg-[#171717]/8 text-[#171717]',
    info: 'bg-[#F4EFE6] text-[#625F59]',
  };

  return (
    <Card className="relative p-6">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#66625B]">
            {title}
          </span>
          <div className="mt-2 text-2xl lg:text-3xl font-bold tracking-tight text-[#171717]">
            {value}
          </div>
        </div>
        <div className={cn('p-3 rounded-xl', iconStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#DED7CA]/70">
        <p className="text-xs text-[#66625B] truncate">{description}</p>
        {typeof change === 'number' && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-semibold shrink-0 ml-2',
              isPositive ? 'text-[#2B6B48]' : 'text-[#9A3F2C]'
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span title={changePeriod}>
              {isPositive ? '+' : ''}
              {change}%
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
