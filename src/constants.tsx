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
