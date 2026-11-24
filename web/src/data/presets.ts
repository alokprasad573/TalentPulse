import type { EmployeeInput } from '../ml/types';

export interface EmployeePreset {
  id: string;
  label: string;
  summary: string;
  tone: 'safe' | 'warn' | 'risk';
  values: EmployeeInput;
}

export const EMPLOYEE_PRESETS: EmployeePreset[] = [
  {
    id: 'balanced-engineer',
    label: 'Happy worker',
    summary: 'Fair pay, normal hours, likes the team',
    tone: 'safe',
    values: {
      Age: 36,
      BusinessTravel: 'Travel_Rarely',
      Department: 'Research & Development',
      DistanceFromHome: 7,
      Education: 3,
      EducationField: 'Life Sciences',
      EnvironmentSatisfaction: 3,
      Gender: 'Female',
      JobInvolvement: 3,
      JobLevel: 2,
      JobRole: 'Research Scientist',
      JobSatisfaction: 3,
      MaritalStatus: 'Married',
      MonthlyIncome: 6200,
      NumCompaniesWorked: 2,
      OverTime: 'No',
      PercentSalaryHike: 14,
      PerformanceRating: 3,
      RelationshipSatisfaction: 3,
      StockOptionLevel: 1,
      TotalWorkingYears: 10,
      TrainingTimesLastYear: 3,
      WorkLifeBalance: 3,
      YearsAtCompany: 5,
      YearsInCurrentRole: 3,
      YearsSinceLastPromotion: 1,
      YearsWithCurrManager: 3,
    },
  },
  {
    id: 'frontline-sales',
    label: 'Overworked sales staff',
    summary: 'Extra hours, low pay, new to company',
    tone: 'risk',
    values: {
      Age: 25,
      BusinessTravel: 'Travel_Frequently',
      Department: 'Sales',
      DistanceFromHome: 18,
      Education: 2,
      EducationField: 'Marketing',
      EnvironmentSatisfaction: 2,
      Gender: 'Male',
      JobInvolvement: 2,
      JobLevel: 1,
      JobRole: 'Sales Representative',
      JobSatisfaction: 1,
      MaritalStatus: 'Single',
      MonthlyIncome: 2550,
      NumCompaniesWorked: 4,
      OverTime: 'Yes',
      PercentSalaryHike: 11,
      PerformanceRating: 3,
      RelationshipSatisfaction: 2,
      StockOptionLevel: 0,
      TotalWorkingYears: 3,
      TrainingTimesLastYear: 1,
      WorkLifeBalance: 1,
      YearsAtCompany: 1,
      YearsInCurrentRole: 0,
      YearsSinceLastPromotion: 0,
      YearsWithCurrManager: 0,
    },
  },
  {
    id: 'stagnant-lab',
    label: 'Waiting for promotion',
    summary: 'Extra hours, 5 years in same spot',
    tone: 'warn',
    values: {
      Age: 32,
      BusinessTravel: 'Travel_Rarely',
      Department: 'Research & Development',
      DistanceFromHome: 16,
      Education: 3,
      EducationField: 'Technical Degree',
      EnvironmentSatisfaction: 1,
      Gender: 'Male',
      JobInvolvement: 2,
      JobLevel: 1,
      JobRole: 'Laboratory Technician',
      JobSatisfaction: 2,
      MaritalStatus: 'Single',
      MonthlyIncome: 3100,
      NumCompaniesWorked: 5,
      OverTime: 'Yes',
      PercentSalaryHike: 12,
      PerformanceRating: 3,
      RelationshipSatisfaction: 2,
      StockOptionLevel: 0,
      TotalWorkingYears: 8,
      TrainingTimesLastYear: 2,
      WorkLifeBalance: 2,
      YearsAtCompany: 6,
      YearsInCurrentRole: 4,
      YearsSinceLastPromotion: 5,
      YearsWithCurrManager: 1,
    },
  },
  {
    id: 'tenured-director',
    label: 'Long-time leader',
    summary: '12 years here, strong pay and balance',
    tone: 'safe',
    values: {
      Age: 48,
      BusinessTravel: 'Non-Travel',
      Department: 'Research & Development',
      DistanceFromHome: 4,
      Education: 4,
      EducationField: 'Medical',
      EnvironmentSatisfaction: 4,
      Gender: 'Female',
      JobInvolvement: 3,
      JobLevel: 4,
      JobRole: 'Research Director',
      JobSatisfaction: 4,
      MaritalStatus: 'Married',
      MonthlyIncome: 16400,
      NumCompaniesWorked: 1,
      OverTime: 'No',
      PercentSalaryHike: 16,
      PerformanceRating: 3,
      RelationshipSatisfaction: 4,
      StockOptionLevel: 2,
      TotalWorkingYears: 22,
      TrainingTimesLastYear: 3,
      WorkLifeBalance: 3,
      YearsAtCompany: 12,
      YearsInCurrentRole: 7,
      YearsSinceLastPromotion: 2,
      YearsWithCurrManager: 8,
    },
  },
];

