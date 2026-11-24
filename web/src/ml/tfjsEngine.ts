import * as tf from '@tensorflow/tfjs';
import { transformEmployeeInput } from './preprocessor';
import type { DashboardData, EmployeeInput, PredictionResult, PreprocessorSpec } from './types';

export interface LoadedModelsBundle {
  preprocessor: PreprocessorSpec;
  dashboard: DashboardData;
  models: {
    stacking: tf.LayersModel;
    logistic: tf.LayersModel;
    xgboost: tf.LayersModel;
    randomForest: tf.LayersModel;
  };
  backend: string;
}

let cachedBundle: LoadedModelsBundle | null = null;
let loadPromise: Promise<LoadedModelsBundle> | null = null;

export async function loadTalentPulseEngine(): Promise<LoadedModelsBundle> {
  if (cachedBundle) return cachedBundle;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    await tf.ready();
    const [preRes, dashRes, stacking, logistic, xgboost, randomForest] = await Promise.all([
      fetch('/models/preprocessor.json'),
      fetch('/models/dashboard_data.json'),
      tf.loadLayersModel('/models/tfjs/stacking_ensemble/model.json'),
      tf.loadLayersModel('/models/tfjs/logistic_regression/model.json'),
      tf.loadLayersModel('/models/tfjs/xgboost/model.json'),
      tf.loadLayersModel('/models/tfjs/random_forest/model.json'),
    ]);

    if (!preRes.ok || !dashRes.ok) {
      throw new Error('Failed to fetch model metadata assets from /models');
    }

    const preprocessor = (await preRes.json()) as PreprocessorSpec;
    const dashboard = (await dashRes.json()) as DashboardData;

    // Warm up TF.js WebGL/CPU kernels on a single zero tensor for instant slider inference
    tf.tidy(() => {
      const dummy = tf.zeros([1, preprocessor.input_dim], 'float32');
      stacking.predict(dummy);
      logistic.predict(dummy);
      xgboost.predict(dummy);
      randomForest.predict(dummy);
    });

    cachedBundle = {
      preprocessor,
      dashboard,
      models: { stacking, logistic, xgboost, randomForest },
      backend: tf.getBackend() || 'cpu',
    };
    return cachedBundle;
  })();

  return loadPromise;
}

export function predictEmployeeAttrition(
  engine: LoadedModelsBundle,
  input: EmployeeInput
): PredictionResult {
  const t0 = performance.now();
  const { vector, engineeredSummary, contributions } = transformEmployeeInput(
    input,
    engine.preprocessor
  );

  const probs = tf.tidy(() => {
    const x = tf.tensor2d(vector, [1, engine.preprocessor.input_dim], 'float32');
    const pStack = (engine.models.stacking.predict(x) as tf.Tensor).dataSync()[0];
    const pLog = (engine.models.logistic.predict(x) as tf.Tensor).dataSync()[0];
    const pXgb = (engine.models.xgboost.predict(x) as tf.Tensor).dataSync()[0];
    const pRf = (engine.models.randomForest.predict(x) as tf.Tensor).dataSync()[0];
    return {
      stacking: Math.min(Math.max(pStack, 0), 1),
      logistic: Math.min(Math.max(pLog, 0), 1),
      xgboost: Math.min(Math.max(pXgb, 0), 1),
      randomForest: Math.min(Math.max(pRf, 0), 1),
    };
  });

  const inferenceMs = Math.max(performance.now() - t0, 0.1);

  return {
    ...probs,
    inferenceMs,
    backend: engine.backend,
    contributions,
    engineeredSummary,
  };
}
