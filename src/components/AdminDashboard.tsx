import React, { useState } from 'react';
import { SKILL_NODES, MOCK_USE_CASES } from '../constants';
import ContentLab from './ContentLab';
import AdminPathLibrary from './AdminPathLibrary'; // NEW

const AdminDashboard: React.FC = () => {
  // Added "library" tab so admin can preview all personas/paths
  const [activeAuditTab, setActiveAuditTab] = useState<
    'inventory' | 'datasets' | 'paths' | 'library' | 'lab'
  >('lab');

  const exportForProduction = () => {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      nodes: SKILL_NODES,
      useCases: MOCK_USE_CASES,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai_pilot_forge_production_v1.json';
    a.click();
  };

  const TABS: Array<{ key: 'inventory' | 'datasets' | 'paths' | 'library' | 'lab'; label: string }> = [
    { key: 'inventory', label: 'inventory' },
    { key: 'datasets', label: 'datasets' },
    { key: 'paths', label: 'paths' },
    { key: 'library', label: 'Path Library' }, // NEW
    { key: 'lab', label: 'Content Lab' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 heading">Production Control</h1>
          <p className="text-slate-500 font-medium">
            Configure Skill Gates, Verify Datasets, Preview Paths, & Export to Cloud DB.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={exportForProduction}
            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export JSON for DB
          </button>

          {/* TAB SWITCHER */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveAuditTab(t.key)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeAuditTab === t.key
                    ? 'bg-white shadow-sm text-indigo-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* BODY CONTENT */}
      {activeAuditTab === 'lab' ? (
        <ContentLab />
      ) : activeAuditTab === 'library' ? (
        // NEW: Admin can preview all persona skill trees & 9-week journeys
        <AdminPathLibrary />
      ) : (
        // Existing placeholders
        <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
            Audit Console Active for Tab: {activeAuditTab}
          </p>
          <p className="text-slate-500 text-sm mt-2">Data syncing with V1 Local State.</p>

          <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg mx-auto opacity-50">
            <div className="h-4 bg-slate-100 rounded"></div>
            <div className="h-4 bg-slate-100 rounded col-span-2"></div>
            <div className="h-4 bg-slate-100 rounded col-span-2"></div>
            <div className="h-4 bg-slate-100 rounded"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
