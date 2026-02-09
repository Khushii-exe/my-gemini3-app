
import React from 'react';
import { ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { SimulationResult } from '../types';
import ValueRadarChart from './ValueRadarChart';
import VisionBoard from './VisionBoard';
import OutcomeCard from './OutcomeCard';
import ForecastConfidence from './ForecastConfidence';

interface StrategicDashboardProps {
  result: SimulationResult;
  theme: 'light' | 'dark';
}

const StrategicDashboard: React.FC<StrategicDashboardProps> = ({ result, theme }) => {
  return (
    <div className="space-y-12">
      {/* Vision Board (AI Image Gen) */}
      {result?.visionBoardUrl && (
        <div className="animate-in fade-in duration-700">
          <VisionBoard 
            imageUrl={result.visionBoardUrl} 
            title={result.outcomes.best.title} 
            theme={theme} 
          />
        </div>
      )}

      {/* Decision State (Interpreter Stage) */}
      {result?.reasoningArtifacts && (
        <div className="p-10 rounded-[56px] border border-slate-200 dark:border-white/10 glass-card bg-slate-50/50 dark:bg-white/[0.02] shadow-inner">
          <div className="mb-10 text-center">
            <h5 className="text-[10px] font-black uppercase tracking-[0.5em] text-pink-500 mb-4">Decision State</h5>
            <p className="text-2xl font-black italic text-slate-900 dark:text-white">"{result.reasoningArtifacts.decisionSummary}"</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h6 className="text-[10px] font-black uppercase tracking-widest text-rose-500">Key Tensions</h6>
              <ul className="space-y-3">
                {(result.reasoningArtifacts.keyTensions || []).map((t, i) => (
                  <li key={i} className="text-xs font-bold opacity-70 flex gap-2"><span className="text-rose-500">•</span> {t}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h6 className="text-[10px] font-black uppercase tracking-widest text-cyan-500">Non-Negotiables</h6>
              <ul className="space-y-3">
                {(result.reasoningArtifacts.nonNegotiables || []).map((t, i) => (
                  <li key={i} className="text-xs font-bold opacity-70 flex gap-2"><span className="text-cyan-500">•</span> {t}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h6 className="text-[10px] font-black uppercase tracking-widest text-amber-500">Unclear Assumptions</h6>
              <ul className="space-y-3">
                {(result.reasoningArtifacts.unclearAssumptions || []).map((t, i) => (
                  <li key={i} className="text-xs font-bold opacity-70 flex gap-2"><span className="text-amber-500">•</span> {t}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h6 className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Pressure Points</h6>
              <ul className="space-y-3">
                {(result.reasoningArtifacts.pressurePoints || []).map((t, i) => (
                  <li key={i} className="text-xs font-bold opacity-70 flex gap-2"><span className="text-emerald-500">•</span> {t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Outcome Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          <OutcomeCard type="best" outcome={result.outcomes.best} />
          <OutcomeCard type="mostLikely" outcome={result.outcomes.mostLikely} />
          <OutcomeCard type="worst" outcome={result.outcomes.worst} />
      </div>

      {/* Forecast Confidence */}
      <ForecastConfidence result={result} theme={theme} />
      
      {/* Simulator Paths (Call #2 Output) */}
      {result?.paths && result.paths.length > 0 && (
        <div className="space-y-8">
           <div className="text-center">
             <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Simulation Variances</h4>
             <p className="text-xl font-black italic">Strategic Forecast Paths</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {result.paths.map((path, idx) => (
               <div key={idx} className="p-8 rounded-[40px] border border-slate-200 dark:border-white/10 glass-card bg-white/40 dark:bg-black/20 hover:scale-[1.02] transition-transform">
                 <div className="flex items-center gap-3 mb-6">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                    <h5 className="text-sm font-black uppercase tracking-widest">{path.label}</h5>
                 </div>
                 <div className="space-y-4">
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-pink-500 block mb-1">Prioritizes</span>
                      <p className="text-xs font-bold opacity-70">{path.prioritizes}</p>
                    </div>
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-cyan-500 block mb-1">Potential Gains</span>
                      <p className="text-xs font-bold opacity-70">{path.offers}</p>
                    </div>
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-rose-500 block mb-1">Required Trade-off</span>
                      <p className="text-xs font-bold opacity-70">{path.requires}</p>
                    </div>
                 </div>
               </div>
             ))}
           </div>
           
           {result?.crossPathObservations && result.crossPathObservations.length > 0 && (
             <div className="p-8 rounded-[40px] border border-cyan-500/20 bg-cyan-500/[0.03] text-center italic font-bold text-sm opacity-80 max-w-4xl mx-auto">
               <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500 block mb-4">Cross-Path Observations</span>
               <div className="flex flex-col gap-2">
                 {result.crossPathObservations.map((obs, i) => (
                   <p key={i}>"{obs}"</p>
                 ))}
               </div>
             </div>
           )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-8 rounded-[40px] border border-slate-200 dark:border-white/10 glass-card">
          <div className="text-left mb-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-500 mb-2">Resonance Signature</h4>
            <p className="text-lg font-black italic">Value Alignment</p>
            <p className="text-xs font-bold opacity-50 mt-2 max-w-md">This radar map visualizes how deeply your decision resonates with your core-drivers. The larger the spread, the more aligned you are with your foundational life values.</p>
          </div>
          <div className="h-[320px]">
            <ValueRadarChart data={result?.alignment || []} theme={theme} />
          </div>
        </div>

        <div className="p-8 rounded-[40px] border border-slate-200 dark:border-white/10 glass-card">
          <div className="text-left mb-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Dimensional Variance</h4>
            <p className="text-lg font-black italic">Strategic Impact</p>
            <p className="text-xs font-bold opacity-50 mt-2 max-w-md">Measures how this choice shifts your reality across key dimensions. High variance indicates a high-stakes pivot that significantly reshapes your short and long-term trajectory.</p>
          </div>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result?.charts?.impactMagnitude || []} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" hide domain={[0, 10]} />
                <YAxis dataKey="category" type="category" width={80} tick={{ fontSize: 9, fontStretch: 'ultra-condensed', fontWeight: 900, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '16px', fontSize: '11px', fontWeight: 'bold', backgroundColor: theme === 'dark' ? '#0f112d' : '#fff' }} />
                <Bar dataKey="score" radius={[0, 10, 10, 0]} fill="#ec4899" barSize={14} background={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', radius: 10 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {result?.reflection && (
        <div className="p-10 md:p-16 rounded-[56px] border border-cyan-500/20 glass-card bg-cyan-500/[0.03]">
           <div className="flex flex-col items-center max-w-6xl mx-auto">
              <div className="text-center mb-16">
                 <h3 className="text-3xl md:text-4xl font-black italic tracking-tighter mb-4 text-slate-900 dark:text-white leading-tight">Meta-Reflection Audit</h3>
              </div>
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-10">
                    <div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500 block mb-4">Hidden Assumptions</span>
                       <ul className="space-y-4">
                          {(result?.reflection?.assumptionsMade || [])?.map((a, i) => (
                             <li key={i} className="text-sm font-bold opacity-80 flex gap-3"><span className="text-cyan-500">•</span> <span>{a}</span></li>
                          ))}
                       </ul>
                    </div>
                    <div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-pink-500 block mb-4">Sensitivity Factors</span>
                       <ul className="space-y-4">
                          {(result?.reflection?.sensitivityFactors || [])?.map((f, i) => (
                             <li key={i} className="text-sm font-bold opacity-80 flex gap-3"><span className="text-pink-500">•</span> <span>{f}</span></li>
                          ))}
                       </ul>
                    </div>
                 </div>
                 <div className="p-8 md:p-10 rounded-[40px] bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/20">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Uncertainty Concentration</span>
                    <div className="text-sm font-bold italic space-y-4">
                      {(result?.reflection?.uncertaintyConcentration?.split('\n') || []).filter(l => l.trim()).map((line, idx) => (
                         <div key={idx} className="flex gap-3"><span className="text-pink-400">•</span> <span>{line.replace(/^[•\-\*]\s*/, '')}</span></div>
                      ))}
                    </div>
                    <div className="pt-10 border-t border-white/10 mt-8">
                       <p className="text-lg font-black italic text-emerald-500">"{result?.reflection?.adaptationAdvice || "Proceed with adaptive awareness."}"</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StrategicDashboard;
