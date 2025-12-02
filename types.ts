
export enum DistributionType {
  BERNOULLI = '伯努利分布 (抛硬币)',
  UNIFORM = '均匀分布 (连续)',
  EXPONENTIAL = '指数分布',
  DICE = '离散均匀分布 (骰子)',
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