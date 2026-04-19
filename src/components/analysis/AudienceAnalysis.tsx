import React, { useState, useMemo } from 'react';
import { Users, Filter, ChevronDown, BarChart2, PieChart as PieChartIcon, X, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { ColumnConfig } from '../ColumnMapper';
import { PieChart, PIE_COLORS } from '../charts/PieChart';
import { cn } from '@/lib/utils';

interface AudienceAnalysisProps {
  data: any[];
  config: ColumnConfig[];
}

interface FilterCondition {
  id: string;
  question: string;
  option: string;
}

export const AudienceAnalysis: React.FC<AudienceAnalysisProps> = ({ data, config }) => {
  const [filters, setFilters] = useState<FilterCondition[]>([{ id: 'default', question: '', option: '' }]);

  const attributeColumns = useMemo(() => config.filter(c => c.type === 'attribute'), [config]);
  const singleChoiceColumns = useMemo(() => config.filter(c => c.type === 'single-choice'), [config]);

  // Helper to get options for a specific question
  const getOptionsForQuestion = (question: string) => {
    if (!question) return [];
    const options = new Set<string>();
    data.forEach(row => {
      if (row[question]) {
        options.add(row[question]);
      }
    });
    return Array.from(options).sort();
  };

  const addFilter = () => {
    setFilters([...filters, { id: Math.random().toString(36).substring(7), question: '', option: '' }]);
  };

  const updateFilter = (id: string, field: 'question' | 'option', value: string) => {
    setFilters(filters.map(f => {
      if (f.id === id) {
        return { ...f, [field]: value, ...(field === 'question' ? { option: '' } : {}) };
      }
      return f;
    }));
  };

  const removeFilter = (id: string) => {
    if (filters.length === 1) {
      setFilters([{ id: 'default', question: '', option: '' }]);
    } else {
      setFilters(filters.filter(f => f.id !== id));
    }
  };

  // Filter data based on all active filters
  const analysisData = useMemo(() => {
    const activeFilters = filters.filter(f => f.question && f.option);
    if (activeFilters.length > 0) {
      return data.filter(row => 
        activeFilters.every(f => row[f.question] === f.option)
      );
    }
    return data;
  }, [data, filters]);

  // Extract unique values for attribute columns to generate consistent color maps
  const attributeOptions = useMemo(() => {
    const options: Record<string, string[]> = {};
    attributeColumns.forEach(col => {
      const values = new Set(data.map(row => row[col.name]).filter(Boolean));
      options[col.name] = Array.from(values).sort();
    });
    return options;
  }, [data, attributeColumns]);

  const getColorMap = (colName: string) => {
    const map: Record<string, string> = {};
    const options = attributeOptions[colName] || [];
    options.forEach((opt, idx) => {
      map[opt] = PIE_COLORS[idx % PIE_COLORS.length];
    });
    return map;
  };

  // Prepare chart data for pie charts
  const getChartData = (colName: string) => {
    const counts: Record<string, number> = {};
    analysisData.forEach(row => {
      const val = row[colName];
      if (val) {
        counts[val] = (counts[val] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const activeFiltersCount = filters.filter(f => f.question && f.option).length;

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="modern-card p-6 flex flex-col xl:flex-row xl:items-start justify-between gap-6">
        <div className="flex items-center gap-4 mt-2">
          <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-800 tracking-tight">
              人群分析
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              探索受访者的属性分布特征
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full xl:w-auto">
          {filters.map((filter, index) => (
            <div key={filter.id} className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 px-2 w-full sm:w-32 shrink-0">
                {index === 0 ? (
                  <>
                    <Filter className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-600 whitespace-nowrap">
                      特定人群筛选:
                    </span>
                  </>
                ) : (
                  <span className="text-xs font-bold text-slate-400 bg-slate-200 px-2 py-1 rounded uppercase tracking-wider ml-6">
                    AND
                  </span>
                )}
              </div>
              
              <div className="relative flex-1 w-full sm:w-64">
                <select
                  value={filter.question}
                  onChange={(e) => updateFilter(filter.id, 'question', e.target.value)}
                  className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
                >
                  <option value="">选择问题 (默认所有人群)</option>
                  {singleChoiceColumns.map(col => (
                    <option 
                      key={col.name} 
                      value={col.name}
                      disabled={filters.some(f => f.id !== filter.id && f.question === col.name)}
                    >
                      {col.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {filter.question && (
                <div className="relative flex-1 w-full sm:w-48">
                  <select
                    value={filter.option}
                    onChange={(e) => updateFilter(filter.id, 'option', e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
                  >
                    <option value="">选择特定选项...</option>
                    {getOptionsForQuestion(filter.question).map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}

              {(filter.question || filters.length > 1) && (
                <button 
                  onClick={() => removeFilter(filter.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  title="移除此筛选条件"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          {filters.length < singleChoiceColumns.length && filters[filters.length - 1].question && filters[filters.length - 1].option && (
            <button 
              onClick={addFilter}
              className="self-start flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors ml-2 sm:ml-36"
            >
              <Plus className="w-4 h-4" /> 
              添加交叉筛选条件
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="flex items-center gap-3 px-2">
        <div className="px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-sm font-bold flex items-center gap-2 border border-brand-100">
          <BarChart2 className="w-4 h-4" />
          当前分析样本量: {analysisData.length} 人
        </div>
        {activeFiltersCount > 0 && (
          <div className="text-sm text-slate-500 font-medium">
            占总样本的 {((analysisData.length / data.length) * 100).toFixed(1)}%
          </div>
        )}
      </div>

      {/* Charts Grid */}
      {attributeColumns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {attributeColumns.map((col, idx) => (
            <motion.div
              key={col.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <PieChart 
                title={col.name}
                data={getChartData(col.name)}
                totalRespondents={analysisData.length}
                colorMap={getColorMap(col.name)}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">没有可用的属性列</h3>
          <p className="text-slate-500">请在数据映射阶段将至少一列标记为"受访者属性"。</p>
        </div>
      )}
    </div>
  );
};
