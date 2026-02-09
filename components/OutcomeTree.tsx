
import React from 'react';
import { DecisionCrossroad } from '../types';

interface OutcomeTreeProps {
  crossroads: DecisionCrossroad[];
  onAnswer: (index: number, answer: 'yes' | 'no') => void;
  answers: Record<number, 'yes' | 'no'>;
}

const OutcomeTree: React.FC<OutcomeTreeProps> = ({ crossroads = [], onAnswer, answers }) => {
  const safeCrossroads = crossroads || [];

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center relative py-6">
      <div className="text-center mb-16">
          <h3 className="text-5xl md:text-7xl font-black tracking-tighter italic mb-4 text-slate-900 dark:text-white leading-none">Decisive Junctions</h3>
          <p className="text-sm uppercase tracking-[0.5em] opacity-40 text-slate-500 font-black mb-6">Reality Convergence Mapping</p>
          <p className="max-w-2xl mx-auto text-lg font-bold opacity-60 italic leading-relaxed text-slate-600 dark:text-slate-300">
            Navigate the micro-decisions that determine the stability and success of your proposed pivot. Your choices here define the final strategic synthesis.
          </p>
      </div>

      <div className="absolute top-[80px] bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-transparent via-pink-500/20 to-transparent pointer-events-none"></div>

      <div className="flex flex-col gap-16 w-full items-center relative z-10 px-4">
        {safeCrossroads.map((c, i) => (
          <div key={i} className="relative flex flex-col items-center w-full animate-in slide-in-from-bottom-4 duration-500">
            
            {/* Question Card */}
            <div className={`relative px-10 py-10 md:px-16 md:py-12 rounded-[40px] md:rounded-[56px] shadow-2xl text-xl md:text-3xl font-black max-w-2xl text-center border-4 transition-all duration-500 ${
              answers[i] 
                ? 'bg-pink-500 text-white border-pink-400' 
                : 'bg-white dark:bg-[#050625] border-slate-100 dark:border-white/10 text-slate-900 dark:text-white'
            }`}>
              <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full text-[10px] font-black tracking-[0.4em] transition-all shadow-xl z-20 ${
                answers[i] ? 'bg-[#0c0e2b] text-white' : 'bg-pink-500 text-white'
              }`}>
                JUNCTION 0{i + 1}
              </div>
              <p className="leading-tight italic">"{c.question}"</p>
            </div>

            {/* Answer Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 w-full mt-10 max-w-4xl">
              {/* YES Option */}
              <button 
                onClick={() => onAnswer(i, 'yes')}
                className={`p-8 md:p-10 rounded-[48px] border-2 transition-all text-left group hover:scale-[1.03] active:scale-95 flex flex-col h-full shadow-lg ${
                  answers[i] === 'yes' 
                    ? 'border-emerald-500 bg-white shadow-emerald-500/20' 
                    : 'bg-white dark:bg-[#0c0e2b]/50 border-slate-100 dark:border-white/5 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md ${
                    answers[i] === 'yes' ? 'bg-emerald-500 text-white' : 'bg-slate-50 dark:bg-white/5 text-emerald-300'
                  }`}>
                    <i className="fa-solid fa-check text-xl"></i>
                  </div>
                  <span className={`text-[12px] font-black uppercase tracking-widest ${answers[i] === 'yes' ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {c.yesLabel || "YES"}
                  </span>
                </div>
                <p className={`text-lg md:text-xl font-bold leading-relaxed flex-grow italic ${answers[i] === 'yes' ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-200'}`}>
                  {c.ifYes}
                </p>
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-black uppercase tracking-widest">Confirm Decision</span>
                  <i className="fa-solid fa-arrow-right-long text-xs"></i>
                </div>
              </button>

              {/* NO Option */}
              <button 
                onClick={() => onAnswer(i, 'no')}
                className={`p-8 md:p-10 rounded-[48px] border-2 transition-all text-left group hover:scale-[1.03] active:scale-95 flex flex-col h-full shadow-lg ${
                  answers[i] === 'no' 
                    ? 'border-rose-500 bg-white shadow-rose-500/20' 
                    : 'bg-white dark:bg-[#0c0e2b]/50 border-slate-100 dark:border-white/5 hover:border-rose-300'
                }`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md ${
                    answers[i] === 'no' ? 'bg-rose-500 text-white' : 'bg-slate-50 dark:bg-white/5 text-rose-300'
                  }`}>
                    <i className="fa-solid fa-xmark text-xl"></i>
                  </div>
                  <span className={`text-[12px] font-black uppercase tracking-widest ${answers[i] === 'no' ? 'text-rose-500' : 'text-slate-400'}`}>
                    {c.noLabel || "NO"}
                  </span>
                </div>
                <p className={`text-lg md:text-xl font-bold leading-relaxed flex-grow italic ${answers[i] === 'no' ? 'text-rose-700 dark:text-rose-300' : 'text-slate-700 dark:text-slate-200'}`}>
                  {c.ifNo}
                </p>
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-black uppercase tracking-widest">Confirm Decision</span>
                  <i className="fa-solid fa-arrow-right-long text-xs"></i>
                </div>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OutcomeTree;
