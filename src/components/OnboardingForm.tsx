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
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      const isAudit = formData.role === "Internal Auditor (Admin)";
      
      // FIX: Construct a complete UserProfile with ID and defaults
      onComplete({
        id: 'user_' + Date.now(), // Generate Temp ID
        role: formData.role || 'Learner',
        industry: formData.industry || 'General',
        tools: formData.tools || [],
        goal: formData.goal || 'Upskilling',
        availability: formData.availability || 5,
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

  const current = steps[step];

  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Step {step + 1} of {steps.length}</span>
            <div className="flex gap-1">
              {steps.map((_, i) => (
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
                    checked={formData.tools?.includes(opt.toLowerCase())}
                    onChange={(e) => {
                        const tools = formData.tools || [];
                        const val = opt.toLowerCase();
                        setFormData({ 
                          ...formData, 
                          tools: e.target.checked ? [...tools, val] : tools.filter(t => t !== val)
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
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-sm font-bold text-slate-500">
                <span>{current.min} hrs/week</span>
                <span className="text-indigo-600 text-lg">{formData.availability} hrs</span>
                <span>{current.max} hrs/week</span>
              </div>
              <button
                onClick={handleNext}
                className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700"
              >
                Finalize My Track
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
