import { LearningTrack, UserProfile, SkillStatus, SkillNode } from '../types';

/**
 * Calculates the initial learning path based on user profile.
 * Fixes: Uses 'STRATEGIST' instead of 'MANAGER' and 'marketing' instead of 'mkt'
 */
export const calculateLearningPath = (profile: UserProfile) => {
  const { tools, role } = profile;
  
  const hasCodingPotential = tools.includes('python') || tools.includes('sql');
  // FIX 1: Use STRATEGIST instead of MANAGER
  const track = hasCodingPotential ? LearningTrack.ANALYST : LearningTrack.STRATEGIST;

  const isOps = role.toLowerCase().includes('ops') || role.toLowerCase().includes('chain') || role.toLowerCase().includes('supply');
  
  // FIX 2: Use 'marketing' to match the data in constants.ts
  const domainPreference = isOps ? 'ops' : 'marketing';

  // FIX 3: Update IDs to match the actual IDs in constants.ts
  let startingUseCaseId = isOps ? 'uc-ops-1' : 'uc-mkt-1';

  return {
    track,
    domainPreference,
    startingUseCaseId
  };
};

/**
 * Adaptive adjustment logic based on performance
 */
export const adjustGraphForPerformance = (
  nodes: SkillNode[], 
  masteryScore: number, 
  domain: string // Relaxed type to allow string comparisons
): SkillNode[] => {
  return nodes.map(node => {
    // Hide nodes not in user's domain (except shared)
    // FIX 4: Ensure we check against the new 'domain' field on SkillNode
    if (node.domain && node.domain !== 'shared' && node.domain !== domain) {
      return { ...node, status: SkillStatus.HIDDEN };
    }

    // Mastery Logic: Unlock advanced branches
    // FIX 5: Ensure 'difficulty' exists before checking it
    if (masteryScore >= 85 && node.difficulty === 'advanced' && node.status === SkillStatus.HIDDEN) {
      return { ...node, status: SkillStatus.LOCKED };
    }

    // Struggle Logic: Unlock remediation if mastery drops
    if (masteryScore < 40 && node.id === 'remedial-excel-logic' && node.status === SkillStatus.HIDDEN) {
      return { ...node, status: SkillStatus.UNLOCKED };
    }

    return node;
  });
};
