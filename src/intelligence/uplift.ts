/**
 * Econometric Causal Uplift Estimator with CUPED Variance Reduction.
 * Reduces variance in experimental conversion metrics using pre-experiment baseline covariates.
 */

export interface Observation {
  arm: "treated" | "holdout";
  outcome: number;     // 1 if converted, 0 if abandoned
  preCovariate?: number; // Pre-experiment baseline metric (e.g. past transaction count)
}

export interface UpliftResult {
  treatedRate: number;
  holdoutRate: number;
  rawLift: number;
  cupedLift: number;
  varianceReductionPct: number;
  standardError: number;
  ci95: [number, number];
  pValue: number;
  statisticallySignificant: boolean;
}

function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function variance(xs: number[], m: number): number {
  if (xs.length <= 1) return 0;
  return xs.reduce((acc, x) => acc + Math.pow(x - m, 2), 0) / (xs.length - 1);
}

function covariance(xs: number[], ys: number[], mx: number, my: number): number {
  if (xs.length <= 1 || xs.length !== ys.length) return 0;
  let sum = 0;
  for (let i = 0; i < xs.length; i++) {
    sum += (xs[i]! - mx) * (ys[i]! - my);
  }
  return sum / (xs.length - 1);
}

/** Standard Normal CDF approximation (Abramowitz and Stegun) */
function normalCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

/**
 * Calculates causal uplift and applies CUPED adjustment if pre-covariates are present.
 */
export function estimateUplift(observations: Observation[]): UpliftResult {
  const treated = observations.filter((o) => o.arm === "treated");
  const holdout = observations.filter((o) => o.arm === "holdout");

  const yt = treated.map((o) => o.outcome);
  const yh = holdout.map((o) => o.outcome);

  const meanT = mean(yt);
  const meanH = mean(yh);
  const rawLift = meanT - meanH;

  const allY = observations.map((o) => o.outcome);
  const allX = observations.map((o) => o.preCovariate ?? 0);
  const hasCovariates = observations.some((o) => (o.preCovariate ?? 0) > 0);

  let theta = 0;
  if (hasCovariates) {
    const meanAllY = mean(allY);
    const meanAllX = mean(allX);
    const varX = variance(allX, meanAllX);
    if (varX > 1e-6) {
      theta = covariance(allX, allY, meanAllX, meanAllY) / varX;
    }
  }

  // CUPED adjusted outcomes: Y_cuped = Y - theta * (X - meanX)
  const meanAllX = mean(allX);
  const ytCuped = treated.map((o) => o.outcome - theta * ((o.preCovariate ?? 0) - meanAllX));
  const yhCuped = holdout.map((o) => o.outcome - theta * ((o.preCovariate ?? 0) - meanAllX));

  const cupedT = mean(ytCuped);
  const cupedH = mean(yhCuped);
  const cupedLift = cupedT - cupedH;

  const rawVar = variance(allY, mean(allY));
  const cupedVar = rawVar * (1 - Math.min(0.9, Math.pow(theta, 2)));
  const varianceReductionPct = rawVar > 0 ? Math.max(0, ((rawVar - cupedVar) / rawVar) * 100) : 0;

  const nt = Math.max(1, treated.length);
  const nh = Math.max(1, holdout.length);
  const varT = variance(ytCuped, cupedT);
  const varH = variance(yhCuped, cupedH);
  const se = Math.sqrt(varT / nt + varH / nh);

  const z = se > 0 ? Math.abs(cupedLift) / se : 0;
  const pValue = 2 * (1 - normalCdf(z));
  const ci95: [number, number] = [cupedLift - 1.96 * se, cupedLift + 1.96 * se];

  return {
    treatedRate: meanT,
    holdoutRate: meanH,
    rawLift,
    cupedLift,
    varianceReductionPct: Math.round(varianceReductionPct * 10) / 10,
    standardError: se,
    ci95,
    pValue,
    statisticallySignificant: pValue < 0.05 && (ci95[0] > 0 || ci95[1] < 0),
  };
}
