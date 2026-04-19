import React, { useState, useEffect } from 'react';
import { Check, ChevronRight, HelpCircle, ArrowLeft, Database, Settings2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export type ColumnType = 'attribute' | 'single-choice' | 'multi-choice' | 'rating' | 'text' | 'ignore';

export interface ColumnConfig {
  name: string;
  type: ColumnType;
}

interface ColumnMapperProps {
  data: any[];
  columns: string[];
  onComplete: (config: ColumnConfig[]) => void;
  onBack: () => void;
}

export function ColumnMapper({ data, columns, onComplete, onBack }: ColumnMapperProps) {
  const [config, setConfig] = useState<ColumnConfig[]>([]);

  useEffect(() => {
    const inferredConfig: ColumnConfig[] = columns.map(col => {
      const type = inferColumnType(data, col);
      return { name: col, type };
    });
    setConfig(inferredConfig);
  }, [data, columns]);

  const inferColumnType = (data: any[], colName: string): ColumnType => {
    const values = data.map(row => row[colName]).filter(v => v !== null && v !== undefined && v !== '');
    if (values.length === 0) return 'ignore';

    const nameLower = colName.toLowerCase();
    const uniqueValues = new Set(values);
    const totalCount = values.length;
    const uniqueRatio = uniqueValues.size / totalCount;
    const avgLength = values.reduce((sum, val) => sum + String(val).length, 0) / totalCount;

    // Ignore IDs and Dates
    if (nameLower.includes('id') && uniqueRatio > 0.9) return 'ignore';
    if (nameLower.includes('timestamp') || nameLower.includes('date')) return 'ignore';

    // 1. Keyword based detection for attributes (样本属性)
    const attributeKeywords = ['age', 'gender', 'department', 'tenure', '年龄', '性别', '部门', '司龄'];
    if (attributeKeywords.some(kw => nameLower.includes(kw))) {
      return 'attribute';
    }

    // 2. Keyword based detection for text questions (文本题)
    const textKeywords = ['feedback', 'suggestion', 'comment', '反馈', '建议', '评价', '文字'];
    if (textKeywords.some(kw => nameLower.includes(kw))) {
      return 'text';
    }

    // 3. Rating detection (0-10 or 0-5)
    const isNumeric = values.every(v => !isNaN(Number(v)));
    if (isNumeric) {
      const numValues = values.map(Number);
      const min = Math.min(...numValues);
      const max = Math.max(...numValues);
      if (min >= 0 && max <= 10) return 'rating';
    }

    // 4. Multi-choice detection (comma separated)
    const hasCommas = values.some(v => String(v).includes(','));
    if (hasCommas && avgLength < 50) return 'multi-choice';

    // 5. Heuristic based detection
    if (avgLength > 30) return 'text';
    if (uniqueValues.size <= 15) return 'single-choice';
    if (uniqueValues.size < 50 && avgLength < 30) return 'attribute';

    return 'ignore';
  };

  const handleTypeChange = (index: number, type: ColumnType) => {
    const newConfig = [...config];
    newConfig[index].type = type;
    setConfig(newConfig);
  };

  const isValid = config.some(c => c.type !== 'ignore');

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-brand-600 font-bold tracking-widest uppercase text-xs">
            <Settings2 className="w-4 h-4" />
            步骤 02
          </div>
          <h2 className="text-4xl font-display font-bold text-slate-800">配置数据结构</h2>
          <p className="text-slate-500 font-light text-lg">
            检查每个列在仪表盘中的处理方式。
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn-secondary flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <button
            onClick={() => onComplete(config)}
            disabled={!isValid}
            className="btn-primary flex items-center gap-2"
          >
            生成仪表盘
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="modern-card overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-6 bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          <div className="col-span-1 flex items-center justify-center">#</div>
          <div className="col-span-4">列名</div>
          <div className="col-span-7">分析类型</div>
        </div>
        
        <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {config.map((col, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={cn(
                "grid grid-cols-12 gap-4 p-6 items-center transition-all duration-200",
                col.type === 'ignore' ? "bg-slate-50/30" : "bg-white"
              )}
            >
              <div className="col-span-1 flex items-center justify-center font-mono text-xs text-slate-300">
                {(idx + 1).toString().padStart(2, '0')}
              </div>
              
              <div className="col-span-4">
                <div className="font-semibold text-slate-800 truncate flex items-center gap-2" title={col.name}>
                  {col.name}
                  {col.type !== 'ignore' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  {data[0][col.name]?.toString().substring(0, 30) || "空"}...
                </div>
              </div>

              <div className="col-span-7">
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'ignore', label: '忽略', color: 'slate' },
                    { id: 'attribute', label: '样本属性', color: 'blue' },
                    { id: 'single-choice', label: '单选题', color: 'emerald' },
                    { id: 'multi-choice', label: '多选题', color: 'teal' },
                    { id: 'rating', label: '评分题', color: 'orange' },
                    { id: 'text', label: '文本题', color: 'violet' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleTypeChange(idx, type.id as ColumnType)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                        col.type === type.id 
                          ? {
                              'slate': 'bg-slate-700 text-white border-slate-700 shadow-md',
                              'blue': 'bg-blue-600 text-white border-blue-600 shadow-md',
                              'emerald': 'bg-emerald-600 text-white border-emerald-600 shadow-md',
                              'teal': 'bg-teal-600 text-white border-teal-600 shadow-md',
                              'orange': 'bg-orange-500 text-white border-orange-500 shadow-md',
                              'violet': 'bg-violet-600 text-white border-violet-600 shadow-md'
                            }[type.color as string]
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-6 text-slate-400">
        <div className="flex items-center gap-2 text-xs font-medium">
          <Database className="w-4 h-4" />
          <span>{data.length} 行数据已检测</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-slate-200" />
        <div className="flex items-center gap-2 text-xs font-medium">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>{config.filter(c => c.type !== 'ignore').length} 列已选择</span>
        </div>
      </div>
    </div>
  );
}
