
import React from 'react';

interface NavigationProps {
  currentTab: string;
  setTab: (tab: string) => void;
  userRole?: string;
  isAdmin?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ currentTab, setTab, userRole, isAdmin }) => {
  const tabs = [
    { id: 'dashboard', label: 'My Skill Tree' },
    { id: 'usecase', label: 'Current Sprint' },
    { id: 'portfolio', label: 'Public Portfolio' },
  ];

  if (isAdmin) {
    tabs.push({ id: 'admin', label: 'System Audit' });
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setTab('dashboard')}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="font-bold text-xl tracking-tight heading">PilotForge</span>
          </div>
          
          <div className="hidden md:flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  currentTab === tab.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-400 uppercase">{isAdmin ? 'System Admin' : 'Role'}</p>
                <p className="text-sm font-bold text-slate-700">{userRole || 'New User'}</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userRole}`} alt="avatar" />
             </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
