import React, { useState, useEffect } from 'react';
import { Star, Clock, Users, ArrowLeft, CheckCircle2, PlayCircle, BookOpen, Send, Award, ShieldCheck } from 'lucide-react';

export default function CourseDetail({ course, onBack, onNavigate, onShowToast }) {
  const [reviews, setReviews] = useState([]);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    if (course?.id) {
      fetch(`/api/courses/${course.id}/reviews`)
        .then(res => res.json())
        .then(data => setReviews(data))
        .catch(console.error);
    }
  }, [course]);

  if (!course) return null;

  // SEC-380: Course Review Submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewContent.trim()) return;

    try {
      const res = await fetch(`/api/courses/${course.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: reviewTitle.trim() || '수강 만족 후기',
          content: reviewContent.trim(),
          rating
        })
      });
      const data = await res.json();
      if (data.success) {
        setReviews([data.review, ...reviews]);
        setReviewTitle('');
        setReviewContent('');
        onShowToast({
          title: '강의 후기 등록 완료',
          message: '소중한 수강 리뷰가 성공적으로 등록되었습니다.',
          type: 'success',
          bugId: data.bugId,
          secId: data.secId,
          reqId: data.request_id
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnroll = async () => {
    try {
      await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id })
      });
      onNavigate('mylearning');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <button
        className="btn btn-secondary btn-sm"
        onClick={onBack}
        style={{ width: 'fit-content' }}
      >
        <ArrowLeft size={15} /> 강의 목록으로 돌아가기
      </button>

      {/* Main Course Info Header */}
      <div className="grid-layout grid-2" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
        <div>
          <span className="badge badge-blue" style={{ marginBottom: '10px' }}>{course.category.toUpperCase()}</span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px', lineHeight: 1.3 }}>
            {course.title}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
            {course.description}
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: 700 }}>
              <Star size={15} fill="#f59e0b" color="#f59e0b" /> {course.rating} ({course.reviewCount}개 후기)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={15} /> {course.duration}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={15} /> {course.studentCount}명 수강 중
            </span>
          </div>

          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>담당 강사</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
              {course.instructor}
            </div>
          </div>
        </div>

        {/* Enrollment Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <img
            src={course.thumbnail}
            alt={course.title}
            style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '18px' }}
          />

          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>수강료 (평생 소장)</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
              {course.discountRate > 0 && (
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#e11d48' }}>
                  {course.discountRate}%
                </span>
              )}
              <span style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)' }}>
                ₩{(course.finalPrice || course.price).toLocaleString()}
              </span>
              {course.discountRate > 0 && (
                <span style={{ fontSize: '0.95rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                  ₩{course.price.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', height: '46px', fontSize: '15px', marginBottom: '10px' }}
            onClick={handleEnroll}
          >
            수강 신청하고 바로 학습하기
          </button>

          <button
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center', height: '42px', fontSize: '13px' }}
            onClick={() => onNavigate('coupons')}
          >
            할인 쿠폰 적용하기
          </button>
        </div>
      </div>

      {/* Curriculum & Reviews */}
      <div className="grid-layout grid-2" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* Curriculum */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} color="var(--primary)" /> 상세 커리큘럼
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {course.curriculum?.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 14px',
                  background: '#f8fafc',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-main)'
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* SEC-380: Course Reviews */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
            수강생 리뷰 작성 & 후기 ({reviews.length}건)
          </h3>

          <form onSubmit={handleReviewSubmit} style={{ marginBottom: '20px', background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label className="form-label">후기 제목</label>
              <input
                type="text"
                className="form-input"
                placeholder="한 줄 요약을 입력하세요."
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label className="form-label">수강 평점</label>
              <select
                className="form-input"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                <option value={5}>★★★★★ (5점 만점)</option>
                <option value={4}>★★★★☆ (4점)</option>
                <option value={3}>★★★☆☆ (3점)</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">후기 내용 *</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="강의 수강 후기와 만족도를 솔직하게 남겨주세요."
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
              <Send size={13} /> 수강 후기 등록
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '320px', overflowY: 'auto' }}>
            {reviews.map((r) => (
              <div
                key={r.id}
                style={{
                  padding: '12px',
                  background: '#ffffff',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>{r.userName}</span>
                  <span style={{ color: '#f59e0b', fontSize: '12px' }}>{'★'.repeat(r.rating || 5)}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-main)', marginBottom: '2px' }}>{r.title}</div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
