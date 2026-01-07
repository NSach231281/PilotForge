export enum LearningTrack {
  ANALYST = 'Analyst',
  ENGINEER = 'Engineer',
  STRATEGIST = 'Strategist'
}

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  phone?: string;
  subscriptionActive?: boolean;
  role: string;
  industry: string;
  tools: string[];
  goal: string;
  availability: number;
  isAdmin?: boolean;
  track: LearningTrack | string;
  domainPreference: 'ops' | 'marketing' | 'hr' | string;
  verifiedSkills: string[];
  masteryScore: number;
}

export enum SkillStatus {
  LOCKED = 'locked',
  UNLOCKED = 'unlocked',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  HIDDEN = 'hidden'
}

export interface SkillNode {
  id: string;
  label: string;
  description: string;
  status: SkillStatus;
  dependencies: string[];
  // Fix: We allow both 'category' (new) and 'type' (old) to prevent constant errors
  category?: 'foundation' | 'tool' | 'business' | 'advanced';
  type?: string; 
  x: number;
  y: number;
  // Fix: Added missing fields from matchingEngine
  domain?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface UseCase {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  requiredSkills: string[];
  finishedOutputPreviewUrl?: string;
  // Fix: Added missing fields
  domain?: string;
  cookbook?: string[]; 
}

export interface Course {
  id?: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: any;
  created_at?: string;
}

export interface Artifact {
  id: string;
  userId: string;
  useCaseId: string;
  title: string;
  type: 'Pilot Artifact' | 'Certificate' | 'Code Bundle';
  date: string;
  url: string;
  thumbnail?: string;
  status: 'verified' | 'pending';
}
