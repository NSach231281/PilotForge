import { SkillNode, SkillStatus, UseCase, ProgramWeek } from './types';

export const SKILL_NODES: SkillNode[] = [
  {
    id: 'data-hygiene',
    label: 'Data Hygiene',
    description: 'Fixing messy spreadsheets & automated normalization.',
    status: SkillStatus.UNLOCKED,
    dependencies: [],
    category: 'foundation', // Renamed from 'type'
    domain: 'ops',          // specific domain
    difficulty: 'beginner',
    x: 100,                 // Added for Graph Layout
    y: 300
  },
  {
    id: 'ops-forecasting',
    label: 'Demand Forecasting',
    description: 'Time-series analysis for inventory planning.',
    status: SkillStatus.LOCKED,
    dependencies: ['data-hygiene'],
    category: 'business',   // Renamed from 'type'
    domain: 'ops',
    difficulty: 'intermediate',
    x: 300,
    y: 300
  },
  {
    id: 'ops-optimization',
    label: 'Safety Stock Opt.',
    description: 'Calculated buffers to minimize stockouts and holding costs.',
    status: SkillStatus.LOCKED,
    dependencies: ['ops-forecasting'],
    category: 'tool',
    domain: 'ops',
    difficulty: 'intermediate',
    x: 500,
    y: 300
  },
  {
    id: 'ops-advanced-sensing',
    label: 'Demand Sensing (AI)',
    description: 'Real-time adjustment of forecasts based on external signals.',
    status: SkillStatus.HIDDEN,
    dependencies: ['ops-optimization'],
    category: 'advanced',
    domain: 'ops',
    difficulty: 'advanced',
    x: 700,
    y: 300
  },
  {
    id: 'mkt-classification',
    label: 'Lead Prioritization',
    description: 'Predicting lead conversion probability.',
    status: SkillStatus.LOCKED,
    dependencies: ['data-hygiene'],
    category: 'business',
    domain: 'marketing',
    difficulty: 'intermediate',
    x: 300,
    y: 500
  },
  {
    id: 'mkt-segmentation',
    label: 'Behavioral Clustering',
    description: 'Grouping customers by churn risk and LTV.',
    status: SkillStatus.LOCKED,
    dependencies: ['mkt-classification'],
    category: 'tool',
    domain: 'marketing',
    difficulty: 'intermediate',
    x: 500,
    y: 500
  },
  {
    id: 'mkt-advanced-personalization',
    label: 'Hyper-Personalization',
    description: 'Generative AI workflows for localized ad copy.',
    status: SkillStatus.HIDDEN,
    dependencies: ['mkt-segmentation'],
    category: 'advanced',
    domain: 'marketing',
    difficulty: 'advanced',
    x: 700,
    y: 500
  },
  {
    id: 'deployment-final',
    label: 'Pilot Deployment',
    description: 'Automating your model output to a live business workflow.',
    status: SkillStatus.LOCKED,
    dependencies: ['ops-optimization', 'mkt-segmentation'],
    category: 'advanced',
    domain: 'shared',
    difficulty: 'advanced',
    x: 900,
    y: 400
  },
  {
    id: 'remedial-excel-logic',
    label: 'Logic Foundations',
    description: 'Deep dive into IF/THEN and boolean logic for datasets.',
    status: SkillStatus.HIDDEN,
    dependencies: [],
    category: 'foundation',
    domain: 'shared',
    difficulty: 'beginner',
    x: 100,
    y: 100
  }
];

// -------------------------------------------------
// PilotForge v1+: Ops/SC persona-specific Skill Trees
// Focus: Statistical Modeling → ML → OR/Optimization
// -------------------------------------------------

export const OPS_DEMAND_SKILL_TREE_ID = 'ops-demand-planning-v1';
export const OPS_INVENTORY_SKILL_TREE_ID = 'ops-inventory-service-v1';

// Shared nodes across Ops personas
const OPS_SHARED_NODES: SkillNode[] = [
  {
    id: 'data-hygiene',
    label: 'Data Hygiene',
    description: 'Fixing messy spreadsheets & automated normalization.',
    status: SkillStatus.UNLOCKED,
    dependencies: [],
    category: 'foundation',
    domain: 'ops',
    difficulty: 'beginner',
    x: 120,
    y: 260,
  },
  {
    id: 'kpi-error-diagnostics',
    label: 'KPI & Error Diagnostics',
    description: 'MAPE/WAPE/MASE, bias checks, and decision-ready evaluation.',
    status: SkillStatus.LOCKED,
    dependencies: ['data-hygiene'],
    category: 'foundation',
    domain: 'ops',
    difficulty: 'beginner',
    x: 420,
    y: 260,
  },
  {
    id: 'sku-segmentation-abcxyz',
    label: 'SKU Segmentation (ABC-XYZ)',
    description: 'Segment SKUs by value and variability to pick the right model/policy.',
    status: SkillStatus.LOCKED,
    dependencies: ['kpi-error-diagnostics'],
    category: 'business',
    domain: 'ops',
    difficulty: 'intermediate',
    x: 720,
    y: 260,
  },
];

