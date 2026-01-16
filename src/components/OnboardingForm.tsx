import React, { useState } from 'react';
import { UserProfile, LearningTrack } from '../types';

interface OnboardingFormProps {
  onComplete: (profile: UserProfile) => void;
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    tools: [],
    availability: 5,
  });

  const steps = [
    {
      title: "Current Role",
      field: "role",
      type: "select",
      options: ["Operations Manager", "Supply Chain Lead", "Marketing Manager", "Sales Ops", "Internal Auditor (Admin)", "Other"]
    },
    {
      title: "Industry",
      field: "industry",
      type: "select",
      options: ["E-commerce", "Manufacturing", "FMCG", "Fintech", "Logistics", "Retail"]
    },
    {
      title: "Current Tech Stack",
      field: "tools",
      type: "multiselect",
      options: ["Excel (Advanced)", "SQL", "Python", "PowerBI/Tableau", "None/Basic Excel"]
    },
    {
      title: "Primary Goal",
      field: "goal",
      type: "select",
      options: ["Career Promotion", "Work Productivity", "Business Transformation", "Validation & Audit"]
    },
    {
      title: "Weekly Time Commitment",
      field: "availability",
      type: "range",
      min: 2,
      max: 15
    },
    // Ops/SC persona signals (shown only for Ops roles)
    {
      title: "Decisions You Make Weekly (Ops/SC)",
      field: "decisionsMade",
      type: "multiselect",
      options: [
        "Forecasting / Demand Planning",
        "S&OP / Supply Planning",
        "Safety Stock / Buffer Setting",
        "Replenishment / Ordering",
        "Service Level & Stockout Management",
        "Multi-Echelon / Network Allocation"
      ]
    },
    {
      title: "KPIs You Own (Ops/SC)",
      field: "kpisOwned",
      type: "multiselect",
      options: [
        "Forecast Accuracy (MAPE/WAPE)",
        "Fill Rate / Service Level",
        "Stockouts",
        "Inventory Turns / DOS",
        "Working Capital / Inventory Value",
        "Expedite / Premium Freight"
      ]
    },
    {
      title: "Quick Diagnostic (Self-check)",
      field: "diagnosticScore",
      type: "range",
      min: 0,
      max: 100
    }
  ];

  // Show extra steps only for Ops/SC learners (v1)
  const baseStepsCount = 5;
  const isOpsRole = (formData.role || '').toLowerCase().includes('ops') ||
    (formData.role || '').toLowerCase().includes('supply') ||
    (formData.role || '').toLowerCase().includes('chain');

  const effectiveSteps = isOpsRole ? steps : steps.slice(0, baseStepsCount);

  const handleNext = () => {
    if (step < effectiveSteps.length - 1) {
      setStep(step + 1);
    } else {
      const isAudit = formData.role === "Internal Auditor (Admin)";

      const normalizeDecisions = (raw: string[]): string[] => {
        return raw.map((x) => {
          const t = x.toLowerCase();
          if (t.includes('forecast')) return 'forecasting';
          if (t.includes('s&op') || t.includes('sop') || t.includes('s&op')) return 'snop';
          if (t.includes('safety stock') || t.includes('buffer')) return 'safety_stock';
          if (t.includes('replen')) return 'replenishment';
          if (t.includes('service level') || t.includes('stockout')) return 'service_level';
          if (t.includes('multi-echelon') || t.includes('network')) return 'meio';
          return t.replace(/\s+/g, '_');
        });
      };

      const normalizeKpis = (raw: string[]): string[] => {
        return raw.map((x) => {
          const t = x.toLowerCase();
          if (t.includes('forecast')) return 'forecast_accuracy';
          if (t.includes('fill') || t.includes('service')) return 'fill_rate';
          if (t.includes('stockout')) return 'stockouts';
          if (t.includes('turn') || t.includes('dos')) return 'inventory_turns';
          if (t.includes('working') || t.includes('value')) return 'working_capital';
          if (t.includes('expedite') || t.includes('freight')) return 'expedite';
          return t.replace(/\s+/g, '_');
        });
      };
      
      // FIX: Construct a complete UserProfile with ID and defaults
      onComplete({
        id: 'user_' + Date.now(), // Generate Temp ID
        role: formData.role || 'Learner',
        industry: formData.industry || 'General',
        tools: formData.tools || [],
        goal: formData.goal || 'Upskilling',
        availability: formData.availability || 5,
        kpisOwned: normalizeKpis(((formData as any).kpisOwned || []) as string[]),
        decisionsMade: normalizeDecisions(((formData as any).decisionsMade || []) as string[]),
        diagnosticScore: typeof (formData as any).diagnosticScore === 'number' ? (formData as any).diagnosticScore : 60,
        isAdmin: isAudit,
        track: LearningTrack.ANALYST, // Default
        domainPreference: 'ops', // Default
        verifiedSkills: [],
        masteryScore: 0
      } as UserProfile);
    }
  };

  const handleDevBypass = () => {
    onComplete({
      id: 'dev_user_001', // FIX: Added ID
      role: 'Founding Engineer',
      industry: 'EdTech',
      tools: ['python', 'sql'],
      goal: 'Validation & Audit',
      availability: 40,
      isAdmin: true,
      track: LearningTrack.ANALYST,
      domainPreference: 'ops',
      verifiedSkills: [],
      masteryScore: 100
    } as UserProfile);
  };

  const current = effectiveSteps[step];

  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Step {step + 1} of {effectiveSteps.length}</span>
            <div className="flex gap-1">
              {effectiveSteps.map((_, i) => (
                <div key={i} className={`h-1 w-4 rounded-full ${i <= step ? 'bg-indigo-600' : 'bg-slate-200'}`} />
              ))}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 heading">{current.title}</h2>
        </div>

        <div className="space-y-4">
          {current.type === 'select' && current.options?.map(opt => (
            <button
              key={opt}
              onClick={() => {
                setFormData({ ...formData, [current.field]: opt });
                // We need a slight delay or just direct state update handling to ensure data is set before next
                // But React state batching handles this usually. To be safe, we just set and let user click? 
                // Actually your original code clicked and moved next immediately.
                // Better pattern: set state, then wait. But for this simple form:
                setFormData(prev => {
                    const next = { ...prev, [current.field]: opt };
                    // If we want to auto-advance, we can do it here or via effect.
                    // For now, let's keep your logic but safe.
                    return next;
                });
                handleNext(); 
              }}
              className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all font-medium text-slate-700"
            >
              {opt}
            </button>
          ))}

          {current.type === 'multiselect' && (
            <div className="space-y-3">
              {current.options?.map(opt => (
                <label key={opt} className="flex items-center p-4 rounded-xl border-2 border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
                  <input 
                    type="checkbox"
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    checked={(() => {
                      const field = current.field as keyof UserProfile;
                      const raw = (formData as any)[field] || [];
                      if (field === 'tools') return (raw as string[]).includes(opt.toLowerCase());
                      return (raw as string[]).includes(opt);
                    })()}
                    onChange={(e) => {
                        const field = current.field as keyof UserProfile;
                        const existing: string[] = ((formData as any)[field] || []) as string[];

                        // Tools are stored normalized (python/sql/excel etc). Others keep label for now.
                        const value = field === 'tools' ? opt.toLowerCase() : opt;

                        const next = e.target.checked
                          ? Array.from(new Set([...existing, value]))
                          : existing.filter((x) => x !== value);

                        setFormData({
                          ...formData,
                          [field]: next,
                        });
                    }}
                  />
                  <span className="ml-3 font-medium text-slate-700">{opt}</span>
                </label>
              ))}
              <button
                onClick={handleNext}
                className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold mt-4 shadow-lg shadow-indigo-200 hover:bg-indigo-700"
              >
                Continue
              </button>
            </div>
          )}

          {current.type === 'range' && (
            <div className="space-y-6">
              <input 
                type="range"
                min={current.min}
                max={current.max}
                value={(() => {
                  const f = current.field as keyof UserProfile;
                  const v = (formData as any)[f];
                  if (typeof v === 'number') return v;
                  return f === 'availability' ? 5 : 60;
                })()}
                onChange={(e) => {
                  const f = current.field as keyof UserProfile;
                  setFormData({ ...formData, [f]: parseInt(e.target.value) } as any);
                }}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-sm font-bold text-slate-500">
                {(current.field === 'availability') ? (
                  <>
                    <span>{current.min} hrs/week</span>
                    <span className="text-indigo-600 text-lg">{(formData as any).availability || 5} hrs</span>
                    <span>{current.max} hrs/week</span>
                  </>
                ) : (
                  <>
                    <span>{current.min}</span>
                    <span className="text-indigo-600 text-lg">{(formData as any).diagnosticScore ?? 60}</span>
                    <span>{current.max}</span>
                  </>
                )}
              </div>
              <button
                onClick={handleNext}
                className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700"
              >
                {step === effectiveSteps.length - 1 ? 'Finalize My Track' : 'Continue'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Dev/Auditor Quick Access */}
      <button 
        onClick={handleDevBypass}
        className="text-slate-400 hover:text-indigo-600 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        Debug Mode: Instant Admin Access
      </button>
    </div>
  );
};

export default OnboardingForm;
