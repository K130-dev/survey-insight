import React from 'react';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveBar } from 'recharts';
import { Sparkles, MessageSquare } from 'lucide-react';

const pieData = [
  { name: '满意', value: 65 },
  { name: '一般', value: 25 },
  { name: '不满意', value: 10 },
];

const PIE_COLORS = ['#2e4aff', '#8aa3ff', '#dce4ff'];

const barData = [
  { name: '18-24', value: 30 },
  { name: '25-34', value: 45 },
  { name: '35-44', value: 18 },
  { name: '45+', value: 7 },
];

const feedbackSummary = "用户普遍对产品界面给予高度评价，特别提到交互流畅和可视化效果出色。部分用户建议增加更多自定义选项。";

function PieChartCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/40 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] transition-all duration-300"
    >
      <h3 className="text-sm font-bold text-slate-700 mb-4">用户满意度分布</h3>
      <div className="h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={55}
              paddingAngle={3}
              dataKey="value"
              animationDuration={1200}
              animationBegin={500}
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-2">
        {pieData.map((item, idx) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }} />
            <span className="text-[10px] font-medium text-slate-500">{item.name} {item.value}%</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function BarChartCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/40 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] transition-all duration-300"
    >
      <h3 className="text-sm font-bold text-slate-700 mb-4">年龄群体分布</h3>
      <div className="h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <Bar dataKey="value" fill="#2e4aff" radius={[6, 6, 0, 0]} animationDuration={1200} animationBegin={700} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: '#1e293b',
                border: 'none',
                borderRadius: 8,
                fontSize: 12,
                color: 'white',
              }}
              cursor={{ fill: 'rgba(46, 74, 255, 0.08)' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-center text-[10px] font-medium text-slate-400 mt-2">单位：%</p>
    </motion.div>
  );
}

function TextInsightCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/40 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] transition-all duration-300"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-violet-600" />
        </div>
        <h3 className="text-sm font-bold text-slate-700">AI 反馈摘要</h3>
      </div>
      <div className="space-y-2">
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
          {feedbackSummary}
        </p>
        <div className="flex items-center gap-1.5 pt-1">
          <MessageSquare className="w-3 h-3 text-slate-400" />
          <span className="text-[10px] font-medium text-slate-400">基于 128 条反馈生成</span>
        </div>
      </div>
    </motion.div>
  );
}

export function HomePreview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
      <PieChartCard />
      <BarChartCard />
      <TextInsightCard />
    </div>
  );
}
