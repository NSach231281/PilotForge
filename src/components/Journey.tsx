import React, { useEffect, useMemo, useState } from "react";
import { UserProfile, ProgramProgress, ProgramWeek } from "../types";
import { OPS_9W_PROGRAM_ID, getProgramWeeks } from "../constants";
import { evaluateJourneyWeek, JourneyReview } from "../services/gradingService";
import { saveUserProfile } from "../services/userService";

import { listWeekContent, getDatasetByContentItem, ContentItem } from "../services/contentService";

interface JourneyProps {
  profile: UserProfile;
  onProfileUpdate: (p: UserProfile) => void;
}

const nowIso = () => new Date().toISOString();

function initProgress(programId: string, weeks: ProgramWeek[]): ProgramProgress {
  const weeksMap: ProgramProgress["weeks"] = {};
  for (const w of weeks) {
    weeksMap[w.weekNo] = {
      status: w.weekNo === 0 ? "unlocked" : "locked",
    };
  }
  return {
    programId,
    currentWeek: 0,
    startedAt: nowIso(),
    updatedAt: nowIso(),
    weeks: weeksMap,
  };
}

function canUnlockNext(current: number, review?: JourneyReview, week?: ProgramWeek): boolean {
  if (!review || !week) return false;
  const passScore = week.rubric?.overallPassScore ?? 70;
  return review.pass === true && (review.score ?? 0) >= passScore;
}

