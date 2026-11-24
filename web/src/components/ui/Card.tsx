import type { ComponentProps } from 'react';
import { cn } from '../../lib/cn';

export function Card({ className, ...props }: ComponentProps<'section'>) {
  return (
    <section
      data-slot="card"
      className={cn(
        'rounded-2xl border border-hairline bg-surface p-6 shadow-[var(--shadow-card)]',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn('mb-4 flex flex-wrap items-baseline justify-between gap-2', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: ComponentProps<'h2'>) {
  return (
    <h2
      data-slot="card-title"
      className={cn('text-[16px] font-medium leading-snug text-ink-primary', className)}
      {...props}
    />
  );
}