// Persona A: Demand & Planning Manager
export const OPS_DEMAND_NODES: SkillNode[] = [
  ...OPS_SHARED_NODES,
  {
    id: 'stat-forecast-baselines',
    label: 'Stat Forecast Baselines',
    description: 'ETS/ARIMA-style baselines + backtesting you can explain to leadership.',
    status: SkillStatus.LOCKED,
    dependencies: ['sku-segmentation-abcxyz'],
    category: 'business',
    domain: 'ops',
    difficulty: 'intermediate',
    x: 260,
    y: 420,
  },
  {
    id: 'india-seasonality-festivals',
    label: 'India Seasonality & Festivals',
    description: 'Festival/monsoon regressors and uplift logic for Indian demand patterns.',
    status: SkillStatus.LOCKED,
    dependencies: ['stat-forecast-baselines'],
    category: 'business',
    domain: 'ops',
    difficulty: 'intermediate',
    x: 560,
    y: 420,
  },
  {
    id: 'ml-forecasting-features',
    label: 'ML Forecasting (Features)',
    description: 'Lag features, tree models, and guardrails for stable ML forecasts.',
    status: SkillStatus.LOCKED,
    dependencies: ['india-seasonality-festivals'],
    category: 'tool',
    domain: 'ops',
    difficulty: 'intermediate',
    x: 860,
    y: 420,
  },
  {
    id: 'hierarchical-reconciliation',
    label: 'Hierarchy Reconciliation',
    description: 'SKU→Category→Region consistency (top-down/bottom-up thinking).',
    status: SkillStatus.LOCKED,
    dependencies: ['ml-forecasting-features'],
    category: 'tool',
    domain: 'ops',
    difficulty: 'advanced',
    x: 260,
    y: 580,
  },
  {
    id: 'demand-sensing-signals',
    label: 'Demand Sensing',
    description: 'Weekly nowcasting using signals + blending with the base forecast.',
    status: SkillStatus.LOCKED,
    dependencies: ['hierarchical-reconciliation'],
    category: 'advanced',
    domain: 'ops',
    difficulty: 'advanced',
    x: 560,
    y: 580,
  },
  {
    id: 'scenario-planning',
    label: 'Scenario Planning',
    description: 'Base/upside/downside scenarios with decision triggers.',
    status: SkillStatus.LOCKED,
    dependencies: ['demand-sensing-signals'],
    category: 'advanced',
    domain: 'ops',
    difficulty: 'advanced',
    x: 860,
    y: 580,
  },
  {
    id: 'snop-optimization-lite',
    label: 'S&OP Optimization (OR)',
    description: 'Constraint-based planning (LP-lite) for capacity, MOQ, and service.',
    status: SkillStatus.LOCKED,
    dependencies: ['scenario-planning'],
    category: 'advanced',
    domain: 'ops',
    difficulty: 'advanced',
    x: 560,
    y: 740,
  },
  {
    id: 'deployment-final',
    label: 'Pilot Deployment',
    description: 'Automate outputs into a repeatable business workflow.',
    status: SkillStatus.LOCKED,
    dependencies: ['snop-optimization-lite'],
    category: 'advanced',
    domain: 'shared',
    difficulty: 'advanced',
    x: 860,
    y: 740,
  },
];

