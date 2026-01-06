import { supabase } from './supabase';
import { Course } from '../types';

export const getCourses = async (): Promise<Course[]> => {
  // 1. Ask Supabase for ALL columns (*) from the 'courses' table
  const { data, error } = await supabase
    .from('courses')
    .select('*');

  if (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }

  return data || [];
};
// ... existing imports

// New Function: Create a Course
export const createCourse = async (courseData: {
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: any;
}) => {
  const { data, error } = await supabase
    .from('courses')
    .insert([
      {
        title: courseData.title,
        description: courseData.description,
        difficulty: courseData.difficulty,
        content: courseData.content,
        // created_at is auto-handled by Supabase
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating course:', error);
    throw error;
  }
  
  return data;
};
