import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { X } from 'lucide-react';

interface BarChartProps {
  data: { name: string; value: number }[];
  title: string;
  totalRespondents?: number;
  color?: string;
  onClose?: () => void;
  averageScore?: number;
  showPercentage?: boolean;
}

export function BarChart({ data, title, totalRespondents, color = '#3b82f6', onClose, averageScore, showPercentage }: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="modern-card p-6 flex flex-col items-center justify-center min-h-[300px] text-slate-400 relative group">
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <p>暂无数据</p>
      </div>
    );
  }

  return (
    <div className="modern-card p-6 flex flex-col h-full relative group">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 z-10"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <div className="mb-6 pr-8 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          {totalRespondents && (
            <p className="text-xs text-slate-500 mt-1">基于 {totalRespondents} 份有效回答</p>
          )}
        </div>
        {averageScore !== undefined && (
          <div className="text-right bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100">
            <div className="text-2xl font-display font-bold text-orange-600 leading-none">{averageScore.toFixed(1)}</div>
            <div className="text-[10px] font-bold text-orange-400/80 uppercase tracking-widest mt-1">平均分</div>
          </div>
        )}
      </div>
      <div className="flex-1 min-h-[250px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(value) => showPercentage && totalRespondents ? `${((value / totalRespondents) * 100).toFixed(0)}%` : value}
            />
            <Tooltip
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                padding: '12px 16px'
              }}
              formatter={(value: number) => [
                <span key="val" className="font-bold text-slate-800">
                  {showPercentage && totalRespondents ? `${((value / totalRespondents) * 100).toFixed(1)}% (${value}人)` : `${value} 次`}
                </span>, 
                <span key="lbl" className="text-slate-500">{showPercentage ? '选择占比' : '选择频次'}</span>
              ]}
              labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '12px' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={color} />
              ))}
              <LabelList 
                dataKey="value" 
                position="top" 
                fill="#64748b" 
                fontSize={12} 
                fontWeight={600} 
                offset={8} 
                formatter={(value: number) => showPercentage && totalRespondents ? `${((value / totalRespondents) * 100).toFixed(1)}%` : value}
              />
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
