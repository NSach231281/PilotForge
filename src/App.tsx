import React, { useState, useEffect } from 'react';
import CourseList from './components/CourseList';
import Navigation from './components/Navigation';
import OnboardingForm from './components/OnboardingForm';
import SkillTree from './components/SkillTree';
import UseCaseDetail from './components/UseCaseDetail';
import Portfolio from './components/Portfolio';
import AdminDashboard from './components/AdminDashboard';
import { UserProfile, SkillNode, SkillStatus, Artifact } from './types';
import { SKILL_NODES, MOCK_USE_CASES } from './constants';
import { calculateLearningPath, adjustGraphForPerformance } from './services/matchingEngine';

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [activeUseCaseId, setActiveUseCaseId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<SkillNode[]>(SKILL_NODES);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);

  useEffect(() => {
    if (userProfile) {
      if (userProfile.isAdmin) {
        setNodes(SKILL_NODES.map(n => ({...n, status: SkillStatus.UNLOCKED})));
      } else {
        const adjusted = adjustGraphForPerformance(SKILL_NODES, userProfile.masteryScore, userProfile.domainPreference);
        setNodes(adjusted);
      }
    }
  }, [userProfile?.masteryScore, userProfile?.domainPreference, userProfile?.isAdmin]);

  const handleOnboardingComplete = (profile: UserProfile) => {
    const { track, domainPreference, startingUseCaseId } = calculateLearningPath(profile);
    const completeProfile: UserProfile = { 
      ...profile, 
      track, 
      domainPreference,
      verifiedSkills: [],
      masteryScore: 70 
    };
    setUserProfile(completeProfile);
    setActiveUseCaseId(startingUseCaseId);
    
    if (completeProfile.isAdmin) {
      setCurrentTab('admin');
    } else {
      setCurrentTab('dashboard');
    }
  };

  const handleNodeClick = (node: SkillNode) => {
    const found = MOCK_USE_CASES.find(uc => uc.requiredSkills.includes(node.id));
    if (found) {
      setActiveUseCaseId(found.id);
      setCurrentTab('usecase');
    }
  };

  const handleTaskComplete = (useCaseId: string, difficultyAdjustment: number) => {
    const uc = MOCK_USE_CASES.find(u => u.id === useCaseId);
    if (!uc || !userProfile) return;

    const newMastery = Math.min(100, Math.max(0, userProfile.masteryScore + difficultyAdjustment));
    const updatedProfile: UserProfile = {
      ...userProfile,
      masteryScore: newMastery,
      verifiedSkills: Array.from(new Set([...userProfile.verifiedSkills, ...uc.requiredSkills]))
    };
    setUserProfile(updatedProfile);

    const newNodes = nodes.map(node => {
      if (uc.requiredSkills.includes(node.id)) {
        return { ...node, status: SkillStatus.COMPLETED };
      }
      return node;
    });

    const finalNodes = newNodes.map(node => {
      if (node.status === SkillStatus.LOCKED) {
        const depsMet = node.dependencies.every(depId => 
          newNodes.find(n => n.id === depId)?.status === SkillStatus.COMPLETED
        );
        if (depsMet) return { ...node, status: SkillStatus.UNLOCKED };
      }
      return node;
    });
    setNodes(finalNodes);

    const newArtifact: Artifact = {
      id: Math.random().toString(),
      userId: userProfile.id,
      useCaseId: useCaseId,
      title: uc.title,
      type: 'Pilot Artifact',
      date: new Date().toLocaleDateString('en-IN'),
      url: '#',
      thumbnail: uc.finishedOutputPreviewUrl,
      status: 'verified'
    };
    setArtifacts([newArtifact, ...artifacts]);
    setCurrentTab('portfolio');
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6">
        <header className="text-center mb-12">
           <h1 className="text-4xl font-black text-slate-900 heading mb-4 tracking-tighter">Build Your First AI Pilot <span className="text-indigo-600">in 45 Minutes.</span></h1>
           <p className="text-slate-500 max-w-lg mx-auto font-medium text-lg italic">The v1 personal OS for India's Supply Chain & Marketing leaders.</p>
        </header>
        <OnboardingForm onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  const activeUseCase = MOCK_USE_CASES.find(u => u.id === activeUseCaseId) || MOCK_USE_CASES[0];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navigation 
        currentTab={currentTab} 
        setTab={setCurrentTab} 
        userRole={userProfile.role} 
        isAdmin={userProfile.isAdmin}
      />

      <main className="transition-all duration-300">
        {currentTab === 'dashboard' && (
          <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
               <div>
                  <h2 className="text-2xl font-bold text-slate-900 heading">Your {userProfile.domainPreference.toUpperCase()} Learning Path</h2>
                  <p className="text-slate-500 font-medium italic mb-4">Path adapted to your role and verified mastery: {userProfile.masteryScore}%</p>
                  
                  {/* --- NEW BUTTON TO ACCESS COURSES --- */}
                  <button 
                    onClick={() => setCurrentTab('courses')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    View Course Catalog
                  </button>
               </div>
               <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 flex items-center justify-center font-bold text-emerald-600 text-sm">
                    {Math.round((userProfile.verifiedSkills.length / Math.max(1, nodes.filter(n => n.status !== SkillStatus.HIDDEN).length)) * 100)}%
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Track Completion</p>
                    <p className="text-sm font-bold text-slate-700">{userProfile.verifiedSkills.length} Skills Verified</p>
                  </div>
               </div>
            </div>
            <SkillTree nodes={nodes.filter(n => n.status !== SkillStatus.HIDDEN)} onNodeClick={handleNodeClick} />
          </div>
        )}

        {/* --- NEW COURSES TAB --- */}
        {currentTab === 'courses' && (
          <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="mb-6">
              <button 
                onClick={() => setCurrentTab('dashboard')} 
                className="text-slate-500 hover:text-slate-900 text-sm mb-4 flex items-center gap-1 font-medium"
              >
                ← Back to Dashboard
              </button>
              <h2 className="text-2xl font-bold text-slate-900 heading">Learning Resources</h2>
              <p className="text-slate-500">Live courses fetched from Supabase</p>
            </div>
            <CourseList />
          </div>
        )}

        {currentTab === 'usecase' && (
          <UseCaseDetail 
            useCase={activeUseCase} 
            profile={userProfile}
            onCompleteTask={handleTaskComplete}
          />
        )}

        {currentTab === 'portfolio' && (
          <Portfolio profile={userProfile} artifacts={artifacts} />
        )}

        {currentTab === 'admin' && userProfile.isAdmin && (
          <AdminDashboard />
        )}
      </main>
    </div>
  );
};

export default App;
