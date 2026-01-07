/**
 * SYNTHETIC DATA ENGINE v2
 * Features:
 * 1. Domain-aware Row Limits (HR = 100, Ops = 1000)
 * 2. Smart Type Inference
 * 3. Controlled Noise Injection
 */

interface DataSchema {
  previewRows: any[]; 
  messyFactors?: string[];
  domain?: string; // New: Used to determine row count
}

const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const randomChoice = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

// Helper to calculate smart row counts
export const getRecommendedRowCount = (domain: string = 'general'): number => {
  const d = domain.toLowerCase();
  if (d.includes('hr') || d.includes('people') || d.includes('talent')) return 150; // HR usually has smaller, richer datasets
  if (d.includes('ops') || d.includes('supply') || d.includes('marketing')) return 1200; // Ops needs scale for variety
  return 500; // Default
};

export const generateFullDataset = (schema: DataSchema): any[] => {
  const { previewRows, messyFactors = [], domain = 'general' } = schema;
  if (!previewRows || previewRows.length === 0) return [];

  const targetRows = getRecommendedRowCount(domain);
  
  // 1. Analyze Columns & Types
  const columns = Object.keys(previewRows[0]);
  const analysis: Record<string, any> = {};

  columns.forEach(col => {
    const values = previewRows.map(r => r[col]);
    
    // Detect ID Columns (Sequential)
    if (col.toLowerCase().includes('id') || col.toLowerCase().includes('code')) {
      analysis[col] = { type: 'id', prefix: values[0].toString().replace(/\d+$/, '') };
      return;
    }

    // Detect Dates
    if (values.every(v => !isNaN(Date.parse(v)) && isNaN(Number(v)))) {
      const dates = values.map(v => new Date(v).getTime());
      analysis[col] = { type: 'date', min: Math.min(...dates), max: Math.max(...dates) };
      return;
    }

    // Detect Numbers
    if (values.every(v => typeof v === 'number' || (!isNaN(Number(v)) && v !== ''))) {
      const nums = values.map(v => Number(v));
      analysis[col] = { type: 'number', min: Math.min(...nums), max: Math.max(...nums) };
      return;
    }

    // Default: Categorical (Pick from existing values)
    analysis[col] = { type: 'string', options: [...new Set(values)] };
  });

  // 2. Generate Rows
  const fullDataset = [];
  
  for (let i = 0; i < targetRows; i++) {
    const newRow: any = {};

    columns.forEach(col => {
      const config = analysis[col];
      let val;

      if (config.type === 'id') {
        val = `${config.prefix}${1000 + i}`; 
      } 
      else if (config.type === 'date') {
        // Expand date range slightly (±30 days) to make it realistic
        val = randomDate(new Date(config.min - 2592000000), new Date(config.max + 2592000000)).toISOString().split('T')[0];
      } 
      else if (config.type === 'number') {
        // Add Variance (+/- 20%)
        const base = config.min + Math.random() * (config.max - config.min);
        val = Math.floor(base * (0.8 + Math.random() * 0.4)); 
      } 
      else {
        val = randomChoice(config.options);
      }

      // 3. Inject "Messiness" (5% Chance)
      if (messyFactors.length > 0 && Math.random() > 0.95) {
        const factor = randomChoice(messyFactors).toLowerCase();
        if (factor.includes('null') || factor.includes('missing')) val = null;
        else if (factor.includes('outlier') && typeof val === 'number') val = val * 10;
        else if (factor.includes('typo') && typeof val === 'string') val = val + "_x";
      }

      newRow[col] = val;
    });

    fullDataset.push(newRow);
  }

  return fullDataset;
};
