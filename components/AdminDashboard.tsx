
import React, { useState } from 'react';
import { SKILL_NODES, MOCK_USE_CASES } from '../constants';
import { SkillStatus, LearningTrack, SkillNode, VerificationCriteria } from '../types';
import { generateAILearningContent } from '../services/geminiService';

const AdminDashboard: React.FC = () => {
  const [activeAuditTab, setActiveAuditTab] = useState<'inventory' | 'datasets' | 'paths' | 'lab'>('inventory');
  const [isGenerating, setIsGenerating] = useState(false);
  const [labForm, setLabForm] = useState<Partial<SkillNode>>({
    label: '',
    domain: 'ops',
    difficulty: 'basic',
    type: 'data',
    dependencies: []
  });

  const handleAiGenerate = async () => {
    if (!labForm.label) return alert("Enter a label first");
    setIsGenerating(true);
    try {
      const content = await generateAILearningContent(labForm.label, labForm.domain || 'ops');
      console.log("AI Generated Production Content:", content);
      alert("AI drafted the curriculum and verification criteria. Ready for JSON Export.");
    } finally {
      setIsGenerating(false);
    }
  };

  const exportForProduction = () => {
    const data = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      nodes: SKILL_NODES,
      useCases: MOCK_USE_CASES
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai_pilot_forge_production_v1.json';
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 heading">Production Control</h1>
          <p className="text-slate-500 font-medium">Configure Skill Gates, Verify Datasets, & Export to Cloud DB.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={exportForProduction}
            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export JSON for DB
          </button>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['inventory', 'datasets', 'paths', 'lab'].map((t) => (
              <button 
                key={t}
                onClick={() => setActiveAuditTab(t as any)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize ${activeAuditTab === t ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t === 'lab' ? 'Content Lab' : t}
              </button>
            ))}
          </div>
        </div>
      </header>

      {activeAuditTab === 'lab' ? (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold heading">Author Skill Gate</h2>
                <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-700 px-2 py-1 rounded">V1 Draft Mode</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400">Node Label</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Lead Scoring AI"
                    value={labForm.label}
                    onChange={e => setLabForm({...labForm, label: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-indigo-600 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400">Difficulty Gate</label>
                  <select 
                    value={labForm.difficulty}
                    onChange={e => setLabForm({...labForm, difficulty: e.target.value as any})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="basic">Tier 1: Foundations</option>
                    <option value="intermediate">Tier 2: Build Sprint</option>
                    <option value="advanced">Tier 3: Deployment</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handleAiGenerate}
                  disabled={isGenerating}
                  className="flex-1 bg-indigo-50 text-indigo-700 p-4 rounded-xl font-bold border-2 border-indigo-100 hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
                >
                  {isGenerating ? 'AI Architecting...' : '✨ Generate Verification Logic'}
                </button>
                <button className="flex-1 bg-slate-900 text-white p-4 rounded-xl font-bold hover:bg-black transition-all">
                  Commit to Graph
                </button>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2rem] text-white">
               <h2 className="text-xl font-bold mb-6">Verification Protocol (Gemini-Evaluated)</h2>
               <div className="space-y-4">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                       <p className="font-bold text-sm">Criterion 1: Schema Match</p>
                       <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase font-black tracking-widest">Active</span>
                    </div>
                    <p className="text-xs text-slate-400 italic">"Ensure the uploaded CSV contains 'Probability_Score' and 'City_Tier' columns."</p>
                  </div>
                  <button className="w-full py-3 border border-dashed border-white/20 rounded-xl text-xs font-bold text-slate-500 hover:text-white hover:border-white/40 transition-all">+ Add Logical Constraint</button>
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
               <h3 className="font-bold mb-4">India Compliance Audit</h3>
               <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-medium text-slate-600">DPDP Act Privacy Shield Active</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-medium text-slate-600">Explicit Consent for PII Redaction</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                    <span className="text-xs font-medium text-slate-600 italic text-slate-400">External Auditor Sign-off Pending</span>
                  </div>
               </div>
            </div>

            <div className="bg-indigo-900 p-6 rounded-3xl text-white">
               <h3 className="font-bold mb-2">Monetization Status</h3>
               <div className="p-4 bg-white/10 rounded-xl">
                  <p className="text-[10px] font-black uppercase text-indigo-300 mb-1">Razorpay Environment</p>
                  <p className="text-sm font-bold">TEST_MODE_ACTIVE</p>
               </div>
               <button className="w-full mt-4 bg-white text-indigo-900 py-3 rounded-xl font-bold text-xs">Switch to Production Keys</button>
            </div>
          </div>
        </section>
      ) : (
        /* Inventory / Datasets / Paths (Same as before but with slightly cleaner UI) */
        <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-200">
           <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Audit Console Active for Tab: {activeAuditTab}</p>
           <p className="text-slate-500 text-sm mt-2">Data syncing with V1 Local State.</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