// Persona B: Inventory / Service-Level Owner
export const OPS_INVENTORY_NODES: SkillNode[] = [
  ...OPS_SHARED_NODES,
  {
    id: 'variability-leadtime-modeling',
    label: 'Variability & Lead Time',
    description: 'Model demand/lead-time variability and service level definitions.',
    status: SkillStatus.LOCKED,
    dependencies: ['sku-segmentation-abcxyz'],
    category: 'business',
    domain: 'ops',
    difficulty: 'intermediate',
    x: 260,
    y: 420,
  },
  {
    id: 'safety-stock-statistical',
    label: 'Safety Stock (Stat)',
    description: 'z-factor, CSL vs fill-rate, and practical buffer setting.',
    status: SkillStatus.LOCKED,
    dependencies: ['variability-leadtime-modeling'],
    category: 'tool',
    domain: 'ops',
    difficulty: 'intermediate',
    x: 560,
    y: 420,
  },
  {
    id: 'replenishment-policy-rop',
    label: 'Replenishment Policy',
    description: 'ROP/Min-Max policies with review cycles and exceptions.',
    status: SkillStatus.LOCKED,
    dependencies: ['safety-stock-statistical'],
    category: 'tool',
    domain: 'ops',
    difficulty: 'intermediate',
    x: 860,
    y: 420,
  },
  {
    id: 'intermittent-demand-overrides',
    label: 'Intermittent Demand',
    description: 'Spare-parts style demand with policy overrides and segmentation.',
    status: SkillStatus.LOCKED,
    dependencies: ['replenishment-policy-rop'],
    category: 'tool',
    domain: 'ops',
    difficulty: 'advanced',
    x: 260,
    y: 580,
  },
  {
    id: 'cost-service-tradeoff',
    label: 'Cost–Service Trade-off',
    description: 'Holding vs stockout vs expedite risk trade-offs with clear curves.',
    status: SkillStatus.LOCKED,
    dependencies: ['intermittent-demand-overrides'],
    category: 'business',
    domain: 'ops',
    difficulty: 'advanced',
    x: 560,
    y: 580,
  },
  {
    id: 'inventory-optimization-or',
    label: 'Inventory Optimization (OR)',
    description: 'LP/MILP formulation to minimize cost while meeting service + risk constraints.',
    status: SkillStatus.LOCKED,
    dependencies: ['cost-service-tradeoff'],
    category: 'advanced',
    domain: 'ops',
    difficulty: 'advanced',
    x: 860,
    y: 580,
  },
  {
    id: 'meio-lite',
    label: 'MEIO-lite (Multi-node)',
    description: 'Allocate buffers across nodes with network constraints and pooling logic.',
    status: SkillStatus.LOCKED,
    dependencies: ['inventory-optimization-or'],
    category: 'advanced',
    domain: 'ops',
    difficulty: 'advanced',
    x: 560,
    y: 740,
  },
  {
    id: 'deployment-final',
    label: 'Pilot Deployment',
    description: 'Automate outputs into a repeatable business workflow.',
    status: SkillStatus.LOCKED,
    dependencies: ['meio-lite'],
    category: 'advanced',
    domain: 'shared',
    difficulty: 'advanced',
    x: 860,
    y: 740,
  },
];

export const SKILL_TREES: Record<string, SkillNode[]> = {
  // legacy
  legacy: SKILL_NODES,
  [OPS_DEMAND_SKILL_TREE_ID]: OPS_DEMAND_NODES,
  [OPS_INVENTORY_SKILL_TREE_ID]: OPS_INVENTORY_NODES,
};

export const getSkillTreeNodes = (skillTreeId?: string): SkillNode[] => {
  if (skillTreeId && SKILL_TREES[skillTreeId]) return SKILL_TREES[skillTreeId];
  return SKILL_NODES;
};

export const MOCK_USE_CASES: UseCase[] = [
  {
    id: 'uc-ops-1',
    title: 'Regional Warehouse Rebalancing',
    domain: 'ops',
    description: 'Reallocate stock between Bangalore and Mumbai hubs to meet spike demand.',
    difficulty: 'intermediate',
    estimatedHours: 4,
    requiredSkills: ['data-hygiene', 'ops-forecasting'],
    finishedOutputPreviewUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    // Simplified to match Type Definition
    cookbook: [
      'Step 1: Normalize date formats in the ledger.',
      'Step 2: Calculate stock-out probability using 30-day rolling variance.',
      'Step 3: Run the rebalancing script to suggest inter-city transfers.',
      'Step 4: Export as a Transport Manifest CSV.'
    ]
  },
  {
    id: 'uc-mkt-1',
    title: 'Tier-2 City Lead Scoring',
    domain: 'marketing',
    description: 'Identify high-intent leads in non-metro regions to optimize tele-sales time.',
    difficulty: 'intermediate',
    estimatedHours: 3,
    requiredSkills: ['data-hygiene', 'mkt-classification'],
    finishedOutputPreviewUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    // Simplified to match Type Definition
    cookbook: [
      'Step 1: Cleanse leads with invalid phone formats.',
      'Step 2: Apply weighting to "web_visits" vs "downloads".',
      'Step 3: Assign Probability Scores (0.0 - 1.0).',
      'Step 4: Push Top 10% to "Hot List" in Google Sheets.'
    ]
  }
];

// ------------------------------
// PilotForge v1: Ops 9-Week Journey (Week 0–9)
// ------------------------------
// NOTE: We keep this in code for v1 speed. Later, move to Supabase tables.
export const OPS_9W_PROGRAM_ID = 'ops-9w-v1';

