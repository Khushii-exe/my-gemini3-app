
import React from 'react';
import { Outcome } from '../types';

interface RiskVisualizerProps {
  worstOutcome: Outcome;
}

const RiskVisualizer: React.FC<RiskVisualizerProps> = ({ worstOutcome }) => {
  const score = worstOutcome.impactScore || 5;
  const severityColor = score > 7 ? 'bg-rose-600' : score > 4 ? 'bg-amber-500' : 'bg-cyan-500';
  
  const stages = [
    { label: 'Initial Impact', active: true, duration: '0-3 Months' },
    { label: 'Systemic Shift', active: score > 4, duration: '6-18 Months' },
    { label: 'Long-term Delta', active: score > 7, duration: '2+ Years' },
  ];

  return (
    <div className="bg-white rounded-[32px] p-8 border border-cyan-50 shadow-xl overflow-hidden relative">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h4 className="text-xs font-black uppercase text-cyan-400 tracking-[0.2em] mb-1">Risk Architecture</h4>
            <p className="text-xl font-black text-blue-900">Worst Case Assessment</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${severityColor} animate-pulse`}></span>
            <span className="text-xs font-bold text-blue-500">Tier {score > 7 ? 'III (High)' : score > 4 ? 'II (Med)' : 'I (Low)'}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="flex justify-between items-end mb-3">
              <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Impact Severity</span>
              <span className={`text-2xl font-black ${score > 7 ? 'text-rose-600' : 'text-blue-900'}`}>{score}/10</span>
            </div>
            <div className="flex gap-1 h-2">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-full flex-grow rounded-full transition-all duration-700 ${
                    i < score ? severityColor : 'bg-cyan-50'
                  }`}
                  style={{ transitionDelay: `${i * 40}ms` }}
                ></div>
              ))}
            </div>
            <p className="text-[10px] text-cyan-400 mt-3 font-medium">
              Calculated based on emotional fallout and financial variance.
            </p>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest block mb-1">Ripple Horizon</span>
            <div className="relative pl-4 space-y-4 before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-cyan-50">
              {stages.map((stage, idx) => (
                <div key={stage.label} className="relative">
                  <div className={`absolute -left-[18px] top-1.5 w-2 h-2 rounded-full border-2 border-white shadow-sm ${stage.active ? severityColor : 'bg-cyan-100'}`}></div>
                  <div className={`transition-opacity duration-500 ${stage.active ? 'opacity-100' : 'opacity-30'}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-blue-800">{stage.label}</span>
                      <span className="text-[9px] font-mono text-cyan-400">{stage.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-pink-50 rounded-2xl p-6 border border-pink-100 group hover:bg-blue-950 hover:text-white transition-all duration-500 cursor-default">
          <div className="flex items-center gap-2 mb-2">
            <i className={`fa-solid fa-bolt-lightning text-xs ${score > 7 ? 'text-amber-500' : 'text-pink-400'}`}></i>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Long-term Prognosis</span>
          </div>
          <p className="text-sm font-semibold leading-relaxed group-hover:text-cyan-400 transition-colors">
            "{worstOutcome.longTermEffect}"
          </p>
        </div>
      </div>
      
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none transform translate-x-1/4 -translate-y-1/4 scale-150">
        <i className="fa-solid fa-clock-rotate-left text-[200px] text-blue-900"></i>
      </div>
    </div>
  );
};

export default RiskVisualizer;
