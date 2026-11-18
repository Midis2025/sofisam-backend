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
    default: 'bg-slate-100 text-[#14243A]',
    gold: 'bg-[#B99A62]/15 text-[#8D703D]',
    navy: 'bg-[#14243A]/10 text-[#14243A]',
    info: 'bg-blue-50 text-blue-600',
  };

  return (
    <Card className="relative p-6">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-[#7C8795]">
            {title}
          </span>
          <div className="mt-2 text-2xl lg:text-3xl font-bold tracking-tight text-[#182536]">
            {value}
          </div>
        </div>
        <div className={cn('p-3 rounded-xl', iconStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#E5E9EF]/60">
        <p className="text-xs text-[#7C8795] truncate">{description}</p>
        {typeof change === 'number' && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-semibold shrink-0 ml-2',
              isPositive ? 'text-emerald-600' : 'text-rose-600'
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
