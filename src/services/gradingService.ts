import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface GradingResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

// v1 Journey review format (kept similar to GradingResult, with next steps + pass/fail)
export interface JourneyReview {
  score: number; // 0-100
  feedback: string; // 2-4 sentences
  strengths: string[];
  improvements: string[];
  nextActions: string[];
  pass: boolean;
}

export const evaluateSubmission = async (
  studentSubmission: string, 
  caseContext: any
): Promise<GradingResult> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // 1. Construct the Professor's Prompt
    const prompt = `
      You are a strict Professor evaluating a Case Study submission.
      
      CASE CONTEXT:
      Title: ${caseContext.title}
      Scenario: ${caseContext.description}
      Strategic Questions to Answer: ${JSON.stringify(caseContext.content?.strategicQuestions || [])}
      
      STUDENT SUBMISSION:
      "${studentSubmission}"
      
      TASK:
      Grade this submission on a scale of 0-100 based on:
      1. Analytical Depth (Did they use data?)
      2. Strategic Alignment (Does it solve the business crisis?)
      3. Clarity.

      OUTPUT FORMAT:
      Return ONLY raw JSON (no markdown):
      {
        "score": 85,
        "feedback": "2-sentence summary.",
        "strengths": ["Point 1", "Point 2"],
        "improvements": ["Missed Point 1", "Missed Point 2"]
      }
    `;

    // 2. Call AI
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // 3. Clean & Parse
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);

  } catch (error) {
    console.error("Grading failed:", error);
    return {
      score: 0,
      feedback: "Error grading submission. Please try again.",
      strengths: [],
      improvements: []
    };
  }
};

/**
 * PilotForge Journey (Week-by-week) evaluation.
 * For v1 speed we reuse the existing Gemini client integration.
 */
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
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
You are a strict but fair reviewer for an outcome-based AI apprenticeship.

WEEK CONTEXT:
Week: ${weekContext.weekNo}
Title: ${weekContext.title}
Outcome: ${weekContext.outcome || ''}
Expected Deliverables: ${JSON.stringify(weekContext.deliverables)}

RUBRIC (use this to score):
${JSON.stringify(weekContext.rubric)}

SUBMISSION:
"""
${submissionText}
"""

TASK:
1) Grade the submission on 0-100.
2) List strengths, improvements, and 5 concrete next actions.
3) Mark pass=true only if it meets the week's bar.

OUTPUT FORMAT:
Return ONLY raw JSON (no markdown):
{
  "score": 82,
  "feedback": "2-4 sentences.",
  "strengths": ["..."],
  "improvements": ["..."],
  "nextActions": ["..."],
  "pass": true
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedText);

    return {
      score: typeof parsed.score === 'number' ? parsed.score : 0,
      feedback: parsed.feedback || '',
      strengths: parsed.strengths || [],
      improvements: parsed.improvements || [],
      nextActions: parsed.nextActions || [],
      pass: !!parsed.pass
    };
  } catch (error) {
    console.error('Journey grading failed:', error);
    return {
      score: 0,
      feedback: 'Error grading submission. Please try again.',
      strengths: [],
      improvements: [],
      nextActions: [],
      pass: false
    };
  }
};
