
import React from 'react';
import { InactionScenario } from '../types';

interface InactionViewProps {
  scenario: InactionScenario;
  theme: 'light' | 'dark';
}

const InactionView: React.FC<InactionViewProps> = ({ scenario, theme }) => {
  const getZone = (score: number) => {
    if (score <= 3) return { label: 'Comfort Zone', color: 'text-emerald-500', bg: 'bg-emerald-500', desc: 'Low stagnation risk. You are stable, but your personal and professional evolution remains static.' };
    if (score <= 7) return { label: 'Growth Plateau', color: 'text-amber-500', bg: 'bg-amber-500', desc: 'Moderate stagnation. The momentum of your life has leveled off; opportunities are starting to pass you by.' };
    return { label: 'Stagnation Trap', color: 'text-rose-500', bg: 'bg-rose-500', desc: 'High atrophy risk. Staying still is actively damaging your potential and resulting in significant life-variance loss.' };
  };

  const zone = getZone(scenario.stagnationRisk || 0);
  const safeTrajectory = scenario.trajectory || [];

  return (
    <div className="py-12 space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="text-center relative">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-15 blur-3xl pointer-events-none">
          <i className="fa-solid fa-ghost text-[120px] text-slate-400"></i>
        </div>
        <h3 className="text-5xl md:text-6xl font-black tracking-tighter italic mb-4">The Cost of Inaction</h3>
        <p className="text-sm uppercase tracking-[0.5em] opacity-60 font-black text-slate-500 mb-6">Long-Term Status Quo Forensics</p>
        <p className="max-w-2xl mx-auto text-lg md:text-2xl opacity-90 leading-relaxed font-semibold italic text-slate-600 dark:text-slate-300">
          "Sometimes standing still is the most expensive decision you'll ever make." — Aura visualizes the slow decay of the status quo when a pivot is rejected.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
        {/* Stagnation Level Gauge */}
        <div className="p-12 rounded-[64px] border border-slate-200 dark:border-white/10 glass-card bg-slate-50/50 dark:bg-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-xl">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-all duration-700">
             <i className="fa-solid fa-hourglass-start text-8xl"></i>
          </div>
          
          <div className="mb-10 w-full relative z-10">
            <span className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 block mb-8">Entropy & Atrophy Measurement</span>
            
            <div className="relative w-full h-14 bg-slate-200/50 dark:bg-white/5 rounded-[28px] overflow-hidden mb-6 p-1.5 shadow-inner border border-white/10">
              <div 
                className={`h-full rounded-[22px] transition-all duration-1500 ease-out shadow-[0_0_30px_rgba(0,0,0,0.1)] ${zone.bg}`}
                style={{ width: `${Math.max((scenario.stagnationRisk || 0) * 10, 8)}%` }}
              >
                <div className="w-full h-full bg-white/20 animate-pulse"></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center px-4">
              <span className={`text-4xl font-black tracking-tight ${zone.color}`}>{zone.label}</span>
              <span className="text-lg font-black opacity-30 tracking-widest">{(scenario.stagnationRisk || 0)}/10 ENTROPY</span>
            </div>
            <p className="text-lg md:text-xl font-bold opacity-70 mt-8 leading-relaxed px-6 italic text-slate-500 dark:text-slate-400">
              {zone.desc}
            </p>
          </div>

          <div className="pt-10 border-t border-slate-200 dark:border-white/10 w-full relative z-10">
             <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6">The 5-Year Status Quo Reality</h4>
             <p className="text-2xl md:text-4xl font-black text-slate-800 dark:text-slate-100 italic leading-tight px-4">
               "{scenario.fiveYearFate?.replace(/\bthe user\b/gi, 'you') || "The baseline continues with gradual shifts."}"
             </p>
          </div>
        </div>

        {/* Opportunity Cost & Observation */}
        <div className="flex flex-col gap-8">
          <div className="p-10 rounded-[48px] border border-slate-200 dark:border-white/10 glass-card bg-slate-50/30 dark:bg-white/5 flex-grow shadow-lg">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 rounded-[24px] bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center text-rose-500 shadow-lg border border-rose-500/20">
                <i className="fa-solid fa-ban text-2xl"></i>
              </div>
              <div>
                <h4 className="text-3xl font-black leading-none text-slate-800 dark:text-white tracking-tight">Opportunity Atrophy</h4>
                <p className="text-[10px] uppercase tracking-widest opacity-60 font-black mt-3">The Doors That Close Forever If You Wait</p>
              </div>
            </div>
            <div className="space-y-4">
              {(scenario.missedOpportunities || []).slice(0, 3).map((op, idx) => (
                <div key={idx} className="flex gap-6 items-start p-6 rounded-[28px] bg-white/70 dark:bg-white/5 border border-slate-100 dark:border-white/10 group hover:border-rose-400 hover:shadow-lg transition-all">
                  <span className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex-shrink-0 flex items-center justify-center text-lg font-black shadow-sm">{idx + 1}</span>
                  <p className="text-lg font-bold opacity-90 leading-relaxed text-slate-700 dark:text-slate-200">{op}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-12 rounded-[48px] bg-[#0c0e2b] text-white shadow-2xl relative overflow-hidden group border border-white/10">
            <div className="absolute -top-10 -right-10 p-12 opacity-15 group-hover:rotate-12 group-hover:scale-110 transition-all duration-1000">
               <i className="fa-solid fa-moon text-[120px]"></i>
            </div>
            <h4 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 mb-6">Aura's Core Forensic Insight</h4>
            <p className="text-2xl md:text-3xl font-black italic leading-tight relative z-10 text-slate-100">
              "{scenario.summary?.replace(/\bthe user\b/gi, 'you') || "No immediate shifts detected."}"
            </p>
          </div>
        </div>
      </div>

      {/* Shadow Trajectory Detail */}
      <div className="pt-20 border-t border-slate-200 dark:border-white/10">
        <div className="text-center mb-16">
          <h4 className="text-xs font-black uppercase tracking-[0.5em] text-slate-400 mb-4">The Inaction Path Timeline</h4>
          <p className="text-4xl md:text-[80px] font-black italic tracking-tighter text-[#0c0e2b] dark:text-white leading-none">The Slow Progression of Stillness</p>
          <p className="text-lg font-bold opacity-50 mt-4 italic max-w-2xl mx-auto">Visualizing the gradual erosion of the alternative timeline you are currently avoiding.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {safeTrajectory.map((node, i) => (
            <div key={i} className="p-8 md:p-10 rounded-[56px] border border-slate-100 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl hover:border-slate-400 hover:shadow-2xl transition-all flex flex-col h-full shadow-lg group">
              <div className="mb-10 flex justify-between items-start">
                <span className="inline-block px-8 py-3 rounded-full bg-[#0c0e2b] text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl">
                  {node.period || `Year ${i + 1}`}
                </span>
                <span className="text-slate-200 dark:text-slate-800 text-5xl font-black opacity-30 group-hover:opacity-50 transition-opacity select-none">0{i+1}</span>
              </div>
              <h5 className="text-2xl md:text-3xl font-black mb-6 leading-tight text-[#0c0e2b] dark:text-white">{node.milestone}</h5>
              <p className="text-base font-bold opacity-80 italic mb-10 flex-grow leading-relaxed text-slate-700 dark:text-slate-300">
                "{node.consequence.replace(/\bthe user\b/gi, 'you')}"
              </p>
              <div className="pt-6 border-t border-slate-200 dark:border-white/10">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-pink-500 block mb-3">Entropy Logic</span>
                <p className="text-xs font-bold opacity-50 leading-relaxed text-slate-600 dark:text-slate-400">
                  {node.butterflyEffect.replace(/\bthe user\b/gi, 'you')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InactionView;
