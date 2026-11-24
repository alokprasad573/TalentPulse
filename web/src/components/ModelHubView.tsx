import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DashboardData } from '../ml/types';
import { Card, CardHeader, CardTitle } from './ui/Card';

interface ModelHubViewProps {
  dashboard: DashboardData;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function ModelHubView({ dashboard }: ModelHubViewProps) {
  const [showTechnical, setShowTechnical] = useState(false);

  const champHr = dashboard.test_metrics_hr_recall[dashboard.champion_model];
  const softVoteHr = dashboard.test_metrics_hr_recall['Weighted Soft-Vote Ensemble'];

  // Plain-language comparison of the 3 biggest real-world risk multipliers from EDA
  const everydayStoryBars = [
    { group: 'Overtime + Single', rate: 49.6, tone: '#b91c1c' },
    { group: 'Overtime + No shares', rate: 45.1, tone: '#b91c1c' },
    { group: 'Sales Representative', rate: 39.8, tone: '#c2410c' },
    { group: 'First year on job', rate: 34.9, tone: '#b45309' },
    { group: 'Works extra hours', rate: 30.5, tone: '#b45309' },
    { group: 'Company average', rate: 16.1, tone: '#1d4ed8' },
    { group: 'No overtime + Married', rate: 8.4, tone: '#0f766e' },
  ];

  // Interpolate ROC series cleanly for optional technical drawer
  const fprGrid = Array.from({ length: 41 }, (_, i) => Number((i / 40).toFixed(3)));
  const interp = (pts: Array<{ x: number; y: number }>, xTarget: number) => {
    if (!pts || pts.length === 0) return 0;
    for (let i = 1; i < pts.length; i++) {
      if (pts[i].x >= xTarget) {
        const dx = pts[i].x - pts[i - 1].x;
        const t = dx === 0 ? 0 : (xTarget - pts[i - 1].x) / dx;
        return Number((pts[i - 1].y + t * (pts[i].y - pts[i - 1].y)).toFixed(4));
      }
    }
    return pts[pts.length - 1].y;
  };
  const rocPlotData = fprGrid.map((fpr) => ({
    fpr,
    random: fpr,
    stacking: interp(dashboard.roc_curves['Stacking Ensemble'], fpr),
    logistic: interp(dashboard.roc_curves['Logistic Regression'], fpr),
    xgboost: interp(dashboard.roc_curves['XGBoost'], fpr),
    rf: interp(dashboard.roc_curves['Random Forest'], fpr),
  }));

  const technicalModels = [
    'Stacking Ensemble',
    'Weighted Soft-Vote Ensemble',
    'Logistic Regression',
    'XGBoost',
    'Random Forest',
  ].filter((m) => Boolean(dashboard.test_metrics_hr_recall[m]));

  return (
    <div className="space-y-6">
      {/* Plain Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-hairline bg-surface p-6 shadow-[var(--shadow-card)] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-medium leading-[1.15] text-ink-primary">
            Why workers leave and how accurate this tool is
          </h1>
          <p className="mt-2 max-w-[64ch] text-[15px] leading-[22px] text-ink-secondary">
            Real numbers from 1,470 past staff records showing which situations cause people to quit, and how often our checker catches them early.
          </p>
        </div>

        <button
          type="button"
          aria-expanded={showTechnical}
          onClick={() => setShowTechnical((v) => !v)}
          className={`h-10 shrink-0 rounded-lg border px-4 text-[13px] font-medium transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
            showTechnical
              ? 'border-brand bg-brand text-white'
              : 'border-hairline bg-card text-ink-primary hover:bg-raised'
          }`}
        >
          {showTechnical ? 'Hide technical metrics' : 'Show technical ML details'}
        </button>
      </div>

      {/* Row 1: 4 Colorful, Plain-Language Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-hairline bg-surface p-5 shadow-[var(--shadow-card)]">
          <p className="text-[13px] text-ink-secondary">Staff who left overall</p>
          <p className="mt-2 font-mono text-[32px] font-medium leading-none text-ink-primary tabular-nums">
            16 in 100
          </p>
          <p className="mt-2 text-[12px] text-ink-muted">237 out of 1,470 total workers</p>
        </div>

        <div className="rounded-2xl border border-risk/20 bg-risk-soft/60 p-5 shadow-[var(--shadow-card)]">
          <p className="text-[13px] text-ink-primary">Leaving with overtime</p>
          <p className="mt-2 font-mono text-[32px] font-medium leading-none text-risk tabular-nums">
            31 in 100
          </p>
          <p className="mt-2 text-[12px] text-risk">3x higher than regular hours (10 in 100)</p>
        </div>

        <div className="rounded-2xl border border-safe/20 bg-safe-soft/70 p-5 shadow-[var(--shadow-card)]">
          <p className="text-[13px] text-ink-primary">Test accuracy score</p>
          <p className="mt-2 font-mono text-[32px] font-medium leading-none text-safe tabular-nums">
            {Math.round(champHr.accuracy * 100)}%
          </p>
          <p className="mt-2 text-[12px] text-safe">
            Catches {Math.round(softVoteHr.recall * 100)}% of leavers in early-warning mode
          </p>
        </div>

        <div className="rounded-2xl border border-info/20 bg-info-soft/60 p-5 shadow-[var(--shadow-card)]">
          <p className="text-[13px] text-ink-primary">Early leavers spotted</p>
          <p className="mt-2 font-mono text-[32px] font-medium leading-none text-info tabular-nums">
            {Math.round(softVoteHr.recall * 100)} in 100
          </p>
          <p className="mt-2 text-[12px] text-info">Flagged early in real unseen test staff</p>
        </div>
      </div>

      {/* Row 2: Dominant 2/3 Plain-Language Bar Chart + Narrow 1/3 Simple Key Takeaways */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.8fr_1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Who is most likely to quit?</CardTitle>
              <p className="mt-0.5 text-[13px] text-ink-muted">
                Out of every 100 workers in each group, how many left the company
              </p>
            </div>
            <span className="font-mono text-[12px] text-ink-muted">Real 1,470-record data</span>
          </CardHeader>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={everydayStoryBars}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 10, bottom: 4 }}
              >
                <CartesianGrid stroke="rgba(31,27,22,0.07)" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 55]}
                  tick={{ fontSize: 12, fill: '#5a5248', fontFamily: 'IBM Plex Mono' }}
                  tickFormatter={(v: number) => `${v}%`}
                  stroke="rgba(31,27,22,0.14)"
                />
                <YAxis
                  type="category"
                  dataKey="group"
                  width={158}
                  tick={{ fontSize: 12, fill: '#1f1b16' }}
                  stroke="rgba(31,27,22,0.14)"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(31,27,22,0.12)',
                    borderRadius: '10px',
                    fontSize: '13px',
                  }}
                  formatter={(v) => [`${Number(v).toFixed(1)} out of 100 left`, 'Leaving rate']}
                />
                <Bar dataKey="rate" radius={[0, 6, 6, 0]} barSize={24}>
                  {everydayStoryBars.map((item) => (
                    <Cell key={item.group} fill={item.tone} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Narrow Plain-Language Role Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Leaving rate by job role</CardTitle>
            <span className="text-[12px] text-ink-muted">Highest to lowest</span>
          </CardHeader>

          <ul className="space-y-3" role="list">
            {dashboard.eda_role_rates.map((role) => {
              const barClass =
                role.rate >= 30
                  ? 'bg-risk'
                  : role.rate >= 20
                    ? 'bg-warn'
                    : role.rate >= 12
                      ? 'bg-info'
                      : 'bg-brand';
              return (
                <li key={role.JobRole} className="space-y-1">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="truncate text-ink-primary">{role.JobRole}</span>
                    <span className="ml-2 shrink-0 font-mono text-[12px] font-medium text-ink-secondary tabular-nums">
                      {role.rate.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-raised">
                    <div
                      className={`h-2 rounded-full ${barClass}`}
                      style={{
                        width: `${Math.min((role.rate / 42) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {/* Optional Expandable Technical ML Section (Hidden by default for non-technical users!) */}
      <AnimatePresence initial={false}>
        {showTechnical && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Holdout ROC curves (294 unseen records)</CardTitle>
                    <p className="mt-0.5 text-[12px] text-ink-muted">
                      True probability curves comparing Stacking Ensemble, Logistic Regression, XGBoost, and Random Forest
                    </p>
                  </div>
                </CardHeader>

                <div className="h-[290px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rocPlotData} margin={{ top: 8, right: 16, left: -10, bottom: 8 }}>
                      <CartesianGrid stroke="rgba(31,27,22,0.07)" vertical={false} />
                      <XAxis
                        dataKey="fpr"
                        tick={{ fontSize: 11, fill: '#766d62', fontFamily: 'IBM Plex Mono' }}
                        tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
                      />
                      <YAxis
                        domain={[0, 1]}
                        tick={{ fontSize: 11, fill: '#766d62', fontFamily: 'IBM Plex Mono' }}
                        tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid rgba(31,27,22,0.12)',
                          borderRadius: '10px',
                          fontSize: '12px',
                          fontFamily: 'IBM Plex Mono',
                        }}
                        formatter={(v, n) => [`${(Number(v) * 100).toFixed(1)}%`, String(n)]}
                      />
                      <Line type="monotone" dataKey="random" name="Random" stroke="#d4cec4" strokeDasharray="4 4" dot={false} />
                      <Line type="monotone" dataKey="rf" name="Random forest (0.798)" stroke="#b45309" strokeWidth={1.6} dot={false} />
                      <Line type="monotone" dataKey="xgboost" name="XGBoost (0.806)" stroke="#1d4ed8" strokeWidth={1.8} dot={false} />
                      <Line type="monotone" dataKey="logistic" name="Logistic reg (0.834)" stroke="#1f1b16" strokeWidth={1.9} dot={false} />
                      <Line type="monotone" dataKey="stacking" name="Stacking ens (0.835)" stroke="#0f766e" strokeWidth={2.6} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>TF.js export fidelity</CardTitle>
                  <span className="font-mono text-[12px] text-ink-muted">Python vs browser</span>
                </CardHeader>
                <div className="space-y-3">
                  {dashboard.tfjs_export_summary.map((item) => (
                    <div
                      key={item.name}
                      className="rounded-xl border border-hairline bg-card p-3"
                    >
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="font-medium text-ink-primary">
                          {item.name.replace(/_/g, ' ')}
                        </span>
                        <span className="font-mono text-[12px] text-brand tabular-nums">
                          {item.size_kb.toFixed(1)} KB
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between font-mono text-[11px] text-ink-secondary tabular-nums">
                        <span>Corr {item.test_corr_vs_teacher.toFixed(4)}</span>
                        <span>
                          AUC {item.teacher_test_roc_auc.toFixed(4)} → {item.tfjs_test_roc_auc.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Holdout evaluation matrix (HR high-recall thresholds)</CardTitle>
                <span className="font-mono text-[12px] text-ink-muted">294 test records</span>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-hairline text-ink-muted">
                      <th className="py-2.5 pr-4 font-medium">Model</th>
                      <th className="px-3 py-2.5 text-right font-medium">Threshold τ</th>
                      <th className="px-3 py-2.5 text-right font-medium">ROC-AUC</th>
                      <th className="px-3 py-2.5 text-right font-medium">PR-AUC</th>
                      <th className="px-3 py-2.5 text-right font-medium">Accuracy</th>
                      <th className="px-3 py-2.5 text-right font-medium">Recall</th>
                      <th className="px-3 py-2.5 text-right font-medium">F1</th>
                      <th className="pl-3 py-2.5 text-right font-medium">Brier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {technicalModels.map((name) => {
                      const m = dashboard.test_metrics_hr_recall[name];
                      const isChamp = name === dashboard.champion_model;
                      return (
                        <tr
                          key={name}
                          className={
                            isChamp
                              ? 'border-b border-hairline bg-brand-soft/60'
                              : 'border-b border-hairline hover:bg-card'
                          }
                        >
                          <td className="py-3 pr-4 font-medium text-ink-primary">
                            {name}
                            {isChamp && (
                              <span className="ms-2 font-mono text-[11px] text-brand">Best</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-right font-mono tabular-nums">
                            {m.threshold.toFixed(3)}
                          </td>
                          <td className="px-3 py-3 text-right font-mono tabular-nums">
                            {m.roc_auc.toFixed(4)}
                          </td>
                          <td className="px-3 py-3 text-right font-mono tabular-nums">
                            {m.pr_auc.toFixed(4)}
                          </td>
                          <td className="px-3 py-3 text-right font-mono tabular-nums">
                            {(m.accuracy * 100).toFixed(1)}%
                          </td>
                          <td className="px-3 py-3 text-right font-mono tabular-nums">
                            {(m.recall * 100).toFixed(1)}%
                          </td>
                          <td className="px-3 py-3 text-right font-mono font-medium tabular-nums">
                            {m.f1.toFixed(4)}
                          </td>
                          <td className="pl-3 py-3 text-right font-mono text-ink-secondary tabular-nums">
                            {m.brier.toFixed(4)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
