import React, { useState, useEffect } from 'react';
import { Search, Star } from 'lucide-react';

export default function CourseList({ categories }) {
  const [courses, setCourses] = useState([]);
  const [activeCategory, setActiveCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let url = `/api/courses?category=${activeCategory}`;
    if (searchQuery) url += `&search=${searchQuery}`;
    if (filter !== 'all') url += `&filter=${filter}`;

    fetch(url)
      .then(res => res.json())
      .then(data => setCourses(data.data));
  }, [activeCategory, searchQuery, filter]);

  return (
    <div>
      <h1 className="page-title">강의 목록</h1>
      
      <div className="controls-bar">
        <div className="category-tabs">
          {categories.map(cat => (
            <button 
              key={cat}
              className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="search-box">
            <Search size={16} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="강의, 강사 검색" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">상태 전체</option>
            <option value="in-progress">진행 중</option>
            <option value="completed">수강 완료</option>
          </select>
        </div>
      </div>

      <div className="course-grid">
        {courses.map(course => {
          // INTENTIONAL GUI BUG: site004-bug02
          // Type: component-rendering
          // Description: 강의 목록에서 특정 강의 카드가 조건부 렌더링 문제로 사라진다.
          // Explanation: id가 103인 강의(데이터 기반 디지털 마케팅)의 경우 null을 반환하여 화면에 렌더링되지 않게 만듦.
          if (course.id === 103) {
            return <div key={course.id} data-bug-id="site004-bug02" style={{ display: 'none' }}></div>;
          }

          return (
            <div key={course.id} className="course-card">
              <div className="course-thumbnail">
                {course.category === '프로그래밍' ? '💻' : course.category === '디자인' ? '🎨' : '📈'}
              </div>
              <div className="course-info">
                <div className="course-cat">{course.category}</div>
                <div className="course-title">{course.title}</div>
                <div className="course-instructor">{course.instructor} 강사</div>
                
                <div className="course-meta">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={14} fill="currentColor" color="#f59e0b" />
                    {course.rating} ({course.students}명)
                  </span>
                  <span className="course-price">
                    {course.price.toLocaleString()}원
                  </span>
                </div>
                
                {course.status === 'available' ? (
                  /* INTENTIONAL GUI BUG: site004-bug01
                     Type: button-no-response
                     Description: "수강신청" 버튼이 클릭되어도 신청 상태로 바뀌지 않는다.
                     Explanation: onClick 핸들러 누락 */
                  <button 
                    className="btn-enroll"
                    data-bug-id="site004-bug01"
                    onClick={() => {}}
                  >
                    수강신청
                  </button>
                ) : (
                  <div className="progress-container">
                    <div className="progress-label">
                      <span>{course.status === 'completed' ? '수강 완료' : '수강 중'}</span>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{course.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${course.progress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {courses.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            검색 결과가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
