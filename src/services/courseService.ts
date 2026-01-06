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
