import React, { useEffect, useState } from 'react';
import { getCourseById } from '../services/courseService';
import { Course } from '../types';

interface CourseDetailProps {
  courseId: string;
  onBack: () => void;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ courseId, onBack }) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourse = async () => {
      const data = await getCourseById(courseId);
      setCourse(data);
      setLoading(false);
    };
    loadCourse();
  }, [courseId]);

  if (loading) return <div className="p-8 text-center">Loading Class...</div>;
  if (!course) return <div className="p-8 text-center">Course not found.</div>;

  // Safe parsing of the JSON content
  const modules = Array.isArray(course.content) ? course.content : (course.content?.modules || []);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* HEADER */}
      <button 
        onClick={onBack}
        className="text-slate-500 hover:text-slate-900 text-sm mb-6 flex items-center gap-1 font-bold"
      >
        ← Back to Catalog
      </button>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase mb-4 ${
              course.difficulty === 'beginner' ? 'bg-emerald-100 text-emerald-700' : 
              course.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-700' : 
              'bg-indigo-100 text-indigo-700'
            }`}>
              {course.difficulty}
            </span>
            <h1 className="text-3xl font-black text-slate-900 heading mb-2">{course.title}</h1>
            <p className="text-slate-600 max-w-2xl">{course.description}</p>
          </div>
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all">
            Start Learning
          </button>
        </div>
      </div>

      {/* CURRICULUM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Module List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Course Modules</h2>
          
          {modules.length === 0 ? (
            <div className="p-8 bg-slate-50 rounded-2xl text-center text-slate-500 italic">
              No modules defined yet.
            </div>
          ) : (
            modules.map((mod: any, index: number) => (
              <div key={index} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Module {index + 1}: {mod.module || mod.title}</h3>
                  <span className="text-xs font-bold text-slate-400 uppercase">{mod.lessons?.length || 0} Lessons</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {mod.lessons?.map((lesson: any, lIndex: number) => (
                    <div key={lIndex} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4 group cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs group-hover:bg-indigo-100 group-hover:text-indigo-600">
                        {lIndex + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-700">{lesson.title}</p>
                        <p className="text-xs text-slate-400">Video Lesson</p>
                      </div>
                      <button className="text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Play ►
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Stats Widget */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-3xl">
            <h3 className="font-bold mb-2">Your Progress</h3>
            <div className="w-full bg-white/10 rounded-full h-2 mb-4">
              <div className="bg-emerald-500 h-2 rounded-full w-[0%]"></div>
            </div>
            <p className="text-xs text-slate-400">0% Completed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
