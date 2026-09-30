import React from 'react';
import { Star, Clock, Users, PlayCircle, BookOpen } from 'lucide-react';

export default function CourseCard({ course, onSelect }) {
  return (
    <div className="course-card" onClick={() => onSelect(course)}>
      <div className="course-img-wrapper">
        <img src={course.thumbnail} alt={course.title} className="course-img" />
        <span style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'rgba(15, 23, 42, 0.85)',
          color: '#60a5fa',
          fontSize: '11px',
          fontWeight: 700,
          padding: '3px 8px',
          borderRadius: '4px',
          border: '1px solid rgba(96, 165, 250, 0.3)'
        }}>
          {course.difficulty}
        </span>
        {course.discountRate > 0 && (
          <span style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: '#e11d48',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 800,
            padding: '3px 7px',
            borderRadius: '4px'
          }}>
            {course.discountRate}% OFF
          </span>
        )}
      </div>

      <div className="course-content">
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>
          {course.instructor}
        </div>
        <h4 style={{
          fontSize: '15px',
          fontWeight: 700,
          color: 'var(--text-main)',
          marginBottom: '8px',
          lineHeight: 1.4,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          minHeight: '42px'
        }}>
          {course.title}
        </h4>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: 700 }}>
            <Star size={13} fill="#f59e0b" color="#f59e0b" /> {course.rating}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={13} /> {course.duration.split(' ')[0]}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={13} /> {course.studentCount}명 수강
          </span>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
          <div>
            {course.discountRate > 0 && (
              <span style={{ fontSize: '12px', color: 'var(--text-light)', textDecoration: 'line-through', marginRight: '6px' }}>
                ₩{course.price.toLocaleString()}
              </span>
            )}
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
              ₩{(course.finalPrice || course.price).toLocaleString()}
            </div>
          </div>

          <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <PlayCircle size={12} /> 강의 보기
          </span>
        </div>
      </div>
    </div>
  );
}
