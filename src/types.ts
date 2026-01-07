// Define the Learning Track Enum
export enum LearningTrack {
  ANALYST = 'Analyst',
  ENGINEER = 'Engineer',
  STRATEGIST = 'Strategist'
}

// Update UserProfile to include the missing fields (email, phone, etc.)
export interface UserProfile {
  id: string;
  email?: string;             // Fixed: Added Optional Email
  name?: string;              // Fixed: Added Optional Name
  phone?: string;             // Fixed: Added Optional Phone
  subscriptionActive?: boolean; // Fixed: Added Subscription Status
  
  role: string;
  industry: string;
  tools: string[];
  goal: string;
  availability: number;
  isAdmin?: boolean;
  
  // Learning State
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
  category: 'foundation' | 'tool' | 'business' | 'advanced';
  x: number; 
  y: number;
}

export interface UseCase {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  requiredSkills: string[]; 
  finishedOutputPreviewUrl?: string; 
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
