import React, { useMemo, useState } from 'react';
import { ADMIN_PATH_LIBRARY } from '../constants';

const LS_KEYS = {
  skillTreeId: 'admin_preview_skillTreeId',
  programId: 'admin_preview_programId',
  domain: 'admin_preview_domainPreference',
};

const AdminPathLibrary: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>(ADMIN_PATH_LIBRARY[0]?.id || '');

  const selected = useMemo(
    () => ADMIN_PATH_LIBRARY.find((x) => x.id === selectedId),
    [selectedId]
  );

  const setPreview = (action: 'skillTree' | 'journey') => {
    if (!selected) return;
    localStorage.setItem(LS_KEYS.skillTreeId, selected.skillTreeId);
    localStorage.setItem(LS_KEYS.programId, selected.programId);
    localStorage.setItem(LS_KEYS.domain, selected.domainPreference);

    // Navigate to learner pages for preview (admin sees exactly what learner sees)
    if (action === 'skillTree') window.location.href = '/skill-tree';
    else window.location.href = '/journey';
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Path Library</h2>
          <p className="text-slate-500 text-sm">
            Preview any persona’s Skill Tree and 9-week Journey without onboarding.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setPreview('skillTree')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
            disabled={!selected}
          >
            Preview Skill Tree
          </button>
          <button
            onClick={() => setPreview('journey')}
            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-black transition"
            disabled={!selected}
          >
            Preview 9-Week Journey
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: selector list */}
        <div className="lg:col-span-1 bg-slate-50 rounded-2xl p-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Available Paths
          </p>

          <div className="space-y-2">
            {ADMIN_PATH_LIBRARY.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`w-full text-left p-3 rounded-xl border transition ${
                  selectedId === item.id
                    ? 'bg-white border-indigo-200 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-sm font-extrabold text-slate-900">{item.title}</div>
                <div className="text-xs text-slate-500 mt-1">{item.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: details */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100">
          {selected ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">{selected.title}</h3>
                  <p className="text-slate-500 text-sm mt-1">{selected.description}</p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400 uppercase font-bold tracking-widest">Domain</div>
                  <div className="text-sm font-extrabold text-slate-900">{selected.domainPreference}</div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="text-xs text-slate-400 uppercase font-bold tracking-widest">Skill Tree ID</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">{selected.skillTreeId}</div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="text-xs text-slate-400 uppercase font-bold tracking-widest">Program ID</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">{selected.programId}</div>
                </div>
              </div>

              <div className="mt-4 text-xs text-slate-500">
                Tip: Admin preview sets a localStorage override so the Skill Tree & Journey pages load the selected path
                even if your admin profile has no onboarding data.
              </div>
            </>
          ) : (
            <div className="text-slate-500">No path selected.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPathLibrary;
