import type { EmployeeInput, FeatureContribution, PreprocessorSpec } from './types';

const TRAVEL_SCORE_MAP: Record<string, number> = {
  'Non-Travel': 0,
  Travel_Rarely: 1,
  Travel_Frequently: 2,
};

const FRIENDLY_LABELS: Record<string, string> = {
  OverTime_Yes: 'Works extra hours (overtime)',
  OverTime_x_Single: 'Extra hours while single',
  OverTime_x_NoStock: 'Extra hours with no share bonus',
  OverTime_x_FreqTravel: 'Extra hours plus frequent trips',
  OverTime_x_LowSat: 'Extra hours while unhappy at work',
  OverTime_x_LowIncome: 'Extra hours with pay under $4,000',
  OverTime_x_Distance: 'Extra hours plus long travel to work',
  OverTime_x_NewHire: 'Extra hours during first year',
  BurnoutIndex: 'Overall tiredness and workload',
  NoStockOptions: 'No company share benefits',
  Single_x_NoStock: 'Single with no share benefits',
  BusinessTravel_Travel_Frequently: 'Travels very often for work',
  BusinessTravel_Travel_Rarely: 'Occasional work travel',
  'JobRole_Sales Representative': 'Works in high-turnover sales role',
  'JobRole_Laboratory Technician': 'Works in lab technician role',
  'JobRole_Research Director': 'Senior research leadership role',
  'JobRole_Manufacturing Director': 'Manufacturing leadership role',
  'JobRole_Healthcare Representative': 'Healthcare representative role',
  'JobRole_Human Resources': 'Human resources role',
  'JobRole_Sales Executive': 'Sales executive role',
  'JobRole_Research Scientist': 'Research scientist role',
  JobRole_Manager: 'Team manager role',
  MaritalStatus_Single: 'Single (easier to switch jobs)',
  MaritalStatus_Married: 'Married (tends to stay longer)',
  EngagementScore: 'Overall happiness and involvement',
  TotalSatisfaction: 'Combined work happiness',
  LowSatisfactionCount: 'Number of unhappy areas',
  MinSatisfaction: 'Lowest happiness area',
  IncomeVsRoleMedian: 'Pay compared to teammates in same role',
  IncomeVsLevelMedian: 'Pay compared to same job level',
  IncomeVsDeptMedian: 'Pay compared to department average',
  TenureVsRoleMedian: 'Time at company vs same role',
  LogMonthlyIncome: 'Monthly take-home pay',
  MonthlyIncome: 'Monthly pay amount',
  YearsAtCompany: 'Years spent at this company',
  LogYearsAtCompany: 'Time built up at this company',
  TotalWorkingYears: 'Total career experience',
  LogTotalWorkingYears: 'Total years worked in career',
  YearsInCurrentRole: 'Years in current job',
  YearsWithCurrManager: 'Years with the same manager',
  YearsSinceLastPromotion: 'Years waiting for a promotion',
  PromotionStagnation: 'Long wait without a promotion',
  RoleStagnation: 'Time spent in the exact same role',
  ManagerLoyaltyRatio: 'Steady relationship with manager',
  TenureRatio: 'Share of career spent here',
  JobHopperRate: 'Switched past employers often',
  NumCompaniesWorked: 'Number of past employers',
  DistanceFromHome: 'Travel distance from home',
  LogDistanceFromHome: 'Daily commute distance',
  EnvironmentSatisfaction: 'Workplace comfort rating',
  JobSatisfaction: 'Job happiness rating',
  JobInvolvement: 'Interest and care in work',
  RelationshipSatisfaction: 'Bond with coworkers and manager',
  WorkLifeBalance: 'Time for family and rest',
  TrainingTimesLastYear: 'Training and learning received',
  StockOptionLevel: 'Company share bonus tier',
  StockOptionCat_1: 'Receives company shares (tier 1)',
  StockOptionCat_2: 'Receives strong company shares (tier 2)',
  StockOptionCat_3: 'Top company share tier (tier 3)',
  IsNewHire: 'Still in first year at company',
  Age: 'Worker age and career stage',
  JobLevel: 'Seniority level in company',
  Department_Sales: 'Sales department',
  'Department_Research & Development': 'Research and development team',
  Gender_Male: 'Gender group',
};

