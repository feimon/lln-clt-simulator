
import React, { useState } from 'react';
import { Sparkles, RefreshCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateMathExplanation } from '../services/geminiService';
import { DistributionType } from '../types';

interface ExplanationPanelProps {
  distribution: DistributionType;
  stats: any;
}

export const ExplanationPanel: React.FC<ExplanationPanelProps> = ({ distribution, stats }) => {
  const [explanation, setExplanation] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleAskAI = async () => {
    setLoading(true);
    const text = await generateMathExplanation(distribution, stats);
    setExplanation(text);
    setLoading(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg mt-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          AI Tutor Insight
        </h3>
        <button
          onClick={handleAskAI}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            loading
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md hover:shadow-indigo-500/20'
          }`}
        >
          {loading ? (
            <RefreshCcw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {explanation ? 'Update Analysis' : 'Ask AI to Analyze'}
        </button>
      </div>

      <div className="min-h-[80px] text-slate-300 text-sm leading-relaxed">
        {explanation ? (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{explanation}</ReactMarkdown>
          </div>
        ) : (
          <p className="italic text-slate-500">
            Click the button above to have Gemini analyze your current simulation results and explain the mathematical principles at play.
          </p>
        )}
      </div>
    </div>
  );
};
