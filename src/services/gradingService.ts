import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface GradingResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
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
