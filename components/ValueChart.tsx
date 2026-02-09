
import React from 'react';
import { ValueAlignment } from '../types';

interface ValueChartProps {
  data: ValueAlignment[];
}

const ValueChart: React.FC<ValueChartProps> = ({ data }) => {
  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div 
          key={item.value} 
          className="group bg-white border border-pink-50 p-4 rounded-3xl hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-50 transition-all cursor-default"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-blue-900 tracking-wider">
                {item.value}
              </span>
              
              <div className="relative group/info">
                <i className="fa-solid fa-circle-info text-[10px] text-pink-300 hover:text-emerald-500 cursor-help transition-colors"></i>
                <div className="absolute bottom-full left-0 mb-3 w-64 p-4 bg-blue-950 text-white text-[11px] rounded-2xl opacity-0 group-hover/info:opacity-100 transition-all pointer-events-none z-30 shadow-2xl border border-blue-800 leading-relaxed italic transform scale-95 group-hover/info:scale-100 origin-bottom-left">
                  <div className="font-black text-emerald-400 mb-1 uppercase tracking-tighter border-b border-white/10 pb-1 flex items-center gap-2">
                    <i className="fa-solid fa-feather-pointed"></i>
                    Aura's Reasoning
                  </div>
                  "{item.commentary}"
                  <div className="absolute top-full left-4 border-8 border-transparent border-t-blue-950"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                item.score > 70 ? 'bg-emerald-100 text-emerald-700' : 
                item.score > 40 ? 'bg-amber-100 text-amber-700' : 
                'bg-pink-50 text-pink-600'
              }`}>
                {item.score}% Match
              </span>
            </div>
          </div>

          <div className="relative w-full h-3 bg-pink-50 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-out rounded-full ${
                item.score > 70 ? 'bg-emerald-500' : 
                item.score > 40 ? 'bg-amber-400' : 
                'bg-pink-400'
              }`}
              style={{ width: `${item.score}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ValueChart;