function yeoJohnsonTransform(x: number, lmbda: number): number {
  const eps = 1e-12;
  if (x >= 0) {
    if (Math.abs(lmbda) < eps) {
      return Math.log1p(x);
    }
    return (Math.pow(x + 1.0, lmbda) - 1.0) / lmbda;
  }
  if (Math.abs(lmbda - 2.0) < eps) {
    return -Math.log1p(-x);
  }
  return -(Math.pow(-x + 1.0, 2.0 - lmbda) - 1.0) / (2.0 - lmbda);
}

export interface EngineeredBundle {
  vector: Float32Array;
  engineeredSummary: {
    burnoutIndex: number;
    incomeVsRoleMedian: number;
    engagementScore: number;
    tenureRatio: number;
  };
  contributions: FeatureContribution[];
}

export function transformEmployeeInput(
  input: EmployeeInput,
  spec: PreprocessorSpec
): EngineeredBundle {
  const travelScore = TRAVEL_SCORE_MAP[input.BusinessTravel] ?? 1.0;
  const ot = input.OverTime === 'Yes' ? 1.0 : 0.0;
  const single = input.MaritalStatus === 'Single' ? 1.0 : 0.0;

  const twy = Number(input.TotalWorkingYears);
  const yac = Number(input.YearsAtCompany);
  const yir = Number(input.YearsInCurrentRole);
  const ysp = Number(input.YearsSinceLastPromotion);
  const ywm = Number(input.YearsWithCurrManager);
  const ncw = Number(input.NumCompaniesWorked);
  const inc = Number(input.MonthlyIncome);
  const age = Number(input.Age);
  const lvl = Math.max(Number(input.JobLevel), 1.0);
  const dist = Number(input.DistanceFromHome);

  const totalSatisfaction =
    input.EnvironmentSatisfaction +
    input.JobSatisfaction +
    input.RelationshipSatisfaction +
    input.WorkLifeBalance;
  const engagementScore = totalSatisfaction + input.JobInvolvement;
  const minSatisfaction = Math.min(
    input.EnvironmentSatisfaction,
    input.JobSatisfaction,
    input.RelationshipSatisfaction,
    input.WorkLifeBalance,
    input.JobInvolvement
  );
  const lowSatisfactionCount =
    (input.EnvironmentSatisfaction === 1 ? 1 : 0) +
    (input.JobSatisfaction === 1 ? 1 : 0) +
    (input.RelationshipSatisfaction === 1 ? 1 : 0) +
    (input.WorkLifeBalance === 1 ? 1 : 0) +
    (input.JobInvolvement === 1 ? 1 : 0);

  const roleMed = spec.medians.role_income[input.JobRole] ?? spec.medians.global_income;
  const lvlMed = spec.medians.level_income[String(Math.round(lvl))] ?? spec.medians.global_income;
  const deptMed = spec.medians.dept_income[input.Department] ?? spec.medians.global_income;
  const roleTen = spec.medians.role_tenure[input.JobRole] ?? spec.medians.global_tenure;

  const incomeVsRoleMedian = inc / (roleMed + 1.0);
  const tenureRatio = yac / (twy + 1.0);
  const noStock = input.StockOptionLevel === 0 ? 1.0 : 0.0;
  const isNewHire = yac <= 1.0 ? 1.0 : 0.0;
  const burnoutIndex =
    ot * 2.0 +
    travelScore * 0.75 +
    (4.0 - input.WorkLifeBalance) * 0.75 +
    (4.0 - input.JobSatisfaction) * 0.5;

  const numericMap: Record<string, number> = {
    Age: age,
    DistanceFromHome: dist,
    Education: Number(input.Education),
    EnvironmentSatisfaction: Number(input.EnvironmentSatisfaction),
    JobInvolvement: Number(input.JobInvolvement),
    JobLevel: Number(input.JobLevel),
    JobSatisfaction: Number(input.JobSatisfaction),
    MonthlyIncome: inc,
    NumCompaniesWorked: ncw,
    PercentSalaryHike: Number(input.PercentSalaryHike),
    PerformanceRating: Number(input.PerformanceRating),
    RelationshipSatisfaction: Number(input.RelationshipSatisfaction),
    StockOptionLevel: Number(input.StockOptionLevel),
    TotalWorkingYears: twy,
    TrainingTimesLastYear: Number(input.TrainingTimesLastYear),
    WorkLifeBalance: Number(input.WorkLifeBalance),
    YearsAtCompany: yac,
    YearsInCurrentRole: yir,
    YearsSinceLastPromotion: ysp,
    YearsWithCurrManager: ywm,
    TravelScore: travelScore,
    LogMonthlyIncome: Math.log1p(Math.max(inc, 0)),
    LogDistanceFromHome: Math.log1p(Math.max(dist, 0)),
    LogYearsAtCompany: Math.log1p(Math.max(yac, 0)),
    LogTotalWorkingYears: Math.log1p(Math.max(twy, 0)),
    LogYearsSinceLastPromotion: Math.log1p(Math.max(ysp, 0)),
    TotalSatisfaction: totalSatisfaction,
    EngagementScore: engagementScore,
    MinSatisfaction: minSatisfaction,
    LowSatisfactionCount: lowSatisfactionCount,
    IncomePerYearExp: inc / (twy + 1.0),
    IncomePerAge: inc / Math.max(age, 1.0),
    IncomePerJobLevel: inc / lvl,
    TenureRatio: tenureRatio,
    PromotionStagnation: ysp / (yac + 1.0),
    RoleStagnation: yir / (yac + 1.0),
    ManagerLoyaltyRatio: ywm / (yac + 1.0),
    AvgYearsPerCompany: twy / (ncw + 1.0),
    CareerStartAge: age - twy,
    JobHopperRate: ncw / (twy + 1.0),
    YearsWithoutPromoGap: yac - ysp,
    IncomeVsRoleMedian: incomeVsRoleMedian,
    IncomeVsLevelMedian: inc / (lvlMed + 1.0),
    IncomeVsDeptMedian: inc / (deptMed + 1.0),
    TenureVsRoleMedian: yac / (roleTen + 1.0),
    NoStockOptions: noStock,
    IsNewHire: isNewHire,
    OverTime_x_Single: ot * single,
    OverTime_x_NoStock: ot * noStock,
    OverTime_x_FreqTravel: ot * (travelScore === 2.0 ? 1.0 : 0.0),
    OverTime_x_LowSat: ot * (lowSatisfactionCount >= 1.0 ? 1.0 : 0.0),
    OverTime_x_LowIncome: ot * (inc < 4000.0 ? 1.0 : 0.0),
    OverTime_x_Distance: ot * dist,
    OverTime_x_NewHire: ot * isNewHire,
    Single_x_NoStock: single * noStock,
    BurnoutIndex: burnoutIndex,
  };

  const categoricalMap: Record<string, string> = {
    BusinessTravel: input.BusinessTravel,
    Department: input.Department,
    EducationField: input.EducationField,
    Gender: input.Gender,
    JobRole: input.JobRole,
    MaritalStatus: input.MaritalStatus,
    OverTime: input.OverTime,
    StockOptionCat: String(Math.round(input.StockOptionLevel)),
  };

  const vector = new Float32Array(spec.input_dim);
  let cursor = 0;

  const { lambdas, mean, scale } = spec.power_transformer;
  for (let i = 0; i < spec.numeric_columns.length; i++) {
    const col = spec.numeric_columns[i];
    const rawVal = numericMap[col] ?? 0.0;
    const yj = yeoJohnsonTransform(rawVal, lambdas[i]);
    const denom = scale[i] === 0 ? 1.0 : scale[i];
    vector[cursor++] = (yj - mean[i]) / denom;
  }

  for (let c = 0; c < spec.categorical_columns.length; c++) {
    const col = spec.categorical_columns[c];
    const val = categoricalMap[col] ?? '';
    const cats = spec.one_hot_encoder.categories[c];
    const dropIdx = spec.one_hot_encoder.drop_idx[c];
    for (let k = 0; k < cats.length; k++) {
      if (k === dropIdx) continue;
      vector[cursor++] = val === cats[k] ? 1.0 : 0.0;
    }
  }

  const coefs = spec.logistic_explainability.coefficients;
  const rawContribs: FeatureContribution[] = [];
  for (let i = 0; i < vector.length; i++) {
    const contrib = vector[i] * coefs[i];
    if (Math.abs(contrib) < 0.015) continue;
    const cleanName = spec.clean_feature_names[i];
    rawContribs.push({
      feature: cleanName,
      label: FRIENDLY_LABELS[cleanName] ?? cleanName.replace(/_/g, ' '),
      contribution: contrib,
      direction: contrib > 0 ? 'risk' : 'protective',
    });
  }

  rawContribs.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  return {
    vector,
    engineeredSummary: {
      burnoutIndex,
      incomeVsRoleMedian,
      engagementScore,
      tenureRatio,
    },
    contributions: rawContribs.slice(0, 6),
  };
}
