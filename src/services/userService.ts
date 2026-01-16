import { supabase } from './supabase';
import { UserProfile, LearningTrack, ProgramProgress } from '../types';

// 1. SAVE: Updates the user's profile in the database
export const saveUserProfile = async (profile: UserProfile) => {
  const { error } = await supabase
    .from('users')
    .upsert({
      id: profile.id,
      email: profile.email,
      full_name: profile.name,
      role: profile.role,
      // We store the flexible app data in a JSON column
      profile_data: {
        masteryScore: profile.masteryScore,
        domainPreference: profile.domainPreference,
        track: profile.track,
        verifiedSkills: profile.verifiedSkills,
        // FIX: Add the missing fields to the JSON payload
        industry: profile.industry,
        tools: profile.tools,
        goal: profile.goal,
        availability: profile.availability,

        // Persona bindings (v1)
        primaryPersona: profile.primaryPersona || 'UNKNOWN',
        secondaryPersona: profile.secondaryPersona || 'UNKNOWN',
        kpisOwned: profile.kpisOwned || [],
        decisionsMade: profile.decisionsMade || [],
        diagnosticScore: profile.diagnosticScore || 60,

        activeSkillTreeId: profile.activeSkillTreeId || null,
        activeProgramId: profile.activeProgramId || null,

        // PilotForge Journey Progress (v1)
        programProgress: (profile as any).programProgress || null
      }
    });

  if (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
};

// 2. LOAD: Fetches the profile when the app starts
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  // Transform DB data back into our App's UserProfile format
  return {
    id: data.id,
    email: data.email,
    name: data.full_name,
    role: data.role, 
    isAdmin: data.role === 'admin' || data.role === 'Internal Auditor (Admin)',
    
    // FIX: Extract new fields from JSON (or use defaults if missing)
    industry: data.profile_data?.industry || 'General',
    tools: data.profile_data?.tools || [],
    goal: data.profile_data?.goal || 'Upskilling',
    availability: data.profile_data?.availability || 5,

    // Learning Data
    masteryScore: data.profile_data?.masteryScore || 0,
    domainPreference: data.profile_data?.domainPreference || 'ops',
    track: data.profile_data?.track || LearningTrack.ANALYST,
    verifiedSkills: data.profile_data?.verifiedSkills || [],

    // Persona-aware bindings
    primaryPersona: data.profile_data?.primaryPersona || 'UNKNOWN',
    secondaryPersona: data.profile_data?.secondaryPersona || 'UNKNOWN',
    kpisOwned: data.profile_data?.kpisOwned || [],
    decisionsMade: data.profile_data?.decisionsMade || [],
    diagnosticScore: data.profile_data?.diagnosticScore || 60,

    activeSkillTreeId: data.profile_data?.activeSkillTreeId || undefined,
    activeProgramId: data.profile_data?.activeProgramId || undefined,

    // PilotForge Journey Progress (v1)
    ...(data.profile_data?.programProgress ? { programProgress: data.profile_data.programProgress as ProgramProgress } : {})
  };
};
