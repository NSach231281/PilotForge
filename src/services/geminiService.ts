import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-flash";

// Force stable API version (v1) instead of default v1beta
const ai = new GoogleGenAI({
  apiKey: API_KEY,
  httpOptions: { apiVersion: "v1" },
});

export interface GradingResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface JourneyReview {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  nextActions: string[];
  pass: boolean;
}

// ---------- helpers ----------
function ensureKey() {
  if (!API_KEY) {
    throw new Error("Missing VITE_GEMINI_API_KEY. Set it in Vercel env vars.");
  }
}

function extractJson(text: string) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();

  // direct parse
  try {
    return JSON.parse(cleaned);
  } catch {
    // try substring object
    const a = cleaned.indexOf("{");
    const b = cleaned.lastIndexOf("}");
    if (a >= 0 && b > a) return JSON.parse(cleaned.slice(a, b + 1));
    throw new Error("Gemini returned non-JSON output: " + cleaned.slice(0, 200));
  }
}

function clampScore(x: any): number {
  const n = typeof x === "number" ? x : parseFloat(x);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

// ---------- Case grading ----------
export const evaluateSubmission = async (
  studentSubmission: string,
  caseContext: any
): Promise<GradingResult> => {
  try {
    ensureKey();

    const prompt = `
You are a strict Professor evaluating a Case Study submission.

CASE CONTEXT:
Title: ${caseContext.title}
Scenario: ${caseContext.description}
Strategic Questions: ${JSON.stringify(caseContext.content?.strategicQuestions || [])}

STUDENT SUBMISSION:
"""
${studentSubmission}
"""

TASK:
Grade 0-100 based on Analytical Depth, Strategic Alignment, and Clarity.

OUTPUT:
Return ONLY raw JSON:
{
  "score": 85,
  "feedback": "2-sentence summary.",
  "strengths": ["..."],
  "improvements": ["..."]
}
`.trim();

    const resp = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    // SDK returns a helper .text in many examples; safest: coerce to string
    const text = (resp as any).text ?? JSON.stringify(resp);
    const parsed = extractJson(text);

    return {
      score: clampScore(parsed.score),
      feedback: parsed.feedback || "",
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
    };
  } catch (e: any) {
    console.error("Grading failed:", e);
    return {
      score: 0,
      feedback: e?.message || "Error grading submission.",
      strengths: [],
      improvements: [],
    };
  }
};

// ---------- Journey grading ----------
export const evaluateJourneyWeek = async (
  submissionText: string,
  weekContext: {
    weekNo: number;
    title: string;
    outcome?: string;
    deliverables: string[];
    rubric: any;
  }
): Promise<JourneyReview> => {
  try {
    ensureKey();

    const prompt = `
You are a strict but fair reviewer for an outcome-based AI apprenticeship.

WEEK:
${weekContext.weekNo} — ${weekContext.title}
Outcome: ${weekContext.outcome || ""}
Deliverables: ${JSON.stringify(weekContext.deliverables)}

Rubric:
${JSON.stringify(weekContext.rubric)}

Submission:
"""
${submissionText}
"""

Return ONLY raw JSON:
{
  "score": 82,
  "feedback": "2-4 sentences.",
  "strengths": ["..."],
  "improvements": ["..."],
  "nextActions": ["...", "...", "...", "...", "..."],
  "pass": true
}
`.trim();

    const resp = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    const text = (resp as any).text ?? JSON.stringify(resp);
    const parsed = extractJson(text);

    return {
      score: clampScore(parsed.score),
      feedback: parsed.feedback || "",
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      nextActions: Array.isArray(parsed.nextActions) ? parsed.nextActions.slice(0, 5) : [],
      pass: !!parsed.pass,
    };
  } catch (e: any) {
    console.error("Journey grading failed:", e);
    return {
      score: 0,
      feedback:
        e?.message ||
        "AI grading failed. Admin: verify model access + API version (use v1).",
      strengths: [],
      improvements: [],
      nextActions: [],
      pass: false,
    };
  }
};
