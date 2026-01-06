import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import { Session } from '@supabase/supabase-js';

// --- Services & Components ---
import { saveUserProfile, getUserProfile } from './services/userService';
import Auth from './components/Auth';
import CourseList from './components/CourseList';
import CourseDetail from './components/CourseDetail'; // <--- NEW IMPORT
import Navigation from './components/Navigation';
import OnboardingForm from './components/OnboardingForm';
import SkillTree from './components/SkillTree';
import UseCaseDetail from './components/UseCaseDetail';
import Portfolio from './components/Portfolio';
import AdminDashboard from './components/AdminDashboard';

// --- Types & Constants ---
import { UserProfile, SkillNode, SkillStatus, Artifact } from './types';
import { SKILL_NODES, MOCK_USE_CASES } from './constants';
import { calculateLearningPath, adjustGraphForPerformance } from './services/matchingEngine';

const App: React.FC = () => {
  // --- AUTH STATE ---
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // --- APP STATE ---
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  
  // New State for Course Navigation
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null); // <--- NEW STATE

  const [activeUseCaseId, setActiveUseCaseId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<SkillNode[]>(SKILL_NODES);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);

  // --- 1. AUTH & DATA LOADING EFFECT ---
  useEffect(() => {
    // Helper to load profile from DB
    const loadUserData = async (currentSession: Session) => {
      try {
        const profile = await getUserProfile(currentSession.user.id);
        if (profile) {
          setUserProfile(profile); // Found profile -> Skip onboarding
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setAuthLoading(false);
      }
    };

    // Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadUserData(session);
      } else {
        setAuthLoading(false);
      }
    });

    // Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadUserData(session);
      } else {
        setUserProfile(null); // Clear profile on logout
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- 2. SKILL GRAPH ADJUSTMENT EFFECT ---
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

  // --- HANDLERS ---

  const handleOnboardingComplete = async (profile: UserProfile) => {
    if (!session?.user) return;

    const { track, domainPreference, startingUseCaseId } = calculateLearningPath(profile);
    
    // Create complete profile with Auth ID
    const completeProfile: UserProfile = { 
      ...profile, 
      id: session.user.id,
      email: session.user.email || '',
      track, 
      domainPreference,
      verifiedSkills: [],
      masteryScore: 70 
    };

    // 1. Update UI immediately
    setUserProfile(completeProfile);
    setActiveUseCaseId(startingUseCaseId);
    
    if (completeProfile.isAdmin) {
      setCurrentTab('admin');
    } else {
      setCurrentTab('dashboard');
    }

    // 2. Save to Supabase (Background)
    try {
      await saveUserProfile(completeProfile);
    } catch (err) {
      console.error("Failed to save profile:", err);
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

    // Update Skill Tree Logic
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
    setNodes(SKILL_NODES);
    setSession(null);
  };

  // --- RENDERING ---

  // 1. Loading
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 font-medium">Loading AI Pilot Forge...</div>;
  }

  // 2. Auth Screen (Gatekeeper)
  if (!session) {
    return <Auth />;
  }

  // 3. Onboarding (Logged in, but new user)
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6">
        <div className="w-full max-w-4xl flex justify-end mb-4">
           <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 text-sm font-medium">Sign Out</button>
        </div>
        <header className="text-center mb-12">
           <h1 className="text-4xl font-black text-slate-900 heading mb-4 tracking-tighter">Build Your First AI Pilot <span className="text-indigo-600">in 45 Minutes.</span></h1>
           <p className="text-slate-500 max-w-lg mx-auto font-medium text-lg italic">The v1 personal OS for India's Supply Chain & Marketing leaders.</p>
        </header>
        <OnboardingForm onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  // 4. Main App (Logged in & Profile loaded)
  const activeUseCase = MOCK_USE_CASES.find(u => u.id === activeUseCaseId) || MOCK_USE_CASES[0];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-slate-900 text-white px-4 py-2 flex justify-between items-center text-xs">
         <span>Logged in as: {session.user.email} {userProfile.isAdmin ? '(ADMIN)' : ''}</span>
         <button onClick={handleLogout} className="hover:text-red-300">Sign Out</button>
      </div>

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
                  
                  <button 
                    onClick={() => setCurrentTab('courses')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    View Course Catalog
                  </button>
               </div>

               {/* Progress Widget */}
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

        {/* --- UPDATED COURSES TAB LOGIC --- */}
        {currentTab === 'courses' && (
          <div className="max-w-7xl mx-auto py-8 px-4">
            {activeCourseId ? (
              // SHOW DETAIL VIEW
              <CourseDetail 
                courseId={activeCourseId} 
                onBack={() => setActiveCourseId(null)} 
              />
            ) : (
              // SHOW LIST VIEW
              <div className="mb-6">
                <button 
                  onClick={() => setCurrentTab('dashboard')} 
                  className="text-slate-500 hover:text-slate-900 text-sm mb-4 flex items-center gap-1 font-medium"
                >
                  ← Back to Dashboard
                </button>
                <h2 className="text-2xl font-bold text-slate-900 heading">Learning Resources</h2>
                <p className="text-slate-500 mb-8">Live courses fetched from Supabase</p>
                <CourseList onSelectCourse={(id) => setActiveCourseId(id)} />
              </div>
            )}
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
