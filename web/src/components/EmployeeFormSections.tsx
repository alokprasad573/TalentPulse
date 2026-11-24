import { Briefcase, Clock, Heart } from 'lucide-react';
import {
  DEPARTMENTS,
  EDUCATION_FIELDS,
  HAPPINESS_WORDS,
  JOB_ROLES,
  RATING_WORDS,
} from '../data/presets';
import type { EmployeeInput } from '../ml/types';
import { Card, CardHeader, CardTitle } from './ui/Card';

interface EmployeeFormSectionsProps {
  input: EmployeeInput;
  onUpdate: <K extends keyof EmployeeInput>(key: K, value: EmployeeInput[K]) => void;
}

export function EmployeeFormSections({ input, onUpdate }: EmployeeFormSectionsProps) {
  return (
    <div className="space-y-6">
      {/* Section 1: Pay, Job & Extra Hours */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-info-soft text-info">
              <Briefcase className="size-4" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div>
              <CardTitle>Job, pay and extra hours</CardTitle>
              <p className="text-[12px] text-ink-muted">These affect leaving chance the most</p>
            </div>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-[13px] font-medium text-ink-secondary">What is their job?</span>
            <select
              value={input.JobRole}
              onChange={(e) => onUpdate('JobRole', e.target.value as EmployeeInput['JobRole'])}
              className="h-10 w-full rounded-lg border border-hairline bg-card px-3 text-[14px] text-ink-primary transition-colors duration-[var(--duration-fast)] focus:border-brand focus:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {JOB_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-[13px] font-medium text-ink-secondary">Which team?</span>
            <select
              value={input.Department}
              onChange={(e) => onUpdate('Department', e.target.value as EmployeeInput['Department'])}
              className="h-10 w-full rounded-lg border border-hairline bg-card px-3 text-[14px] text-ink-primary transition-colors duration-[var(--duration-fast)] focus:border-brand focus:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-2 rounded-xl bg-card p-3.5 border border-hairline">
            <div className="flex items-center justify-between text-[13px]">
              <label htmlFor="slider-income" className="font-medium text-ink-secondary">
                Monthly pay
              </label>
              <span className="font-mono text-[14px] font-medium text-ink-primary tabular-nums">
                ${input.MonthlyIncome.toLocaleString()} / mo
              </span>
            </div>
            <input
              id="slider-income"
              type="range"
              min={1000}
              max={20000}
              step={100}
              value={input.MonthlyIncome}
              onChange={(e) => onUpdate('MonthlyIncome', Number(e.target.value))}
              className="tp-slider"
            />
            <div className="flex justify-between font-mono text-[11px] text-ink-muted">
              <span>$1,000</span>
              <span>$20,000</span>
            </div>
          </div>

          <div className="space-y-2 rounded-xl bg-card p-3.5 border border-hairline">
            <div className="flex items-center justify-between text-[13px]">
              <label htmlFor="slider-hike" className="font-medium text-ink-secondary">
                Last yearly pay raise
              </label>
              <span className="font-mono text-[14px] font-medium text-ink-primary tabular-nums">
                {input.PercentSalaryHike}%
              </span>
            </div>
            <input
              id="slider-hike"
              type="range"
              min={11}
              max={25}
              step={1}
              value={input.PercentSalaryHike}
              onChange={(e) => onUpdate('PercentSalaryHike', Number(e.target.value))}
              className="tp-slider"
            />
            <div className="flex justify-between font-mono text-[11px] text-ink-muted">
              <span>11%</span>
              <span>25%</span>
            </div>
          </div>

          {/* Overtime Toggle */}
          <div className="space-y-1.5">
            <span className="text-[13px] font-medium text-ink-secondary">
              Works extra hours (overtime)?
            </span>
            <div role="group" aria-label="Works extra hours" className="grid grid-cols-2 gap-1 rounded-lg bg-raised p-1">
              {(['No', 'Yes'] as const).map((opt) => {
                const active = input.OverTime === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onUpdate('OverTime', opt)}
                    className={`h-9 rounded-md text-[13px] font-medium transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                      active
                        ? opt === 'Yes'
                          ? 'bg-risk text-white shadow-[var(--shadow-card)]'
                          : 'bg-brand text-white shadow-[var(--shadow-card)]'
                        : 'text-ink-secondary hover:text-ink-primary'
                    }`}
                  >
                    {opt === 'Yes' ? 'Yes, works overtime' : 'No, regular hours'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Work Travel */}
          <div className="space-y-1.5">
            <span className="text-[13px] font-medium text-ink-secondary">Travels for work?</span>
            <div role="group" aria-label="Travels for work" className="grid grid-cols-3 gap-1 rounded-lg bg-raised p-1">
              {(
                [
                  ['Non-Travel', 'Never'],
                  ['Travel_Rarely', 'Sometimes'],
                  ['Travel_Frequently', 'Often'],
                ] as const
              ).map(([val, lbl]) => (
                <button
                  key={val}
                  type="button"
                  aria-pressed={input.BusinessTravel === val}
                  onClick={() => onUpdate('BusinessTravel', val)}
                  className={`h-9 rounded-md text-[13px] font-medium transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                    input.BusinessTravel === val
                      ? 'bg-surface text-ink-primary shadow-[var(--shadow-card)]'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {/* Seniority Level */}
          <div className="space-y-1.5">
            <span className="text-[13px] font-medium text-ink-secondary">
              Job rank (1 = starter, 5 = head)
            </span>
            <div role="group" aria-label="Job rank" className="grid grid-cols-5 gap-1 rounded-lg bg-raised p-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  aria-pressed={input.JobLevel === lvl}
                  onClick={() => onUpdate('JobLevel', lvl)}
                  className={`h-9 rounded-md font-mono text-[13px] tabular-nums transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                    input.JobLevel === lvl
                      ? 'bg-surface font-medium text-ink-primary shadow-[var(--shadow-card)]'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Company Shares / Bonus Tier */}
          <div className="space-y-1.5">
            <span className="text-[13px] font-medium text-ink-secondary">
              Company share bonus (0 = none)
            </span>
            <div role="group" aria-label="Company share bonus" className="grid grid-cols-4 gap-1 rounded-lg bg-raised p-1">
              {[0, 1, 2, 3].map((tier) => (
                <button
                  key={tier}
                  type="button"
                  aria-pressed={input.StockOptionLevel === tier}
                  onClick={() => onUpdate('StockOptionLevel', tier)}
                  className={`h-9 rounded-md text-[13px] font-medium transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                    input.StockOptionLevel === tier
                      ? 'bg-surface text-ink-primary shadow-[var(--shadow-card)]'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  {tier === 0 ? 'None' : `Tier ${tier}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Section 2: Happiness & Daily Comfort (Plain Words!) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-safe-soft text-safe">
              <Heart className="size-4" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div>
              <CardTitle>How happy is this worker?</CardTitle>
              <p className="text-[12px] text-ink-muted">Pick the word that fits best right now</p>
            </div>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {(
            [
              ['JobSatisfaction', 'Happiness with daily work', HAPPINESS_WORDS],
              ['WorkLifeBalance', 'Time for family and rest', RATING_WORDS],
              ['EnvironmentSatisfaction', 'Comfort at workplace', RATING_WORDS],
              ['JobInvolvement', 'Interest in their work', RATING_WORDS],
              ['RelationshipSatisfaction', 'Bond with coworkers', RATING_WORDS],
            ] as const
          ).map(([fieldKey, label, words]) => (
            <div key={fieldKey} className="space-y-1.5">
              <span className="text-[13px] font-medium text-ink-secondary">{label}</span>
              <div role="group" aria-label={label} className="grid grid-cols-4 gap-1 rounded-lg bg-raised p-1">
                {[1, 2, 3, 4].map((val) => {
                  const active = input[fieldKey] === val;
                  const activeColor =
                    val === 1
                      ? 'bg-risk text-white'
                      : val === 2
                        ? 'bg-warn text-white'
                        : 'bg-brand text-white';
                  return (
                    <button
                      key={val}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onUpdate(fieldKey, val)}
                      className={`h-9 rounded-md px-1 text-[12px] font-medium transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                        active
                          ? `${activeColor} shadow-[var(--shadow-card)]`
                          : 'text-ink-secondary hover:text-ink-primary'
                      }`}
                    >
                      {words[val - 1]}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Section 3: Time at Company & Personal Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-warn-soft text-warn">
              <Clock className="size-4" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div>
              <CardTitle>Time at company and background</CardTitle>
              <p className="text-[12px] text-ink-muted">
                New hires and long waits without promotion leave more often
              </p>
            </div>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(
            [
              ['Age', 'Worker age', 18, 60, 'yrs'],
              ['DistanceFromHome', 'Home to office distance', 1, 29, 'km'],
              ['NumCompaniesWorked', 'Past companies worked', 0, 9, ''],
              ['TotalWorkingYears', 'Total career years', 0, Math.max(input.Age - 18, 0), 'yrs'],
              ['YearsAtCompany', 'Years at this company', 0, input.TotalWorkingYears, 'yrs'],
              ['YearsInCurrentRole', 'Years in same job', 0, Math.min(input.YearsAtCompany, 18), 'yrs'],
              ['YearsSinceLastPromotion', 'Years since last promotion', 0, Math.min(input.YearsAtCompany, 15), 'yrs'],
              ['YearsWithCurrManager', 'Years with current boss', 0, Math.min(input.YearsAtCompany, 17), 'yrs'],
              ['TrainingTimesLastYear', 'Trainings last year', 0, 6, ''],
            ] as const
          ).map(([fieldKey, label, minVal, maxVal, unit]) => (
            <div key={fieldKey} className="space-y-2 rounded-xl border border-hairline bg-card p-3">
              <div className="flex items-center justify-between gap-2 text-[13px]">
                <label htmlFor={`slider-${fieldKey}`} className="text-ink-secondary">
                  {label}
                </label>
                <span className="shrink-0 font-mono text-[13px] font-medium text-ink-primary tabular-nums">
                  {input[fieldKey]} {unit}
                </span>
              </div>
              <input
                id={`slider-${fieldKey}`}
                type="range"
                min={minVal}
                max={Math.max(maxVal, minVal)}
                value={input[fieldKey]}
                onChange={(e) => onUpdate(fieldKey, Number(e.target.value))}
                className="tp-slider"
              />
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-hairline pt-5 md:grid-cols-3">
          <div className="space-y-1.5">
            <span className="text-[13px] font-medium text-ink-secondary">Family status</span>
            <div role="group" aria-label="Family status" className="grid grid-cols-3 gap-1 rounded-lg bg-raised p-1">
              {(['Married', 'Divorced', 'Single'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  aria-pressed={input.MaritalStatus === status}
                  onClick={() => onUpdate('MaritalStatus', status)}
                  className={`h-9 rounded-md text-[13px] font-medium transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                    input.MaritalStatus === status
                      ? 'bg-surface text-ink-primary shadow-[var(--shadow-card)]'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <label className="block space-y-1.5">
            <span className="text-[13px] font-medium text-ink-secondary">Study background</span>
            <select
              value={input.EducationField}
              onChange={(e) =>
                onUpdate('EducationField', e.target.value as EmployeeInput['EducationField'])
              }
              className="h-10 w-full rounded-lg border border-hairline bg-card px-3 text-[14px] text-ink-primary focus:border-brand focus:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {EDUCATION_FIELDS.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-1.5">
            <span className="text-[13px] font-medium text-ink-secondary">Gender</span>
            <div role="group" aria-label="Gender" className="grid grid-cols-2 gap-1 rounded-lg bg-raised p-1">
              {(['Female', 'Male'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  aria-pressed={input.Gender === g}
                  onClick={() => onUpdate('Gender', g)}
                  className={`h-9 rounded-md text-[13px] font-medium transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                    input.Gender === g
                      ? 'bg-surface text-ink-primary shadow-[var(--shadow-card)]'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
