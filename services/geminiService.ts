
import { GoogleGenAI } from "@google/genai";

/**
 * Fetches job-specific context using Gemini based on the user's role and domain.
 * Follows @google/genai guidelines by initializing inside the function to ensure the current API key is used.
 */
export const getJobSpecificContext = async (role: string, domain: string, tool: string) => {
  try {
    // Initialize GoogleGenAI instance right before the call as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explain why learning ${tool} is critical for a ${role} in ${domain} in the context of the Indian market. Keep it punchy, outcome-focused, and mention one specific high-impact use case. Max 100 words.`,
      config: {
        temperature: 0.7,
      }
    });
    // Correctly accessing the text property (not a method) as per the latest SDK spec
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "This skill will help you automate repetitive tasks and drive 10x better decision-making in your current role.";
  }
};
