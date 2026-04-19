import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileUpload } from '@/components/FileUpload';
import { ColumnMapper, ColumnConfig } from '@/components/ColumnMapper';
import { Dashboard } from '@/components/Dashboard';

type Step = 'upload' | 'map' | 'dashboard';

export default function App() {
  const [step, setStep] = useState<Step>('upload');
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [config, setConfig] = useState<ColumnConfig[]>([]);

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
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center justify-center min-h-screen p-6"
          >
            <div className="text-center mb-16">
              <h1 className="text-6xl font-display font-bold text-slate-800 tracking-tight sm:text-7xl mb-6">
                Insight
              </h1>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
                将原始 CSV 数据转化为精美、交互式的仪表盘，并提供 AI 驱动的定性分析。
              </p>
            </div>
            <FileUpload onDataLoaded={handleDataLoaded} />
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
