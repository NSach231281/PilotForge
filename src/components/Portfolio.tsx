
import React from 'react';
import { UserProfile, Artifact } from '../types';

interface PortfolioProps {
  profile: UserProfile;
  artifacts: Artifact[];
}

const Portfolio: React.FC<PortfolioProps> = ({ profile, artifacts }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Bio Section */}
      <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 mb-12">
        <div className="h-32 bg-indigo-600 relative">
          <div className="absolute -bottom-12 left-8 w-24 h-24 rounded-3xl border-4 border-white shadow-lg bg-slate-200 overflow-hidden">
             <img src="https://picsum.photos/200" alt="Profile" />
          </div>
        </div>
        <div className="pt-16 pb-8 px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 heading">Verified AI Manager</h1>
              <p className="text-slate-500 font-medium">Domain: {profile.role} in {profile.industry}</p>
            </div>
            <button className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-indigo-600 transition-colors flex items-center gap-2">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
               Share to LinkedIn
            </button>
          </div>
          
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pilots Shipped</p>
                <p className="text-2xl font-black text-indigo-600">{artifacts.length}</p>
             </div>
             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Skills Verified</p>
                <p className="text-2xl font-black text-emerald-600">{profile.verifiedSkills.length}</p>
             </div>
             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Track</p>
                <p className="text-sm font-black text-slate-700 uppercase">{profile.track}</p>
             </div>
             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Credential ID</p>
                <p className="text-xs font-mono font-medium text-slate-500">PF-{(Math.random() * 100000).toFixed(0)}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Artifacts Feed */}
      <h2 className="text-2xl font-bold text-slate-900 heading mb-6">AI Pilot Artifacts</h2>
      <div className="space-y-6">
        {artifacts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
             <p className="text-slate-400 font-medium">No pilots shipped yet. Finish your first sprint!</p>
          </div>
        ) : (
          artifacts.map(art => (
            <div key={art.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex gap-6 items-center">
               <div className="w-32 h-20 bg-slate-100 rounded-xl overflow-hidden hidden sm:block">
                  <img src={art.thumbnail} className="w-full h-full object-cover opacity-80" alt="Artifact" />
               </div>
               <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded uppercase">{art.type}</span>
                    <span className="text-xs text-slate-400 font-medium">{art.date}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg leading-tight">{art.title}</h3>
               </div>
               <a href={art.url} className="p-3 bg-slate-50 rounded-full text-slate-400 hover:text-indigo-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
               </a>
            </div>
          ))
        )}
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-slate-400 font-medium italic">Verified by AI Pilot Forge Protocol. Data Safety Compliant (DPDP Act).</p>
      </div>
    </div>
  );
};

export default Portfolio;