export const OPS_9W_WEEKS: ProgramWeek[] = [
  {
    programId: OPS_9W_PROGRAM_ID,
    weekNo: 0,
    title: 'Onboarding + Diagnostic (2–3 days)',
    outcome: 'Pick a pilot, define success, and lock a realistic plan.',
    deliverables: [
      'Pilot choice (1 of: Forecasting / Inventory / Supplier Risk / Service Ops)',
      'Success metric + target (e.g., reduce stockouts by X%, improve MAPE by Y)',
      'Data readiness (A/B/C) + what you have vs what you need',
      '60–90 day commitment (hours/week) and starting week recommendation'
    ],
    rubric: {
      overallPassScore: 70,
      criteria: [
        { key: 'clarity', label: 'Clarity', max: 5 },
        { key: 'measurability', label: 'Measurability', max: 5 },
        { key: 'feasibility', label: 'Feasibility', max: 5 }
      ]
    }
  },
  {
    programId: OPS_9W_PROGRAM_ID,
    weekNo: 1,
    title: 'Problem Framing like a Consultant',
    outcome: 'A one-page charter that a manager would sign off.',
    deliverables: [
      '1-page Problem Charter: background, KPI, constraints, definition of done',
      'Stakeholder map: sponsor, users, data owners, approvers',
      'Assumptions + risks (what could break this pilot?)'
    ],
    rubric: {
      overallPassScore: 75,
      criteria: [
        { key: 'scope', label: 'Scope realism', max: 5 },
        { key: 'kpi', label: 'KPI definition', max: 5 },
        { key: 'stakeholders', label: 'Stakeholder clarity', max: 5 }
      ]
    }
  },
  {
    programId: OPS_9W_PROGRAM_ID,
    weekNo: 2,
    title: 'Data Discovery + Feasibility',
    outcome: 'A clear view of what data exists, its quality, and feasibility.',
    deliverables: [
      'Data inventory table: source, grain, frequency, owner, access',
      'EDA snapshot: missingness, outliers, seasonality/trend, leakage risks',
      'Top 10 candidate predictors + why they matter'
    ],
    rubric: {
      overallPassScore: 70,
      criteria: [
        { key: 'coverage', label: 'Coverage & completeness', max: 5 },
        { key: 'quality', label: 'Data quality awareness', max: 5 },
        { key: 'leakage', label: 'Leakage/validity checks', max: 5 }
      ]
    }
  },
  {
    programId: OPS_9W_PROGRAM_ID,
    weekNo: 3,
    title: 'Baseline First (Non‑negotiable)',
    outcome: 'A simple baseline + metrics you can beat.',
    deliverables: [
      'Baseline approach (simple + explainable)',
      'Baseline metric table + interpretation (why it performs like this)',
      'Business impact estimate (rough, with assumptions)'
    ],
    rubric: {
      overallPassScore: 75,
      criteria: [
        { key: 'baseline', label: 'Baseline soundness', max: 5 },
        { key: 'metrics', label: 'Metric rigor', max: 5 },
        { key: 'insight', label: 'Insightfulness', max: 5 }
      ]
    }
  },
  {
    programId: OPS_9W_PROGRAM_ID,
    weekNo: 4,
    title: 'Model / Logic Build v1 (MVP Intelligence)',
    outcome: 'An end‑to‑end v1 that beats baseline (even modestly).',
    deliverables: [
      'v1 model/logic (one notch above baseline)',
      'Train/validation strategy explained',
      'Error analysis: where it wins/loses + why'
    ],
    rubric: {
      overallPassScore: 75,
      criteria: [
        { key: 'lift', label: 'Improvement over baseline', max: 5 },
        { key: 'validation', label: 'Validation strategy', max: 5 },
        { key: 'analysis', label: 'Error analysis quality', max: 5 }
      ]
    }
  },
  {
    programId: OPS_9W_PROGRAM_ID,
    weekNo: 5,
    title: 'Operational Constraints + Decision Policy',
    outcome: 'Make the pilot compatible with real operations.',
    deliverables: [
      'List key constraints (lead time, MOQ, capacity, service levels, etc.)',
      'Decision policy: what action does output trigger?',
      'Risk log: adoption + governance + edge cases'
    ],
    rubric: {
      overallPassScore: 70,
      criteria: [
        { key: 'constraints', label: 'Constraint realism', max: 5 },
        { key: 'policy', label: 'Decision policy clarity', max: 5 },
        { key: 'risks', label: 'Risk awareness', max: 5 }
      ]
    }
  },
  {
    programId: OPS_9W_PROGRAM_ID,
    weekNo: 6,
    title: 'Pilot Packaging (Make it usable)',
    outcome: 'Someone else can run and interpret your pilot.',
    deliverables: [
      'Pilot runbook: inputs, how to run, how to interpret outputs',
      'Simple dashboard/summary (even static) + key views',
      'Cost/benefit worksheet (inputs + assumptions)'
    ],
    rubric: {
      overallPassScore: 70,
      criteria: [
        { key: 'usability', label: 'Usability & clarity', max: 5 },
        { key: 'comms', label: 'Communication quality', max: 5 },
        { key: 'economics', label: 'Cost/benefit logic', max: 5 }
      ]
    }
  },
  {
    programId: OPS_9W_PROGRAM_ID,
    weekNo: 7,
    title: 'Scenario Testing + Sensitivity',
    outcome: 'You know when your pilot breaks—and what to do then.',
    deliverables: [
      '3 stress tests (demand shock, supplier delay, missing data, etc.)',
      'Sensitivity analysis on 2–3 key drivers',
      'Confidence narrative: reliable zones vs risky zones'
    ],
    rubric: {
      overallPassScore: 70,
      criteria: [
        { key: 'stress', label: 'Stress testing quality', max: 5 },
        { key: 'sensitivity', label: 'Sensitivity clarity', max: 5 },
        { key: 'interpretation', label: 'Interpretation & actions', max: 5 }
      ]
    }
  },
  {
    programId: OPS_9W_PROGRAM_ID,
    weekNo: 8,
    title: 'ROI + Exec Story',
    outcome: 'A credible business case in a 6-slide story.',
    deliverables: [
      'ROI model (conservative vs optimistic + assumptions)',
      '6-slide exec story: Problem, Why now, Approach, Results, ROI, Next steps'
    ],
    rubric: {
      overallPassScore: 75,
      criteria: [
        { key: 'credibility', label: 'Credibility', max: 5 },
        { key: 'story', label: 'Story clarity', max: 5 },
        { key: 'roi', label: 'ROI rigor', max: 5 }
      ]
    }
  },
  {
    programId: OPS_9W_PROGRAM_ID,
    weekNo: 9,
    title: 'Portfolio Final + Interview Narrative',
    outcome: 'Publish a portfolio-ready case and a next-steps roadmap.',
    deliverables: [
      'Portfolio pack (Problem → Method → Results → ROI → Learnings)',
      'LinkedIn-ready summary (300–500 words)',
      'Next 30-day production roadmap (data, MLOps, governance)'
    ],
    rubric: {
      overallPassScore: 80,
      criteria: [
        { key: 'portfolio', label: 'Portfolio quality', max: 5 },
        { key: 'impact', label: 'Impact articulation', max: 5 },
        { key: 'next', label: 'Next steps clarity', max: 5 }
      ]
    }
  }
];

