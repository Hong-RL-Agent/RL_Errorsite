import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import CourseCard from '../components/CourseCard';

export default function Courses({ onSelectCourse, onShowToast }) {
  const [courses, setCourses] = useState([]);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('popular');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(2);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCourses(page, sort, category, searchQuery);
  }, [page, sort, category]);

  const fetchCourses = async (p = 1, s = 'popular', c = 'all', q = '') => {
    try {
      const res = await fetch(`/api/courses?page=${p}&sort=${s}&category=${c}&q=${encodeURIComponent(q)}&limit=4`);
      const data = await res.json();
      if (data.courses) {
        setCourses(data.courses);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // SEC-375: Course Sort Trigger
  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPage(1);
    fetchCourses(1, newSort, category, searchQuery);
    onShowToast({
      title: '강의 정렬 기준 변경',
      message: `강의 목록이 [${newSort}] 기준으로 정렬되었습니다.`,
      type: 'success',
      bugId: 'site040-bug05',
      secId: 'SEC-375',
      reqId: `req-${Date.now().toString().slice(-3)}`
    });
  };

  // SEC-376: Course Pagination Trigger
  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchCourses(newPage, sort, category, searchQuery);
    onShowToast({
      title: '페이지 이동 완료',
      message: `강의 목록 ${newPage}페이지로 이동했습니다.`,
      type: 'success',
      bugId: 'site040-bug06',
      secId: 'SEC-376',
      reqId: `req-${Date.now().toString().slice(-3)}`
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCourses(1, sort, category, searchQuery);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">전체 강의 코스 탐색</h1>
          <p className="page-subtitle">프로그래밍, 데이터 분석, 디자인, 직무 역량 강화 코스를 탐색하세요.</p>
        </div>
      </div>

      {/* Filter and Sort Bar */}
      <div className="card" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '400px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '36px', height: '40px', fontSize: '13px' }}
                placeholder="강의명, 강사명 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm" style={{ height: '40px' }}>
              검색
            </button>
          </form>

          {/* Category & Sort controls */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              className="form-input"
              style={{ width: '160px', height: '40px' }}
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">전체 분야</option>
              <option value="programming">프로그래밍</option>
              <option value="data">데이터 분석</option>
              <option value="design">UX/UI 디자인</option>
              <option value="career">취업 & 포트폴리오</option>
            </select>

            {/* SEC-375: Sort Parameter */}
            <select
              className="form-input"
              style={{ width: '160px', height: '40px' }}
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="popular">수강생 많은순</option>
              <option value="rating">평점 높은순</option>
              <option value="price-low">가격 낮은순</option>
              <option value="price-high">가격 높은순</option>
            </select>
          </div>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid-layout grid-4">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onSelect={onSelectCourse}
          />
        ))}
      </div>

      {/* SEC-376: Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
        <button
          className="btn btn-secondary btn-sm"
          disabled={page <= 1}
          onClick={() => handlePageChange(Math.max(1, page - 1))}
        >
          <ChevronLeft size={15} /> 이전
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-secondary'}`}
            style={{ minWidth: '36px', justifyContent: 'center' }}
            onClick={() => handlePageChange(p)}
          >
            {p}
          </button>
        ))}

        <button
          className="btn btn-secondary btn-sm"
          disabled={page >= totalPages}
          onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
        >
          다음 <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
