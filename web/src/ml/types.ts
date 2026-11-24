export interface EmployeeInput {
  Age: number;
  BusinessTravel: 'Non-Travel' | 'Travel_Rarely' | 'Travel_Frequently';
  Department: 'Sales' | 'Research & Development' | 'Human Resources';
  DistanceFromHome: number;
  Education: number;
  EducationField:
    | 'Life Sciences'
    | 'Medical'
    | 'Marketing'
    | 'Technical Degree'
    | 'Human Resources'
    | 'Other';
  EnvironmentSatisfaction: number;
  Gender: 'Male' | 'Female';
  JobInvolvement: number;
  JobLevel: number;
  JobRole:
    | 'Sales Executive'
    | 'Research Scientist'
    | 'Laboratory Technician'
    | 'Manufacturing Director'
    | 'Healthcare Representative'
    | 'Manager'
    | 'Sales Representative'
    | 'Research Director'
    | 'Human Resources';
  JobSatisfaction: number;
  MaritalStatus: 'Single' | 'Married' | 'Divorced';
  MonthlyIncome: number;
  NumCompaniesWorked: number;
  OverTime: 'Yes' | 'No';
  PercentSalaryHike: number;
  PerformanceRating: number;
  RelationshipSatisfaction: number;
  StockOptionLevel: number;
  TotalWorkingYears: number;
  TrainingTimesLastYear: number;
  WorkLifeBalance: number;
  YearsAtCompany: number;
  YearsInCurrentRole: number;
  YearsSinceLastPromotion: number;
  YearsWithCurrManager: number;
}

export interface PreprocessorSpec {
  version: string;
  input_dim: number;
  feature_names: string[];
  clean_feature_names: string[];
  numeric_columns: string[];
  categorical_columns: string[];
  medians: {
    role_income: Record<string, number>;
    level_income: Record<string, number>;
    dept_income: Record<string, number>;
    role_tenure: Record<string, number>;
    global_income: number;
    global_tenure: number;
  };
  defaults: Record<string, number | string>;
  power_transformer: {
    lambdas: number[];
    mean: number[];
    scale: number[];
  };
  one_hot_encoder: {
    categories: string[][];
    drop_idx: (number | null)[];
  };
  logistic_explainability: {
    coefficients: number[];
    intercept: number;
  };
  reference_samples?: Array<{
    raw: Record<string, number | string>;
    expected_transformed: number[];
    expected_lr_prob: number;
    expected_stack_prob: number;
  }>;
}

export interface ModelMetricSnapshot {
  threshold: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  f1_5: number;
  roc_auc: number;
  pr_auc: number;
  log_loss: number;
  brier: number;
  tn: number;
  fp: number;
  fn: number;
  tp: number;
}

export interface TfjsExportItem {
  name: string;
  export_type: 'exact_weights' | 'distilled_mlp';
  architecture: string;
  size_kb: number;
  test_r2_vs_teacher: number;
  test_corr_vs_teacher: number;
  test_mae_vs_teacher: number;
  teacher_test_roc_auc: number;
  tfjs_test_roc_auc: number;
  teacher_test_pr_auc: number;
  tfjs_test_pr_auc: number;
}

export interface DashboardData {
  dataset: {
    total_records: number;
    train_records: number;
    test_records: number;
    attrition_yes_count: number;
    attrition_rate_pct: number;
    engineered_features: number;
  };
  champion_model: string;
  optimal_thresholds: Record<string, { balanced_f1: number; hr_high_recall: number }>;
  ensemble_weights: Record<string, number>;
  stacking_meta_coefs: Record<string, number>;
  oof_cv_metrics: Record<
    string,
    {
      oof_roc_auc: number;
      fold_roc_auc_mean: number;
      fold_roc_auc_std: number;
      oof_pr_auc: number;
      oof_log_loss: number;
      cv_seconds: number;
    }
  >;
  train_metrics_balanced_f1: Record<string, ModelMetricSnapshot>;
  test_metrics_balanced_f1: Record<string, ModelMetricSnapshot>;
  test_metrics_hr_recall: Record<string, ModelMetricSnapshot>;
  subgroup_audit: Record<
    string,
    Array<{
      group: string;
      n: number;
      actual_yes: number;
      roc_auc: number | null;
      recall: number;
      precision: number;
    }>
  >;
  roc_curves: Record<string, Array<{ x: number; y: number }>>;
  top_drivers: Array<{
    feature: string;
    consensus_pct: number;
    lr_coef: number;
    xgb_pct: number;
    rf_pct: number;
    direction: 'risk' | 'protective';
  }>;
  eda_role_rates: Array<{ JobRole: string; count: number; rate: number }>;
  eda_dept_rates: Array<{ Department: string; count: number; rate: number }>;
  tfjs_export_summary: TfjsExportItem[];
  legacy_baseline: Record<string, { roc_auc: number; pr_auc: number; f1: number; accuracy: number }>;
}

export interface FeatureContribution {
  feature: string;
  label: string;
  contribution: number;
  direction: 'risk' | 'protective';
}

export interface PredictionResult {
  stacking: number;
  logistic: number;
  xgboost: number;
  randomForest: number;
  inferenceMs: number;
  backend: string;
  contributions: FeatureContribution[];
  engineeredSummary: {
    burnoutIndex: number;
    incomeVsRoleMedian: number;
    engagementScore: number;
    tenureRatio: number;
  };
}

export type ThresholdMode = 'hr_high_recall' | 'balanced_f1';