export const RATING_WORDS = ['Poor', 'Okay', 'Good', 'Great'] as const;
export const HAPPINESS_WORDS = ['Unhappy', 'Okay', 'Happy', 'Very happy'] as const;

export const JOB_ROLES: EmployeeInput['JobRole'][] = [
  'Sales Representative',
  'Laboratory Technician',
  'Human Resources',
  'Sales Executive',
  'Research Scientist',
  'Healthcare Representative',
  'Manufacturing Director',
  'Manager',
  'Research Director',
];

export const DEPARTMENTS: EmployeeInput['Department'][] = [
  'Sales',
  'Research & Development',
  'Human Resources',
];

export const EDUCATION_FIELDS: EmployeeInput['EducationField'][] = [
  'Life Sciences',
  'Medical',
  'Marketing',
  'Technical Degree',
  'Human Resources',
  'Other',
];

export interface ManagerActionStep {
  title: string;
  detail: string;
  priority: 'urgent' | 'helpful' | 'keep';
}

/**
 * Generates plain-language, practical steps a manager can take immediately
 * based on the current worker profile.
 */
export function getManagerActionSteps(
  input: EmployeeInput,
  payVsRoleMedian: number,
  riskProb: number,
  threshold: number
): ManagerActionStep[] {
  const steps: ManagerActionStep[] = [];

  if (input.OverTime === 'Yes') {
    steps.push({
      title: 'Cut back extra overtime hours',
      detail: 'Workers doing overtime leave 3 times more often (30.5% vs 10.4%). Share heavy tasks across the team.',
      priority: 'urgent',
    });
  }

  if (payVsRoleMedian < 0.9 || input.MonthlyIncome < 3500) {
    steps.push({
      title: 'Review monthly pay against teammates',
      detail: `Pay is at ${Math.round(payVsRoleMedian * 100)}% of the typical pay for a ${input.JobRole}. A fair pay bump lowers leaving risk.`,
      priority: 'urgent',
    });
  }

  if (input.JobSatisfaction <= 2 || input.EnvironmentSatisfaction <= 2 || input.WorkLifeBalance <= 2) {
    steps.push({
      title: 'Hold a private 15-minute check-in this week',
      detail: 'Low day-to-day happiness or poor home-life balance is a top early sign before someone resigns.',
      priority: 'urgent',
    });
  }

  if (input.YearsAtCompany <= 1) {
    steps.push({
      title: 'Pair with a friendly buddy in year one',
      detail: 'New hires in their first year leave at 34.9% compared to 12.9% after year one. Early support keeps them grounded.',
      priority: 'helpful',
    });
  }

  if (input.YearsSinceLastPromotion >= 3 && input.YearsAtCompany >= 4) {
    steps.push({
      title: 'Map out a clear next promotion step',
      detail: `It has been ${input.YearsSinceLastPromotion} years since their last promotion. Share what skills lead to the next level.`,
      priority: 'helpful',
    });
  }

  if (input.StockOptionLevel === 0 && input.OverTime === 'Yes') {
    steps.push({
      title: 'Add retention bonus or company share plan',
      detail: 'Staff working overtime with zero company shares leave at 45.1%. Long-term rewards help them stay.',
      priority: 'helpful',
    });
  }

  if (steps.length === 0 || riskProb < threshold) {
    steps.push({
      title: 'Keep current work routine and recognize good work',
      detail: 'Pay, hours, and happiness look steady. Regular thank-yous and yearly growth talks keep strong staff loyal.',
      priority: 'keep',
    });
  }

  return steps.slice(0, 3);
}
