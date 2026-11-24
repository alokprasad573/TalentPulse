import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, RotateCcw, TrendingDown, TrendingUp } from 'lucide-react';
import { EMPLOYEE_PRESETS, getManagerActionSteps } from '../data/presets';
import type { DashboardData, EmployeeInput, PredictionResult, ThresholdMode } from '../ml/types';
import { ActionPlanCard } from './ActionPlanCard';
import { EmployeeFormSections } from './EmployeeFormSections';
import { RiskGauge } from './RiskGauge';
import { Card, CardHeader, CardTitle } from './ui/Card';

interface RiskProfileViewProps {
  input: EmployeeInput;
  onChange: (next: EmployeeInput) => void;
  prediction: PredictionResult;
  dashboard: DashboardData;
  thresholdMode: ThresholdMode;
  onThresholdModeChange: (mode: ThresholdMode) => void;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function RiskProfileView({
  input,
  onChange,
  prediction,
  dashboard,
  thresholdMode,
  onThresholdModeChange,
}: RiskProfileViewProps) {
  const [showAllModels, setShowAllModels] = useState(false);

  const updateField = <K extends keyof EmployeeInput>(key: K, value: EmployeeInput[K]) => {
    const next = { ...input, [key]: value };
    if (key === 'Age') {
      const maxExp = Math.max(Number(value) - 18, 0);
      if (next.TotalWorkingYears > maxExp) next.TotalWorkingYears = maxExp;
    }
    if (next.YearsAtCompany > next.TotalWorkingYears) next.YearsAtCompany = next.TotalWorkingYears;
    if (next.YearsInCurrentRole > next.YearsAtCompany) next.YearsInCurrentRole = next.YearsAtCompany;
    if (next.YearsSinceLastPromotion > next.YearsAtCompany) {
      next.YearsSinceLastPromotion = next.YearsAtCompany;
    }
    if (next.YearsWithCurrManager > next.YearsAtCompany) {
      next.YearsWithCurrManager = next.YearsAtCompany;
    }
    onChange(next);
  };

  const stackThresholds = dashboard.optimal_thresholds['Stacking Ensemble'];
  const activeThreshold =
    thresholdMode === 'hr_high_recall'
      ? stackThresholds.hr_high_recall
      : stackThresholds.balanced_f1;

  const actionSteps = getManagerActionSteps(
    input,
    prediction.engineeredSummary.incomeVsRoleMedian,
    prediction.stacking,
    activeThreshold
  );

  const checkRows = [
    {
      name: 'Main result',
      hint: 'Combines all checks into one steady answer',
      prob: prediction.stacking,
      threshold: dashboard.optimal_thresholds['Stacking Ensemble'][thresholdMode],
      lead: true,
    },
    {
      name: 'Everyday balance check',
      hint: 'Weighs pay, hours, and happiness directly',
      prob: prediction.logistic,
      threshold: dashboard.optimal_thresholds['Logistic Regression'][thresholdMode],
      lead: false,
    },
    {
      name: 'Stress-pair check',
      hint: 'Spots tough mixes like overtime with lower pay',
      prob: prediction.xgboost,
      threshold: dashboard.optimal_thresholds['XGBoost'][thresholdMode],
      lead: false,
    },
    {
      name: 'Extra-careful check',
      hint: 'Flags small early hints so fewer leavers are missed',
      prob: prediction.randomForest,
      threshold: dashboard.optimal_thresholds['Random Forest'][thresholdMode],
      lead: false,
    },
  ];

  const flaggedCount = checkRows.filter((row) => row.prob >= row.threshold).length;
  const agreementBadge =
    flaggedCount === 4
      ? { label: 'All 4 say watch out', tone: 'bg-risk-soft text-risk' }
      : flaggedCount === 0
        ? { label: 'All 4 say safe', tone: 'bg-safe-soft text-safe' }
        : { label: `${flaggedCount} of 4 flag risk`, tone: 'bg-warn-soft text-warn' };
  const agreementSummary =
    flaggedCount === 4 || flaggedCount === 0
      ? 'All four checks point the same way, so this result is steady.'
      : 'The four checks are slightly split, so treat this as a gentle cue for a short 1-on-1 chat.';

  return (
    <div className="space-y-6">
      {/* Plain-English Hero Banner + One-Tap Example Workers */}
      <div className="rounded-2xl border border-hairline bg-surface p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-[28px] font-medium leading-[1.15] text-ink-primary">
              Will this worker stay or leave?
            </h1>
            <p className="mt-2 max-w-[62ch] text-[15px] leading-[22px] text-ink-secondary">
              Pick a sample worker below or move any slider. Your browser checks the chance of them leaving right away with zero server upload.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {EMPLOYEE_PRESETS.map((preset) => {
              const dotColor =
                preset.tone === 'risk'
                  ? 'bg-risk'
                  : preset.tone === 'warn'
                    ? 'bg-warn'
                    : 'bg-safe';
              return (
                <motion.button
                  key={preset.id}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onChange(preset.values)}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-hairline bg-card px-3.5 text-[13px] font-medium text-ink-primary transition-colors duration-[var(--duration-fast)] hover:bg-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  title={preset.summary}
                >
                  <span className={`size-2 rounded-full ${dotColor}`} aria-hidden="true" />
                  {preset.label}
                </motion.button>
              );
            })}
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(EMPLOYEE_PRESETS[0].values)}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-hairline bg-raised px-3 text-[13px] font-medium text-ink-secondary transition-colors duration-[var(--duration-fast)] hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              aria-label="Reset form to default worker"
            >
              <RotateCcw className="size-4" strokeWidth={1.5} />
              Reset
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Interactive Workspace */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <EmployeeFormSections input={input} onUpdate={updateField} />

