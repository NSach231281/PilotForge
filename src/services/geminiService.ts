const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

/**
 * UTILITY: Auto-Retry Wrapper
 * If Google says "Overloaded" (503) or "Too Many Requests" (429),
 * we wait a few seconds and try again automatically.
 */
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, delay = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      
      // If success, return immediately
      if (response.ok) return response;

      // If it's NOT a traffic error (e.g., 404 Not Found, 401 Bad Key), fail immediately
      if (response.status !== 503 && response.status !== 429) {
        return response; 
      }

      // If we are here, it's a traffic error. Wait and retry.
      console.warn(`⚠️ Google is busy (Attempt ${i + 1}/${retries}). Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Increase delay for next time (Exponential Backoff: 1s -> 2s -> 4s)
      delay *= 2;

    } catch (err) {
      // Network errors (like WiFi disconnect) also trigger retries
      if (i === retries - 1) throw err;
    }
  }
  throw new Error("Max retries reached. Google is still overloaded.");
}

/**
 * UTILITY: Model Hunter
 * Finds the best available model for your key.
 */
async function findWorkingModel(baseUrl: string): Promise<string> {
  try {
    const listUrl = `${baseUrl}/models?key=${API_KEY}`;
    const response = await fetch(listUrl);
    const data = await response.json();

    if (!data.models) return "models/gemini-pro"; 

    // Filter for models that support generating content
    const validModels = data.models.filter((m: any) => 
      m.supportedGenerationMethods?.includes("generateContent") &&
      m.name.includes("gemini")
    );

    // Prefer Pro (Stable) -> Flash (Fast) -> Any
    const bestModel = 
      validModels.find((m: any) => m.name.includes("pro")) ||
      validModels.find((m: any) => m.name.includes("flash")) ||
      validModels[0];

    return bestModel ? bestModel.name : "models/gemini-pro";

  } catch (e) {
    return "models/gemini-pro";
  }
}

/**
 * HELPER: Tooltips
 */
export const getJobSpecificContext = async (role: string, domain: string, tool: string) => {
  try {
    if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY is missing");

    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";
    const modelName = await findWorkingModel(baseUrl);
    const url = `${baseUrl}/${modelName}:generateContent?key=${API_KEY}`;
    
    // USE RETRY HERE
    const response = await fetchWithRetry(url, {
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

    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";
    const modelName = await findWorkingModel(baseUrl);
    console.log("🚀 Using Model:", modelName);

    const url = `${baseUrl}/${modelName}:generateContent?key=${API_KEY}`;

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

    // USE RETRY HERE
    const response = await fetchWithRetry(url, {
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
    
    return { 
      caseTitle: "Service Unreachable", 
      narrative: `TECHNICAL ERROR: ${error?.message || "Google is currently overloaded. Please wait 1 minute and try again."}`,
      strategicQuestions: [], 
      modules: [],
      datasetContext: { filename: "error.csv", columns: [], messyFactors: [], previewRows: [] }
    };
  }
};
