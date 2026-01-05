
export enum LearningTrack {
  MANAGER = 'MANAGER',
  ANALYST = 'ANALYST'
}

export enum SkillStatus {
  LOCKED = 'LOCKED',
  UNLOCKED = 'UNLOCKED',
  COMPLETED = 'COMPLETED',
  HIDDEN = 'HIDDEN' // For advanced branches or remediation
}

export interface SkillNode {
  id: string;
  label: string;
  description: string;
  status: SkillStatus;
  dependencies: string[];
  type: 'data' | 'model' | 'deployment' | 'optimization' | 'remediation';
  domain?: 'ops' | 'mkt' | 'shared';
  difficulty: 'basic' | 'intermediate' | 'advanced';
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
  cookbook: {
    steps: string[];
    resources: { label: string; url: string; type: 'excel' | 'notebook' | 'prompt' }[];
  };
}

export interface UserProfile {
  role: string;
  industry: string;
  tools: string[];
  goal: string;
  availability: number;
  track: LearningTrack;
  verifiedSkills: string[];
  domainPreference: 'ops' | 'mkt';
  masteryScore: number; // 0-100, affects adaptive paths
}

export interface Artifact {
  id: string;
  title: string;
  type: string;
  date: string;
  url: string;
  thumbnail: string;
}