        {/* Right Column: Live 3D + Dial + Action Tips + Plain Reasons */}
        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          {/* Alert Sensitivity Toggle */}
          <div className="rounded-xl border border-hairline bg-surface p-2 shadow-[var(--shadow-card)]">
            <div className="grid grid-cols-2 gap-1">
              {(
                [
                  {
                    id: 'hr_high_recall' as const,
                    label: 'Early warning',
                    sub: `Alert at ${Math.round(stackThresholds.hr_high_recall * 100)}%`,
                  },
                  {
                    id: 'balanced_f1' as const,
                    label: 'Balanced alert',
                    sub: `Alert at ${Math.round(stackThresholds.balanced_f1 * 100)}%`,
                  },
                ]
              ).map((mode) => {
                const active = thresholdMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onThresholdModeChange(mode.id)}
                    className="relative flex h-11 flex-col items-start justify-center rounded-lg px-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    {active && (
                      <motion.span
                        layoutId="sensitivityPill"
                        transition={{ duration: 0.2, ease: EASE }}
                        className="absolute inset-0 rounded-lg border border-brand/25 bg-brand-soft"
                      />
                    )}
                    <span
                      className={`relative z-10 text-[13px] font-medium leading-tight ${
                        active ? 'text-brand' : 'text-ink-secondary'
                      }`}
                    >
                      {mode.label}
                    </span>
                    <span className="relative z-10 font-mono text-[11px] text-ink-muted tabular-nums">
                      {mode.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Visual Moment: GSAP Gauge + 3 Plain Health Meters */}
          <RiskGauge
            probability={prediction.stacking}
            threshold={activeThreshold}
            burnoutScore={prediction.engineeredSummary.burnoutIndex}
            engagementRatio={prediction.engineeredSummary.engagementScore / 20}
            payRatio={prediction.engineeredSummary.incomeVsRoleMedian}
            overtimeYes={input.OverTime === 'Yes'}
          />

          {/* Plain-Language Manager Action Plan */}
          <ActionPlanCard steps={actionSteps} />

          {/* Plain Reasons Driving This Worker's Score */}
          <Card>
            <CardHeader>
              <CardTitle>Top reasons behind this score</CardTitle>
              <span className="text-[12px] text-ink-muted">Live breakdown</span>
            </CardHeader>

