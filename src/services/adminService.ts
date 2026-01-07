import { supabase } from './supabase';

/**
 * Saves the AI-generated content as a new Course in Supabase.
 */
export const publishCourseToGraph = async (
  aiOutput: any, 
  domain: string, 
  difficulty: string
): Promise<string | null> => {
  
  // 1. Construct the Course Object
  const newCourse = {
    title: aiOutput.caseTitle || "Untitled Case",
    description: aiOutput.narrative || "No description provided.",
    difficulty: difficulty.toLowerCase(),
    // We store the ENTIRE AI JSON object in the 'content' column
    content: aiOutput, 
    created_at: new Date().toISOString()
  };

  try {
    // 2. Insert into Supabase 'courses' table
    const { data, error } = await supabase
      .from('courses') 
      .insert([newCourse])
      .select()
      .single();

    if (error) throw error;
    
    return data.id; // Return the new ID so we can redirect
  } catch (error) {
    console.error("Failed to publish course:", error);
    return null;
  }
};
