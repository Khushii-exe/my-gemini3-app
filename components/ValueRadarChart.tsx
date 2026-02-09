
import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { ValueAlignment } from '../types';

interface ValueRadarChartProps {
  data: ValueAlignment[];
  theme: 'light' | 'dark';
}

const ValueRadarChart: React.FC<ValueRadarChartProps> = ({ data = [], theme }) => {
  // Enforce data presence for the 5 selected values
  const safeData = data && data.length > 0 ? data : [];
  
  return (
    <div className="w-full h-full min-h-[300px] relative group">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={safeData}>
          <PolarGrid 
            stroke={theme === 'dark' ? "rgba(236, 72, 153, 0.2)" : "rgba(236, 72, 153, 0.1)"} 
          />
          <PolarAngleAxis 
            dataKey="value" 
            tick={{ 
              fill: theme === 'dark' ? '#ff1088' : '#0c0e2b', 
              fontSize: 10, 
              fontWeight: 900,
              letterSpacing: '0.05em'
            }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={false} 
            axisLine={false} 
          />
          <Radar
            name="Value Resonance"
            dataKey="score"
            stroke="#ff1088"
            fill="#ff1088"
            fillOpacity={0.3}
            strokeWidth={4}
            animationBegin={300}
            animationDuration={1500}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: theme === 'dark' ? '#0c0e2b' : '#ffffff', 
              border: '2px solid #ff1088', 
              borderRadius: '24px', 
              fontSize: '11px',
              fontWeight: '900',
              boxShadow: '0 10px 30px rgba(255, 16, 136, 0.2)'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ValueRadarChart;
