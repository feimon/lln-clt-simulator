import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { Play, Pause, RotateCcw, Activity } from 'lucide-react';
import { DistributionType, ChartDataPoint } from '../types';
import { generateRandomValue, getTheoreticalMean } from '../utils/mathUtils';

export const LLNSimulation: React.FC = () => {
  const [distribution, setDistribution] = useState<DistributionType>(DistributionType.BERNOULLI);
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(50); // ms per tick
  const [totalSamples, setTotalSamples] = useState(0);
  const [runningSum, setRunningSum] = useState(0);

  const theoreticalMean = getTheoreticalMean(distribution);
  const animationRef = useRef<number>(0);

  const reset = useCallback(() => {
    setIsRunning(false);
    setData([]);
    setTotalSamples(0);
    setRunningSum(0);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  }, []);

  // Effect to handle distribution change
  useEffect(() => {
    reset();
  }, [distribution, reset]);

  const step = useCallback(() => {
    // Add multiple points per frame for speed if sample count is high, 
    // but for visual clarity in animation, we'll do smaller batches.
    const batchSize = speed < 20 ? 5 : 1;
    
    let newSum = runningSum;
    let newTotal = totalSamples;
    const newPoints: ChartDataPoint[] = [];

    for (let i = 0; i < batchSize; i++) {
      const val = generateRandomValue(distribution);
      newSum += val;
      newTotal += 1;
      
      // Optimization: Only add data points to the chart periodically if we have tons of data
      // to prevent React rendering lag.
      if (newTotal < 200 || newTotal % 5 === 0) {
        newPoints.push({
          index: newTotal,
          value: newSum / newTotal,
          expected: theoreticalMean
        });
      }
    }

    setRunningSum(newSum);
    setTotalSamples(newTotal);
    setData(prev => {
        const next = [...prev, ...newPoints];
        // Keep chart performant by slicing if too large (optional, but good for long runs)
        return next.length > 500 ? next.filter((_, idx) => idx % 2 === 0) : next;
    });

  }, [runningSum, totalSamples, distribution, speed, theoreticalMean]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      interval = setInterval(step, speed);
    }
    return () => clearInterval(interval);
  }, [isRunning, step, speed]);

  const currentMean = totalSamples > 0 ? runningSum / totalSamples : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
            <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                <label className="block text-sm font-medium text-slate-400 mb-2">Distribution</label>
                <select 
                    value={distribution}
                    onChange={(e) => setDistribution(e.target.value as DistributionType)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={isRunning}
                >
                    {Object.values(DistributionType).map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                <label className="block text-sm font-medium text-slate-400 mb-2">Simulation Speed</label>
                <input 
                    type="range" 
                    min="1" 
                    max="200" 
                    step="1"
                    value={201 - speed} // Invert so right is faster
                    onChange={(e) => setSpeed(201 - parseInt(e.target.value))}
                    className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Slow</span>
                    <span>Fast</span>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => setIsRunning(!isRunning)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${
                        isRunning 
                        ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                >
                    {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isRunning ? "Pause" : "Start"}
                </button>
                <button
                    onClick={reset}
                    className="flex items-center justify-center px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-all"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-2">Statistics</div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400">Total Trials (n):</span>
                    <span className="font-mono text-white">{totalSamples}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400">Current Mean:</span>
                    <span className={`font-mono font-bold ${Math.abs(currentMean - theoreticalMean) < 0.05 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {currentMean.toFixed(4)}
                    </span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-400">Theoretical Exp:</span>
                    <span className="font-mono text-blue-400">{theoreticalMean.toFixed(4)}</span>
                </div>
            </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-3 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-inner flex flex-col min-h-[400px] order-1 lg:order-2">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Activity className="text-blue-500 w-5 h-5"/> Convergence of Sample Mean
            </h2>
            <div className="flex-1 w-full min-h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis 
                            dataKey="index" 
                            type="number" 
                            domain={['auto', 'auto']} 
                            tick={{fill: '#94a3b8'}} 
                            label={{ value: 'Number of Trials (n)', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
                        />
                        <YAxis 
                            domain={[
                                distribution === DistributionType.DICE ? 1 : 0, 
                                distribution === DistributionType.DICE ? 6 : (distribution === DistributionType.EXPONENTIAL ? 3 : 1.2)
                            ]} 
                            tick={{fill: '#94a3b8'}}
                            label={{ value: 'Average Value', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                            itemStyle={{ color: '#f1f5f9' }}
                            formatter={(value: number) => value.toFixed(4)}
                            labelFormatter={(label) => `n = ${label}`}
                        />
                        <Legend wrapperStyle={{paddingTop: '10px'}}/>
                        <ReferenceLine y={theoreticalMean} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Expected Value', fill: '#f59e0b', position: 'insideTopRight' }} />
                        <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#3b82f6" 
                            strokeWidth={2} 
                            dot={false} 
                            isAnimationActive={false} 
                            name="Running Mean"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};