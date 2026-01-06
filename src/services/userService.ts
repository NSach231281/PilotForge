import { supabase } from './supabase';
import { UserProfile } from '../types';

// 1. SAVE: Updates the user's profile in the database
export const saveUserProfile = async (profile: UserProfile) => {
  const { error } = await supabase
    .from('users')
    .upsert({
      id: profile.id,
      email: profile.email,
      full_name: profile.name,
      role: profile.role,
      profile_data: {
        masteryScore: profile.masteryScore,
        domainPreference: profile.domainPreference,
        track: profile.track,
        verifiedSkills: profile.verifiedSkills
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
    role: data.role as 'admin' | 'manager' | 'pilot',
    isAdmin: data.role === 'admin',
    masteryScore: data.profile_data?.masteryScore || 0,
    domainPreference: data.profile_data?.domainPreference || 'supply_chain',
    track: data.profile_data?.track || [],
    verifiedSkills: data.profile_data?.verifiedSkills || []
  };
};
