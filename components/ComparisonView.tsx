
import React from 'react';
import { SavedSimulation } from '../types';

interface ComparisonViewProps {
  simulations: SavedSimulation[];
  onClose: () => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ simulations, onClose }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 bg-white rounded-[40px] shadow-2xl border border-pink-100 overflow-hidden">
      <div className="p-8 border-b border-pink-50 flex justify-between items-center bg-pink-50/30">
        <div>
          <h2 className="text-2xl font-black text-blue-900 tracking-tight">Strategy Comparison</h2>
          <p className="text-pink-500 text-sm">Contrasting your drafted futures side-by-side.</p>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white border border-pink-100 flex items-center justify-center text-pink-400 hover:text-pink-900 transition-colors shadow-sm"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white">
              <th className="p-6 text-xs font-black uppercase text-pink-300 tracking-widest border-b border-pink-50 min-w-[200px]">Metrics</th>
              {simulations.map(s => (
                <th key={s.id} className="p-6 border-b border-pink-50 min-w-[300px]">
                  <div className="text-emerald-600 text-xs font-bold uppercase mb-1">Option {s.id.slice(0,4)}</div>
                  <div className="text-blue-900 font-bold leading-tight">{s.input.decision}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="align-top">
              <td className="p-6 border-b border-pink-50 bg-pink-50/10">
                <div className="font-bold text-blue-800">Most Likely Outcome</div>
                <div className="text-[10px] text-pink-400 uppercase mt-1">Primary Forecast</div>
              </td>
              {simulations.map(s => (
                <td key={s.id} className="p-6 border-b border-pink-50">
                  <div className="font-bold text-blue-700 mb-2">{s.result.outcomes.mostLikely.title}</div>
                  <p className="text-xs text-blue-600 leading-relaxed mb-3">{s.result.outcomes.mostLikely.description}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-grow h-1 bg-blue-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${s.result.outcomes.mostLikely.probability * 100}%` }}></div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-blue-600">{Math.round(s.result.outcomes.mostLikely.probability * 100)}%</span>
                  </div>
                </td>
              ))}
            </tr>
            <tr className="align-top">
              <td className="p-6 border-b border-pink-50 bg-pink-50/10">
                <div className="font-bold text-blue-800">Risk Profile</div>
                <div className="text-[10px] text-pink-400 uppercase mt-1">Worst Case Scenario</div>
              </td>
              {simulations.map(s => (
                <td key={s.id} className="p-6 border-b border-pink-50">
                  <div className="font-bold text-rose-700 mb-2">{s.result.outcomes.worst.title}</div>
                  <p className="text-xs text-blue-600 leading-relaxed italic">"{s.result.outcomes.worst.longTermEffect}"</p>
                </td>
              ))}
            </tr>
            <tr className="align-top">
              <td className="p-6 border-b border-pink-50 bg-pink-50/10">
                <div className="font-bold text-blue-800">Value Alignment</div>
                <div className="text-[10px] text-pink-400 uppercase mt-1">Core Values Score</div>
              </td>
              {simulations.map(s => {
                const avg = s.result.alignment.reduce((acc, curr) => acc + curr.score, 0) / s.result.alignment.length;
                return (
                  <td key={s.id} className="p-6 border-b border-pink-50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-2xl font-black text-blue-900">{Math.round(avg)}%</div>
                      <div className="text-[10px] font-bold text-pink-400 uppercase leading-none">Overall<br/>Match</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {s.result.alignment.map(v => (
                        <div key={v.value} className="px-2 py-1 bg-pink-50 rounded text-[10px] font-bold text-pink-600">
                          {v.value}: {v.score}%
                        </div>
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>
            <tr className="align-top">
              <td className="p-6 bg-pink-50/10">
                <div className="font-bold text-blue-800">Key Tradeoff</div>
                <div className="text-[10px] text-pink-400 uppercase mt-1">Main Sacrifice</div>
              </td>
              {simulations.map(s => (
                <td key={s.id} className="p-6">
                  <p className="text-xs font-medium text-blue-700 leading-relaxed border-l-2 border-rose-300 pl-4 py-1">
                    {s.result.verdict.mainTradeoff}
                  </p>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonView;
