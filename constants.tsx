
import { SkillNode, SkillStatus, UseCase } from './types';

export const SKILL_NODES: SkillNode[] = [
  {
    id: 'data-hygiene',
    label: 'Data Hygiene',
    description: 'Fixing messy spreadsheets & automated normalization.',
    status: SkillStatus.UNLOCKED,
    dependencies: [],
    type: 'data',
    domain: 'shared',
    difficulty: 'basic',
    // Added missing materials field
    materials: []
  },
  {
    id: 'ops-forecasting',
    label: 'Demand Forecasting',
    description: 'Time-series analysis for inventory planning.',
    status: SkillStatus.LOCKED,
    dependencies: ['data-hygiene'],
    type: 'model',
    domain: 'ops',
    difficulty: 'intermediate',
    // Added missing materials field
    materials: []
  },
  {
    id: 'ops-optimization',
    label: 'Safety Stock Opt.',
    description: 'Calculated buffers to minimize stockouts and holding costs.',
    status: SkillStatus.LOCKED,
    dependencies: ['ops-forecasting'],
    type: 'optimization',
    domain: 'ops',
    difficulty: 'intermediate',
    // Added missing materials field
    materials: []
  },
  {
    id: 'ops-advanced-sensing',
    label: 'Demand Sensing (AI)',
    description: 'Real-time adjustment of forecasts based on external signals.',
    status: SkillStatus.HIDDEN,
    dependencies: ['ops-optimization'],
    type: 'model',
    domain: 'ops',
    difficulty: 'advanced',
    // Added missing materials field
    materials: []
  },
  {
    id: 'mkt-classification',
    label: 'Lead Prioritization',
    description: 'Predicting lead conversion probability.',
    status: SkillStatus.LOCKED,
    dependencies: ['data-hygiene'],
    type: 'model',
    domain: 'mkt',
    difficulty: 'intermediate',
    // Added missing materials field
    materials: []
  },
  {
    id: 'mkt-segmentation',
    label: 'Behavioral Clustering',
    description: 'Grouping customers by churn risk and LTV.',
    status: SkillStatus.LOCKED,
    dependencies: ['mkt-classification'],
    type: 'model',
    domain: 'mkt',
    difficulty: 'intermediate',
    // Added missing materials field
    materials: []
  },
  {
    id: 'mkt-advanced-personalization',
    label: 'Hyper-Personalization',
    description: 'Generative AI workflows for localized ad copy.',
    status: SkillStatus.HIDDEN,
    dependencies: ['mkt-segmentation'],
    type: 'model',
    domain: 'mkt',
    difficulty: 'advanced',
    // Added missing materials field
    materials: []
  },
  {
    id: 'deployment-final',
    label: 'Pilot Deployment',
    description: 'Automating your model output to a live business workflow.',
    status: SkillStatus.LOCKED,
    dependencies: ['ops-optimization', 'mkt-segmentation'],
    type: 'deployment',
    domain: 'shared',
    difficulty: 'advanced',
    // Added missing materials field
    materials: []
  },
  {
    id: 'remedial-excel-logic',
    label: 'Logic Foundations',
    description: 'Deep dive into IF/THEN and boolean logic for datasets.',
    status: SkillStatus.HIDDEN,
    dependencies: [],
    type: 'remediation',
    domain: 'shared',
    difficulty: 'basic',
    // Added missing materials field
    materials: []
  }
];

export const MOCK_USE_CASES: UseCase[] = [
  {
    id: 'uc-ops-1',
    title: 'Regional Warehouse Rebalancing',
    domain: 'Operations & Supply Chain',
    context: 'Reallocate stock between Bangalore and Mumbai hubs to meet spike demand.',
    finishedOutputPreviewUrl: 'https://picsum.photos/seed/opsrebalance/800/400',
    requiredSkills: ['data-hygiene', 'ops-forecasting'],
    datasetDescription: 'Warehouse Stock Ledger (Anonymized) - 10,000 SKUs across 5 locations.',
    dummyDataPreview: [
      { sku: 'SKU-9901', warehouse: 'BLR', stock: 450, avg_daily_sales: 42, lead_time_days: 3 },
      { sku: 'SKU-9902', warehouse: 'MUM', stock: 120, avg_daily_sales: 85, lead_time_days: 2 },
      { sku: 'SKU-9903', warehouse: 'DEL', stock: 310, avg_daily_sales: 12, lead_time_days: 5 }
    ],
    // Added missing verificationLogic field
    verificationLogic: [],
    cookbook: {
      steps: [
        'Normalize date formats in the ledger.',
        'Calculate stock-out probability using 30-day rolling variance.',
        'Run the rebalancing script to suggest inter-city transfers.',
        'Export as a Transport Manifest CSV.'
      ],
      resources: [
        { label: 'Warehouse Dataset', url: '#', type: 'excel' },
        { label: 'Rebalance Notebook', url: '#', type: 'notebook' }
      ]
    }
  },
  {
    id: 'uc-mkt-1',
    title: 'Tier-2 City Lead Scoring',
    domain: 'Marketing & Sales',
    context: 'Identify high-intent leads in non-metro regions to optimize tele-sales time.',
    finishedOutputPreviewUrl: 'https://picsum.photos/seed/mktscore/800/400',
    requiredSkills: ['data-hygiene', 'mkt-classification'],
    datasetDescription: 'CRM Export (Simulated) - 5,000 leads with engagement signals.',
    dummyDataPreview: [
      { lead_id: 'L-541', city: 'Indore', web_visits: 12, content_downloads: 1, last_active: '2023-10-01' },
      { lead_id: 'L-542', city: 'Surat', web_visits: 2, content_downloads: 0, last_active: '2023-09-28' },
      { lead_id: 'L-543', city: 'Lucknow', web_visits: 35, content_downloads: 4, last_active: '2023-10-02' }
    ],
    // Added missing verificationLogic field
    verificationLogic: [],
    cookbook: {
      steps: [
        'Cleanse leads with invalid phone formats.',
        'Apply weighting to "web_visits" vs "downloads".',
        'Assign Probability Scores (0.0 - 1.0).',
        'Push Top 10% to "Hot List" in Google Sheets.'
      ],
      resources: [
        { label: 'CRM Sample Data', url: '#', type: 'excel' },
        { label: 'Scoring Prompt Template', url: '#', type: 'prompt' }
      ]
    }
  }
];
