import { DistributionType } from '../types';

export const generateRandomValue = (type: DistributionType): number => {
  switch (type) {
    case DistributionType.BERNOULLI:
      // 0 or 1 (Fair coin)
      return Math.random() < 0.5 ? 0 : 1;
    case DistributionType.DICE:
      // 1 to 6
      return Math.floor(Math.random() * 6) + 1;
    case DistributionType.UNIFORM:
      // 0 to 1
      return Math.random();
    case DistributionType.EXPONENTIAL:
      // Lambda = 1, Mean = 1
      return -Math.log(1 - Math.random());
    default:
      return Math.random();
  }
};

export const getTheoreticalMean = (type: DistributionType): number => {
  switch (type) {
    case DistributionType.BERNOULLI: return 0.5;
    case DistributionType.DICE: return 3.5;
    case DistributionType.UNIFORM: return 0.5;
    case DistributionType.EXPONENTIAL: return 1.0;
    default: return 0.5;
  }
};

export const getTheoreticalStdDev = (type: DistributionType): number => {
  switch (type) {
    case DistributionType.BERNOULLI: 
      // Sqrt(p(1-p)) -> Sqrt(0.5*0.5) = 0.5
      return 0.5;
    case DistributionType.DICE: 
      // Sqrt(((6-1+1)^2 - 1)/12) = Sqrt(35/12) ≈ 1.7078
      return 1.7078;
    case DistributionType.UNIFORM: 
      // Sqrt(1/12) ≈ 0.2887
      return 0.2887;
    case DistributionType.EXPONENTIAL: 
      // 1/lambda = 1
      return 1.0;
    default: return 1.0;
  }
};

// Normal Probability Density Function
export const normalPDF = (x: number, mean: number, stdDev: number): number => {
  return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
};

export const calculateMean = (data: number[]): number => {
  if (data.length === 0) return 0;
  return data.reduce((a, b) => a + b, 0) / data.length;
};

export const calculateVariance = (data: number[], mean: number): number => {
  if (data.length < 2) return 0;
  return data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (data.length - 1);
};