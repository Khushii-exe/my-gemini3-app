import React from 'react';
import { RegretAnalysis } from '../types';

interface RegretPredictorProps {
  analysis: RegretAnalysis;
}

const RegretPredictor: React.FC<RegretPredictorProps> = ({ analysis }) => {
  const getLevelColor = () => {
    switch(analysis.level) {
      case 'Low': return 'emerald-400';
      case 'Moderate': return 'amber-400';
      case 'High': return 'rose-400';
      case 'Critical': return 'rose-500';
      default: return 'slate-400';
    }
  };

  const colorClass = getLevelColor();

  return (
    <div className="py-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-16">
        <h3 className="text-5xl md:text-7xl font-black tracking-tighter italic mb-4 text-slate-900 dark:text-white leading-none">Regret Predictor</h3>
        <p className="text-sm uppercase tracking-[0.5em] opacity-40 text-slate-500 font-black mb-6">Future Emotional Forensics</p>
        <p className="max-w-3xl mx-auto text-lg md:text-xl font-bold opacity-60 italic leading-relaxed text-slate-600 dark:text-slate-300">
          A predictive analysis of future emotional friction and potential areas of hesitation. By identifying shadow trajectories early, we can mitigate risks before they manifest as deep-seated regret.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Probability Gauge Side */}
        <div className="p-12 rounded-[64px] border-4 border-white dark:border-white/10 glass-card flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <i className="fa-solid fa-shield-heart text-[120px]"></i>
          </div>
          
          <div className="relative w-56 h-56 mb-10">
            <svg className="w-full h-full transform -rotate-90 filter drop-shadow-lg">
              <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-white/5" />
              <circle 
                cx="112" cy="112" r="100" 
                stroke="currentColor" 
                strokeWidth="12" 
                fill="transparent" 
                strokeDasharray={628} 
                strokeDashoffset={628 - (628 * analysis.probability) / 100}
                className={`text-${colorClass} transition-all duration-[2000ms] ease-out`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-6xl font-black text-${colorClass}`}>{analysis.probability}%</span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">FRICTION INDEX</span>
            </div>
          </div>
          
          <h4 className={`text-3xl font-black text-${colorClass} mb-4 tracking-tight`}>{analysis.level} Resistance</h4>
          <p className="text-sm font-bold opacity-60 leading-relaxed max-w-[280px] italic">
            "Estimated probability of encountering emotional resistance or second-guessing this specific path integration."
          </p>
        </div>

        {/* Detailed Analysis Side */}
        <div className="space-y-8">
          <div className="p-8 rounded-[40px] bg-rose-500/5 border border-rose-500/10 shadow-sm">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 rounded-[24px] bg-rose-500 flex items-center justify-center text-white shadow-xl">
                <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
              </div>
              <div>
                <h4 className="text-2xl font-black leading-none text-slate-900 dark:text-white">Shadow Friction Points</h4>
                <p className="text-[10px] uppercase tracking-widest opacity-40 font-black mt-2">Potential Hurdles & Warning Signs</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {analysis.redFlags.map((flag, idx) => (
                <div key={idx} className="p-6 rounded-[28px] bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-start gap-6 hover:border-rose-400 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-rose-500 flex-shrink-0 group-hover:scale-110 transition-transform">
                     <i className="fa-solid fa-hand-dots text-lg"></i>
                  </div>
                  <div>
                    <p className="text-base font-black opacity-85 leading-snug text-slate-800 dark:text-slate-200">{flag}</p>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-2">Critical Awareness Point</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-10 rounded-[48px] border-4 border-emerald-500/20 bg-emerald-500/[0.04] relative overflow-hidden group shadow-lg">
             <div className="absolute -bottom-6 -right-6 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                <i className="fa-solid fa-shield-halved text-8xl text-emerald-500"></i>
             </div>
             <div className="flex items-center gap-3 mb-6 relative z-10">
                <i className="fa-solid fa-wand-magic-sparkles text-emerald-500 text-lg"></i>
                <span className="text-xs font-black uppercase tracking-[0.4em] text-emerald-600 dark:text-emerald-400">Aura's Mitigating Counsel</span>
             </div>
             <p className="text-xl md:text-2xl font-black italic leading-tight text-slate-800 dark:text-emerald-100 relative z-10">
               "{analysis.preventativeAdvice}"
             </p>
             <p className="text-xs font-bold opacity-40 mt-6 relative z-10 italic">
               Follow this counsel to reduce your Friction Index and ensure a more stable value integration.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegretPredictor;