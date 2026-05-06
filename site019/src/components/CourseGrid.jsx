import React from 'react';
import CourseCard from './CourseCard';

export default function CourseGrid({ courses, onCourseClick, onToggleWishlist }) {
  if (courses.length === 0) {
    return <div style={{padding: '3rem', textAlign: 'center', color: 'var(--text-muted)'}}>해당 조건의 강의가 없습니다.</div>;
  }

  return (
    <div className="course-grid">
      {courses.map(course => (
        <CourseCard 
          key={course.id} 
          course={course} 
          onClick={onCourseClick} 
          onToggleWishlist={onToggleWishlist} 
        />
      ))}
    </div>
  );
}
