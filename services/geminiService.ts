
import { GoogleGenAI, Type } from "@google/genai";

export const getJobSpecificContext = async (role: string, domain: string, tool: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explain why learning ${tool} is critical for a ${role} in ${domain} in the context of the Indian market. Keep it punchy, outcome-focused, and mention one specific high-impact use case. Max 100 words.`,
      config: {
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "This skill will help you automate repetitive tasks and drive 10x better decision-making in your current role.";
  }
};

/**
 * Generates a realistic dummy dataset schema and rows for a specific use case.
 */
export const generateAILearningContent = async (nodeLabel: string, domain: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Act as a senior curriculum designer for an Indian edtech startup. 
    Create a highly realistic dummy dataset schema and 3 rows of data for a learning module titled "${nodeLabel}" in the ${domain} domain. 
    The data must feel uniquely Indian (city names like Ludhiana, specific business terms like 'GST compliance' or 'Lorry Hire'). 
    Return as JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          context: { type: Type.STRING },
          cookbookSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
          datasetPreview: { 
            type: Type.ARRAY, 
            items: { type: Type.OBJECT, properties: {} } 
          }
        }
      }
    }
  });
  
  return JSON.parse(response.text);
};
