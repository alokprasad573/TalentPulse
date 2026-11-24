import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import gsap from 'gsap';
import { BarChart3, HelpCircle, Menu, UserCheck, X } from 'lucide-react';
import { EMPLOYEE_PRESETS } from './data/presets';
import { useReducedMotion } from './hooks/useReducedMotion';
import {
  loadTalentPulseEngine,
  predictEmployeeAttrition,
  type LoadedModelsBundle,
} from './ml/tfjsEngine';
import type { EmployeeInput, ThresholdMode } from './ml/types';
import { RiskProfileView } from './components/RiskProfileView';
import { ModelHubView } from './components/ModelHubView';
import { MethodologyView } from './components/MethodologyView';

type NavTab = 'profile' | 'hub' | 'methodology';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const NAV_ITEMS: Array<{ id: NavTab; label: string; hint: string; icon: typeof UserCheck }> = [
  { id: 'profile', label: 'Check one worker', hint: 'Live score and tips', icon: UserCheck },
  { id: 'hub', label: 'Why workers leave', hint: 'Charts and accuracy', icon: BarChart3 },
  { id: 'methodology', label: 'How it works', hint: 'Plain 3-step guide', icon: HelpCircle },
];

export default function App() {
  const [engine, setEngine] = useState<LoadedModelsBundle | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('profile');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [employeeInput, setEmployeeInput] = useState<EmployeeInput>(EMPLOYEE_PRESETS[0].values);
  const [thresholdMode, setThresholdMode] = useState<ThresholdMode>('hr_high_recall');

  const shellRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let mounted = true;
    loadTalentPulseEngine()
      .then((bundle) => {
        if (mounted) setEngine(bundle);
      })
      .catch((err: unknown) => {
        if (mounted) {
          setLoadError(err instanceof Error ? err.message : 'Unable to load browser AI models');
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!engine || !shellRef.current || reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.from('.tp-enter', {
        y: 10,
        opacity: 0,
        duration: 0.38,
        stagger: 0.05,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });
    }, shellRef);
    return () => ctx.revert();
  }, [engine, reducedMotion]);

  const prediction = useMemo(() => {
    if (!engine) return null;
    return predictEmployeeAttrition(engine, employeeInput);
  }, [engine, employeeInput]);

  const handleTabSelect = (tab: NavTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <MotionConfig reducedMotion="user">
    <div ref={shellRef} className="min-h-screen bg-page text-ink-primary">
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-hairline bg-surface px-4 lg:hidden">
        <div className="flex items-center gap-2.5">
          <BrandMark />
          <span className="text-[16px] font-medium text-ink-primary">TalentPulse</span>
        </div>
        <button
          type="button"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((o) => !o)}
          className="inline-flex size-10 items-center justify-center rounded-lg border border-hairline text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          aria-label="Open menu"
        >
          {mobileMenuOpen ? (
            <X className="size-4" strokeWidth={1.75} />
          ) : (
            <Menu className="size-4" strokeWidth={1.75} />
          )}
        </button>
      </header>

      <div className="flex min-h-screen">
        {/* Desktop & Mobile Sidebar (256px) */}
        <aside
          className={`${
            mobileMenuOpen ? 'fixed inset-y-0 start-0 z-40 block shadow-[var(--shadow-float)]' : 'hidden'
          } w-64 shrink-0 border-e border-hairline bg-surface lg:sticky lg:top-0 lg:block lg:h-screen`}
        >
          <div className="flex h-full flex-col justify-between p-4">
            <div>
              <div className="flex h-10 items-center gap-2.5 px-2">
                <BrandMark />
                <span className="text-[18px] font-semibold tracking-[-0.01em] text-ink-primary">
                  TalentPulse
                </span>
              </div>

              <p className="mt-2 px-2 text-[13px] leading-[19px] text-ink-secondary">
                Simple staff stay-or-leave checker for any manager.
              </p>

              <nav className="mt-6" aria-label="Main sections">
                <p className="mb-2 px-2 text-[12px] font-medium text-ink-muted">Sections</p>
                <ul className="space-y-1.5">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active = activeTab === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          aria-current={active ? 'page' : undefined}
                          onClick={() => handleTabSelect(item.id)}
                          className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                            active
                              ? 'text-brand'
                              : 'text-ink-secondary hover:bg-card hover:text-ink-primary'
                          }`}
                        >
                          {active && (
                            <motion.span
                              layoutId="activeNavRow"
                              transition={{ duration: 0.22, ease: EASE }}
                              className="absolute inset-0 rounded-xl border border-brand/20 bg-brand-soft"
                            />
                          )}
                          <span className="relative z-10 flex size-5 shrink-0 items-center justify-center">
                            <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
                          </span>
                          <span className="relative z-10 min-w-0">
                            <span className="block text-[14px] font-medium leading-tight">
                              {item.label}
                            </span>
                            <span className="mt-0.5 block text-[11px] text-ink-muted">
                              {item.hint}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            {/* Quiet Status & Privacy Box */}
            <div className="space-y-2.5 rounded-xl border border-hairline bg-card p-3.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="inline-flex items-center gap-2 font-medium text-ink-primary">
                  <span
                    className={`size-2 rounded-full ${
                      engine ? 'bg-safe' : loadError ? 'bg-risk' : 'bg-warn'
                    }`}
                  />
                  {engine ? 'Ready on your device' : loadError ? 'Could not load' : 'Starting up'}
                </span>
              </div>
              <p className="text-[12px] leading-[17px] text-ink-secondary">
                Everything runs privately inside your browser. Zero staff details are sent to any server.
              </p>
            </div>
          </div>
        </aside>

        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-30 bg-ink-primary/25 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1440px]">
            {loadError ? (
              <div className="rounded-2xl border border-risk/25 bg-surface p-6 shadow-[var(--shadow-card)]">
                <h1 className="text-[18px] font-medium text-risk">
                  Browser models could not load
                </h1>
                <p className="mt-2 text-[14px] text-ink-secondary">{loadError}</p>
                <p className="mt-3 font-mono text-[12px] text-ink-muted">
                  Run python export_tfjs.py to create web/public/models/tfjs files.
                </p>
              </div>
            ) : !engine || !prediction ? (
              <div className="space-y-6" aria-busy="true" aria-label="Loading retention checker">
                <div className="h-24 rounded-2xl border border-hairline bg-surface" />
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.12fr_0.88fr]">
                  <div className="h-[460px] rounded-2xl border border-hairline bg-surface" />
                  <div className="h-[460px] rounded-2xl border border-hairline bg-surface" />
                </div>
              </div>
            ) : (
              <div className="tp-enter">
                <AnimatePresence mode="wait">
                  {activeTab === 'profile' && (
                    <motion.div
                      key="profile"
                      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reducedMotion ? undefined : { opacity: 0, y: -4 }}
                      transition={{ duration: 0.24, ease: EASE }}
                    >
                      <RiskProfileView
                        input={employeeInput}
                        onChange={setEmployeeInput}
                        prediction={prediction}
                        dashboard={engine.dashboard}
                        thresholdMode={thresholdMode}
                        onThresholdModeChange={setThresholdMode}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'hub' && (
                    <motion.div
                      key="hub"
                      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reducedMotion ? undefined : { opacity: 0, y: -4 }}
                      transition={{ duration: 0.24, ease: EASE }}
                    >
                      <ModelHubView dashboard={engine.dashboard} />
                    </motion.div>
                  )}

                  {activeTab === 'methodology' && (
                    <motion.div
                      key="methodology"
                      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reducedMotion ? undefined : { opacity: 0, y: -4 }}
                      transition={{ duration: 0.24, ease: EASE }}
                    >
                      <MethodologyView dashboard={engine.dashboard} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
    </MotionConfig>
  );
}

function BrandMark() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="6" fill="#0f766e" />
      <path
        d="M5.5 13H8.8L10.6 8.5L13.4 15.5L15.2 11.5H18.5"
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
