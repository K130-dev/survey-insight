import React, { useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, Sparkles, ChevronRight } from 'lucide-react';
import Papa from 'papaparse';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { SAMPLE_DATA, SAMPLE_COLUMNS } from '@/data/sampleData';

interface FileUploadProps {
  onDataLoaded: (data: any[], columns: string[]) => void;
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

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
          console.error('CSV Parse Errors:', results.errors);
          setError('解析 CSV 文件出错。请检查格式。');
          setIsProcessing(false);
          return;
        }
        if (results.data.length === 0) {
          setError('CSV 文件似乎为空。');
          setIsProcessing(false);
          return;
        }
        const columns = results.meta.fields || Object.keys(results.data[0] as object);
        
        // Simulate a small delay for better UX feel
        setTimeout(() => {
          onDataLoaded(results.data, columns);
          setIsProcessing(false);
        }, 800);
      },
      error: (err) => {
        setError(`读取文件出错：${err.message}`);
        setIsProcessing(false);
      }
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const loadSampleData = () => {
    setError(null);
    setIsProcessing(true);
    
    // Simulate loading delay
    setTimeout(() => {
      onDataLoaded(SAMPLE_DATA, SAMPLE_COLUMNS);
      setIsProcessing(false);
    }, 800);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Upload Zone */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            "relative group border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-500 flex flex-col items-center justify-center min-h-[400px]",
            isDragging
              ? "border-brand-500 bg-brand-50/50 scale-[1.02] shadow-2xl shadow-brand-100/50"
              : "border-slate-200 hover:border-slate-300 bg-white shadow-xl shadow-slate-200/40",
            isProcessing && "pointer-events-none opacity-80"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-6 w-full">
            <motion.div 
              animate={isDragging ? { y: -10 } : { y: 0 }}
              className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300",
                isDragging ? "bg-brand-600 text-white shadow-xl shadow-brand-200" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600"
              )}
            >
              {isProcessing ? (
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Upload className="w-10 h-10" />
              )}
            </motion.div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-bold text-slate-800">
                {isProcessing ? "正在处理数据..." : "上传您的数据"}
              </h3>
              <p className="text-slate-500 font-light text-sm">
                拖放或点击浏览 CSV 文件
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 pt-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                自动检测列
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                AI 自动总结
              </div>
            </div>
          </label>
        </motion.div>

        {/* Sample Data Zone */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative group border border-slate-200 rounded-3xl p-10 text-center bg-white shadow-xl shadow-slate-200/40 flex flex-col items-center justify-center min-h-[400px] overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Sparkles className="w-32 h-32 text-brand-500" />
          </div>

          <div className="w-20 h-20 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mb-6">
            <Sparkles className="w-10 h-10" />
          </div>

          <div className="space-y-2 mb-8">
            <h3 className="text-2xl font-display font-bold text-slate-800">
              快速开始
            </h3>
            <p className="text-slate-500 font-light text-sm max-w-[200px] mx-auto">
              没有现成数据？使用我们的示例数据集即刻体验。
            </p>
          </div>

          <button
            onClick={loadSampleData}
            disabled={isProcessing}
            className="group relative flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-brand-600 hover:shadow-2xl hover:shadow-brand-200 transition-all duration-300 active:scale-95"
          >
            使用示例数据
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="mt-10 w-full">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">包含内容</p>
            <div className="flex justify-center gap-4">
              {['样本属性', '量化指标', '文本反馈'].map((tag) => (
                <span key={tag} className="text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3 shadow-sm max-w-2xl mx-auto"
        >
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertCircle className="w-5 h-5" />
          </div>
          <span className="font-medium">{error}</span>
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-16 text-center"
      >
        <p className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-[0.2em]">支持的 CSV 结构示例</p>
        <div className="max-w-3xl mx-auto bg-slate-900/5 backdrop-blur-sm border border-slate-200 p-6 rounded-2xl text-left overflow-x-auto font-mono text-[10px] text-slate-600 leading-relaxed shadow-inner">
          <span className="text-slate-400"># timestamp, age_group, gender, satisfaction, feedback</span><br/>
          2024-03-01, 18-24, Male, High, "The interface is incredibly smooth..."<br/>
          2024-03-02, 25-34, Female, Medium, "Needs more dark mode options."
        </div>
      </motion.div>
    </div>
  );
}
