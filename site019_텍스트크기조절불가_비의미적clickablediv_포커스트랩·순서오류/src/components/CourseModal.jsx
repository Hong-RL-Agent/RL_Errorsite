import React from 'react';
import { X, PlayCircle, Clock, Star } from 'lucide-react';

export default function CourseModal({ course, onClose, onEnroll }) {
  if (!course) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* INTENTIONAL GUI BUG: site019-bug03
          Type: broken-focus-order
          Description: 모달 오픈 시 포커스 트랩을 적용하지 않아 Tab 이동이 배경 요소로 빠져나감. */}
      <div className="modal-content" onClick={e => e.stopPropagation()} data-bug-id="site019-bug03">
        <button className="modal-close" onClick={onClose}><X size={24} /></button>
        
        <h2>{course.title}</h2>
        
        <div className="modal-body">
          <img src={course.thumbnail} alt={course.title} style={{width: '100%', height: '250px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem'}} />
          
          <div className="flex justify-between items-center" style={{marginBottom: '1rem'}}>
            <span className="course-category">{course.category}</span>
            <span className="course-price" style={{fontSize: '1.25rem', color: 'var(--primary)'}}>₩{course.price.toLocaleString()}</span>
          </div>

          <p style={{color: 'var(--text-main)', marginBottom: '1.5rem'}}>
            이 강의에서는 현업에서 바로 사용할 수 있는 핵심 기술과 노하우를 배울 수 있습니다. {course.instructor} 강사님과 함께 지금 바로 시작하세요!
          </p>

          <div className="flex justify-between items-center" style={{background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem'}}>
            <div className="flex items-center gap-2"><Clock size={18} className="text-muted"/> 총 12시간 30분</div>
            <div className="flex items-center gap-2"><PlayCircle size={18} className="text-muted"/> 45강</div>
            <div className="flex items-center gap-2"><Star size={18} fill="#f59e0b" color="#f59e0b"/> {course.rating}</div>
          </div>

          <div style={{display: 'flex', justifyContent: 'center'}}>
            {/* INTENTIONAL GUI BUG: site019-bug02
                Type: non-semantic-clickable-element
                Description: 수강 신청 액션을 button이 아닌 div로 구현해 키보드 접근성이 떨어짐. */}
            <div 
              data-bug-id="site019-bug02" 
              className="fake-button" 
              onClick={() => onEnroll(course.id)}
            >
              수강 신청하기
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
