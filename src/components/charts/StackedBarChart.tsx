import React, { useState } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const COLORS = [
  '#0ea5e9', // sky-500
  '#8b5cf6', // violet-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#f43f5e', // rose-500
  '#6366f1', // indigo-500
  '#14b8a6', // teal-500
  '#ec4899', // pink-500
];

interface StackedBarChartProps {
  title: string;
  data: any[];
  keys: string[];
  xAxisKey: string;
}

export const StackedBarChart: React.FC<StackedBarChartProps> = ({ title, data, keys, xAxisKey }) => {
  const [isNormalized, setIsNormalized] = useState(false);

  const toPercent = (decimal: number, fixed = 1) => `${(decimal * 100).toFixed(fixed)}%`;

  return (
    <div className="modern-card p-6 h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-display font-bold text-slate-800 tracking-tight">
          {title}
        </h3>
        <button
          onClick={() => setIsNormalized(!isNormalized)}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
        >
          {isNormalized ? '显示数量' : '显示百分比'}
        </button>
      </div>
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            stackOffset={isNormalized ? "expand" : "none"}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey={xAxisKey} 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              tickFormatter={isNormalized ? toPercent : undefined}
              dx={-10}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              formatter={(value: number, name: string, props: any) => {
                if (isNormalized) {
                  const total = keys.reduce((sum, key) => sum + (props.payload[key] || 0), 0);
                  const percent = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
                  return [`${value} (${percent})`, name];
                }
                return [value, name];
              }}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                padding: '12px',
                fontWeight: 500,
                color: '#1e293b'
              }}
              itemStyle={{
                fontWeight: 600
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            {keys.map((key, index) => (
              <Bar 
                key={key} 
                dataKey={key} 
                stackId="a" 
                fill={COLORS[index % COLORS.length]} 
                radius={isNormalized ? [0, 0, 0, 0] : (index === keys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0])}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
