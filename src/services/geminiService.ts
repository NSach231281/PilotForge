import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * HELPER: Keeps your tooltips working
 */
export const getJobSpecificContext = async (role: string, domain: string, tool: string) => {
  try {
    if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY is missing");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `Explain why learning ${tool} is critical for a ${role} in ${domain} in the context of the Indian market. Max 50 words.` }] }],
    });
    return result.response.text();
  } catch (error) {
    return `Mastering ${tool} allows a ${role} to automate core workflows in the Indian ${domain} sector.`;
  }
};

/**
 * MAIN ENGINE: Generates Case Study AND Dataset Schema
 */
export const generateAILearningContent = async (topic: string, domain: string) => {
  try {
    if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY is missing");

    const caseStudySchema = {
      description: "A structured business case study with dataset definition",
      type: SchemaType.OBJECT,
      properties: {
        // 1. THE STORY
        caseTitle: { type: SchemaType.STRING, description: "Catchy title like 'The Diwali Stockout Crisis'" },
        protagonist: { type: SchemaType.STRING, description: "Name and role (e.g., 'Anjali, Supply Chain Lead')" },
        companyContext: { type: SchemaType.STRING, description: "Context of the Indian company" },
        narrative: { type: SchemaType.STRING, description: "3-paragraph story setting the scene of the crisis." },
        
        // 2. THE STRATEGY
        strategicQuestions: {
          type: SchemaType.ARRAY,
          description: "5 business questions the protagonist must answer",
          items: { type: SchemaType.STRING }
        },

        // 3. THE DATA
        datasetContext: {
          type: SchemaType.OBJECT,
          description: "Definition of the csv file the student will analyze",
          properties: {
            filename: { type: SchemaType.STRING, description: "e.g., 'bangalore_warehouse_v2.csv'" },
            columns: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "List of columns e.g. ['SKU', 'Lead_Time']" },
            messyFactors: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "List of data errors to fix e.g. ['Missing Zip Codes']" },
            previewRows: { 
              type: SchemaType.ARRAY, 
              description: "3 realistic rows of dummy data matching the story context",
              items: { type: SchemaType.OBJECT, properties: {} } // Allow any shape
            }
          },
          required: ["filename", "columns", "messyFactors", "previewRows"]
        },

        // 4. THE LEARNING MODULES
        modules: {
          type: SchemaType.ARRAY,
          description: "Technical learning modules",
          items: {
            type: SchemaType.OBJECT,
            properties: {
              title: { type: SchemaType.STRING },
              description: { type: SchemaType.STRING },
              technicalSkill: { type: SchemaType.STRING }
            },
            required: ["title", "description", "technicalSkill"]
          }
        }
      },
      required: ["caseTitle", "protagonist", "companyContext", "narrative", "strategicQuestions", "datasetContext", "modules"]
    };

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: caseStudySchema,
      }
    });

    const prompt = `
      Act as a Professor at a top Indian Business School. 
      Create a 'Harvard-Style' Case Study for: "${topic}" in domain "${domain}".
      
      CRITICAL CONSTRAINTS:
      1. Context must be strictly INDIAN (use specific cities, festivals, business terms).
      2. The story must involve a Crisis.
      3. The solution must require DATA ANALYTICS.
      4. GENERATE DATASET DETAILS: Create a schema for a "messy" CSV file that contains the clues to solve the case.
         - The 'previewRows' must look like real data (include specific Indian states/currencies).
      
      Return JSON matching the schema.
    `;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());

  } catch (error: any) {
    console.error("Content Gen Error:", error);
    
    // --- UPDATED DEBUG LOGIC ---
    // This captures the real error message from Google/Vercel
    const errorMessage = error?.message || "Unknown Error";

    return { 
      caseTitle: "Connection Error", 
      narrative: `TECHNICAL ERROR DETAILS: ${errorMessage}`, // <--- This will show in your UI
      strategicQuestions: [], 
      modules: [],
      datasetContext: { filename: "error.csv", columns: [], messyFactors: [], previewRows: [] }
    };
  }
};
