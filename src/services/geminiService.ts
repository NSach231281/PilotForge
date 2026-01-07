import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * HELPER: Keeps your tooltips working
 * CHANGED: Switched to 'gemini-pro' to fix the 404 error
 */
export const getJobSpecificContext = async (role: string, domain: string, tool: string) => {
  try {
    if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY is missing");
    
    // FIX: Use standard model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `Explain why learning ${tool} is critical for a ${role} in ${domain} in the context of the Indian market. Max 50 words.` }] }],
    });
    return result.response.text();
  } catch (error) {
    return `Mastering ${tool} allows a ${role} to automate core workflows in the Indian ${domain} sector.`;
  }
};

/**
 * MAIN ENGINE: Universal "Manual JSON" Mode
 * Works by stripping markdown instead of relying on API Schema enforcement.
 */
export const generateAILearningContent = async (topic: string, domain: string) => {
  try {
    if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY is missing");

    // FIX: Use standard model (gemini-pro) which is universally supported
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Act as a Professor at a top Indian Business School. 
      Create a 'Harvard-Style' Case Study for: "${topic}" in domain "${domain}".
      
      CRITICAL INSTRUCTIONS:
      1. Context must be strictly INDIAN (use specific cities like Mumbai/Bangalore, currency INR, GST, etc.).
      2. The story must involve a Crisis.
      3. The solution must require DATA ANALYTICS.
      
      OUTPUT FORMAT:
      Return ONLY a raw JSON object. Do not include markdown formatting (like \`\`\`json).
      
      The JSON must match this structure exactly:
      {
        "caseTitle": "Catchy Title",
        "protagonist": "Name and Role",
        "companyContext": "Context description",
        "narrative": "3-paragraph story",
        "strategicQuestions": ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"],
        "datasetContext": {
          "filename": "data.csv",
          "columns": ["Col1", "Col2"],
          "messyFactors": ["Error 1", "Error 2"],
          "previewRows": [
             "{\"col1\": \"val1\", \"col2\": \"val2\"}",
             "{\"col1\": \"val1\", \"col2\": \"val2\"}",
             "{\"col1\": \"val1\", \"col2\": \"val2\"}"
          ]
        },
        "modules": [
          { "title": "Module 1", "description": "Desc", "technicalSkill": "Skill" },
          { "title": "Module 2", "description": "Desc", "technicalSkill": "Skill" }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // CLEANUP: The AI might wrap the response in ```json ... ```. We strip that.
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanedText);

  } catch (error: any) {
    console.error("Content Gen Error:", error);
    const errorMessage = error?.message || "Unknown Error";

    return { 
      caseTitle: "Connection Error", 
      narrative: `TECHNICAL ERROR DETAILS: ${errorMessage}`,
      strategicQuestions: [], 
      modules: [],
      datasetContext: { filename: "error.csv", columns: [], messyFactors: [], previewRows: [] }
    };
  }
};