// -------------------------------------------------
// Persona-specific 9-week journeys (v1)
// -------------------------------------------------

export const OPS_DEMAND_9W_PROGRAM_ID = 'ops-demand-9w-v1';
export const OPS_INVENTORY_9W_PROGRAM_ID = 'ops-inventory-9w-v1';

export const OPS_DEMAND_9W_WEEKS: ProgramWeek[] = [
  {
    programId: OPS_DEMAND_9W_PROGRAM_ID,
    weekNo: 0,
    title: 'Onboarding + Diagnostic (2–3 days)',
    outcome: 'Lock your forecasting pilot, success metric, and data readiness.',
    deliverables: [
      'Pilot choice: Forecasting (SKU/Region)',
      'Success metric + target (e.g., improve WAPE by X)',
      'Data readiness (A/B/C) + missing fields list',
      'Commitment: hours/week + sprint calendar'
    ],
    rubric: {
      overallPassScore: 70,
      criteria: [
        { key: 'clarity', label: 'Clarity', max: 5 },
        { key: 'measurability', label: 'Measurability', max: 5 },
        { key: 'feasibility', label: 'Feasibility', max: 5 },
      ],
    },
  },
  {
    programId: OPS_DEMAND_9W_PROGRAM_ID,
    weekNo: 1,
    title: 'Data Hygiene + KPI Definitions',
    outcome: 'A clean demand table + decision-grade forecast KPIs.',
    deliverables: [
      'Cleaned demand dataset (grain locked: SKU×Region×Week/Month)',
      'Data quality report (missingness/outliers/duplicates)',
      'Forecast KPI dashboard (WAPE, bias, service impact narrative)'
    ],
    rubric: {
      overallPassScore: 75,
      criteria: [
        { key: 'quality', label: 'Data quality handling', max: 5 },
        { key: 'grain', label: 'Correct data grain', max: 5 },
        { key: 'kpi', label: 'KPI correctness', max: 5 },
      ],
    },
  },
  {
    programId: OPS_DEMAND_9W_PROGRAM_ID,
    weekNo: 2,
    title: 'Stat Baselines + Backtesting',
    outcome: 'A baseline forecast that is explainable and measurable.',
    deliverables: [
      'Baseline models (at least 2) + backtest comparison',
      'Error analysis by SKU segment (ABC-XYZ)',
      'Business interpretation: why baseline wins/loses'
    ],
    rubric: {
      overallPassScore: 75,
      criteria: [
        { key: 'baseline', label: 'Baseline soundness', max: 5 },
        { key: 'backtest', label: 'Backtesting rigor', max: 5 },
        { key: 'insight', label: 'Insights & actions', max: 5 },
      ],
    },
  },
  {
    programId: OPS_DEMAND_9W_PROGRAM_ID,
    weekNo: 3,
    title: 'India Seasonality (Festival/Monsoon)',
    outcome: 'A seasonality-aware forecast with a clear story.',
    deliverables: [
      'Festival/monsoon features added (calendar regressors)',
      'Uplift logic: how much does the festival explain?',
      'Explainable narrative: assumptions + limitations'
    ],
    rubric: {
      overallPassScore: 70,
      criteria: [
        { key: 'features', label: 'Feature logic', max: 5 },
        { key: 'evidence', label: 'Evidence of uplift', max: 5 },
        { key: 'story', label: 'Story clarity', max: 5 },
      ],
    },
  },
  {
    programId: OPS_DEMAND_9W_PROGRAM_ID,
    weekNo: 4,
    title: 'ML Forecasting (Lag Features)',
    outcome: 'A stable ML model that beats baseline responsibly.',
    deliverables: [
      'Feature set (lags/rolling stats/promotions optional)',
      'Model (tree-based) + validation strategy',
      'Feature importance + guardrails (no crazy spikes)'
    ],
    rubric: {
      overallPassScore: 75,
      criteria: [
        { key: 'lift', label: 'Lift over baseline', max: 5 },
        { key: 'validation', label: 'Validation rigor', max: 5 },
        { key: 'stability', label: 'Stability/guardrails', max: 5 },
      ],
    },
  },
  {
    programId: OPS_DEMAND_9W_PROGRAM_ID,
    weekNo: 5,
    title: 'Hierarchy Reconciliation',
    outcome: 'SKU/Region forecasts reconcile to category/total plans.',
    deliverables: [
      'Reconciliation approach + comparison table',
      'Where reconciliation helps/hurts + why',
      'Decision policy: what business uses which level'
    ],
    rubric: {
      overallPassScore: 70,
      criteria: [
        { key: 'consistency', label: 'Consistency achieved', max: 5 },
        { key: 'analysis', label: 'Analysis quality', max: 5 },
        { key: 'policy', label: 'Decision policy', max: 5 },
      ],
    },
  },
  {
    programId: OPS_DEMAND_9W_PROGRAM_ID,
    weekNo: 6,
    title: 'Demand Sensing (Weekly Updates)',
    outcome: 'A sensing layer that updates forecasts using signals.',
    deliverables: [
      'Sensing formula/blend logic (signals + base forecast)',
      'Simulation on last N weeks: does it reduce error?',
      'Operational plan: how often and who triggers updates'
    ],
    rubric: {
      overallPassScore: 70,
      criteria: [
        { key: 'logic', label: 'Logic soundness', max: 5 },
        { key: 'value', label: 'Value evidence', max: 5 },
        { key: 'ops', label: 'Operational feasibility', max: 5 },
      ],
    },
  },
  {
    programId: OPS_DEMAND_9W_PROGRAM_ID,
    weekNo: 7,
    title: 'Scenario Planning + Sensitivity',
    outcome: 'You know when your forecast can be trusted and what-if actions.',
    deliverables: [
      '3 scenarios (base/upside/downside) + trigger thresholds',
      'Sensitivity on 2–3 key features',
      'Exec-ready scenario playbook (1–2 pages)'
    ],
    rubric: {
      overallPassScore: 70,
      criteria: [
        { key: 'scenarios', label: 'Scenario quality', max: 5 },
        { key: 'sensitivity', label: 'Sensitivity clarity', max: 5 },
        { key: 'comms', label: 'Communication', max: 5 },
      ],
    },
  },
  {
    programId: OPS_DEMAND_9W_PROGRAM_ID,
    weekNo: 8,
    title: 'S&OP Optimization (LP-lite)',
    outcome: 'A constraint-based plan recommendation (capacity/MOQ/service).',
    deliverables: [
      'Optimization formulation (variables/objective/constraints)',
      'Solution output + interpretation',
      'Risk/service narrative: why this is implementable'
    ],
    rubric: {
      overallPassScore: 75,
      criteria: [
        { key: 'formulation', label: 'Formulation clarity', max: 5 },
        { key: 'interpret', label: 'Interpretation', max: 5 },
        { key: 'feasible', label: 'Feasibility', max: 5 },
      ],
    },
  },
  {
    programId: OPS_DEMAND_9W_PROGRAM_ID,
    weekNo: 9,
    title: 'Portfolio Final + Deployment Checklist',
    outcome: 'Publish a portfolio-ready case and next-30-day roadmap.',
    deliverables: [
      'Portfolio pack (Problem → Method → Results → ROI → Learnings)',
      'LinkedIn-ready summary (300–500 words)',
      'Deployment/runbook checklist (data refresh, monitoring, governance)'
    ],
    rubric: {
      overallPassScore: 80,
      criteria: [
        { key: 'portfolio', label: 'Portfolio quality', max: 5 },
        { key: 'impact', label: 'Impact articulation', max: 5 },
        { key: 'next', label: 'Next steps clarity', max: 5 },
      ],
    },
  },
];

