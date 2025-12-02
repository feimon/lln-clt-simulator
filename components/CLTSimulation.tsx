import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Legend } from 'recharts';
import { Play, RotateCcw, BarChart3, Settings2, Pause } from 'lucide-react';
import { DistributionType } from '../types';
import { generateRandomValue, calculateMean, getTheoreticalMean, getTheoreticalStdDev, normalPDF } from '../utils/mathUtils';

interface BinData {
  rangeStart: number;
  rangeEnd: number;
  name: string;
  frequency: number; // Density
  normalCurve: number; // PDF value
}

export const CLTSimulation: React.FC = () => {
  const [distribution, setDistribution] = useState<DistributionType>(DistributionType.UNIFORM);
  const [sampleSize, setSampleSize] = useState(1); // n starts at 1
  const [totalSimulations, setTotalSimulations] = useState(2000); // M (Fixed for this demo)
  const [histogramData, setHistogramData] = useState<BinData[]>([]);
  const [meanOfMeans, setMeanOfMeans] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Constants for animation
  const MIN_N = 1;
  const MAX_N = 50;
  const BIN_COUNT = 50;

  // Determine fixed X-axis domain based on distribution to show convergence visual effect
  const getAxisDomain = useCallback((dist: DistributionType): [number, number] => {
    switch (dist) {
      case DistributionType.BERNOULLI: return [-0.1, 1.1]; // 0 and 1
      case DistributionType.DICE: return [1, 6]; // 1 to 6
      case DistributionType.UNIFORM: return [0, 1]; // 0 to 1
      case DistributionType.EXPONENTIAL: return [0, 3]; // Mean is 1, tail is long
      default: return [0, 1];
    }
  }, []);

  // Calculate the appropriate Y-axis domain (ceiling) so the curve "grows" into view
  // We calculate the theoretical max PDF height at MAX_N
  const getYAxisDomain = useCallback((dist: DistributionType): [number, number] => {
    const sigma = getTheoreticalStdDev(dist);
    // Standard Error at MAX_N
    const minSE = sigma / Math.sqrt(MAX_N);
    // Peak of Normal PDF = 1 / (SE * sqrt(2*PI))
    const maxPDFHeight = 1 / (minSE * Math.sqrt(2 * Math.PI));
    
    // For Density Histogram, height corresponds directly to PDF value
    const maxChartHeight = maxPDFHeight;

    // Add 15% padding
    return [0, Number((maxChartHeight * 1.15).toFixed(2))];
  }, []);

  // Core Data Generation Logic (Synchronous)
  const generateHistogramData = (currentN: number, M: number, dist: DistributionType) => {
    const newMeans: number[] = [];
    for (let i = 0; i < M; i++) {
        let sum = 0;
        for (let j = 0; j < currentN; j++) {
            sum += generateRandomValue(dist);
        }
        newMeans.push(sum / currentN);
    }

    const calculatedMeanOfMeans = calculateMean(newMeans);

    // Create Bins
    const axisDomain = getAxisDomain(dist);
    const min = axisDomain[0];
    const max = axisDomain[1];
    
    const binSize = (max - min) / BIN_COUNT;
    
    const bins: BinData[] = [];
    for (let i = 0; i < BIN_COUNT; i++) {
        bins.push({
            rangeStart: min + i * binSize,
            rangeEnd: min + (i + 1) * binSize,
            name: (min + i * binSize + binSize / 2).toFixed(2),
            frequency: 0,
            normalCurve: 0
        });
    }

    // Fill Bins
    newMeans.forEach(val => {
        const binIndex = Math.floor((val - min) / binSize);
        if (binIndex >= 0 && binIndex < BIN_COUNT) {
            bins[binIndex].frequency++;
        }
    });

    // Normalize to Density and Calculate Theoretical Curve
    const theoreticalMean = getTheoreticalMean(dist);
    // Standard Error = sigma / sqrt(n)
    const stdDev = getTheoreticalStdDev(dist) / Math.sqrt(currentN); 

    bins.forEach(bin => {
        const relativeFrequency = bin.frequency / M;
        // Density = Relative Frequency / Bin Width
        // This ensures Area = Frequency
        bin.frequency = relativeFrequency / binSize; 
        
        // Calculate PDF value for the center of the bin
        const x = (bin.rangeStart + bin.rangeEnd) / 2;
        const pdfValue = normalPDF(x, theoreticalMean, stdDev);
        // For density histogram, curve height is simply the PDF value
        bin.normalCurve = pdfValue;
    });

    return { bins, mean: calculatedMeanOfMeans };
  };

  // Helper to update all state at once
  const updateSimulationState = (n: number, M: number, dist: DistributionType) => {
      const { bins, mean } = generateHistogramData(n, M, dist);
      setSampleSize(n);
      setHistogramData(bins);
      setMeanOfMeans(mean);
  };

  // 1. Handle Initial Load & Distribution Change
  useEffect(() => {
    // Reset to Min N when distribution changes
    const startN = MIN_N; 
    setSampleSize(startN);
    const { bins, mean } = generateHistogramData(startN, totalSimulations, distribution);
    setHistogramData(bins);
    setMeanOfMeans(mean);
  }, [distribution, totalSimulations]);


  // 2. Handle Animation Loop (Synchronized Update)
  useEffect(() => {
    if (isAnimating) {
        timerRef.current = setInterval(() => {
            setSampleSize(prevN => {
                if (prevN >= MAX_N) {
                    setIsAnimating(false);
                    return prevN;
                }
                const nextN = prevN + 1;
                
                // SYNCHRONOUS UPDATE: Calculate data for nextN immediately
                const { bins, mean } = generateHistogramData(nextN, totalSimulations, distribution);
                setHistogramData(bins);
                setMeanOfMeans(mean);

                return nextN;
            });
        }, 400); // 400ms per step
    } else {
        if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isAnimating, distribution, totalSimulations]);

  // 3. Handle Manual Interaction
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsAnimating(false);
      const newN = parseInt(e.target.value);
      updateSimulationState(newN, totalSimulations, distribution);
  };

  const handleReset = () => {
    setIsAnimating(false);
    updateSimulationState(MIN_N, totalSimulations, distribution);
  };

  const handleDistributionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setIsAnimating(false);
      setDistribution(e.target.value as DistributionType);
      // The useEffect [distribution] will handle the data update
  };

  const theoreticalMean = getTheoreticalMean(distribution);
  const currentYDomain = getYAxisDomain(distribution);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Layout: Chart on Top (order-1), Controls on Bottom (order-2) for mobile. 
          On LG screens, Controls Left (order-1), Chart Right (order-2) */}
      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6">
        
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
            <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-4 text-slate-300">
                    <Settings2 className="w-5 h-5" />
                    <span className="font-semibold">配置</span>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">分布类型</label>
                        <select 
                            value={distribution}
                            onChange={handleDistributionChange}
                            className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2.5 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all text-sm"
                            disabled={isAnimating}
                        >
                            {Object.values(DistributionType).map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                         <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                            样本量 (n)
                         </label>
                         <div className="flex items-center justify-between bg-slate-900 rounded-md px-3 py-2 border border-slate-700">
                             <span className="text-xl font-mono text-purple-400 font-bold">{sampleSize}</span>
                             <span className="text-xs text-slate-500">最大: {MAX_N}</span>
                         </div>
                         <input 
                            type="range" 
                            min={MIN_N}
                            max={MAX_N}
                            value={sampleSize}
                            onChange={handleSliderChange}
                            className="w-full accent-purple-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer mt-3"
                         />
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => {
                        if (sampleSize >= MAX_N && !isAnimating) {
                            updateSimulationState(MIN_N, totalSimulations, distribution);
                            setTimeout(() => setIsAnimating(true), 100);
                        } else {
                            setIsAnimating(!isAnimating);
                        }
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${
                        isAnimating 
                        ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                >
                    {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isAnimating ? "暂停" : (sampleSize >= MAX_N ? "重新开始" : "开始")}
                </button>
                <button
                    onClick={handleReset}
                    className="flex items-center justify-center px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-all border border-slate-600"
                    title="重置样本量"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-3">当前统计</div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">固定模拟次数 (M):</span>
                        <span className="font-mono text-slate-200">{totalSimulations}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-slate-400">样本均值:</span>
                        <span className="font-mono text-emerald-400 font-bold">{meanOfMeans.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">理论均值:</span>
                        <span className="font-mono text-blue-400">{theoreticalMean.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800 mt-2">
                        <span className="text-slate-500">标准误 (<span className="font-serif italic">σ/√n</span>):</span>
                        <span className="font-mono text-pink-400">
                            {(getTheoreticalStdDev(distribution) / Math.sqrt(sampleSize)).toFixed(4)}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* Chart Area */}
        <div className="lg:col-span-3 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-inner flex flex-col order-1 lg:order-2">
            <h2 className="text-lg font-semibold text-slate-200 mb-2 flex items-center gap-2">
                <BarChart3 className="text-purple-500 w-5 h-5"/> 
                样本均值的分布
            </h2>
            <p className="text-slate-400 text-xs mb-4">
                红线 = 理论正态曲线。蓝色直方图 = 模拟密度 (面积=频率)。
            </p>
            
            {/* Added explicit height h-[300px] for mobile visibility, auto height for desktop */}
            <div className="w-full h-[300px] lg:h-[500px] lg:flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={histogramData} barCategoryGap={0}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis 
                            dataKey="name" 
                            type="category" 
                            tick={{fill: '#94a3b8', fontSize: 10}} 
                            interval={Math.floor(histogramData.length / 10)}
                            label={{ value: '样本均值', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
                        />
                        <YAxis 
                            domain={currentYDomain}
                            tick={{fill: '#94a3b8'}}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                            itemStyle={{ color: '#f1f5f9' }}
                            formatter={(value: number, name: string) => [
                                value.toFixed(4), 
                                name === 'normalCurve' ? '理论密度' : '密度'
                            ]}
                            labelFormatter={(label) => `均值 ≈ ${label}`}
                        />
                        <Legend wrapperStyle={{paddingTop: '10px'}}/>
                        <Bar dataKey="frequency" name="模拟密度" fill="#8b5cf6" opacity={0.6}>
                            {histogramData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill="#8b5cf6" />
                            ))}
                        </Bar>
                        <Line 
                            type="monotone" 
                            dataKey="normalCurve" 
                            name="正态近似" 
                            stroke="#f43f5e" 
                            strokeWidth={3} 
                            dot={false}
                            isAnimationActive={false}
                        />
                        <ReferenceLine x={theoreticalMean.toFixed(2)} stroke="#fbbf24" strokeDasharray="3 3" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};