import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, AlertCircle, CheckCircle2, Sparkles, ChevronRight } from 'lucide-react';
import Papa from 'papaparse';
import { ColumnMapper, ColumnConfig } from '@/components/ColumnMapper';
import { Dashboard } from '@/components/Dashboard';
import { HomePreview } from '@/components/HomePreview';
import { SAMPLE_DATA, SAMPLE_COLUMNS } from '@/data/sampleData';
import { cn } from '@/lib/utils';

type Step = 'upload' | 'map' | 'dashboard';

export default function App() {
  const [step, setStep] = useState<Step>('upload');
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [config, setConfig] = useState<ColumnConfig[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDataLoaded = (loadedData: any[], loadedColumns: string[]) => {
    setData(loadedData);
    setColumns(loadedColumns);
    setStep('map');
  };

  const handleConfigComplete = (newConfig: ColumnConfig[]) => {
    setConfig(newConfig);
    setStep('dashboard');
  };

  const handleReset = () => {
    setData([]);
    setColumns([]);
    setConfig([]);
    setStep('upload');
    setError(null);
  };

  const processFile = (file: File) => {
    setError(null);
    setIsProcessing(true);

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('请上传有效的 CSV 文件。');
      setIsProcessing(false);
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('解析 CSV 文件出错。请检查格式。');
          setIsProcessing(false);
          return;
        }
        if (results.data.length === 0) {
          setError('CSV 文件似乎为空。');
          setIsProcessing(false);
          return;
        }
        const cols = results.meta.fields || Object.keys(results.data[0] as object);
        setTimeout(() => {
          handleDataLoaded(results.data, cols);
          setIsProcessing(false);
        }, 600);
      },
      error: (err) => {
        setError(`读取文件出错：${err.message}`);
        setIsProcessing(false);
      }
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const loadSampleData = () => {
    setError(null);
    setIsProcessing(true);
    setTimeout(() => {
      handleDataLoaded(SAMPLE_DATA, SAMPLE_COLUMNS);
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #2e4aff 0%, #8aa3ff 40%, #eff2ff 70%, #F8FAFC 100%)',
            }}
          >
            {/* Grid decoration */}
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                backgroundSize: '32px 32px',
              }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-5xl mx-auto">
              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="text-center mb-10 overflow-hidden"
              >
                <h1 className="text-[8rem] font-display font-bold text-white tracking-tight mb-4 leading-none">
                  Insight
                </h1>
                <p className="text-xl text-white/80 font-light leading-relaxed whitespace-nowrap">
                  将原始 CSV 数据转化为精美、交互式的仪表盘，并提供 AI 驱动的定性分析。
                </p>
                <div className="flex items-center justify-center gap-3 mt-6">
                  {['AI 驱动的分析', '支持 CSV', '快速洞察'].map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-bold text-white/80 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Preview Cards */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full mb-10"
              >
                <HomePreview />
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col sm:flex-row items-center gap-4"
              >
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-8 py-4 bg-white text-slate-800 rounded-xl font-bold hover:bg-slate-100 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-lg transition-all"
                >
                  <Upload className="w-5 h-5" />
                  上传数据
                </button>
                <button
                  onClick={loadSampleData}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-8 py-4 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-400 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-lg transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  使用示例数据
                </button>
              </motion.div>

              <p className="text-xs text-white/60 mt-4">支持 CSV 文件，最大 10MB</p>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Error display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3 shadow-sm max-w-md"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-sm">{error}</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {step === 'map' && (
          <motion.div 
            key="map"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-screen py-16 px-6"
          >
            <ColumnMapper 
              data={data}
              columns={columns} 
              onComplete={handleConfigComplete} 
              onBack={() => setStep('upload')}
            />
          </motion.div>
        )}

        {step === 'dashboard' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="h-screen"
          >
            <Dashboard 
              data={data} 
              config={config} 
              onReset={handleReset} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
