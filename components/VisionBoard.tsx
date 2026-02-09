
import React from 'react';

interface VisionBoardProps {
  imageUrl?: string;
  title?: string;
  theme: 'light' | 'dark';
}

const VisionBoard: React.FC<VisionBoardProps> = ({ imageUrl, title, theme }) => {
  if (!imageUrl) {
    return (
      <div className="p-2 rounded-[24px] bg-slate-200 dark:bg-slate-800 shadow-2xl border-2 border-slate-300 dark:border-slate-700">
        <div className="p-1 rounded-[16px] bg-slate-900">
          <div className="relative aspect-[16/9] rounded-[14px] overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center">
            <div className="text-center text-white">
              <i className="fa-solid fa-spinner fa-spin text-3xl mb-4"></i>
              <h3 className="text-xl font-black">Generating Vision Board...</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 rounded-[24px] bg-slate-200 dark:bg-slate-800 shadow-2xl border-2 border-slate-300 dark:border-slate-700 group">
      <div className="p-1 rounded-[16px] bg-slate-900">
        <div className="relative aspect-[16/9] rounded-[14px] overflow-hidden bg-slate-900 border border-white/10">
          <img src={imageUrl} alt={title || 'AI Vision Board'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          {/* Top Projector Light Flare */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-1/3 h-8 bg-white/30 rounded-full blur-2xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="absolute bottom-0 left-0 p-6 md:p-10 text-white">
            <h3 className="text-2xl md:text-4xl font-black tracking-tight drop-shadow-lg leading-tight">{title}</h3>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] opacity-80 drop-shadow-lg mt-2">Aura's Vision Synthesis</p>
          </div>

          <div className="absolute top-6 left-6 text-white text-[9px] font-black uppercase tracking-widest opacity-70 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse border-2 border-emerald-300/50"></span>
            LIVE SYNTHESIS
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionBoard;
