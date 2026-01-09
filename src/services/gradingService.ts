import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// Recommended default model for grading: fast + cheap + good enough
const DEFAULT_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-flash";

if (!API_KEY) {
  // Don't crash build, but make it obvious at runtime
  console.warn(
    "[PilotForge] VITE_GEMINI_API_KEY is missing. AI grading will fail until it is set in Vercel env vars."
  );
}

const genAI = new GoogleGenerativeAI(API_KEY);

export interface GradingResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface JourneyReview {
  score: number; // 0-100
  feedback: string; // 2-4 sentences
  strengths: string[];
  improvements: string[];
  nextActions: string[];
  pass: boolean;
}

// -----------------------------
// Helpers
// -----------------------------
function ensureApiKey() {
  if (!API_KEY) {
    throw new Error(
      "Gemini API key missing. Set VITE_GEMINI_API_KEY in Vercel Environment Variables."
    );
  }
}

function extractJson(text: string): any {
  // 1) Remove markdown fences if any
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();

  // 2) Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    // 3) Try extracting JSON object substring
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      const maybeJson = cleaned.slice(firstBrace, lastBrace + 1);
      return JSON.parse(maybeJson);
    }
    // 4) Try extracting JSON array substring (rare)
    const firstBracket = cleaned.indexOf("[");
    const lastBracket = cleaned.lastIndexOf("]");
    if (firstBracket >= 0 && lastBracket > firstBracket) {
      const maybeJson = cleaned.slice(firstBracket, lastBracket + 1);
      return JSON.parse(maybeJson);
    }
    throw new Error("AI returned non-JSON output. Raw response: " + cleaned.slice(0, 200));
  }
}

function clampScore(x: any): number {
  const n = typeof x === "number" ? x : parseFloat(x);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

// -----------------------------
// Case submission grading
// -----------------------------
export const evaluateSubmission = async (
  studentSubmission: string,
  caseContext: any
): Promise<GradingResult> => {
  try {
    ensureApiKey();

    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });

    const prompt = `
You are a strict Professor evaluating a Case Study submission.

CASE CONTEXT:
Title: ${caseContext.title}
Scenario: ${caseContext.description}
Strategic Questions to Answer: ${JSON.stringify(caseContext.content?.strategicQuestions || [])}

STUDENT SUBMISSION:
"""
${studentSubmission}
"""

TASK:
Grade this submission on a scale of 0-100 based on:
1. Analytical Depth (Did they use data?)
2. Strategic Alignment (Does it solve the business crisis?)
3. Clarity.

OUTPUT FORMAT:
Return ONLY raw JSON (no markdown, no extra keys):
{
  "score": 85,
  "feedback": "2-sentence summary.",
  "strengths": ["Point 1", "Point 2"],
  "improvements": ["Missed Point 1", "Missed Point 2"]
}
`.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const parsed = extractJson(text);

    return {
      score: clampScore(parsed.score),
      feedback: parsed.feedback || "",
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
    };
  } catch (error: any) {
    console.error("Grading failed:", error);
    return {
      score: 0,
      feedback:
        error?.message ||
        "Error grading submission. Please try again. (Admin: check Gemini model + API key.)",
      strengths: [],
      improvements: [],
    };
  }
};

// -----------------------------
// Journey grading (Week-by-week)
// -----------------------------
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
    ensureApiKey();

    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });

    const prompt = `
You are a strict but fair reviewer for an outcome-based AI apprenticeship.

WEEK CONTEXT:
Week: ${weekContext.weekNo}
Title: ${weekContext.title}
Outcome: ${weekContext.outcome || ""}
Expected Deliverables: ${JSON.stringify(weekContext.deliverables)}

RUBRIC (use this to score):
${JSON.stringify(weekContext.rubric)}

SUBMISSION:
"""
${submissionText}
"""

TASK:
1) Grade the submission on 0-100 (integer).
2) Provide strengths, improvements, and exactly 5 concrete next actions.
3) Mark pass=true only if it meets the week's bar.

OUTPUT FORMAT:
Return ONLY raw JSON (no markdown, no commentary):
{
  "score": 82,
  "feedback": "2-4 sentences.",
  "strengths": ["..."],
  "improvements": ["..."],
  "nextActions": ["...","...","...","...","..."],
  "pass": true
}
`.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const parsed = extractJson(text);

    return {
      score: clampScore(parsed.score),
      feedback: parsed.feedback || "",
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      nextActions: Array.isArray(parsed.nextActions) ? parsed.nextActions.slice(0, 5) : [],
      pass: !!parsed.pass,
    };
  } catch (error: any) {
    console.error("Journey grading failed:", error);

    return {
      score: 0,
      feedback:
        error?.message ||
        "AI grading failed. Admin: verify VITE_GEMINI_API_KEY and VITE_GEMINI_MODEL (recommended gemini-1.5-flash).",
      strengths: [],
      improvements: [],
      nextActions: [],
      pass: false,
    };
  }
};
