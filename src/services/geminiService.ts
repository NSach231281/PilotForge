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

  try {
    return JSON.parse(cleaned);
  } catch {
    // try substring object
    const a = cleaned.indexOf("{");
    const b = cleaned.lastIndexOf("}");
    if (a >= 0 && b > a) return JSON.parse(cleaned.slice(a, b + 1));

    // try substring array (rare)
    const c = cleaned.indexOf("[");
    const d = cleaned.lastIndexOf("]");
    if (c >= 0 && d > c) return JSON.parse(cleaned.slice(c, d + 1));

    throw new Error("Gemini returned non-JSON output: " + cleaned.slice(0, 400));
  }
}

function clampScore(x: any): number {
  const n = typeof x === "number" ? x : parseFloat(x);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Extracts plain text from GoogleGenAI response reliably.
 * The SDK response shape can vary; this handles common cases.
 */
function responseToText(resp: any): string {
  if (!resp) return "";

  // Some versions provide a .text helper
  if (typeof resp.text === "string") return resp.text;

  // Common candidate format
  const parts =
    resp?.candidates?.[0]?.content?.parts ||
    resp?.response?.candidates?.[0]?.content?.parts ||
    [];

  const joined = Array.isArray(parts)
    ? parts.map((p: any) => p?.text).filter(Boolean).join("\n")
    : "";

  if (joined) return joined;

  // Fallback: stringify (helps debugging)
  return JSON.stringify(resp);
}

async function generateText(prompt: string): Promise<string> {
  ensureKey();

  const resp = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  return responseToText(resp);
}

// ------------------------------------------------------------
// ✅ 1) ContentLab support: generate learning content / blueprint
// ------------------------------------------------------------
export async function generateAILearningContent(args: {
  mode: "blueprint" | "lesson" | "dataset" | "theory" | "generic";
  domain?: string; // e.g. "ops"
  topic?: string; // e.g. "Demand Forecasting"
  difficulty?: "beginner" | "intermediate" | "advanced";
  instructions?: string;
  context?: any;
}): Promise<string> {
  const prompt = `
You are generating content for an AI apprenticeship platform.

MODE: ${args.mode}
DOMAIN: ${args.domain || "ops"}
TOPIC: ${args.topic || ""}
DIFFICULTY: ${args.difficulty || "intermediate"}

CONTEXT (optional):
${JSON.stringify(args.context || {}, null, 2)}

INSTRUCTIONS:
${args.instructions || "Generate high-quality, practical content."}

OUTPUT RULES:
- If MODE=blueprint: output a detailed case blueprint in JSON with keys like:
  { "title","context","problem_statement","assumptions","data_required","approach","tasks","deliverables","evaluation","extensions" }
- If MODE=lesson/theory: output structured markdown with headings and bullet points.
- If MODE=dataset: output ONLY JSON with:
  { "schema": {...}, "rows": [ {..}, ... ] } (20-50 rows).
- Do NOT wrap output in markdown fences unless asked.
`.trim();

  return generateText(prompt);
}

// ------------------------------------------------------------
// ✅ 2) UseCaseDetail support: persona/job context
// ------------------------------------------------------------
export async function getJobSpecificContext(args: {
  persona: string;
  industry?: string;
  companySize?: string;
  painPoints?: string[];
  goals?: string[];
}): Promise<any> {
  const prompt = `
You are an expert consultant. Create job-specific context to personalize an AI pilot case.

Return ONLY raw JSON (no markdown):
{
  "personaSummary": "...",
  "typicalKpis": ["..."],
  "commonDataSources": ["..."],
  "likelyConstraints": ["..."],
  "successDefinition": "...",
  "pitfalls": ["..."]
}

INPUT:
${JSON.stringify(args, null, 2)}
`.trim();

  const text = await generateText(prompt);
  return extractJson(text);
}

// -----------------------------
// Case grading
// -----------------------------
export const evaluateSubmission = async (
  studentSubmission: string,
  caseContext: any
): Promise<GradingResult> => {
  try {
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

    const text = await generateText(prompt);
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

// -----------------------------
// Journey grading
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

    const text = await generateText(prompt);
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
      feedback: e?.message || "AI grading failed. Admin: verify model access + API key.",
      strengths: [],
      improvements: [],
      nextActions: [],
      pass: false,
    };
  }
};
