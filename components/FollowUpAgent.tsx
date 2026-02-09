
import React, { useState, useEffect } from 'react';
import { FollowUp } from '../types';

interface FollowUpAgentProps {
  followUps: FollowUp[];
  onCheckIn: (followUp: FollowUp) => void;
  onDismiss: (id: string) => void;
  theme: 'light' | 'dark';
}

const FollowUpAgent: React.FC<FollowUpAgentProps> = ({ followUps, onCheckIn, onDismiss, theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dueFollowUps, setDueFollowUps] = useState<FollowUp[]>([]);

  useEffect(() => {
    const checkFollowUps = () => {
      const now = Date.now();
      const due = followUps.filter(f => !f.completed && f.scheduledDate <= now);
      setDueFollowUps(due);
    };

    checkFollowUps();
    const interval = setInterval(checkFollowUps, 60 * 60 * 1000); // Check every hour
    return () => clearInterval(interval);
  }, [followUps]);

  if (dueFollowUps.length === 0 && !isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-[300]">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 p-6 rounded-[32px] glass-card border border-slate-200 dark:border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-black uppercase tracking-widest">Aura Follow-ups</h4>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {dueFollowUps.length > 0 ? (
              dueFollowUps.map(f => (
                <div key={f.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                  <p className="text-xs font-bold opacity-60 mb-2 truncate">Regarding: "{f.decisionLabel}"</p>
                  <p className="font-bold text-sm italic mb-4">Aura asks: "{f.question}"</p>
                  <div className="flex gap-2">
                    <button onClick={() => onCheckIn(f)} className="flex-1 px-3 py-2 bg-pink-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-pink-600 transition-colors">Check-in</button>
                    <button onClick={() => onDismiss(f.id)} className="flex-1 px-3 py-2 bg-slate-100 dark:bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">Dismiss</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-xs font-bold opacity-50 py-8">No pending check-ins. Your path is clear for now. ✨</p>
            )}
          </div>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-emerald-400 text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform relative"
        aria-label="Open Follow-ups"
      >
        <i className={`fa-solid ${isOpen ? 'fa-times' : 'fa-bell'} text-xl`}></i>
        {dueFollowUps.length > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white text-xs font-black flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
            {dueFollowUps.length}
          </span>
        )}
      </button>
    </div>
  );
};

export default FollowUpAgent;
