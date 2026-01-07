import { SkillNode, SkillStatus, UseCase } from './types';

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
