
import React, { useState } from 'react';
import { Outcome } from '../types';

interface OutcomeCardProps {
  type: 'best' | 'worst' | 'mostLikely';
  outcome: Outcome;
}

const OutcomeCard: React.FC<OutcomeCardProps> = ({ type, outcome }) => {
  const [copied, setCopied] = useState(false);

  const themes = {
    best: {
      accent: 'emerald-400',
      label: 'Optimal',
      icon: 'fa-sparkles',
      color: '#34d399'
    },
    worst: {
      accent: 'rose-400',
      label: 'Entropy',
      icon: 'fa-triangle-exclamation',
      color: '#fb7185'
    },
    mostLikely: {
      accent: 'blue-400',
      label: 'Likely',
      icon: 'fa-atom',
      color: '#60a5fa'
    },
  };

  const emotionalImpactThemes = {
    Positive: { icon: 'fa-face-smile', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    Negative: { icon: 'fa-face-frown', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
    Neutral: { icon: 'fa-face-meh', color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' }
  };

  const impactTheme = emotionalImpactThemes[outcome.emotionalImpact as keyof typeof emotionalImpactThemes] || emotionalImpactThemes.Neutral;

  const confidenceThemes = {
    High: 'text-emerald-500 bg-emerald-500/10',
    Medium: 'text-amber-500 bg-amber-500/10',
    Low: 'text-rose-500 bg-rose-500/10'
  };

  const probPercent = Math.round(outcome.probability * 100);

  const handleShare = async () => {
    const shareText = `LifeDraft AI Forecast: "${outcome.title}" - ${outcome.description} (${probPercent}% probability). Explore your future paths at LifeDraft AI. ✨ #LifeDraftAI #AuraAdvisor`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'LifeDraft AI Outcome',
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  return (
    <div className="p-10 rounded-[48px] border border-slate-200 dark:border-white/10 glass-card flex flex-col h-full hover:scale-[1.02] transition-all group relative overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <span className="px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-slate-200 dark:border-white/10" 
              style={{ color: themes[type].color, borderColor: `${themes[type].color}33`, backgroundColor: `${themes[type].color}11` }}>
          <i className={`fa-solid ${themes[type].icon}`}></i>
          {themes[type].label}
        </span>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleShare}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              copied ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-pink-500 hover:bg-pink-500/10'
            }`}
            title="Share this outcome"
          >
            <i className={`fa-solid ${copied ? 'fa-check' : 'fa-share-nodes'} text-xs`}></i>
          </button>
          <span className="text-xl font-black opacity-60">{outcome.impactScore}/10</span>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Probability</span>
          <span className="text-2xl font-black">{probPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-1000 ease-out" 
            style={{ width: `${probPercent}%`, backgroundColor: themes[type].color }}
          ></div>
        </div>
      </div>

      <h3 className="text-2xl font-black mb-4 tracking-tight leading-tight">{outcome.title}</h3>
      <p className="text-base font-medium opacity-80 dark:text-slate-300 leading-relaxed italic mb-8 flex-grow">"{outcome.description}"</p>
      
      <div className="mb-8 p-6 rounded-[32px] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 relative group/confidence overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Forecasting Confidence</span>
          <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${confidenceThemes[outcome.confidenceLevel as keyof typeof confidenceThemes] || 'text-slate-500 bg-slate-100'}`}>
            {outcome.confidenceLevel}
          </span>
        </div>
        <div className="flex gap-1 mb-4">
           <div className={`h-1.5 flex-1 rounded-full transition-all duration-1000 ${outcome.confidenceLevel === 'High' ? 'bg-emerald-400' : outcome.confidenceLevel === 'Medium' ? 'bg-amber-400' : outcome.confidenceLevel === 'Low' ? 'bg-rose-400' : 'bg-slate-200'}`}></div>
           <div className={`h-1.5 flex-1 rounded-full transition-all duration-1000 delay-75 ${outcome.confidenceLevel === 'High' ? 'bg-emerald-400' : outcome.confidenceLevel === 'Medium' ? 'bg-amber-400' : 'bg-slate-200'}`}></div>
           <div className={`h-1.5 flex-1 rounded-full transition-all duration-1000 delay-150 ${outcome.confidenceLevel === 'High' ? 'bg-emerald-400' : 'bg-slate-200'}`}></div>
        </div>
        <div className="text-[11px] font-bold opacity-60 leading-relaxed italic">
          "{outcome.confidenceReasoning}"
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-white/10 mt-auto">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-pink-500 block mb-2">Emotional Impact</span>
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border ${impactTheme.color}`}>
              <i className={`fa-solid ${impactTheme.icon}`}></i>
              {outcome.emotionalImpact}
            </span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-pink-500 block mb-2">Impact Horizon</span>
          <p className="text-sm font-bold opacity-90 dark:text-slate-200 leading-relaxed">{outcome.longTermEffect}</p>
        </div>
      </div>

      {copied && (
        <div className="absolute top-2 right-1/2 translate-x-1/2 animate-in fade-in slide-in-from-top-2">
          <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-full shadow-lg">Copied!</span>
        </div>
      )}
    </div>
  );
};

export default OutcomeCard;
