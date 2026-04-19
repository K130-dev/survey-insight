import React, { useState, useMemo } from 'react';
import { Filter, X, LayoutDashboard, PieChart as PieChartIcon, MessageSquare, Users, FileText, Download, RefreshCw, Search, ChevronLeft, ChevronRight, SlidersHorizontal, Check, ChevronDown, Plus, BarChart2, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ColumnConfig } from './ColumnMapper';
import { PieChart, PIE_COLORS } from './charts/PieChart';
import { BarChart } from './charts/BarChart';
import { TextSummary } from './analysis/TextSummary';
import { AudienceAnalysis } from './analysis/AudienceAnalysis';
import { ComparisonAnalysis } from './analysis/ComparisonAnalysis';
import { cn } from '@/lib/utils';

interface DashboardProps {
  data: any[];
  config: ColumnConfig[];
  onReset: () => void;
}

const FilterSection = ({ 
  title, 
  options, 
  selectedValues, 
  onToggle 
}: { 
  title: string; 
  options: string[]; 
  selectedValues: string[]; 
  onToggle: (value: string) => void; 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 px-1 hover:bg-slate-50 transition-colors rounded-lg group"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-700 group-hover:text-brand-600 transition-colors">{title}</span>
          {selectedValues.length > 0 && (
            <span className="flex items-center justify-center bg-brand-100 text-brand-700 text-[10px] font-bold h-5 min-w-[20px] px-1.5 rounded-full">
              {selectedValues.length}
            </span>
          )}
        </div>
        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-4 space-y-1 px-1">
              {options.map(opt => {
                const isSelected = selectedValues.includes(opt);
                return (
                  <button 
                    key={opt} 
                    onClick={() => onToggle(opt)}
                    className={cn(
                      "w-full flex items-center gap-3 text-sm p-2.5 rounded-xl transition-all duration-200 group border text-left",
                      isSelected 
                        ? "bg-brand-50 text-brand-700 border-brand-200 shadow-sm" 
                        : "hover:bg-slate-50 text-slate-600 border-transparent hover:border-slate-100"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors",
                      isSelected ? "bg-brand-600 border-brand-600" : "border-slate-200 bg-white group-hover:border-slate-300"
                    )}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="truncate flex-1 font-medium">{opt}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function Dashboard({ data, config, onReset }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'insights' | 'comparison' | 'audience'>('insights');
  // appliedFilters controls the data view
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string[]>>({});
  // draftFilters controls the UI state before clicking "Query"
  const [draftFilters, setDraftFilters] = useState<Record<string, string[]>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hiddenCharts, setHiddenCharts] = useState<Set<string>>(new Set());
  
  // Identify column types
  const attributeColumns = useMemo(() => config.filter(c => c.type === 'attribute'), [config]);
  const singleChoiceColumns = useMemo(() => config.filter(c => c.type === 'single-choice'), [config]);
  const multiChoiceColumns = useMemo(() => config.filter(c => c.type === 'multi-choice'), [config]);
  const ratingColumns = useMemo(() => config.filter(c => c.type === 'rating'), [config]);
  const textColumns = useMemo(() => config.filter(c => c.type === 'text'), [config]);

  // Extract unique values for filters
  const filterOptions = useMemo(() => {
    const options: Record<string, string[]> = {};
    attributeColumns.forEach(col => {
      const values = new Set(data.map(row => row[col.name]).filter(Boolean));
      options[col.name] = Array.from(values).sort();
    });
    return options;
  }, [data, attributeColumns]);

  // Extract unique values for single choice columns to generate consistent color maps
  const singleChoiceOptions = useMemo(() => {
    const options: Record<string, string[]> = {};
    singleChoiceColumns.forEach(col => {
      const values = new Set(data.map(row => row[col.name]).filter(Boolean));
      options[col.name] = Array.from(values).sort();
    });
    return options;
  }, [data, singleChoiceColumns]);

  const getColorMap = (colName: string) => {
    const map: Record<string, string> = {};
    const options = singleChoiceOptions[colName] || filterOptions[colName] || [];
    options.forEach((opt, idx) => {
      map[opt] = PIE_COLORS[idx % PIE_COLORS.length];
    });
    return map;
  };

  // Filter data based on APPLIED filters
  const filteredData = useMemo(() => {
    return data.filter(row => {
      // 1. Check Attribute Filters
      const matchesFilters = Object.entries(appliedFilters).every(([colName, selectedValues]) => {
        const values = selectedValues as string[];
        if (values.length === 0) return true;
        return values.includes(row[colName]);
      });

      return matchesFilters;
    });
  }, [data, appliedFilters]);

  // Handle filter changes in DRAFT state
  const toggleDraftFilter = (colName: string, value: string) => {
    setDraftFilters(prev => {
      const current = prev[colName] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      
      if (updated.length === 0) {
        const { [colName]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [colName]: updated };
    });
  };

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
  };

  const clearFilters = () => {
    setDraftFilters({});
    setAppliedFilters({});
  };

  const [insightFilters, setInsightFilters] = useState<{id: string, question: string, option: string}[]>([{ id: '1', question: '', option: '' }]);

  const updateInsightFilter = (id: string, field: 'question' | 'option', value: string) => {
    setInsightFilters(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, [field]: value, ...(field === 'question' ? { option: '' } : {}) };
      }
      return f;
    }));
  };

  const addInsightFilter = () => {
    setInsightFilters(prev => [...prev, { id: Math.random().toString(36).substring(7), question: '', option: '' }]);
  };

  const removeInsightFilter = (id: string) => {
    setInsightFilters(prev => {
      if (prev.length === 1) return [{ id: '1', question: '', option: '' }];
      return prev.filter(f => f.id !== id);
    });
  };

  const getOptionsForQuestion = (question: string) => {
    if (!question) return [];
    const values = new Set(filteredData.map(row => row[question]).filter(Boolean));
    return Array.from(values).sort();
  };

  const insightFilteredData = useMemo(() => {
    return filteredData.filter(row => {
      const activeFilters = insightFilters.filter(f => f.question && f.option);
      if (activeFilters.length === 0) return true;
      return activeFilters.every(f => row[f.question] === f.option);
    });
  }, [filteredData, insightFilters]);

  // Prepare chart data
  const getChartData = (colName: string) => {
    const counts: Record<string, number> = {};
    insightFilteredData.forEach(row => {
      const val = row[colName];
      if (val) {
        counts[val] = (counts[val] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  // Prepare multi-choice data
  const getMultiChoiceData = (colName: string) => {
    const counts: Record<string, number> = {};
    insightFilteredData.forEach(row => {
      const val = row[colName];
      if (val) {
        const opts = String(val).split(',').map(s => s.trim()).filter(Boolean);
        opts.forEach(opt => {
          counts[opt] = (counts[opt] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort by frequency descending
  };

  // Prepare rating data
  const getRatingData = (colName: string) => {
    const counts: Record<string, number> = {};
    insightFilteredData.forEach(row => {
      const val = row[colName];
      if (val !== undefined && val !== null && val !== '') {
        counts[String(val)] = (counts[String(val)] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => Number(a.name) - Number(b.name)); // Sort numerically
  };

  const getAverageRating = (colName: string) => {
    const values = insightFilteredData
      .map(row => row[colName])
      .filter(val => val !== undefined && val !== null && val !== '')
      .map(Number)
      .filter(val => !isNaN(val));
    
    if (values.length === 0) return undefined;
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  };

  // Prepare text data
  const getTextData = (colName: string) => {
    return insightFilteredData.map(row => row[colName]).filter(Boolean);
  };

  const totalRespondents = data.length;
  const activeRespondents = filteredData.length;
  const insightActiveRespondents = insightFilteredData.length;
  const hasActiveFilters = Object.keys(appliedFilters).length > 0 || insightFilters.some(f => f.question && f.option);
  const hasDraftChanges = JSON.stringify(appliedFilters) !== JSON.stringify(draftFilters);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Sidebar */}
      <AnimatePresence mode="popLayout">
        {isSidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-white border-r border-slate-200 flex-shrink-0 flex flex-col z-20 shadow-xl shadow-slate-200/50"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-600 rounded-lg text-white">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <span className="font-display font-bold text-slate-700 tracking-tight">筛选</span>
              </div>
              {Object.keys(draftFilters).length > 0 && (
                <button 
                  onClick={clearFilters}
                  className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                >
                  重置
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {attributeColumns.length === 0 && (
                <div className="text-center py-12 px-4 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <Filter className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                  <p className="text-sm text-slate-500 font-light">
                    未选择筛选属性
                  </p>
                </div>
              )}
              
              <div className="space-y-1">
                {attributeColumns.map(col => (
                  <FilterSection
                    key={col.name}
                    title={col.name}
                    options={filterOptions[col.name] || []}
                    selectedValues={draftFilters[col.name] || []}
                    onToggle={(val) => toggleDraftFilter(col.name, val)}
                  />
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-4">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>已选筛选</span>
                <span>{Object.keys(appliedFilters).length}</span>
              </div>
              <button
                onClick={applyFilters}
                disabled={!hasDraftChanges}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-sm",
                  hasDraftChanges
                    ? "bg-brand-600 text-white hover:bg-brand-700 shadow-brand-200"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                )}
              >
                <Filter className="w-4 h-4" />
                应用查询
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 pt-5 flex flex-col z-10 shadow-sm">
          <div className="flex items-center justify-between pb-5">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-all border border-slate-200"
              >
                {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-display font-bold text-slate-800 tracking-tight leading-none">
                    Insight
                  </h1>
                  <p className="text-xs font-medium text-slate-400 mt-1">
                    {totalRespondents} 条记录
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onReset}
                className="btn-secondary !py-2 !px-4 flex items-center gap-2 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                重新上传
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('insights')}
              className={cn(
                "pb-3 text-sm font-bold border-b-2 transition-colors",
                activeTab === 'insights' 
                  ? "border-brand-600 text-brand-600" 
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              )}
            >
              结果洞察
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={cn(
                "pb-3 text-sm font-bold border-b-2 transition-colors",
                activeTab === 'comparison' 
                  ? "border-brand-600 text-brand-600" 
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              )}
            >
              对比分析
            </button>
            <button
              onClick={() => setActiveTab('audience')}
              className={cn(
                "pb-3 text-sm font-bold border-b-2 transition-colors",
                activeTab === 'audience' 
                  ? "border-brand-600 text-brand-600" 
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              )}
            >
              人群画像
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-8 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto space-y-10 pb-20">
            {activeTab === 'insights' ? (
              <>
                {/* Insights Filter Bar */}
                {singleChoiceColumns.length > 0 && (
                  <div className="modern-card p-6 flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4 mt-2">
                      <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600 shrink-0">
                        <Filter className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-display font-bold text-slate-800 tracking-tight">
                          结果洞察
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                          基于特定题目选项深入分析结果
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full xl:w-auto">
                      {insightFilters.map((filter, index) => (
                        <div key={filter.id} className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2 px-2 w-full sm:w-32 shrink-0">
                            {index === 0 ? (
                              <>
                                <Filter className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-bold text-slate-600 whitespace-nowrap">
                                  题目选项筛选:
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
                              onChange={(e) => updateInsightFilter(filter.id, 'question', e.target.value)}
                              className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
                            >
                              <option value="">选择题目 (默认全部)</option>
                              {singleChoiceColumns.map(col => (
                                <option 
                                  key={col.name} 
                                  value={col.name}
                                  disabled={insightFilters.some(f => f.id !== filter.id && f.question === col.name)}
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
                                onChange={(e) => updateInsightFilter(filter.id, 'option', e.target.value)}
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

                          {(filter.question || insightFilters.length > 1) && (
                            <button 
                              onClick={() => removeInsightFilter(filter.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                              title="移除此筛选条件"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}

                      {insightFilters.length < singleChoiceColumns.length && insightFilters[insightFilters.length - 1].question && insightFilters[insightFilters.length - 1].option && (
                        <button 
                          onClick={addInsightFilter}
                          className="self-start flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors ml-2 sm:ml-36"
                        >
                          <Plus className="w-4 h-4" /> 
                          添加交叉筛选条件
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats Overview - Bento Style with Distinct Colors */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <motion.div 
                whileHover={{ y: -4 }}
                className="md:col-span-2 modern-card p-8 flex flex-col justify-between relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Users className="w-40 h-40 text-brand-700" />
                </div>
                <div className="space-y-2 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-brand-50 rounded-lg">
                      <Users className="w-5 h-5 text-brand-600" />
                    </div>
                    <p className="text-xs font-bold text-brand-600 uppercase tracking-widest">样本量</p>
                  </div>
                  <h2 className="text-5xl font-display font-bold text-slate-800 tracking-tight">
                    {totalRespondents}
                  </h2>
                  <p className="text-slate-500 font-medium">总问卷回收量</p>
                </div>
                <div className="flex items-center gap-3 mt-8 relative z-10">
                  <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(insightActiveRespondents / totalRespondents) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-brand-500"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600 tabular-nums">
                    {((insightActiveRespondents / totalRespondents) * 100).toFixed(1)}%
                  </span>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -4 }}
                className="modern-card p-8 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-lg", hasActiveFilters ? "bg-emerald-100" : "bg-slate-100")}>
                      <Filter className={cn("w-5 h-5", hasActiveFilters ? "text-emerald-600" : "text-slate-500")} />
                    </div>
                    <p className={cn("text-xs font-bold uppercase tracking-widest", hasActiveFilters ? "text-emerald-600" : "text-slate-500")}>
                      当前人群
                    </p>
                  </div>
                  <h2 className="text-4xl font-display font-bold text-slate-800 tracking-tight">
                    {insightActiveRespondents}
                  </h2>
                </div>
                <div className="mt-4">
                  {hasActiveFilters ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      已筛选视图
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">显示全部数据</span>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Single Choice Section */}
            {singleChoiceColumns.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600">
                      <PieChartIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-bold text-slate-800 tracking-tight">
                        单选题分析
                      </h2>
                      <p className="text-sm text-slate-500">单选题分布分析</p>
                    </div>
                  </div>
                  {hiddenCharts.size > 0 && (
                    <button
                      onClick={() => setHiddenCharts(new Set())}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      恢复已隐藏的 {hiddenCharts.size} 个图表
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {singleChoiceColumns.filter(col => !hiddenCharts.has(col.name)).map((col, idx) => (
                    <motion.div
                      key={col.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <PieChart 
                        title={col.name}
                        data={getChartData(col.name)}
                        totalRespondents={insightActiveRespondents}
                        colorMap={getColorMap(col.name)}
                        onClose={() => {
                          setHiddenCharts(prev => {
                            const newSet = new Set(prev);
                            newSet.add(col.name);
                            return newSet;
                          });
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Multi Choice Section */}
            {multiChoiceColumns.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600">
                      <BarChart2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-bold text-slate-800 tracking-tight">
                        多选题分析
                      </h2>
                      <p className="text-sm text-slate-500">选项选中频率分析</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {multiChoiceColumns.map((col, idx) => (
                    <motion.div
                      key={col.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <BarChart 
                        title={col.name}
                        data={getMultiChoiceData(col.name)}
                        totalRespondents={insightActiveRespondents}
                        color="#0d9488"
                        showPercentage={true}
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Rating Section */}
            {ratingColumns.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                      <Star className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-bold text-slate-800 tracking-tight">
                        评分题分析
                      </h2>
                      <p className="text-sm text-slate-500">数值评分分布分析</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {ratingColumns.map((col, idx) => (
                    <motion.div
                      key={col.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <BarChart 
                        title={col.name}
                        data={getRatingData(col.name)}
                        totalRespondents={insightActiveRespondents}
                        color="#f97316"
                        averageScore={getAverageRating(col.name)}
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Text Analysis Section */}
            {textColumns.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-bold text-slate-800 tracking-tight">
                        定性洞察
                      </h2>
                      <p className="text-sm text-slate-500">AI 驱动的文本回答总结</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {textColumns.map((col, idx) => (
                    <motion.div
                      key={col.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + idx * 0.1 }}
                    >
                      <TextSummary
                        question={col.name}
                        answers={getTextData(col.name)}
                        totalRespondents={insightActiveRespondents}
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {singleChoiceColumns.length === 0 && multiChoiceColumns.length === 0 && ratingColumns.length === 0 && textColumns.length === 0 && (
              <div className="text-center py-32 modern-card">
                <LayoutDashboard className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                <h3 className="text-2xl font-display font-bold text-slate-800 mb-3">未配置分析</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-8 font-light">
                  您尚未选择任何分析列。请返回映射步骤选择指标。
                </p>
                <button
                  onClick={onReset}
                  className="btn-primary"
                >
                  配置数据
                </button>
              </div>
            )}
              </>
            ) : null}
            
            {activeTab === 'comparison' && (
              <ComparisonAnalysis data={filteredData} config={config} />
            )}

            {activeTab === 'audience' && (
              <AudienceAnalysis data={filteredData} config={config} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
