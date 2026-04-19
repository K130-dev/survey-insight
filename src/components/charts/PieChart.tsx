import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { X } from 'lucide-react';

interface PieChartProps {
  data: { name: string; value: number }[];
  title: string;
  totalRespondents?: number;
  colorMap?: Record<string, string>;
  onClose?: () => void;
}

export const PIE_COLORS = [
  '#0033FF', // Blue
  '#FFB81C', // Yellow
  '#B84A9C', // Purple
  '#2C524B', // Dark Green
  '#3BA4C3', // Light Blue
  '#9BCA63', // Light Green
  '#FF5733', // Orange Red
  '#8A2BE2', // Blue Violet
  '#00CED1', // Dark Turquoise
  '#DC143C', // Crimson
  '#20B2AA', // Light Sea Green
  '#7B68EE', // Medium Slate Blue
  '#FF8C00', // Dark Orange
  '#FF1493', // Deep Pink
  '#00FF7F', // Spring Green
  '#4682B4', // Steel Blue
  '#D2691E', // Chocolate
  '#C71585', // Medium Violet Red
  '#2E8B57', // Sea Green
  '#4f46e5', // Indigo
  '#db2777', // Pink
  '#ca8a04', // Yellow-600
  '#059669', // Emerald
];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Only show label if percentage is significant enough to fit
  if (percent < 0.05) return null;

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor="middle" 
      dominantBaseline="central" 
      className="text-xs font-bold"
      style={{ pointerEvents: 'none' }}
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

export const PieChart: React.FC<PieChartProps> = ({ data, title, totalRespondents, colorMap, onClose }) => {
  const total = data ? data.reduce((sum, item) => sum + item.value, 0) : 0;
  
  const answeredPercentage = totalRespondents && totalRespondents > 0 
    ? ((total / totalRespondents) * 100).toFixed(1) 
    : null;

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 font-light relative">
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="关闭图表"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        此图表无可用数据。
      </div>
    );
  }

  return (
    <div className="modern-card p-6 h-[420px] flex flex-col relative group">
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-col gap-1.5 pr-8 overflow-hidden">
          <h3 className="text-sm font-bold text-slate-800 truncate" title={title}>{title}</h3>
          {answeredPercentage && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                填写率 {answeredPercentage}%
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                {total} / {totalRespondents} 人
              </span>
            </div>
          )}
        </div>
        {onClose ? (
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            title="关闭图表"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />
        )}
      </div>
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={40}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              labelLine={false}
              label={renderCustomizedLabel}
              startAngle={90}
              endAngle={450}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colorMap && colorMap[entry.name] ? colorMap[entry.name] : PIE_COLORS[index % PIE_COLORS.length]} 
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, name]}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#1e293b'
              }}
              itemStyle={{ color: '#1e293b' }}
            />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              iconType="circle"
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#475569'
              }}
            />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