            <ul className="space-y-2.5" role="list">
              {prediction.contributions.map((item) => {
                const isRisk = item.direction === 'risk';
                return (
                  <li
                    key={item.feature}
                    className="flex items-center justify-between gap-3 rounded-lg bg-card px-3 py-2.5 border border-hairline"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={`flex size-6 shrink-0 items-center justify-center rounded-md ${
                          isRisk ? 'bg-risk-soft text-risk' : 'bg-safe-soft text-safe'
                        }`}
                      >
                        {isRisk ? (
                          <TrendingUp className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                        ) : (
                          <TrendingDown className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                        )}
                      </span>
                      <span className="truncate text-[13px] font-medium text-ink-primary">
                        {item.label}
                      </span>
                    </div>
                    <span
                      className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium ${
                        isRisk ? 'bg-risk-soft text-risk' : 'bg-safe-soft text-safe'
                      }`}
                    >
                      {isRisk ? 'Pushes to leave' : 'Helps stay'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>

          {/* Plain-Language Second Opinion Drawer */}
          <div className="rounded-2xl border border-hairline bg-surface shadow-[var(--shadow-card)]">
            <button
              type="button"
              onClick={() => setShowAllModels((open) => !open)}
              aria-expanded={showAllModels}
              className="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl px-6 py-3 text-left text-[14px] font-medium text-ink-primary transition-colors duration-[var(--duration-fast)] hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <span>Second opinion (4 checks)</span>
              <span className="inline-flex items-center gap-2.5">
                <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${agreementBadge.tone}`}>
                  {agreementBadge.label}
                </span>
                <ChevronDown
                  className={`size-4 text-ink-muted transition-transform duration-200 ${
                    showAllModels ? 'rotate-180' : ''
                  }`}
                  strokeWidth={1.75}
                />
              </span>
            </button>

            <AnimatePresence initial={false}>
              {showAllModels && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.24, ease: EASE }}
                  className="overflow-hidden border-t border-hairline"
                >
                  <div className="space-y-4 p-6 pt-4">
                    <p className="text-[13px] leading-[19px] text-ink-secondary">
                      {agreementSummary}
                    </p>

                    <div className="space-y-3.5">
                      {checkRows.map((row) => {
                        const pct = Math.round(row.prob * 100);
                        const over = row.prob >= row.threshold;
                        const statusWord =
                          row.prob >= Math.max(row.threshold * 1.45, 0.45)
                            ? 'High risk'
                            : over
                              ? 'Watch'
                              : 'Safe';
                        return (
                          <div key={row.name} className="space-y-1.5">
                            <div className="flex items-start justify-between gap-2 text-[13px]">
                              <div className="min-w-0">
                                <span
                                  className={
                                    row.lead
                                      ? 'font-medium text-ink-primary'
                                      : 'font-medium text-ink-secondary'
                                  }
                                >
                                  {row.name}
                                </span>
                                <p className="text-[12px] text-ink-muted">{row.hint}</p>
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <span
                                  className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${
                                    statusWord === 'High risk'
                                      ? 'bg-risk-soft text-risk'
                                      : statusWord === 'Watch'
                                        ? 'bg-warn-soft text-warn'
                                        : 'bg-safe-soft text-safe'
                                  }`}
                                >
                                  {statusWord}
                                </span>
                                <span
                                  className={`w-9 text-right font-mono font-medium tabular-nums ${
                                    over ? 'text-risk' : 'text-safe'
                                  }`}
                                >
                                  {pct}%
                                </span>
                              </div>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-raised">
                              <motion.div
                                className={`h-2 w-full origin-left rounded-full ${
                                  statusWord === 'High risk'
                                    ? 'bg-risk'
                                    : statusWord === 'Watch'
                                      ? 'bg-warn'
                                      : 'bg-safe'
                                }`}
                                initial={false}
                                animate={{ scaleX: Math.max(row.prob, 0.02) }}
                                transition={{ duration: 0.3, ease: EASE }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
