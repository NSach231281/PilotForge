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
  const [activeUnit, setActiveUnit] = useState<'learn' | 'build'>('learn');

  useEffect(() => {
    const fetchContext = async () => {
      // Safe check to ensure we have valid strings before calling AI
      if (profile.role && useCase.title) {
        const context = await getJobSpecificContext(profile.role, profile.industry || 'General', useCase.title);
        setAiContext(context);
      }
    };
    fetchContext();
  }, [useCase, profile]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      onCompleteTask(useCase.id, 10);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 pb-20">
      {/* Unit Switcher */}
      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveUnit('learn')}
          className={`pb-4 text-sm font-bold transition-all ${activeUnit === 'learn' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}
        >
          1. Context & Concepts
        </button>
        <button 
          onClick={() => setActiveUnit('build')}
          className={`pb-4 text-sm font-bold transition-all ${activeUnit === 'build' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}
        >
          2. Build & Deploy Pilot
        </button>
      </div>

      {activeUnit === 'learn' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
               <h1 className="text-3xl font-bold text-slate-900 heading mb-4">{useCase.title}</h1>
               <div className="aspect-video bg-slate-900 rounded-3xl overflow-hidden relative mb-6">
                 {/* Placeholder for Video Player */}
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center bg-gradient-to-t from-black/60 to-transparent">
                   <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md mb-4 hover:scale-110 transition-transform cursor-pointer">
                      <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                   </div>
                   <p className="font-bold">Watch Video Guide (5:20)</p>
                   <p className="text-xs text-white/60">How {profile.role}s in India use {useCase.title} to drive ROI.</p>
                 </div>
               </div>
               <div className="prose prose-slate max-w-none">
                 <h3 className="font-bold text-lg mb-2">Technical Context</h3>
                 <p className="text-slate-600 leading-relaxed italic">{aiContext || 'Personalizing for your current role...'}</p>
                 <p className="text-slate-600 mt-4">{useCase.description}</p>
               </div>
            </div>
          </div>
          
          {/* RIGHT COLUMN */}
          <div className="space-y-6">
             <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl">
                <h4 className="font-bold mb-4">India-Specific Challenge</h4>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Unlike global models, Indian supply chains face higher variance due to localized seasonality (Festivals, Monsoons).
                </p>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                   <p className="text-[10px] font-black uppercase text-indigo-400 mb-2">Founding Tip</p>
                   <p className="text-xs">"Always normalize your city-tier data before running clusters. Metro vs Tier-3 buying patterns are divergent."</p>
                </div>
             </div>
             
             <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
                <h4 className="font-bold text-indigo-900 mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {useCase.requiredSkills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-white text-indigo-600 text-xs font-bold rounded-full border border-indigo-100 shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>
             </div>

             <button 
              onClick={() => setActiveUnit('build')}
              className="w-full bg-indigo-600 text-white p-6 rounded-[2rem] font-bold shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
             >
                I've got the concept. <br/> Let's Build the Pilot →
             </button>
          </div>
        </div>
      ) : (
        /* BUILD TAB */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
           <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                 <h3 className="text-xl font-bold text-slate-900 mb-6">Cookbook: Build Steps</h3>
                 <div className="space-y-4">
                   {/* FIXED: Check if cookbook exists, then map safely */}
                   {useCase.cookbook && useCase.cookbook.length > 0 ? (
                     useCase.cookbook.map((step, idx) => (
                       <div key={idx} className="flex gap-4 items-start bg-slate-50 p-5 rounded-2xl border border-slate-100 group">
                         <span className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200 text-slate-400 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                           {idx + 1}
                         </span>
                         <p className="text-slate-700 font-medium">{step}</p>
                       </div>
                     ))
                   ) : (
                     <div className="p-8 text-center bg-slate-50 rounded-2xl text-slate-400 italic">
                       No step-by-step guide available for this case yet.
                     </div>
                   )}
                 </div>
              </div>
           </div>

           <div className="space-y-6">
              <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="font-black text-xl mb-2">Ship Your Pilot</h4>
                  <p className="text-indigo-100 text-sm mb-6 italic">Upload your final artifact to verify your skill node.</p>
                  <label className={`block w-full text-center py-8 rounded-2xl border-2 border-dashed border-indigo-400 cursor-pointer transition-all hover:bg-indigo-500 hover:border-indigo-300 ${uploading ? 'animate-pulse' : ''}`}>
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                    <span className="text-xs font-bold uppercase tracking-widest">{uploading ? 'Evaluating Pilot...' : 'Drag Final Artifact Here'}</span>
                  </label>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default UseCaseDetail;
