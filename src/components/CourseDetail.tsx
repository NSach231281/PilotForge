import React, { useEffect, useState } from 'react';
import { getCourseById } from '../services/courseService';
import { Course } from '../types';
import { downloadDatasetAsCSV } from '../utils/csvHelper'; // 1. Import Download Helper
import { evaluateSubmission, GradingResult } from '../services/gradingService'; // 2. Import Grading Engine

interface CourseDetailProps {
  courseId: string;
  onBack: () => void;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ courseId, onBack }) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'context' | 'build'>('context');

  // --- NEW STATE FOR GRADING ---
  const [submissionText, setSubmissionText] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [reportCard, setReportCard] = useState<GradingResult | null>(null);

  useEffect(() => {
    const loadCourse = async () => {
      const data = await getCourseById(courseId);
      setCourse(data);
      setLoading(false);
    };
    loadCourse();
  }, [courseId]);

  // --- HANDLER: AI GRADING ---
  const handleGrade = async () => {
    if (!submissionText) return alert("Please type your analysis first.");
    setIsGrading(true);
    
    // Call the AI Professor service
    const result = await evaluateSubmission(submissionText, course);
    setReportCard(result);
    setIsGrading(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold animate-pulse">
      Loading Learning Environment...
    </div>
  );

  if (!course) return <div className="p-8 text-center text-slate-500">Course not found.</div>;

  // --- SAFE DATA PARSING ---
  const aiContent = course.content || {};
  const caseTitle = aiContent.caseTitle || course.title;
  const narrative = aiContent.narrative || course.description;
  const questions = aiContent.strategicQuestions || [];
  const dataset = aiContent.datasetContext || {};
  const fullDataset = aiContent.fullDataset || dataset.previewRows || []; // Use full generated data if available

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 pb-20">
      
      {/* 1. TOP NAVIGATION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 mb-8 gap-4">
        <button 
          onClick={onBack}
          className="text-slate-400 hover:text-slate-900 font-bold text-sm flex items-center gap-2 transition-colors"
        >
          ← Back to Dashboard
        </button>
        
        {/* TAB SWITCHER */}
        <div className="flex gap-8">
           <button 
             onClick={() => setActiveTab('context')}
             className={`pb-4 -mb-[17px] font-bold text-sm transition-all ${activeTab === 'context' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             1. Business Context
           </button>
           <button 
             onClick={() => setActiveTab('build')}
             className={`pb-4 -mb-[17px] font-bold text-sm transition-all ${activeTab === 'build' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             2. Data & Analysis
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
        
        {/* --- LEFT COLUMN (MAIN) --- */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* TITLE HEADER */}
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${course.difficulty === 'beginner' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                 {course.difficulty}
               </span>
               <span className="text-slate-400 text-xs font-bold uppercase">• AI Generated Case</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 heading leading-tight">{caseTitle}</h1>
          </div>

          {activeTab === 'context' ? (
            /* === TAB 1: CONTEXT VIEW (Unchanged) === */
            <div className="space-y-8">
                {/* VIDEO PLACEHOLDER */}
                <div className="bg-slate-900 rounded-[2rem] aspect-video w-full flex flex-col items-center justify-center text-white p-8 relative overflow-hidden group cursor-pointer shadow-2xl shadow-slate-200">
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                   <div className="relative z-10 flex flex-col items-center">
                       <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform border border-white/30">
                          <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                       </div>
                       <p className="font-bold text-lg">Watch Executive Briefing</p>
                       <p className="text-slate-400 text-sm mt-1">Understanding the {aiContent.companyContext || 'Business'} Landscape</p>
                   </div>
                </div>

                {/* NARRATIVE TEXT */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                   <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                     The Scenario
                   </h3>
                   <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-4">
                     {narrative.split('\n').map((para: string, i: number) => (
                       <p key={i}>{para}</p>
                     ))}
                   </div>
                </div>

                {/* STRATEGIC QUESTIONS */}
                {questions.length > 0 && (
                  <div className="bg-indigo-50 rounded-[2rem] p-8 border border-indigo-100">
                      <h3 className="font-bold text-lg text-indigo-900 mb-6">Strategic Objectives</h3>
                      <div className="space-y-3">
                        {questions.map((q: string, i: number) => (
                          <div key={i} className="flex gap-4 items-start bg-white p-4 rounded-xl border border-indigo-100/50 shadow-sm">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                            <p className="text-indigo-900/80 font-medium text-sm">{q}</p>
                          </div>
                        ))}
                      </div>
                  </div>
                )}
            </div>
          ) : (
            /* === TAB 2: BUILD / DATA VIEW (UPGRADED) === */
            <div className="space-y-8">
                
                {/* DATASET CARD */}
                <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl">
                   <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">Sandbox Dataset</h3>
                        <p className="text-slate-400 text-xs font-mono">{dataset.filename || 'data.csv'}</p>
                      </div>
                      <button 
                        // UPDATED: Connected to Real Download Logic
                        onClick={() => downloadDatasetAsCSV(dataset.filename || 'data.csv', fullDataset)}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors border border-white/10 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download {fullDataset.length} Rows
                      </button>
                   </div>
                   
                   {/* DATA PREVIEW TABLE */}
                   <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20">
                      <table className="w-full text-left text-xs">
                         <thead className="bg-white/5 text-slate-300">
                           <tr>
                             {dataset.columns?.map((col: string, i: number) => (
                               <th key={i} className="px-4 py-3 border-b border-white/10 uppercase tracking-widest whitespace-nowrap">{col}</th>
                             ))}
                           </tr>
                         </thead>
                         <tbody className="text-slate-400 font-mono">
                           {/* Show first 5 rows only */}
                           {fullDataset.slice(0, 5).map((row: any, i: number) => (
                               <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                 {Object.values(row).map((val: any, j: number) => (
                                   <td key={j} className="px-4 py-3 whitespace-nowrap">{val}</td>
                                 ))}
                               </tr>
                           ))}
                         </tbody>
                      </table>
                   </div>
                   
                   <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
                      <span className="text-[10px] font-bold uppercase text-slate-500 py-1">Known Issues:</span>
                      {dataset.messyFactors?.map((factor: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-rose-500/20 text-rose-300 rounded text-[10px] font-bold whitespace-nowrap border border-rose-500/20">
                          {factor}
                        </span>
                      ))}
                   </div>
                </div>

                {/* --- NEW SECTION: SUBMISSION ENGINE --- */}
                <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                   <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                      <h2 className="text-xl font-bold text-slate-900">Boardroom Submission</h2>
                      <p className="text-slate-500 text-sm mt-1">Submit your strategic analysis for AI evaluation.</p>
                   </div>
                   
                   <div className="p-8">
                      {/* INPUT AREA */}
                      <div className="space-y-4 mb-8">
                         <textarea 
                           value={submissionText}
                           onChange={(e) => setSubmissionText(e.target.value)}
                           className="w-full h-48 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-slate-600 leading-relaxed resize-none shadow-inner"
                           placeholder="Executive Summary: Based on the analysis of the dataset, the primary drivers of the issue are..."
                         />
                         <button 
                           onClick={handleGrade}
                           disabled={isGrading || !submissionText}
                           className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2
                             ${isGrading 
                               ? 'bg-slate-100 text-slate-400 cursor-wait' 
                               : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'}`}
                         >
                           {isGrading ? 'AI is Grading...' : 'Submit to Board'}
                         </button>
                      </div>

                      {/* REPORT CARD (Dynamic) */}
                      {reportCard && (
                         <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 animate-in fade-in zoom-in duration-500">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                               <div>
                                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Score</p>
                                 <div className={`text-4xl font-black tracking-tighter ${reportCard.score >= 80 ? 'text-emerald-600' : 'text-amber-500'}`}>
                                   {reportCard.score}<span className="text-xl text-slate-300">/100</span>
                                 </div>
                               </div>
                               <div className="text-right">
                                 {reportCard.score >= 80 ? <span className="text-4xl">🏆</span> : <span className="text-4xl">📚</span>}
                               </div>
                            </div>
                            
                            <p className="font-bold text-slate-900 mb-2 text-sm">Feedback</p>
                            <p className="text-sm text-slate-600 italic mb-4">"{reportCard.feedback}"</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {reportCard.strengths.length > 0 && (
                                 <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                    <span className="font-bold text-emerald-700 text-xs block mb-1">STRENGTHS</span>
                                    {reportCard.strengths.map((s, i) => <div key={i} className="text-emerald-800 text-xs">• {s}</div>)}
                                 </div>
                               )}
                               {reportCard.improvements.length > 0 && (
                                 <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
                                    <span className="font-bold text-rose-700 text-xs block mb-1">IMPROVEMENTS</span>
                                    {reportCard.improvements.map((s, i) => <div key={i} className="text-rose-800 text-xs">• {s}</div>)}
                                 </div>
                               )}
                            </div>
                         </div>
                      )}
                   </div>
                </div>
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN (SIDEBAR) --- */}
        <div className="space-y-6">
           
           {/* CONTEXT WIDGET */}
           <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 mb-4 uppercase tracking-wide">Key Protagonist</h3>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl">👩🏽‍💼</div>
                 <div>
                    <p className="font-bold text-slate-900">{aiContent.protagonist?.split(',')[0] || 'Manager'}</p>
                    <p className="text-xs text-slate-500 font-medium">{aiContent.protagonist?.split(',')[1] || 'Role'}</p>
                 </div>
              </div>
           </div>

           {/* INDIA CONTEXT WIDGET */}
           <div className="bg-indigo-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-32 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
               <h3 className="font-bold text-lg mb-4 relative z-10">Market Context</h3>
               <p className="text-indigo-200 text-sm leading-relaxed mb-6 relative z-10">
                 {aiContent.companyContext || "Navigating the complexities of the Indian market requires specific attention to regional variances."}
               </p>
               <div className="bg-white/10 p-4 rounded-xl border border-white/10 relative z-10 backdrop-blur-md">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1 opacity-70">Focus Area</p>
                  <p className="text-xs font-bold text-white">
                    {course.difficulty === 'beginner' ? 'Foundations & Clean Data' : 'Optimization & Scale'}
                  </p>
               </div>
           </div>

           {/* CTA */}
           {activeTab === 'context' && (
             <button 
               onClick={() => setActiveTab('build')}
               className="w-full py-6 bg-indigo-600 rounded-[2rem] text-white font-bold shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group"
             >
               <span>Start Pilot</span>
               <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
             </button>
           )}
        </div>

      </div>
    </div>
  );
};

export default CourseDetail;
