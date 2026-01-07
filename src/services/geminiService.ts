// NOTE: Using Direct Fetch to v1 Stable API
// This bypasses all library version issues and "beta" model restrictions.

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

/**
 * HELPER: Tooltips
 */
export const getJobSpecificContext = async (role: string, domain: string, tool: string) => {
  try {
    if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY is missing");

    // FIX 1: Use 'v1' (Stable) instead of 'v1beta'
    // FIX 2: Use 'gemini-pro' (The standard model everyone has)
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Explain why learning ${tool} is critical for a ${role} in ${domain} in the context of the Indian market. Max 50 words.`
          }]
        }]
      })
    });

    const data = await response.json();
    
    // Safety check in case of error
    if (!data.candidates || data.candidates.length === 0) {
        return `Mastering ${tool} allows a ${role} to automate core workflows in the Indian ${domain} sector.`;
    }

    return data.candidates[0].content.parts[0].text;
    
  } catch (error) {
    console.error("Tooltip Error:", error);
    return `Mastering ${tool} allows a ${role} to automate core workflows in the Indian ${domain} sector.`;
  }
};

/**
 * MAIN ENGINE: Generation
 */
export const generateAILearningContent = async (topic: string, domain: string) => {
  try {
    if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY is missing");

    // FIX 1: Use 'v1' (Stable)
    // FIX 2: Use 'gemini-pro'
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

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

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || "API Request Failed");
    }

    const data = await response.json();
    
    // Safety Check
    if (!data.candidates || !data.candidates[0].content) {
        throw new Error("AI returned empty response. Try again.");
    }

    const text = data.candidates[0].content.parts[0].text;

    // CLEANUP: Strip markdown
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
