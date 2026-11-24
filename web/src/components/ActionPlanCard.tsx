import { motion } from 'framer-motion';
import { ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import type { ManagerActionStep } from '../data/presets';
import { Card, CardHeader, CardTitle } from './ui/Card';

interface ActionPlanCardProps {
  steps: ManagerActionStep[];
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function ActionPlanCard({ steps }: ActionPlanCardProps) {
  return (
    <Card data-slot="action-plan-card">
      <CardHeader>
        <CardTitle>What a manager can do right now</CardTitle>
        <span className="text-[12px] text-ink-muted">Plain action steps</span>
      </CardHeader>

      <ul className="space-y-3" role="list">
        {steps.map((step, idx) => {
          const toneClasses =
            step.priority === 'urgent'
              ? {
                  bg: 'bg-risk-soft/70',
                  border: 'border-risk/20',
                  iconColor: 'text-risk',
                  badge: 'Act this week',
                  Icon: ArrowUpRight,
                }
              : step.priority === 'helpful'
                ? {
                    bg: 'bg-warn-soft/75',
                    border: 'border-warn/20',
                    iconColor: 'text-warn',
                    badge: 'Plan soon',
                    Icon: Clock,
                  }
                : {
                    bg: 'bg-safe-soft/80',
                    border: 'border-safe/20',
                    iconColor: 'text-safe',
                    badge: 'Keep going',
                    Icon: CheckCircle2,
                  };
          const Icon = toneClasses.Icon;

          return (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: idx * 0.04, ease: EASE }}
              className={`rounded-xl border p-3.5 ${toneClasses.bg} ${toneClasses.border}`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 shrink-0 ${toneClasses.iconColor}`}>
                  <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-[14px] font-medium text-ink-primary">{step.title}</h3>
                    <span className={`font-mono text-[11px] font-medium ${toneClasses.iconColor}`}>
                      {toneClasses.badge}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-[19px] text-ink-secondary">{step.detail}</p>
                </div>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </Card>
  );
}
