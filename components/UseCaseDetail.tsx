
import React, { useEffect, useState } from 'react';
import { UseCase, UserProfile } from '../types';
import { getJobSpecificContext } from '../services/geminiService';

interface UseCaseDetailProps {
  useCase: UseCase;
  profile: UserProfile;
  onCompleteTask: (taskId: string, difficultyRating: number) => void;
}

const UseCaseDetail: React.FC<UseCaseDetailProps> = ({ useCase, profile, onCompleteTask }) => {
  const [aiContext, setAiContext] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchContext = async () => {
      const context = await getJobSpecificContext(profile.role, profile.industry, useCase.title);
      setAiContext(context);
    };
    fetchContext();
  }, [useCase, profile]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setUploading(true);
    // Simulate assessment
    setTimeout(() => {
      setUploading(false);
      // Simulated "Difficulty Score" provided by user or AI agent
      const difficultyObserved = Math.random() > 0.3 ? 10 : -20; 
      onCompleteTask(useCase.id, difficultyObserved);
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 pb-20">
      {/* Header & Impact */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
             <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">{useCase.domain}</span>
             <span className="text-slate-400 text-xs font-medium">• 15-min Setup</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 heading mb-4">{useCase.title}</h1>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">{useCase.context}</p>
          
          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-xl">
             <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest mb-1 flex items-center gap-2">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" /></svg>
               Job-Specific Context
             </p>
             <p className="text-slate-700 text-sm italic">{aiContext || 'Personalizing for your role...'}</p>
          </div>
        </div>
        <div className="md:w-1/3">
           <p className="text-xs font-bold text-slate-400 uppercase mb-2">Final Pilot Preview</p>
           <img src={useCase.finishedOutputPreviewUrl} className="rounded-xl shadow-lg border border-slate-200" alt="Preview" />
        </div>
      </div>

      {/* Dataset Sandbox */}
      <div className="bg-slate-900 rounded-[2rem] p-8 text-white">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
              Sandbox Dataset: Realistic Anonymized Data
            </h3>
            <p className="text-slate-400 text-sm">{useCase.datasetDescription}</p>
          </div>
          <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-xs font-bold transition-colors">Download CSV</button>
        </div>
        
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-300 font-bold">
              <tr>
                {Object.keys(useCase.dummyDataPreview[0]).map(k => (
                  <th key={k} className="px-4 py-3 border-b border-white/10 uppercase tracking-widest text-[10px]">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-slate-400 font-mono">
              {useCase.dummyDataPreview.map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  {Object.values(row).map((v: any, j) => (
                    <th key={j} className="px-4 py-3 font-normal">{v}</th>
                  ))}
                </tr>
              ))}
              <tr>
                <td colSpan={Object.keys(useCase.dummyDataPreview[0]).length} className="px-4 py-3 text-center text-[10px] italic text-slate-500">
                  ... +9,997 more rows optimized for Indian warehouse dynamics
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step-by-Step Cookbook */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            The 45-Min Pilot Cookbook
          </h3>
          <div className="space-y-4">
            {useCase.cookbook.steps.map((step, idx) => (
              <div key={idx} className="flex gap-4 items-start bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">{idx + 1}</span>
                <p className="text-slate-700 font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Resources & Upload */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-4">Resources</h4>
            <div className="space-y-3">
              {useCase.cookbook.resources.map((res, i) => (
                <a key={i} href={res.url} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] font-black uppercase">{res.type}</span>
                    <span className="text-sm font-semibold text-slate-700">{res.label}</span>
                  </div>
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>
                </a>
              ))}
            </div>
          </div>

          <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-100">
            <h4 className="font-bold mb-2">Ship Your Pilot</h4>
            <p className="text-indigo-100 text-xs mb-6">Upload your output to verify competence and unlock next branch.</p>
            <label className={`block w-full text-center py-4 px-2 rounded-xl border-2 border-dashed border-indigo-400 cursor-pointer transition-all hover:bg-indigo-500 ${uploading ? 'animate-pulse' : ''}`}>
              <input type="file" className="hidden" onChange={handleFileUpload} />
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-bold uppercase tracking-widest">{uploading ? 'Analyzing...' : 'Upload Proof of Work'}</span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UseCaseDetail;
