import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Layers, Lock, Sliders } from 'lucide-react';
import type { DashboardData } from '../ml/types';
import { Card } from './ui/Card';

interface MethodologyViewProps {
  dashboard: DashboardData;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function MethodologyView({ dashboard }: MethodologyViewProps) {
  const [showTechNotes, setShowTechNotes] = useState(false);

  const stackItem = dashboard.tfjs_export_summary.find((x) => x.name === 'stacking_ensemble');
  const lrItem = dashboard.tfjs_export_summary.find((x) => x.name === 'logistic_regression');
  const xgbItem = dashboard.tfjs_export_summary.find((x) => x.name === 'xgboost');
  const rfItem = dashboard.tfjs_export_summary.find((x) => x.name === 'random_forest');

  const checkCards = [
    {
      name: 'Main result',
      badge: 'Best overall',
      tone: 'bg-brand-soft text-brand',
      verdict: 'Combines all built-in checks into one steady score. Correct about 86 out of 100 times on past test records.',
      bestFor: 'Everyday decisions on which team members need a check-in first.',
      goodToKnow: 'Uses several angles together so one noisy detail does not throw off the result.',
    },
    {
      name: 'Everyday balance check',
      badge: 'Clear reasons',
      tone: 'bg-info-soft text-info',
      verdict: 'Looks at pay, work hours, travel, and happiness directly to show why the score moved up or down.',
      bestFor: 'Reading the plain-language reasons list next to the dial.',
      goodToKnow: 'Easy to follow because every slider pushes the score clearly in one direction.',
    },
    {
      name: 'Stress-pair check',
      badge: 'Spots combos',
      tone: 'bg-warn-soft text-warn',
      verdict: 'Spots risky combinations, like working regular overtime while earning less than teammates in the same job.',
      bestFor: 'Catching hidden burnout before someone starts looking for another job.',
      goodToKnow: 'Catches over 6 out of 10 leavers ahead of time in unseen tests.',
    },
    {
      name: 'Extra-careful check',
      badge: 'Wide safety net',
      tone: 'bg-safe-soft text-safe',
      verdict: 'Flags even smaller early hints and catches 7 out of 10 people who later leave.',
      bestFor: 'Small or critical teams where losing even one skilled worker hurts a lot.',
      goodToKnow: 'Raises a few more gentle alerts, so it is best paired with a friendly chat.',
    },
  ];

  const technicalSummary = [
    {
      plain: 'Main result',
      model: 'Stacking Ensemble',
      auc: stackItem?.tfjs_test_roc_auc.toFixed(4) ?? '0.8390',
      size: `${stackItem?.size_kb.toFixed(1) ?? '32.7'} KB`,
    },
    {
      plain: 'Everyday balance check',
      model: 'Logistic Regression',
      auc: lrItem?.tfjs_test_roc_auc.toFixed(4) ?? '0.8339',
      size: `${lrItem?.size_kb.toFixed(1) ?? '2.3'} KB`,
    },
    {
      plain: 'Stress-pair check',
      model: 'XGBoost',
      auc: xgbItem?.tfjs_test_roc_auc.toFixed(4) ?? '0.8139',
      size: `${xgbItem?.size_kb.toFixed(1) ?? '32.6'} KB`,
    },
    {
      plain: 'Extra-careful check',
      model: 'Random Forest',
      auc: rfItem?.tfjs_test_roc_auc.toFixed(4) ?? '0.7911',
      size: `${rfItem?.size_kb.toFixed(1) ?? '32.7'} KB`,
    },
  ];

  return (
    <article className="max-w-[980px] space-y-8 pb-8">
      <header className="rounded-2xl border border-hairline bg-surface p-6 shadow-[var(--shadow-card)]">
        <h1 className="text-[28px] font-medium leading-[1.15] text-ink-primary">
          How TalentPulse works in simple terms
        </h1>
        <p className="mt-3 text-[15px] leading-[24px] text-ink-secondary">
          TalentPulse compares a worker's pay, work hours, travel, and happiness against 1,470 past staff records right inside your browser. Zero staff details ever leave your device, and you get a clear green, amber, or red answer with practical next steps right away.
        </p>
      </header>

      {/* 3 Simple Steps Visual Guide */}
      <section className="space-y-4">
        <h2 className="text-[20px] font-medium leading-snug text-ink-primary">
          How does this tool guess if someone might quit?
        </h2>
        <p className="text-[14px] leading-[22px] text-ink-secondary">
          It learned from 1,470 past workers where 237 people left and 1,233 stayed. When you move a slider, it checks patterns like extra hours, pay compared to coworkers, long commutes, and day-to-day happiness.
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="p-5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-info-soft text-info">
              <Sliders className="size-4" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <h3 className="mt-3 text-[15px] font-medium text-ink-primary">1. You set simple details</h3>
            <p className="mt-1.5 text-[13px] leading-[20px] text-ink-secondary">
              Pick the job, monthly pay, overtime, travel, and happiness words. No formulas or spreadsheets needed.
            </p>
          </Card>

          <Card className="p-5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <Layers className="size-4" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <h3 className="mt-3 text-[15px] font-medium text-ink-primary">2. Four checks give a second opinion</h3>
            <p className="mt-1.5 text-[13px] leading-[20px] text-ink-secondary">
              Four built-in checks look at the same worker from different angles and turn the result into a green, amber, or red dial.
            </p>
          </Card>

          <Card className="p-5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-safe-soft text-safe">
              <Lock className="size-4" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <h3 className="mt-3 text-[15px] font-medium text-ink-primary">3. Private manager tips</h3>
            <p className="mt-1.5 text-[13px] leading-[20px] text-ink-secondary">
              You get three plain actions to take this week. Everything runs inside your browser and nothing is saved or sent online.
            </p>
          </Card>
        </div>
      </section>

      {/* Plain-English Guide to the 4 Checks */}
      <section className="space-y-4">
        <h2 className="text-[20px] font-medium leading-snug text-ink-primary">
          Why are there four separate checks?
        </h2>
        <p className="text-[14px] leading-[22px] text-ink-secondary">
          Just like asking four experienced managers before making an important call, checking from four angles makes the answer much steadier than relying on one guess.
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {checkCards.map((card) => (
            <Card key={card.name} className="space-y-2.5 p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[15px] font-medium text-ink-primary">{card.name}</h3>
                <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${card.tone}`}>
                  {card.badge}
                </span>
              </div>
              <p className="text-[13px] leading-[20px] text-ink-primary">{card.verdict}</p>
              <dl className="space-y-1 pt-1 text-[13px] leading-[19px] text-ink-secondary">
                <div>
                  <dt className="inline font-medium text-ink-primary">Best for: </dt>
                  <dd className="inline">{card.bestFor}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-ink-primary">Good to know: </dt>
                  <dd className="inline">{card.goodToKnow}</dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-[20px] font-medium leading-snug text-ink-primary">
          Should managers make firing or pay choices from this score alone?
        </h2>
        <p className="text-[14px] leading-[22px] text-ink-secondary">
          No. Treat this score as an early reminder to start a helpful human conversation. Outside life changes, family moves, and local job offers are never visible inside company records.
        </p>
      </section>

      {/* Optional Technical Reference Drawer (Hidden by default for non-technical readers) */}
      <div className="rounded-2xl border border-hairline bg-surface shadow-[var(--shadow-card)]">
        <button
          type="button"
          onClick={() => setShowTechNotes((open) => !open)}
          aria-expanded={showTechNotes}
          className="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl px-6 py-3 text-left text-[14px] font-medium text-ink-secondary transition-colors duration-[var(--duration-fast)] hover:bg-card hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <span>For technical readers: view underlying ML models</span>
          <ChevronDown
            className={`size-4 shrink-0 text-ink-muted transition-transform duration-200 ${
              showTechNotes ? 'rotate-180' : ''
            }`}
            strokeWidth={1.75}
          />
        </button>

        <AnimatePresence initial={false}>
          {showTechNotes && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.24, ease: EASE }}
              className="overflow-hidden border-t border-hairline"
            >
              <div className="space-y-3 p-6 pt-4 text-[13px] text-ink-secondary">
                <p>
                  All four checks run client-side in TensorFlow.js (130 KB total including Yeo-Johnson and one-hot preprocessing weights) trained on the 1,470-row IBM HR dataset.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] border-collapse text-left text-[12px]">
                    <thead>
                      <tr className="border-b border-hairline text-ink-muted">
                        <th className="py-2 pr-3 font-medium">Plain label</th>
                        <th className="px-3 py-2 font-medium">Underlying model</th>
                        <th className="px-3 py-2 text-right font-medium">ROC-AUC Score</th>
                        <th className="pl-3 py-2 text-right font-medium">Browser's Model size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {technicalSummary.map((row) => (
                        <tr key={row.plain} className="border-b border-hairline last:border-none">
                          <td className="py-2 pr-3 font-medium text-ink-primary">{row.plain}</td>
                          <td className="px-3 py-2 font-mono">{row.model}</td>
                          <td className="px-3 py-2 text-right font-mono tabular-nums">{row.auc}</td>
                          <td className="pl-3 py-2 text-right font-mono tabular-nums">{row.size}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </article>
  );
}
