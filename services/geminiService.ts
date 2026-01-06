import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// 1. FIX: Use Vite's env variable syntax
// The '|| ""' prevents TypeScript from crashing if the key is missing momentarily
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

export const getJobSpecificContext = async (role: string, domain: string, tool: string) => {
  try {
    // 2. SAFETY CHECK: Don't call API if key is missing
    if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY is missing");

    // 3. MODEL UPDATE: 'gemini-3' is not public yet. Using 'gemini-1.5-flash' (fast & cheap)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `Explain why learning ${tool} is critical for a ${role} in ${domain} in the context of the Indian market. Keep it punchy, outcome-focused, and mention one specific high-impact use case. Max 100 words.` }] }],
      generationConfig: {
        temperature: 0.7,
      }
    });
    
    return result.response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback text so the app doesn't crash
    return `Mastering ${tool} allows a ${role} to automate core workflows and reduce manual errors by 40%, a key KPI in the Indian ${domain} sector.`;
  }
};

/**
 * Generates a realistic dummy dataset schema and rows for a specific use case.
 */
export const generateAILearningContent = async (nodeLabel: string, domain: string) => {
  try {
    if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY is missing");

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            context: { type: SchemaType.STRING },
            cookbookSteps: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            datasetPreview: { 
              type: SchemaType.ARRAY, 
              items: { type: SchemaType.OBJECT, properties: {} } 
            }
          }
        }
      }
    });

    const result = await model.generateContent(`Act as a senior curriculum designer for an Indian edtech startup. 
    Create a highly realistic dummy dataset schema and 3 rows of data for a learning module titled "${nodeLabel}" in the ${domain} domain. 
    The data must feel uniquely Indian (city names like Ludhiana, specific business terms like 'GST compliance' or 'Lorry Hire'). 
    Return strictly JSON.`);
    
    return JSON.parse(result.response.text());

  } catch (error) {
    console.error("Content Gen Error:", error);
    // Return empty structure to prevent UI crash
    return { context: "Error loading content.", cookbookSteps: [], datasetPreview: [] };
  }
};
