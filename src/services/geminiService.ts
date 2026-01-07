const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

/**
 * UTILITY: The "Model Hunter"
 * Finds a working model so we stop guessing.
 */
async function findWorkingModel(baseUrl: string): Promise<string> {
  try {
    // 1. Ask Google what models we have access to
    const listUrl = `${baseUrl}/models?key=${API_KEY}`;
    const response = await fetch(listUrl);
    const data = await response.json();

    // 2. Log the truth to Console (Check F12 if this fails!)
    console.log("🔍 Available Models for this Key:", data);

    if (!data.models) return "models/gemini-pro"; // Fallback

    // 3. Find the best model that supports 'generateContent'
    // Priority: Flash (Fastest) -> Pro (Standard) -> Any Gemini
    const validModels = data.models.filter((m: any) => 
      m.supportedGenerationMethods?.includes("generateContent") &&
      m.name.includes("gemini")
    );

    const bestModel = 
      validModels.find((m: any) => m.name.includes("flash")) ||
      validModels.find((m: any) => m.name.includes("pro")) ||
      validModels[0];

    return bestModel ? bestModel.name : "models/gemini-pro";

  } catch (e) {
    console.warn("⚠️ Model discovery failed, defaulting to gemini-pro");
    return "models/gemini-pro";
  }
}

/**
 * HELPER: Tooltips (Job Context)
 */
export const getJobSpecificContext = async (role: string, domain: string, tool: string) => {
  try {
    if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY is missing");

    // Use v1beta because it supports the widest range of new models
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";
    const modelName = await findWorkingModel(baseUrl);
    
    const url = `${baseUrl}/${modelName}:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `Explain why learning ${tool} is critical for a ${role} in ${domain} in the context of the Indian market. Max 50 words.` }] }]
      })
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Automates core workflows.";
    
  } catch (error) {
    return `Mastering ${tool} allows a ${role} to automate core workflows in the Indian ${domain} sector.`;
  }
};

/**
 * MAIN ENGINE: Case Study Generator
 */
export const generateAILearningContent = async (topic: string, domain: string) => {
  try {
    if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY is missing");

    // 1. Find the right model dynamically
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";
    const modelName = await findWorkingModel(baseUrl);
    console.log("🚀 Using Model:", modelName);

    const url = `${baseUrl}/${modelName}:generateContent?key=${API_KEY}`;

    // 2. The Prompt
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

    // 3. The Call
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || "API Request Failed");
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0].content) {
        throw new Error("AI returned empty response. Try again.");
    }

    const text = data.candidates[0].content.parts[0].text;
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanedText);

  } catch (error: any) {
    console.error("Content Gen Error:", error);
    
    // Fallback data so the app doesn't crash while you debug
    return { 
      caseTitle: "Service Unreachable", 
      narrative: `TECHNICAL ERROR: ${error?.message || "Check Console (F12) for model details"}`,
      strategicQuestions: [], 
      modules: [],
      datasetContext: { filename: "error.csv", columns: [], messyFactors: [], previewRows: [] }
    };
  }
};
