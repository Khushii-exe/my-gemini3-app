
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { SimulationResult } from '../types';

interface ForecastConfidenceProps {
  result: SimulationResult;
  theme: 'light' | 'dark';
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, percent }: any) => {
    if (percent < 0.05) return null; // Avoid clutter on very small slices
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-black pointer-events-none">
            {`${value}%`}
        </text>
    );
};


const ForecastConfidence: React.FC<ForecastConfidenceProps> = ({ result, theme }) => {
  const data = (result.charts.probabilityDistribution || []).map(d => ({...d, name: d.name.toUpperCase()}));
  
  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex items-center justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center gap-2">
            <span style={{ backgroundColor: entry.color, width: '10px', height: '10px', borderRadius: '50%' }}></span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  const bgColor = theme === 'dark' ? '#02041a' : '#fdfbff';
  const systemCertainty = Math.min(100, Math.round((result.verdict.overallConfidence || 0) * 100));

  return (
    <div className="p-10 rounded-[56px] border border-slate-200 dark:border-white/10 glass-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="md:pr-8">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">TIMELINE MAP</h4>
          <p className="text-3xl font-black italic text-slate-900 dark:text-white mb-4">Forecast Confidence</p>
          <p className="text-sm font-bold opacity-60 leading-relaxed text-slate-600 dark:text-slate-400 mb-8">
            Displays the probability distribution of possible futures. It quantifies the likelihood of your best-case manifestation versus potential entropy or stabilization, helping you gauge the risk-reward ratio of this specific path.
          </p>

          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <p className="text-pink-500 text-5xl font-black leading-none">{systemCertainty}<span className="text-3xl">%</span></p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">System Certainty</p>
            </div>
            <div className="flex-grow">
              <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{result.verdict.recommendation}</p>
              <span className="mt-2 inline-block px-3 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[9px] font-black uppercase tracking-widest rounded-full">Primary Catalyst</span>
            </div>
          </div>
        </div>

        <div className="w-full h-[300px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="100%"
                dataKey="value"
                stroke={bgColor}
                strokeWidth={4}
                cornerRadius={8}
                paddingAngle={2}
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend content={<CustomLegend />} verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                    <i className="fa-solid fa-bolt text-pink-500 text-2xl"></i>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-1">Trajectory</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastConfidence;
