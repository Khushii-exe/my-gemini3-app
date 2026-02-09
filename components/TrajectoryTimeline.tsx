
import React from 'react';
import { TrajectoryNode } from '../types';

interface TrajectoryTimelineProps {
  nodes: TrajectoryNode[];
  theme: 'light' | 'dark';
}

const TrajectoryTimeline: React.FC<TrajectoryTimelineProps> = ({ nodes = [], theme }) => {
  const safeNodes = nodes || [];

  return (
    <div className="py-8 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-16">
        <h3 className="text-5xl md:text-7xl font-black tracking-tighter italic mb-4 text-slate-900 dark:text-white leading-none">The Infinite Ripple</h3>
        <p className="text-sm uppercase tracking-[0.5em] opacity-40 text-slate-500 font-black mb-6">Temporal Reality Mapping</p>
        <p className="max-w-2xl mx-auto text-lg font-bold opacity-60 italic leading-relaxed text-slate-600 dark:text-slate-300">
          Visualizing the long-term consequences and the butterfly effect of your chosen path over the next five years.
        </p>
      </div>

      <div className="relative max-w-5xl mx-auto px-4">
        {/* Connector Line */}
        <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-[4px] bg-gradient-to-b from-pink-500 via-purple-500 to-cyan-500 opacity-20 rounded-full"></div>

        <div className="space-y-12">
          {safeNodes.map((node, i) => (
            <div key={i} className={`flex flex-col md:flex-row items-center gap-6 md:gap-12 relative ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
              {/* Marker */}
              <div className={`absolute left-2 md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white dark:bg-slate-900 border-4 transition-all duration-1000 z-10 shadow-2xl ${
                i === 0 ? 'border-pink-500' : i === safeNodes.length - 1 ? 'border-cyan-500' : 'border-purple-500'
              }`}>
                <div className={`w-full h-full rounded-full animate-ping opacity-20 ${
                  i === 0 ? 'bg-pink-500' : i === safeNodes.length - 1 ? 'bg-cyan-500' : 'bg-purple-500'
                }`}></div>
              </div>

              {/* Card */}
              <div className="flex-1 w-full ml-10 md:ml-0">
                <div className={`p-8 md:p-10 rounded-[48px] border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-pink-300 relative overflow-hidden group ${i % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                  {/* Subtle Background Accent */}
                  <div className={`absolute top-0 ${i % 2 === 0 ? 'right-0' : 'left-0'} w-32 h-32 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`}>
                    <i className="fa-solid fa-feather-pointed text-[120px]"></i>
                  </div>

                  <div className={`flex items-center gap-3 mb-6 ${i % 2 === 0 ? 'md:justify-start' : 'md:justify-end'} justify-start`}>
                    <span className="px-6 py-2 rounded-full bg-[#0c0e2b] text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
                      {node.period || `Year ${i + 1}`}
                    </span>
                  </div>

                  <h4 className="text-2xl md:text-3xl font-black mb-6 tracking-tight leading-tight text-slate-800 dark:text-white">{node.milestone}</h4>
                  
                  <div className={`p-6 md:p-8 rounded-[32px] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 mb-8 shadow-inner`}>
                     <p className="text-base md:text-lg font-bold opacity-90 leading-relaxed italic text-slate-700 dark:text-slate-200">
                       "{node.consequence.replace(/\bthe user\b/gi, 'you')}"
                     </p>
                  </div>
                  
                  <div className={`pt-6 border-t ${theme === 'dark' ? 'border-white/10' : 'border-slate-100'}`}>
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-pink-500 block mb-3">Entropy Logic</span>
                    <p className="text-xs font-bold opacity-50 leading-relaxed text-slate-600 dark:text-slate-400">
                      {node.butterflyEffect.replace(/\bthe user\b/gi, 'you')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Spacer */}
              <div className="flex-1 hidden md:block"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrajectoryTimeline;
