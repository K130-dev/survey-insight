import React, { useState, useMemo } from 'react';
import { Layers, ChevronDown, GitCompare, PieChart as PieChartIcon, Calculator } from 'lucide-react';
import { motion } from 'motion/react';
import { ColumnConfig } from '../ColumnMapper';
import { PieChart, PIE_COLORS } from '../charts/PieChart';
import { StackedBarChart } from '../charts/StackedBarChart';
import { cn } from '@/lib/utils';
import { calculateChiSquare } from '@/lib/statistics';

interface ComparisonAnalysisProps {
  data: any[];
  config: ColumnConfig[];
}

export const ComparisonAnalysis: React.FC<ComparisonAnalysisProps> = ({ data, config }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');
  const [compareAttribute, setCompareAttribute] = useState<string>('');

  const attributeColumns = useMemo(() => config.filter(c => c.type === 'attribute'), [config]);
  const singleChoiceColumns = useMemo(() => config.filter(c => c.type === 'single-choice'), [config]);

  // Set default compare attribute if available
  React.useEffect(() => {
    if (attributeColumns.length > 0 && !compareAttribute) {
      setCompareAttribute(attributeColumns[0].name);
    }
  }, [attributeColumns, compareAttribute]);

  // Options for the selected question
  const questionOptions = useMemo(() => {
    if (!selectedQuestion) return [];
    const options = new Set<string>();
    data.forEach(row => {
      if (row[selectedQuestion]) {
        options.add(row[selectedQuestion]);
      }
    });
    return Array.from(options).sort();
  }, [data, selectedQuestion]);

  // Prepare chart data for feature comparison
  const comparisonData = useMemo(() => {
    if (!selectedQuestion || !compareAttribute) return { data: [], keys: [] };

    const options = questionOptions;
    const attributeValues = new Set<string>();
    
    // Find all possible attribute values
    data.forEach(row => {
      if (row[compareAttribute]) {
        attributeValues.add(row[compareAttribute]);
      }
    });
    
    const keys = Array.from(attributeValues).sort();
    
    const chartData = options.map(opt => {
      const rowData: any = { name: opt };
      keys.forEach(key => { rowData[key] = 0; });
      
      data.forEach(row => {
        if (row[selectedQuestion] === opt && row[compareAttribute]) {
          rowData[row[compareAttribute]] += 1;
        }
      });
      
      return rowData;
    });

    return { data: chartData, keys };
  }, [data, selectedQuestion, compareAttribute, questionOptions]);

  // Generate chart data for cross analysis
  const crossData = useMemo(() => {
    if (!compareAttribute || !selectedQuestion) return [];

    const attributeValues = new Set(data.map(row => row[compareAttribute]).filter(Boolean));
    const uniqueAttributes = Array.from(attributeValues).sort();

    return uniqueAttributes.map(attrValue => {
      const subsetData = data.filter(row => row[compareAttribute] === attrValue);
      const counts: Record<string, number> = {};
      let totalResponses = 0;
      
      subsetData.forEach(row => {
        const val = row[selectedQuestion];
        if (val) {
          counts[val] = (counts[val] || 0) + 1;
          totalResponses++;
        }
      });

      const chartData = Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => a.name.localeCompare(b.name));

      return {
        attributeValue: attrValue,
        totalRespondents: subsetData.length,
        actualResponses: totalResponses,
        data: chartData
      };
    });
  }, [data, compareAttribute, selectedQuestion]);

  // Calculate Chi-Square test
  const chiSquareResult = useMemo(() => {
    if (!comparisonData || comparisonData.data.length === 0 || comparisonData.keys.length === 0) {
      return null;
    }
    
    const observed: number[][] = [];
    comparisonData.data.forEach(row => {
      const rowData: number[] = [];
      comparisonData.keys.forEach(key => {
        rowData.push(row[key] || 0);
      });
      observed.push(rowData);
    });
    
    return calculateChiSquare(observed);
  }, [comparisonData]);

  // Create a color map for the options to ensure consistent colors across pie charts
  const optionColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    questionOptions.forEach((opt, idx) => {
      map[opt] = PIE_COLORS[idx % PIE_COLORS.length];
    });
    return map;
  }, [questionOptions]);

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="modern-card p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
            <GitCompare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-800 tracking-tight">
              对比分析
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              比较不同人群在各个问题上的差异
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 px-2">
              <GitCompare className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-bold text-slate-600 whitespace-nowrap">
                对比维度:
              </span>
            </div>
            
            <div className="relative flex-1 sm:w-64">
              <select
                value={selectedQuestion}
                onChange={(e) => setSelectedQuestion(e.target.value)}
                className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="">选择对比问题...</option>
                {singleChoiceColumns.map(col => (
                  <option key={col.name} value={col.name}>{col.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative flex-1 sm:w-48">
              <select
                value={compareAttribute}
                onChange={(e) => setCompareAttribute(e.target.value)}
                className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="">选择对比属性...</option>
                {attributeColumns.map(col => (
                  <option key={col.name} value={col.name}>{col.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {selectedQuestion && compareAttribute && comparisonData.data.length > 0 ? (
          <>
            {/* Chi-Square Test Result */}
            {chiSquareResult && chiSquareResult.valid && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-5 flex flex-col sm:flex-row sm:items-start gap-4"
              >
                <div className="bg-indigo-100 text-indigo-600 p-2.5 rounded-lg shrink-0 w-fit">
                  <Calculator className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-indigo-900 mb-1.5">
                    卡方独立性检验 (Chi-Square Test)
                  </h4>
                  <p className="text-sm text-indigo-700/80 mb-4">
                    用于检验 <strong>{compareAttribute}</strong> 与 <strong>{selectedQuestion}</strong> 之间是否具有显著的关联性。
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-white/80 px-3 py-1.5 rounded-md text-sm font-medium text-indigo-800 border border-indigo-100/50 shadow-sm">
                      χ² = {chiSquareResult.chiSquare.toFixed(2)}
                    </div>
                    <div className="bg-white/80 px-3 py-1.5 rounded-md text-sm font-medium text-indigo-800 border border-indigo-100/50 shadow-sm">
                      自由度 (df) = {chiSquareResult.df}
                    </div>
                    <div className="bg-white/80 px-3 py-1.5 rounded-md text-sm font-medium text-indigo-800 border border-indigo-100/50 shadow-sm">
                      p值 = {chiSquareResult.pValue < 0.001 ? '< 0.001' : chiSquareResult.pValue.toFixed(3)}
                    </div>
                    <div className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-bold border shadow-sm ml-auto sm:ml-0",
                      chiSquareResult.pValue < 0.05 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    )}>
                      {chiSquareResult.pValue < 0.05 ? '存在显著差异 (p < 0.05)' : '无显著差异 (p ≥ 0.05)'}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Cross Mode */}
            {crossData.length > 0 && (
              <div className="pb-8 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6">不同 {compareAttribute} 在 {selectedQuestion} 上的回答差异</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {crossData.map((chart, idx) => (
                    <motion.div
                      key={chart.attributeValue}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <PieChart 
                        title={`${chart.attributeValue}`}
                        data={chart.data}
                        totalRespondents={chart.totalRespondents}
                        colorMap={optionColorMap}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Compare Mode */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-[500px]"
            >
              <StackedBarChart
                title={`${selectedQuestion} 的 ${compareAttribute} 分布对比`}
                data={comparisonData.data}
                keys={comparisonData.keys}
                xAxisKey="name"
              />
            </motion.div>
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
            <GitCompare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-2">请选择对比维度</h3>
            <p className="text-slate-500">选择一个问题和一个属性，查看不同选项下的人群特征分布和回答差异。</p>
          </div>
        )}
      </div>
    </div>
  );
};
