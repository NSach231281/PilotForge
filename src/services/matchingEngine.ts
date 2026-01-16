import { LearningTrack, UserProfile, SkillStatus, SkillNode } from '../types';
import {
  OPS_DEMAND_9W_PROGRAM_ID,
  OPS_DEMAND_SKILL_TREE_ID,
  OPS_INVENTORY_9W_PROGRAM_ID,
  OPS_INVENTORY_SKILL_TREE_ID,
} from '../constants';

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
  
  // Domain preference for v1 (we are focusing ops/sc first)
  const domainPreference = isOps ? 'ops' : 'marketing';

  // Persona inference (rules-first for v1)
  // Priority order: decisions → KPIs → role keywords
  const decisions = (profile.decisionsMade || []).map((d) => d.toLowerCase());
  const kpis = (profile.kpisOwned || []).map((k) => k.toLowerCase());
  const roleL = role.toLowerCase();

  const scoreDemand =
    (decisions.some((d) => ['forecasting', 'demand_planning', 'snop', 's&op'].includes(d)) ? 45 : 0) +
    (kpis.some((k) => ['forecast_accuracy', 'mape', 'wape', 'fill_rate'].includes(k)) ? 30 : 0) +
    (roleL.includes('planning') || roleL.includes('demand') ? 15 : 0) +
    ((profile.diagnosticScore || 0) >= 60 ? 10 : 0);

  const scoreInventory =
    (decisions.some((d) => ['safety_stock', 'replenishment', 'service_level', 'meio'].includes(d)) ? 45 : 0) +
    (kpis.some((k) => ['stockouts', 'inventory_turns', 'service_level', 'fill_rate'].includes(k)) ? 30 : 0) +
    (roleL.includes('inventory') || roleL.includes('warehouse') ? 15 : 0) +
    ((profile.diagnosticScore || 0) >= 60 ? 10 : 0);

  const primaryPersona: UserProfile['primaryPersona'] =
    scoreDemand >= scoreInventory ? 'DEMAND_PLANNING_MANAGER' : 'INVENTORY_SERVICE_LEVEL_OWNER';
  const secondaryPersona: UserProfile['secondaryPersona'] =
    primaryPersona === 'DEMAND_PLANNING_MANAGER' ? 'INVENTORY_SERVICE_LEVEL_OWNER' : 'DEMAND_PLANNING_MANAGER';

  const activeSkillTreeId =
    primaryPersona === 'DEMAND_PLANNING_MANAGER' ? OPS_DEMAND_SKILL_TREE_ID : OPS_INVENTORY_SKILL_TREE_ID;
  const activeProgramId =
    primaryPersona === 'DEMAND_PLANNING_MANAGER' ? OPS_DEMAND_9W_PROGRAM_ID : OPS_INVENTORY_9W_PROGRAM_ID;

  // Starting use case is kept generic for now; tiles will be wired next
  const startingUseCaseId = isOps ? 'uc-ops-1' : 'uc-mkt-1';

  return {
    track,
    domainPreference,
    startingUseCaseId,
    primaryPersona,
    secondaryPersona,
    activeSkillTreeId,
    activeProgramId,
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