export const OPS_INVENTORY_9W_WEEKS: ProgramWeek[] = [
  {
    programId: OPS_INVENTORY_9W_PROGRAM_ID,
    weekNo: 0,
    title: 'Onboarding + Diagnostic (2–3 days)',
    outcome: 'Lock your inventory pilot, service targets, and data readiness.',
    deliverables: [
      'Pilot choice: Inventory buffers & replenishment',
      'Success metric + target (stockouts ↓, fill-rate ↑, inventory turns ↑)',
      'Data readiness (A/B/C) + missing fields list',
      'Commitment: hours/week + sprint calendar'
    ],
    rubric: {
      overallPassScore: 70,
      criteria: [
        { key: 'clarity', label: 'Clarity', max: 5 },
        { key: 'measurability', label: 'Measurability', max: 5 },
        { key: 'feasibility', label: 'Feasibility', max: 5 },
      ],
    },
  },
  {
    programId: OPS_INVENTORY_9W_PROGRAM_ID,
    weekNo: 1,
    title: 'Data Hygiene + Service KPIs',
    outcome: 'A clean inventory dataset + service KPI definitions.',
    deliverables: [
      'Cleaned inventory dataset (SKU×Node×Day/Week)',
      'DQ report (missingness/outliers/lead-time anomalies)',
      'Service KPI dashboard (CSL/fill-rate/backorders)'
    ],
    rubric: {
      overallPassScore: 75,
      criteria: [
        { key: 'quality', label: 'Data quality handling', max: 5 },
        { key: 'kpi', label: 'KPI correctness', max: 5 },
        { key: 'grain', label: 'Correct grain', max: 5 },
      ],
    },
  },
  {
    programId: OPS_INVENTORY_9W_PROGRAM_ID,
    weekNo: 2,
    title: 'Variability + Lead Time Modeling',
    outcome: 'A variability profile that drives buffer decisions.',
    deliverables: [
      'Demand variability per SKU segment (ABC-XYZ)',
      'Lead time distribution assumptions + checks',
      'Where variability comes from + what to do'
    ],
    rubric: {
      overallPassScore: 70,
      criteria: [
        { key: 'variability', label: 'Variability modeling', max: 5 },
        { key: 'leadtime', label: 'Lead time rigor', max: 5 },
        { key: 'insight', label: 'Insights & actions', max: 5 },
      ],
    },
  },
  {
    programId: OPS_INVENTORY_9W_PROGRAM_ID,
    weekNo: 3,
    title: 'Safety Stock Engine (Statistical)',
    outcome: 'A defensible safety stock recommendation per SKU/node.',
    deliverables: [
      'Safety stock calculator (CSL or fill-rate based)',
      'Policy table: target service by segment',
      'Assumptions + exceptions list'
    ],
    rubric: {
      overallPassScore: 75,
      criteria: [
        { key: 'logic', label: 'Logic correctness', max: 5 },
        { key: 'segmentation', label: 'Segmentation use', max: 5 },
        { key: 'assumptions', label: 'Assumption clarity', max: 5 },
      ],
    },
  },
  {
    programId: OPS_INVENTORY_9W_PROGRAM_ID,
    weekNo: 4,
    title: 'Replenishment Policy (ROP / Min-Max)',
    outcome: 'A workable ordering policy with review cycles.',
    deliverables: [
      'ROP/Min-Max policy per segment',
      'Simulation for last N periods: stockouts vs holding',
      'Operational SOP: who runs it, when, and how'
    ],
    rubric: {
      overallPassScore: 70,
      criteria: [
        { key: 'policy', label: 'Policy soundness', max: 5 },
        { key: 'simulation', label: 'Simulation evidence', max: 5 },
        { key: 'ops', label: 'Operational feasibility', max: 5 },
      ],
    },
  },
  {
    programId: OPS_INVENTORY_9W_PROGRAM_ID,
    weekNo: 5,
    title: 'Cost–Service–Risk Trade-offs',
    outcome: 'Explicit trade-off curves that align finance and operations.',
    deliverables: [
      'Holding vs stockout vs expedite penalties defined',
      'Trade-off curve (service vs cost) by segment',
      'Decision rule: what service level is worth it?'
    ],
    rubric: {
      overallPassScore: 70,
      criteria: [
        { key: 'costs', label: 'Cost modeling', max: 5 },
        { key: 'tradeoff', label: 'Trade-off clarity', max: 5 },
        { key: 'decision', label: 'Decision rule', max: 5 },
      ],
    },
  },
  {
    programId: OPS_INVENTORY_9W_PROGRAM_ID,
    weekNo: 6,
    title: 'Intermittent Demand Overrides',
    outcome: 'Policies for spare parts / lumpy demand that don’t break.',
    deliverables: [
      'Intermittent SKU identification rules',
      'Override policies + exception handling',
      'Impact analysis: what changes vs normal policy'
    ],
    rubric: {
      overallPassScore: 70,
      criteria: [
        { key: 'identification', label: 'Identification logic', max: 5 },
        { key: 'policy', label: 'Policy quality', max: 5 },
        { key: 'impact', label: 'Impact analysis', max: 5 },
      ],
    },
  },
  {
    programId: OPS_INVENTORY_9W_PROGRAM_ID,
    weekNo: 7,
    title: 'Optimization Formulation (LP/MILP)',
    outcome: 'A full OR formulation balancing cost + service + risk.',
    deliverables: [
      'Variables/objective/constraints clearly written',
      'Solved output + interpretation',
      'Sensitivity: which constraint is binding and why'
    ],
    rubric: {
      overallPassScore: 75,
      criteria: [
        { key: 'formulation', label: 'Formulation clarity', max: 5 },
        { key: 'interpret', label: 'Interpretation', max: 5 },
        { key: 'sensitivity', label: 'Sensitivity', max: 5 },
      ],
    },
  },
  {
    programId: OPS_INVENTORY_9W_PROGRAM_ID,
    weekNo: 8,
    title: 'MEIO-lite (Multi-node Allocation)',
    outcome: 'Allocate buffers across nodes with pooling logic.',
    deliverables: [
      'Multi-node model assumptions + constraints',
      'Allocation output + service impact',
      'Implementation SOP: how to roll out node-by-node'
    ],
    rubric: {
      overallPassScore: 75,
      criteria: [
        { key: 'model', label: 'Model soundness', max: 5 },
        { key: 'impact', label: 'Impact articulation', max: 5 },
        { key: 'ops', label: 'Operational feasibility', max: 5 },
      ],
    },
  },
  {
    programId: OPS_INVENTORY_9W_PROGRAM_ID,
    weekNo: 9,
    title: 'Portfolio Final + Deployment Checklist',
    outcome: 'Publish a portfolio-ready inventory case and roadmap.',
    deliverables: [
      'Portfolio pack (Problem → Policy → OR → Results → ROI)',
      'LinkedIn-ready summary (300–500 words)',
      'Next 30-day rollout plan (data refresh, governance, adoption)'
    ],
    rubric: {
      overallPassScore: 80,
      criteria: [
        { key: 'portfolio', label: 'Portfolio quality', max: 5 },
        { key: 'impact', label: 'Impact articulation', max: 5 },
        { key: 'next', label: 'Next steps clarity', max: 5 },
      ],
    },
  },
];

