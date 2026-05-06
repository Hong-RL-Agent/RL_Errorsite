import React from 'react';
import { Star, Users, Heart } from 'lucide-react';

export default function CourseCard({ course, onClick, onToggleWishlist }) {
  return (
    <div className="course-card" onClick={() => onClick(course)}>
      <div style={{position: 'relative'}}>
        <img src={course.thumbnail} alt={course.title} className="course-img" />
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(course.id); }}
          style={{
            position: 'absolute', top: '10px', right: '10px', 
            background: 'rgba(255,255,255,0.9)', padding: '0.4rem', 
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <Heart size={18} fill={course.wisher ? '#ef4444' : 'transparent'} color={course.wisher ? '#ef4444' : '#64748b'} />
        </button>
      </div>
      <div className="course-body">
        <div className="course-category">{course.category}</div>
        
        {/* INTENTIONAL GUI BUG: site019-bug01
            Type: fixed-text-size-overflow
            Description: 강의 카드 텍스트 영역을 고정 px 높이로 제한해 확대 시 텍스트가 잘림. */}
        <div data-bug-id="site019-bug01">
          <h3 className="course-title">{course.title}</h3>
        </div>
        
        <div className="course-instructor">{course.instructor} 강사</div>
        <div className="flex gap-4 text-muted" style={{fontSize: '0.875rem', marginBottom: '1rem'}}>
          <span className="flex items-center gap-1"><Star size={14} fill="#f59e0b" color="#f59e0b" /> {course.rating}</span>
          <span className="flex items-center gap-1"><Users size={14} /> {course.students}명</span>
          <span>{course.level}</span>
        </div>
        <div className="course-footer">
          <div className="course-price">₩{course.price.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
