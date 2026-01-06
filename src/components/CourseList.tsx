import React, { useEffect, useState } from 'react';
import { getCourses } from '../services/courseService';
import { Course } from '../types';

const CourseList: React.FC = () => {
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

  if (loading) return <div>Loading courses...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Available Courses</h2>
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {courses.map((course) => (
          <div key={course.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <span style={{ 
              backgroundColor: '#eee', 
              padding: '4px 8px', 
              borderRadius: '4px', 
              fontSize: '0.8rem' 
            }}>
              {course.difficulty}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseList;
