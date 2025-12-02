import React, { useState } from 'react';
import { BarChart3, Activity } from 'lucide-react';
import { CLTSimulation } from './components/CLTSimulation';
import { LLNSimulation } from './components/LLNSimulation';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'LLN' | 'CLT'>('LLN');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative">
      
      {/* Navigation Tabs (Mobile Optimized) */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-2 sm:space-x-8 justify-center sm:justify-start">
                <button
                    onClick={() => setActiveTab('LLN')}
                    className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-all ${
                        activeTab === 'LLN'
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                >
                    <Activity className="w-4 h-4" />
                    大数定律 (LLN)
                </button>
                <button
                    onClick={() => setActiveTab('CLT')}
                    className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-all ${
                        activeTab === 'CLT'
                            ? 'border-purple-500 text-purple-400'
                            : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                >
                    <BarChart3 className="w-4 h-4" />
                    中心极限定理 (CLT)
                </button>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {activeTab === 'CLT' ? '中心极限定理 (Central Limit Theorem)' : '大数定律 (Law of Large Numbers)'}
          </h2>
          <p className="text-slate-400 max-w-3xl leading-relaxed text-sm sm:text-base">
            {activeTab === 'CLT' 
                ? '观察随着样本量增加，样本均值的分布如何收敛于正态分布（钟形曲线），无论原始分布的形状如何。'
                : '观察随着试验次数增加，样本均值如何收敛于期望值（理论均值），展示了长期平均值的稳定性。'
            }
          </p>
        </div>

        <div className="bg-slate-900/50 rounded-2xl p-1 border border-slate-800 backdrop-blur-sm min-h-[600px]">
          {activeTab === 'CLT' ? <CLTSimulation /> : <LLNSimulation />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 mt-12 mb-safe">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>交互式概率可视化。</p>
        </div>
      </footer>
    </div>
  );
};

export default App;