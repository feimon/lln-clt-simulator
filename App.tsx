import React, { useState } from 'react';
import { Sigma, Share2, ArrowUpRight, BarChart3, Activity } from 'lucide-react';
import { CLTSimulation } from './components/CLTSimulation';
import { LLNSimulation } from './components/LLNSimulation';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'LLN' | 'CLT'>('CLT');
  const [showShareOverlay, setShowShareOverlay] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative">
      {/* WeChat Share Overlay */}
      {showShareOverlay && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex justify-end p-6 cursor-pointer animate-fadeIn"
          onClick={() => setShowShareOverlay(false)}
        >
          <div className="flex flex-col items-end space-y-4 max-w-[70%]">
            <ArrowUpRight className="w-16 h-16 text-white animate-bounce" strokeWidth={1.5} />
            <div className="text-right space-y-2">
              <h3 className="text-xl font-bold text-white">Share with Friends</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Click the menu button in the top-right corner to share this simulation.
              </p>
              <p className="text-slate-500 text-xs mt-4">(Tap anywhere to close)</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg shadow-lg shadow-indigo-500/30">
              <Sigma className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block">Probability Explorer</h1>
              <h1 className="text-lg font-bold tracking-tight text-white sm:hidden">Prob. Sim</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowShareOverlay(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs (Mobile Optimized) */}
      <div className="bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
                <button
                    onClick={() => setActiveTab('CLT')}
                    className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-all ${
                        activeTab === 'CLT'
                            ? 'border-purple-500 text-purple-400'
                            : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                >
                    <BarChart3 className="w-4 h-4" />
                    Central Limit Theorem
                </button>
                <button
                    onClick={() => setActiveTab('LLN')}
                    className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-all ${
                        activeTab === 'LLN'
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                >
                    <Activity className="w-4 h-4" />
                    Law of Large Numbers
                </button>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {activeTab === 'CLT' ? 'Central Limit Theorem' : 'Law of Large Numbers'}
          </h2>
          <p className="text-slate-400 max-w-3xl leading-relaxed text-sm sm:text-base">
            {activeTab === 'CLT' 
                ? 'Witness how the distribution of sample means converges to a Normal Distribution (Bell Curve) as the sample size increases, regardless of the underlying distribution shape.'
                : 'Observe how the sample mean converges to the expected value (theoretical mean) as the number of trials increases, illustrating the stability of long-term averages.'
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
          <p>Interactive Probability Visualizations.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;