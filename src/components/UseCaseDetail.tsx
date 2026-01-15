import React, { useEffect, useState } from 'react';
import { UseCase, UserProfile } from '../types';
import { getJobSpecificContext } from '../services/geminiService';

interface UseCaseDetailProps {
  useCase: UseCase;
  profile: UserProfile;
  onCompleteTask: (taskId: string, difficultyRating: number) => void;
}

const UseCaseDetail: React.FC<UseCaseDetailProps> = ({
  useCase,
  profile,
  onCompleteTask
}) => {
  const [aiContext, setAiContext] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeUnit, setActiveUnit] = useState<'learn' | 'build'>('learn');

  useEffect(() => {
    const fetchContext = async () => {
      if (!profile.role || !useCase.title) return;

      try {
        const ctx = await getJobSpecificContext({
          persona: profile.role,
          industry: profile.industry || "General",
          companySize: "Unknown",
          painPoints: [],
          goals: []
        });

        const text =
          ctx?.personaSummary
            ? `${ctx.personaSummary}\n\nKPIs: ${(ctx.typicalKpis || []).join(", ")}`
            : JSON.stringify(ctx, null, 2);

        setAiContext(text);
      } catch (e) {
        console.error(e);
        setAiContext("AI personalization failed.");
      }
    };

    fetchContext();
  }, [useCase, profile]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      onCompleteTask(useCase.id, 10);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 pb-20">
      <h1 className="text-3xl font-bold">{useCase.title}</h1>

      <p className="italic text-slate-600">
        {aiContext || "Personalizing for your role..."}
      </p>

      <button onClick={() => setActiveUnit("build")}>
        Go to Build
      </button>

      {activeUnit === "build" && (
        <label className="block border p-6 rounded cursor-pointer">
          <input type="file" className="hidden" onChange={handleFileUpload} />
          {uploading ? "Uploading..." : "Upload Final Artifact"}
        </label>
      )}
    </div>
  );
};

export default UseCaseDetail;
