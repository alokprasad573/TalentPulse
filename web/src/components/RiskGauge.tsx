import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { AlertCircle, AlertTriangle, Clock, Heart, ShieldCheck, Wallet } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface RiskGaugeProps {
  probability: number;
  threshold: number;
  burnoutScore: number;
  engagementRatio: number;
  payRatio: number;
  overtimeYes: boolean;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function RiskGauge({
  probability,
  threshold,
  burnoutScore,
  engagementRatio,
  payRatio,
  overtimeYes,
}: RiskGaugeProps) {
  const numberRef = useRef<HTMLSpanElement | null>(null);
  const arcRef = useRef<SVGPathElement | null>(null);
  const needleRef = useRef<SVGGElement | null>(null);
  const tweenState = useRef({ value: 0 });
  const reducedMotion = useReducedMotion();

  const clamped = Math.min(Math.max(probability, 0), 1);
  const isHigh = clamped >= Math.max(threshold * 1.45, 0.45);
  const isWatch = !isHigh && clamped >= threshold;

  const statusTitle = isHigh
    ? 'High chance of leaving'
    : isWatch
      ? 'Needs a check-in soon'
      : 'Likely to stay';

  const statusHelper = isHigh
    ? 'Talk with this worker this week about pay, hours, or support.'
    : isWatch
      ? 'Some early warning signs are showing. A short 1-on-1 talk helps.'
      : 'Pay, hours, and work happiness look balanced right now.';

  const strokeColor = isHigh
    ? 'var(--tone-risk)'
    : isWatch
      ? 'var(--tone-warn)'
      : 'var(--tone-safe)';
  const bannerBg = isHigh ? 'bg-risk-soft' : isWatch ? 'bg-warn-soft' : 'bg-safe-soft';
  const bannerText = isHigh ? 'text-risk' : isWatch ? 'text-warn' : 'text-safe';
  const StatusIcon = isHigh ? AlertTriangle : isWatch ? AlertCircle : ShieldCheck;

  const radius = 92;
  const arcLength = Math.PI * radius;

  const thrAngleRad = Math.PI * (1 - threshold);
  const tickInnerX = 126 + (radius - 10) * Math.cos(thrAngleRad);
  const tickInnerY = 122 - (radius - 10) * Math.sin(thrAngleRad);
  const tickOuterX = 126 + (radius + 10) * Math.cos(thrAngleRad);
  const tickOuterY = 122 - (radius + 10) * Math.sin(thrAngleRad);
  const tickLabelX = 126 + (radius + 22) * Math.cos(thrAngleRad);
  const tickLabelY = 122 - (radius + 22) * Math.sin(thrAngleRad);

  useEffect(() => {
    const targetPct = clamped * 100;
    const targetOffset = arcLength * (1 - clamped);
    const targetDeg = -90 + clamped * 180;
    const dur = reducedMotion ? 0 : 0.4;

    gsap.killTweensOf(tweenState.current);
    gsap.to(tweenState.current, {
      value: targetPct,
      duration: dur,
      ease: 'power3.out',
      onUpdate: () => {
        if (numberRef.current) {
          numberRef.current.textContent = `${Math.round(tweenState.current.value)}%`;
        }
      },
    });

    if (arcRef.current) {
      gsap.to(arcRef.current, {
        strokeDashoffset: targetOffset,
        duration: dur,
        ease: 'power3.out',
      });
    }

    if (needleRef.current) {
      gsap.to(needleRef.current, {
        rotation: targetDeg,
        svgOrigin: '126 122',
        duration: dur,
        ease: 'power3.out',
      });
    }
  }, [clamped, arcLength, reducedMotion]);

  // 3 everyday visual health meters so anyone sees WHY the score is high or low
  const happyPct = Math.min(Math.max(engagementRatio, 0.12), 1);
  const happyWord = happyPct >= 0.72 ? 'Happy' : happyPct >= 0.5 ? 'Okay' : 'Unhappy';
  const happyTone =
    happyPct >= 0.72
      ? { bar: 'bg-safe', text: 'text-safe', iconBg: 'bg-safe-soft text-safe' }
      : happyPct >= 0.5
        ? { bar: 'bg-warn', text: 'text-warn', iconBg: 'bg-warn-soft text-warn' }
        : { bar: 'bg-risk', text: 'text-risk', iconBg: 'bg-risk-soft text-risk' };

  const payFill = Math.min(Math.max(payRatio / 1.35, 0.14), 1);
  const payWord = payRatio >= 1.05 ? 'Good pay' : payRatio >= 0.85 ? 'Fair pay' : 'Below peers';
  const payTone =
    payRatio >= 1.05
      ? { bar: 'bg-safe', text: 'text-safe', iconBg: 'bg-safe-soft text-safe' }
      : payRatio >= 0.85
        ? { bar: 'bg-info', text: 'text-info', iconBg: 'bg-info-soft text-info' }
        : { bar: 'bg-risk', text: 'text-risk', iconBg: 'bg-risk-soft text-risk' };

  const loadStress = Math.min(Math.max((burnoutScore + (overtimeYes ? 1.4 : 0)) / 6.5, 0.14), 1);
  const loadWord = overtimeYes || burnoutScore >= 3.2 ? 'Heavy load' : burnoutScore >= 2 ? 'Busy' : 'Steady';
  const loadTone =
    overtimeYes || burnoutScore >= 3.2
      ? { bar: 'bg-risk', text: 'text-risk', iconBg: 'bg-risk-soft text-risk' }
      : burnoutScore >= 2
        ? { bar: 'bg-warn', text: 'text-warn', iconBg: 'bg-warn-soft text-warn' }
        : { bar: 'bg-safe', text: 'text-safe', iconBg: 'bg-safe-soft text-safe' };

  const quickMeters = [
    {
      label: 'Daily happiness',
      word: happyWord,
      fill: happyPct,
      tone: happyTone,
      Icon: Heart,
    },
    {
      label: 'Pay vs teammates',
      word: payWord,
      fill: payFill,
      tone: payTone,
      Icon: Wallet,
    },
    {
      label: 'Hours and strain',
      word: loadWord,
      fill: loadStress,
      tone: loadTone,
      Icon: Clock,
    },
  ];

  return (
    <section
      data-slot="risk-gauge-card"
      className="rounded-2xl border border-hairline bg-surface p-6 shadow-[var(--shadow-card)]"
    >
      {/* Clear color + icon + plain-language verdict banner */}
      <div className={`flex items-start gap-3 rounded-xl p-4 ${bannerBg}`}>
        <span className={`mt-0.5 shrink-0 ${bannerText}`}>
          <StatusIcon className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className={`text-[17px] font-semibold leading-snug ${bannerText}`}>
              {statusTitle}
            </h2>
            <span className="text-[11px] font-medium text-ink-muted">Private · on your device</span>
          </div>
          <p className="mt-1 text-[13px] leading-[19px] text-ink-primary">{statusHelper}</p>
        </div>
      </div>

      {/* Side-by-side: GSAP Risk Dial + 3 Plain-Language Health Bars */}
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-[1.08fr_0.92fr] sm:items-center">
        <div className="flex flex-col items-center">
          <svg
            viewBox="0 0 252 148"
            className="w-full max-w-[248px] overflow-visible"
            role="img"
            aria-label={`Estimated leaving chance ${Math.round(clamped * 100)} percent`}
          >
            <path
              d="M 34 122 A 92 92 0 0 1 218 122"
              fill="none"
              stroke="rgba(31, 27, 22, 0.08)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path
              ref={arcRef}
              d="M 34 122 A 92 92 0 0 1 218 122"
              fill="none"
              stroke={strokeColor}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={arcLength}
              strokeDashoffset={arcLength}
            />

            <line
              x1={tickInnerX}
              y1={tickInnerY}
              x2={tickOuterX}
              y2={tickOuterY}
              stroke="var(--ink-primary)"
              strokeWidth="2"
            />
            <text
              x={tickLabelX}
              y={tickLabelY}
              textAnchor="middle"
              className="fill-ink-secondary font-mono text-[10px]"
            >
              {`Alert ${Math.round(threshold * 100)}%`}
            </text>

            <g ref={needleRef}>
              <line
                x1="126"
                y1="122"
                x2="126"
                y2="52"
                stroke="var(--ink-primary)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="126" cy="122" r="5" fill="var(--ink-primary)" />
            </g>

            <text x="34" y="142" textAnchor="middle" className="fill-safe font-sans text-[11px] font-medium">
              Safe
            </text>
            <text x="218" y="142" textAnchor="middle" className="fill-risk font-sans text-[11px] font-medium">
              High
            </text>
          </svg>

          <div className="-mt-6 text-center">
            <span
              ref={numberRef}
              className="font-mono text-[36px] font-medium leading-none tracking-[-0.02em] text-ink-primary tabular-nums"
            >
              {Math.round(clamped * 100)}%
            </span>
            <p className="mt-1.5 text-[12px] text-ink-secondary">
              Chance of leaving this year
            </p>
          </div>
        </div>

        {/* 3 Everyday Balance Meters */}
        <div className="space-y-3 rounded-xl border border-hairline bg-card p-4">
          <p className="text-[12px] font-medium text-ink-muted">3 signs at a glance</p>
          {quickMeters.map(({ label, word, fill, tone, Icon }) => (
            <div key={label} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-[12px]">
                <span className="inline-flex items-center gap-1.5 font-medium text-ink-primary">
                  <span
                    className={`flex size-5 items-center justify-center rounded-md ${tone.iconBg}`}
                    aria-hidden="true"
                  >
                    <Icon className="size-3" strokeWidth={1.85} />
                  </span>
                  {label}
                </span>
                <span className={`font-medium ${tone.text}`}>{word}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-raised">
                <motion.div
                  className={`h-2 w-full origin-left rounded-full ${tone.bar}`}
                  initial={false}
                  animate={{ scaleX: fill }}
                  transition={{ duration: 0.35, ease: EASE }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
