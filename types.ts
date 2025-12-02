
export enum DistributionType {
  BERNOULLI = 'Bernoulli (Coin Flip)',
  UNIFORM = 'Uniform (Continuous)',
  EXPONENTIAL = 'Exponential',
  DICE = 'Discrete Uniform (Dice)',
}

export interface SimulationStats {
  mean: number;
  variance: number;
  count: number;
  theoreticalMean: number;
}

export interface HistogramBin {
  rangeStart: number;
  rangeEnd: number;
  frequency: number;
  name: string; // for Recharts x-axis
}

export interface ChartDataPoint {
  index: number;
  value: number;
  expected: number;
}
