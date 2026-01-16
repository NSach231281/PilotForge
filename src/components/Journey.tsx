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
  // supports:
  // - https://www.youtube.com/watch?v=XXXX
  // - https://youtu.be/XXXX
  // - already-embed URLs
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
  const programId = profile.activeProgramId || OPS_9W_PROGRAM_ID;
  const weeks = useMemo(() => getProgramWeeks(profile.activeProgramId || OPS_9W_PROGRAM_ID), [profile.activeProgramId]);

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

  // Ensure profile has programProgress persisted once
  useEffect(() => {
    if (profile.programProgress?.programId !== programId) {
      const updated: UserProfile = { ...profile, programProgress: progress };
      onProfileUpdate(updated);
      // fire-and-forget save
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

          {isLocked ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-slate-600 font-medium">
                This week is locked. Pass the previous week to unlock it.
              </p>
            </div>
          ) : (
            <>
              {/* Week Materials */}
              <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-slate-900">Week Materials</p>
                  <p className="text-xs text-slate-500">Loaded from Supabase</p>
                </div>

                {materialsLoading && <div className="mt-2 text-sm text-slate-500">Loading materials…</div>}
                {materialsError && <div className="mt-2 text-sm text-red-600">{materialsError}</div>}

                {!materialsLoading && !materialsError && weekMaterials.length === 0 && (
                  <div className="mt-2 text-sm text-slate-500">
                    No materials mapped to this week yet. (Admin: map content items to Week {activeWeekObj.weekNo}.)
                  </div>
                )}

                <div className="mt-3 space-y-3">
                  {weekMaterials.map((item) => (
                    <div key={item.id} className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-bold text-slate-900 text-sm">
                          {item.type === "video" && "🎥 "}
                          {item.type === "lesson" && "📄 "}
                          {item.type === "case_blueprint" && "🧩 "}
                          {item.type === "case_full" && "📦 "}
                          {item.type === "template" && "⬇️ "}
                          {item.title}
                        </div>
                        <div className="text-xs text-slate-500">{item.type}</div>
                      </div>

                      {item.summary && <div className="mt-1 text-sm text-slate-600">{item.summary}</div>}

                      {item.type === "video" && item.external_url && (
                        <div className="mt-3 aspect-video w-full overflow-hidden rounded-xl border border-slate-100 bg-white">
                          <iframe
                            className="h-full w-full"
                            src={toYoutubeEmbed(item.external_url)}
                            title={item.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )}

                      {item.type === "lesson" && (
                        <div className="mt-2 text-sm whitespace-pre-wrap text-slate-700">
                          {item.content_json?.text || "Lesson text missing."}
                        </div>
                      )}

                      {(item.type === "case_blueprint" || item.type === "case_full") && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm font-bold text-slate-700">
                            View case details
                          </summary>
                          <pre className="mt-2 max-h-72 overflow-auto rounded-xl bg-white border border-slate-100 p-3 text-xs">
                            {JSON.stringify(item.content_json || {}, null, 2)}
                          </pre>

                          {item.type === "case_full" && datasetPreview && (
                            <div className="mt-3">
                              <div className="text-sm font-bold text-slate-900">Dataset preview (first 10 rows)</div>
                              <pre className="mt-2 max-h-64 overflow-auto rounded-xl bg-white border border-slate-100 p-3 text-xs">
                                {JSON.stringify(datasetPreview, null, 2)}
                              </pre>
                            </div>
                          )}
                        </details>
                      )}

                      {item.type === "template" && item.storage_path && (
                        <div className="mt-2 text-sm">
                          <a className="text-indigo-700 font-bold underline" href={item.storage_path} target="_blank" rel="noreferrer">
                            Download template
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Deliverables */}
              <div className="mb-6">
                <p className="text-sm font-bold text-slate-900 mb-2">Deliverables</p>
                <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                  {activeWeekObj.deliverables.map((d, idx) => (
                    <li key={idx}>{d}</li>
                  ))}
                </ul>
              </div>

              {/* Submission */}
              <div className="mb-4">
                <p className="text-sm font-bold text-slate-900 mb-2">
                  Your Submission (paste links, notes, results)
                </p>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  rows={10}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder={`Write your submission here. Include:
- What you did
- What you found
- Key tables/metrics
- Links to notebook / sheet / slides`}
                />
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3 mb-8">
                <button
                  disabled={busy}
                  onClick={handleSubmitForReview}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-60"
                >
                  {busy ? "Reviewing…" : "Submit for AI Review"}
                </button>
                <div className="text-xs text-slate-500">
                  Pass bar:{" "}
                  <span className="font-bold">{activeWeekObj.rubric?.overallPassScore ?? 70}/100</span>
                </div>
              </div>

              {review && (
                <div className="border-t border-slate-100 pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-slate-900">AI Review</p>
                    <span className="text-sm font-black text-slate-900">Score: {review.score}/100</span>
                  </div>

                  <p className="text-sm text-slate-600 mb-4">{review.feedback}</p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                      <p className="text-sm font-bold text-emerald-900 mb-2">Strengths</p>
                      <ul className="list-disc pl-5 text-sm text-emerald-800 space-y-1">
                        {(review.strengths || []).slice(0, 6).map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                      <p className="text-sm font-bold text-amber-900 mb-2">Improvements</p>
                      <ul className="list-disc pl-5 text-sm text-amber-800 space-y-1">
                        {(review.improvements || []).slice(0, 6).map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-sm font-bold text-slate-900 mb-2">
                      Next actions (do these to unlock Week {activeWeekObj.weekNo + 1})
                    </p>
                    <ol className="list-decimal pl-5 text-sm text-slate-700 space-y-1">
                      {(review.nextActions || []).slice(0, 6).map((a, idx) => (
                        <li key={idx}>{a}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Journey;
