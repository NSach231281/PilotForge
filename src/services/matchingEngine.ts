
import { LearningTrack, UserProfile, SkillStatus, SkillNode } from '../types';

/**
 * Calculates the initial learning path based on user profile.
 * Fixes type inference for domainPreference to ensure it matches the 'ops' | 'mkt' union type.
 */
export const calculateLearningPath = (profile: UserProfile) => {
  const { tools, role } = profile;
  
  const hasCodingPotential = tools.includes('python') || tools.includes('sql');
  const track = hasCodingPotential ? LearningTrack.ANALYST : LearningTrack.MANAGER;

  const isOps = role.toLowerCase().includes('ops') || role.toLowerCase().includes('chain') || role.toLowerCase().includes('supply');
  // Use explicit typing to ensure domainPreference matches UserProfile['domainPreference']
  const domainPreference: 'ops' | 'mkt' = isOps ? 'ops' : 'mkt';

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
  domain: 'ops' | 'mkt'
): SkillNode[] => {
  return nodes.map(node => {
    // Hide nodes not in user's domain (except shared)
    if (node.domain !== 'shared' && node.domain !== domain) {
      return { ...node, status: SkillStatus.HIDDEN };
    }

    // Mastery Logic: Unlock advanced branches
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
