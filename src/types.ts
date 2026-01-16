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

  // -------------------------------------------------
  // PilotForge v1+: Persona-aware learning experience
  // -------------------------------------------------
  primaryPersona?:
    | 'DEMAND_PLANNING_MANAGER'
    | 'INVENTORY_SERVICE_LEVEL_OWNER'
    | 'UNKNOWN';
  secondaryPersona?:
    | 'DEMAND_PLANNING_MANAGER'
    | 'INVENTORY_SERVICE_LEVEL_OWNER'
    | 'UNKNOWN';

  // Intake signals used for persona inference (v1 rules-first)
  kpisOwned?: string[]; // e.g., ['forecast_accuracy','stockouts']
  decisionsMade?: string[]; // e.g., ['forecasting','safety_stock']
  diagnosticScore?: number; // 0..100

  // Active content bindings
  activeSkillTreeId?: string; // e.g., 'ops-demand-planning-v1'
  activeProgramId?: string; // e.g., 'ops-demand-9w-v1'

  // v1 Journey (optional for backward compatibility)
  programProgress?: ProgramProgress;
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

// ------------------------------
// PilotForge v1: 9-week Journey
// ------------------------------

export interface ProgramWeek {
  programId: string; // e.g., 'ops-9w-v1'
  weekNo: number; // 0..9
  title: string;
  outcome: string;
  deliverables: string[];
  rubric: {
    overallPassScore: number; // 0..100
    criteria: Array<{ key: string; label: string; max: number }>;
  };
}

export interface WeekSubmission {
  submittedAt: string; // ISO
  text: string;
  attachments: string[]; // urls (v1)
}

export interface WeekReview {
  score: number; // 0..100
  feedback: string;
  strengths: string[];
  improvements: string[];
  nextActions: string[];
}

export interface ProgramProgress {
  programId: string; // e.g., 'ops-9w-v1'
  currentWeek: number; // 0..9
  startedAt: string; // ISO
  updatedAt: string; // ISO
  weeks: Record<
    number,
    {
      status: 'locked' | 'unlocked' | 'submitted' | 'passed' | 'needs_work';
      submission?: WeekSubmission;
      review?: WeekReview;
    }
  >;
}