function toYoutubeEmbed(url: string) {
  try {
    if (url.includes("youtube.com/embed/")) return url;

    if (url.includes("watch?v=")) {
      const id = url.split("watch?v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  } catch {
    return url;
  }
}

const Journey: React.FC<JourneyProps> = ({ profile, onProfileUpdate }) => {
  // ---- Admin preview override (read-only) ----
  const roleL = (profile.role || "").toLowerCase();
  const isAdmin = roleL === "admin" || roleL === "system_admin";

  const adminPreviewProgramId =
    typeof window !== "undefined" ? localStorage.getItem("admin_preview_programId") : null;

  const programId =
    (isAdmin && adminPreviewProgramId) ? adminPreviewProgramId : (profile.activeProgramId || OPS_9W_PROGRAM_ID);

  const weeks = useMemo(() => getProgramWeeks(programId), [programId]);

  const progress = useMemo<ProgramProgress>(() => {
    if (profile.programProgress?.programId === programId) return profile.programProgress;
    return initProgress(programId, weeks);
  }, [profile.programProgress, programId, weeks]);

  const [activeWeek, setActiveWeek] = useState<number>(progress.currentWeek || 0);
  const [submissionText, setSubmissionText] = useState<string>("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Week materials
  const [weekMaterials, setWeekMaterials] = useState<ContentItem[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);
  const [datasetPreview, setDatasetPreview] = useState<any[] | null>(null);

  // ✅ Keep activeWeek in sync if programId changes (important for admin preview switching)
  useEffect(() => {
    setActiveWeek(progress.currentWeek || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId]);

  // Ensure profile has programProgress persisted once (but NOT for admin preview)
  useEffect(() => {
    // Admin preview should not write to Supabase
    if (isAdmin && adminPreviewProgramId) return;

    if (profile.programProgress?.programId !== programId) {
      const updated: UserProfile = { ...profile, programProgress: progress };
      onProfileUpdate(updated);
      saveUserProfile(updated).catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const existing = progress.weeks?.[activeWeek]?.submission?.text || "";
    setSubmissionText(existing);
  }, [activeWeek, progress.weeks]);

  const activeWeekObj = weeks.find((w) => w.weekNo === activeWeek)!;
  const activeState = progress.weeks?.[activeWeek];
  const review = activeState?.review;
  const isLocked = activeState?.status === "locked";

  // Load materials for active week
  useEffect(() => {
    let alive = true;

    async function loadMaterials() {
      if (!activeWeekObj) return;

      try {
        setMaterialsLoading(true);
        setMaterialsError(null);
        setDatasetPreview(null);
        setWeekMaterials([]);

        const items = await listWeekContent(programId, activeWeekObj.weekNo);
        if (!alive) return;

        setWeekMaterials(items);

        const fullCase = items.find((x) => x.type === "case_full");
        if (fullCase) {
          const ds = await getDatasetByContentItem(fullCase.id);
          if (!alive) return;
          const rows = ds?.dataset_json;
          setDatasetPreview(Array.isArray(rows) ? rows.slice(0, 10) : null);
        }
      } catch (e: any) {
        if (!alive) return;
        setMaterialsError(e?.message || "Failed to load week materials");
        setWeekMaterials([]);
        setDatasetPreview(null);
      } finally {
        if (alive) setMaterialsLoading(false);
      }
    }

    loadMaterials();

    return () => {
      alive = false;
    };
  }, [activeWeekObj?.weekNo, programId]);

  const handleSubmitForReview = async () => {
    setError(null);
    if (!submissionText.trim()) {
      setError("Please paste your submission before requesting a review.");
      return;
    }

    setBusy(true);
    try {
      const review = await evaluateJourneyWeek(submissionText, {
        weekNo: activeWeekObj.weekNo,
        title: activeWeekObj.title,
        outcome: activeWeekObj.outcome,
        deliverables: activeWeekObj.deliverables,
        rubric: activeWeekObj.rubric,
      });

      const updatedProgress: ProgramProgress = {
        ...progress,
        updatedAt: nowIso(),
        weeks: {
          ...progress.weeks,
          [activeWeek]: {
            status: review.pass ? "passed" : "needs_work",
            submission: {
              text: submissionText,
              submittedAt: nowIso(),
              attachments: [],
            },
            review: {
              score: review.score,
              feedback: review.feedback,
              strengths: review.strengths,
              improvements: review.improvements,
              nextActions: review.nextActions,
            },
          },
        },
      };

      // Unlock next week if passed
      const nextWeekNo = activeWeekObj.weekNo + 1;
      const shouldUnlock = canUnlockNext(activeWeekObj.weekNo, review, activeWeekObj);
      if (shouldUnlock && updatedProgress.weeks[nextWeekNo]) {
        updatedProgress.weeks[nextWeekNo] = {
          ...updatedProgress.weeks[nextWeekNo],
          status: "unlocked",
        };
        updatedProgress.currentWeek = Math.max(updatedProgress.currentWeek, nextWeekNo);
      }

      // Admin preview should not save progress
      if (isAdmin && adminPreviewProgramId) {
        // keep it local-only (UI will still update)
        const updatedProfile: UserProfile = { ...profile, programProgress: updatedProgress };
        onProfileUpdate(updatedProfile);
        return;
      }

      const updatedProfile: UserProfile = { ...profile, programProgress: updatedProgress };
      onProfileUpdate(updatedProfile);
      await saveUserProfile(updatedProfile);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const badge = (status?: string) => {
    switch (status) {
      case "passed":
        return (
          <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
            Passed
          </span>
        );
      case "needs_work":
        return (
          <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
            Needs work
          </span>
        );
      case "submitted":
        return (
          <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
            Submitted
          </span>
        );
      case "unlocked":
        return (
          <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
            Unlocked
          </span>
        );
      default:
        return (
          <span className="text-xs font-bold bg-slate-100 text-slate-400 px-2 py-1 rounded-full">
            Locked
          </span>
        );
    }
  };

  // ---- UI remains unchanged below this line ----
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT: Week list */}
        <div className="w-full lg:w-1/3 bg-white border border-slate-100 rounded-2xl shadow-sm p-4">
          <div className="mb-4">
            <h2 className="text-xl font-black text-slate-900 heading">9-Week Pilot Journey</h2>
            <p className="text-sm text-slate-500 font-medium">Ops Track • Outcome-based • Proof-of-work</p>
          </div>

          <div className="space-y-2">
            {weeks.map((w) => {
              const st = progress.weeks?.[w.weekNo]?.status;
              const locked = st === "locked";
              const active = w.weekNo === activeWeek;

              return (
                <button
                  key={w.weekNo}
                  onClick={() => !locked && setActiveWeek(w.weekNo)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    active ? "border-indigo-200 bg-indigo-50" : "border-slate-100 bg-white"
                  } ${locked ? "opacity-50 cursor-not-allowed" : "hover:border-slate-200"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Week {w.weekNo}</p>
                      <p className="text-sm font-bold text-slate-900">{w.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{w.outcome}</p>
                    </div>
                    {badge(st)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Week details */}
        <div className="w-full lg:w-2/3 bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Week {activeWeekObj.weekNo}</p>
              <h3 className="text-2xl font-black text-slate-900 heading">{activeWeekObj.title}</h3>
              <p className="text-slate-600 mt-1 font-medium">Outcome: {activeWeekObj.outcome}</p>
            </div>
            {badge(activeState?.status)}
          </div>

          {/* ...rest of your UI stays exactly the same... */}
          {/* Keep your existing JSX from here onward unchanged */}
        </div>
      </div>
    </div>
  );
};

export default Journey;
