import React, { useEffect, useState } from 'react';
import { getCourses } from '../services/courseService';
import { Course } from '../types';

// New Interface: Defines the 'onSelectCourse' prop so App.tsx can listen for clicks
interface CourseListProps {
  onSelectCourse?: (courseId: string) => void;
}

const CourseList: React.FC<CourseListProps> = ({ onSelectCourse }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (error) {
        console.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Loading State with Tailwind styling
  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading available courses...</div>;

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <div 
          key={course.id} 
          // The Critical Link: When clicked, send ID to parent
          onClick={() => onSelectCourse && onSelectCourse(course.id)}
          className="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
        >
          {/* Difficulty Badge */}
          <div className="flex justify-between items-start mb-4">
             <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                course.difficulty === 'beginner' ? 'bg-emerald-100 text-emerald-700' : 
                course.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-700' : 
                'bg-indigo-100 text-indigo-700'
             }`}>
               {course.difficulty}
             </span>
          </div>

          {/* Title & Description */}
          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
            {course.title}
          </h3>
          <p className="text-slate-500 text-sm line-clamp-2 mb-6">
            {course.description}
          </p>

          {/* Footer Action */}
          <div className="flex items-center text-indigo-600 text-xs font-bold gap-1 mt-auto">
            <span>View Curriculum</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseList;
