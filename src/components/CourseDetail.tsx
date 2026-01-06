import React, { useEffect, useState } from 'react';
import { getCourseById } from '../services/courseService';
import { Course } from '../types';

interface CourseDetailProps {
  courseId: string;
  onBack: () => void;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ courseId, onBack }) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'context' | 'build'>('context');

  useEffect(() => {
    const loadCourse = async () => {
      const data = await getCourseById(courseId);
      setCourse(data);
      setLoading(false);
    };
    loadCourse();
  }, [courseId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold">Loading Learning Environment...</div>;
  if (!course) return <div className="p-8 text-center">Course not found.</div>;

  // Safe parsing of content
  const modules = Array.isArray(course.content) ? course.content : (course.content?.modules || []);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* 1. TOP NAVIGATION (MATCHING USE CASE HEADER) */}
      <div className="flex items-center gap-8 border-b border-slate-200 pb-4 mb-8">
        <button 
          onClick={onBack}
          className="text-slate-400 hover:text-slate-900 font-bold text-sm flex items-center gap-2"
        >
          ← Back
        </button>
        <div className="flex gap-6">
           <button 
             onClick={() => setActiveTab('context')}
             className={`pb-4 -mb-4 font-bold text-sm transition-colors ${activeTab === 'context' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}
           >
             1. Context & Concepts
           </button>
           <button 
             onClick={() => setActiveTab('build')}
             className={`pb-4 -mb-4 font-bold text-sm transition-colors ${activeTab === 'build' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}
           >
             2. Build & Deploy Pilot
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: MAIN CONTENT */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 2. HERO HEADER */}
          <div>
            <h1 className="text-3xl font-black text-slate-900 heading mb-4">{course.title}</h1>
            
            {/* CINEMATIC VIDEO PLAYER (MATCHING YOUR SCREENSHOT) */}
            <div className="bg-slate-900 rounded-3xl aspect-video w-full flex flex-col items-center justify-center text-white p-8 relative overflow-hidden group cursor-pointer shadow-xl">
               <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
               </div>
               <p className="font-bold text-lg">Watch Video Guide (5:20)</p>
               <p className="text-slate-400 text-sm mt-1">Master the core concepts of {course.title}</p>
            </div>
          </div>

          {/* 3. TECHNICAL CONTEXT */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
             <h3 className="font-bold text-lg text-slate-900 mb-2">Technical Context</h3>
             <p className="text-slate-600 italic leading-relaxed text-lg">
               "{course.description}"
             </p>
          </div>

          {/* 4. INTERACTIVE QUIZ / MODULE LIST (THE "PURPLE BOX" STYLE) */}
          <div className="bg-indigo-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-800 rounded-lg">
                  <svg className="w-5 h-5 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="font-bold text-xl">Quick Check: Curriculum Modules</h3>
             </div>

             <div className="space-y-3">
               {modules.length > 0 ? modules.map((mod: any, i: number) => (
                 <div key={i} className="bg-indigo-800/50 p-4 rounded-xl border border-indigo-700/50 hover:bg-indigo-800 transition-colors cursor-pointer flex justify-between items-center group">
                    <div>
                      <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest block mb-1">Module 0{i+1}</span>
                      <p className="font-medium text-indigo-50 group-hover:text-white">{mod.module || mod.title || "Untitled Module"}</p>
                    </div>
                    <span className="bg-indigo-600 text-xs font-bold px-2 py-1 rounded text-white group-hover:bg-white group-hover:text-indigo-900 transition-colors">Start</span>
                 </div>
               )) : (
                 <p className="text-indigo-300 italic">No specific modules defined yet.</p>
               )}
             </div>
          </div>

        </div>

        {/* RIGHT COLUMN: SIDEBAR WIDGETS */}
        <div className="space-y-6">
          
          {/* 5. INDIA-SPECIFIC CHALLENGE (MATCHING SCREENSHOT) */}
          <div className="bg-slate-900 text-white p-8 rounded-[2rem]">
             <h3 className="font-bold text-lg mb-4">India-Specific Challenge</h3>
             <p className="text-slate-300 text-sm leading-relaxed mb-6">
               Unlike global models, Indian supply chains face higher variance due to localized seasonality (Festivals, Monsoons) and tiered city distribution.
             </p>
             <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">FOUNDING TIP</p>
                <p className="text-xs text-slate-300 italic">
                  "Always normalize your city-tier data before running clusters. Metro vs Tier-3 buying patterns are divergent."
                </p>
             </div>
          </div>

          {/* ACTION BUTTON */}
          <button className="w-full py-6 bg-indigo-600 rounded-[2rem] text-white font-black text-lg shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all flex flex-col items-center justify-center gap-1">
             <span>I've got the concept.</span>
             <span className="text-sm font-medium opacity-90">Let's Build the Pilot →</span>
          </button>

        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
