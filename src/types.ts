
export enum LearningTrack {
  MANAGER = 'MANAGER',
  ANALYST = 'ANALYST'
}

export enum SkillStatus {
  LOCKED = 'LOCKED',
  UNLOCKED = 'UNLOCKED',
  COMPLETED = 'COMPLETED',
  HIDDEN = 'HIDDEN'
}

export type MaterialType = 'video' | 'text' | 'quiz' | 'dataset_fix' | 'file_upload';

export interface LearningMaterial {
  id: string;
  type: MaterialType;
  title: string;
  content: string; // URL, Markdown, or JSON
  durationMinutes: number;
  order: number;
}

export interface SkillNode {
  id: string;
  label: string;
  description: string;
  status: SkillStatus;
  dependencies: string[];
  type: 'data' | 'model' | 'deployment' | 'optimization' | 'remediation';
  domain: 'ops' | 'mkt' | 'shared';
  difficulty: 'basic' | 'intermediate' | 'advanced';
  materials: LearningMaterial[];
}

export interface VerificationCriteria {
  id: string;
  type: 'column_check' | 'value_check' | 'logic_check';
  target: string;
  expectedValue?: any;
}

export interface UseCase {
  id: string;
  title: string;
  domain: string;
  context: string;
  finishedOutputPreviewUrl: string;
  requiredSkills: string[];
  datasetDescription: string;
  dummyDataPreview: any[];
  verificationLogic: VerificationCriteria[];
  cookbook: {
    steps: string[];
    resources: { label: string; url: string; type: 'excel' | 'notebook' | 'prompt' | 'csv' }[];
  };
}

export interface UserProfile {
  id: string;
  phone: string; // India-first: Login via Phone/WhatsApp
  role: string;
  industry: string;
  tools: string[];
  goal: string;
  availability: number;
  track: LearningTrack;
  verifiedSkills: string[];
  domainPreference: 'ops' | 'mkt';
  masteryScore: number;
  isAdmin: boolean;
  subscriptionActive: boolean; // Monetization flag
}

export interface Artifact {
  id: string;
  userId: string;
  useCaseId: string;
  title: string;
  type: string;
  date: string;
  url: string;
  thumbnail: string;
  status: 'pending' | 'verified' | 'failed';
  feedback?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  // We use 'any' for content right now because it's a complex JSON object
  content: any; 
}