export const PROGRAM_WEEKS: Record<string, ProgramWeek[]> = {
  [OPS_9W_PROGRAM_ID]: OPS_9W_WEEKS, // legacy
  [OPS_DEMAND_9W_PROGRAM_ID]: OPS_DEMAND_9W_WEEKS,
  [OPS_INVENTORY_9W_PROGRAM_ID]: OPS_INVENTORY_9W_WEEKS,
};

export const getProgramWeeks = (programId?: string): ProgramWeek[] => {
  if (programId && PROGRAM_WEEKS[programId]) return PROGRAM_WEEKS[programId];
  return OPS_9W_WEEKS;
};
// -------------------------------------------------
// Admin Path Library (v1)
// Admin can preview any persona skill tree + 9-week journey
// without going through onboarding.
// -------------------------------------------------

export type AdminPathLibraryItem = {
  id: string;
  title: string;
  description: string;
  domainPreference: 'ops' | 'marketing';
  primaryPersona: 'DEMAND_PLANNING_MANAGER' | 'INVENTORY_SERVICE_LEVEL_OWNER';
  skillTreeId: string;
  programId: string;
};

export const ADMIN_PATH_LIBRARY: AdminPathLibraryItem[] = [
  {
    id: 'ops-demand-v1',
    title: 'Ops: Demand Planning Manager',
    description: 'Stat Forecasting → ML Forecasting → Demand Sensing → S&OP Optimization (OR) → Deployment',
    domainPreference: 'ops',
    primaryPersona: 'DEMAND_PLANNING_MANAGER',
    skillTreeId: OPS_DEMAND_SKILL_TREE_ID,
    programId: OPS_DEMAND_9W_PROGRAM_ID,
  },
  {
    id: 'ops-inventory-v1',
    title: 'Ops: Inventory / Service-Level Owner',
    description: 'Variability → Safety Stock → Replenishment → OR Optimization (LP/MILP) → MEIO-lite → Deployment',
    domainPreference: 'ops',
    primaryPersona: 'INVENTORY_SERVICE_LEVEL_OWNER',
    skillTreeId: OPS_INVENTORY_SKILL_TREE_ID,
    programId: OPS_INVENTORY_9W_PROGRAM_ID,
  },
];

// Optional helpers (useful for dropdowns/debug/admin tooling)
export const listSkillTreeIds = (): string[] => Object.keys(SKILL_TREES);
export const listProgramIds = (): string[] => Object.keys(PROGRAM_WEEKS);

