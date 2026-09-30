import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  BookOpen, 
  Sparkles, 
  ChevronLeft,
  ShieldCheck,
  Send
} from 'lucide-react';
import AnnouncementList from '../components/AnnouncementList';
import Modal from '../components/Modal';
import { fetchApi, getCurrentUser } from '../api/client';

export default function ClassDetail({ classId, onBack, onEnrollComplete, onShowToast }) {
  const [cls, setCls] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const currentUser = getCurrentUser();

  const loadDetail = () => {
    if (!classId) return;
    setLoading(true);

    Promise.all([
      fetchApi(`/api/classes/${classId}`),
      fetchApi(`/api/classes/${classId}/announcements`)
    ])
      .then(([classData, annData]) => {
        setCls(classData);
        setAnnouncements(annData);
        setLoading(false);
      })
      .catch(err => {
        if (onShowToast) onShowToast(err.message, 'error');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDetail();
  }, [classId]);

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        클래스 상세 정보를 불러오는 중입니다...
      </div>
    );
  }

  if (!cls) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <h3>클래스 정보를 찾을 수 없습니다.</h3>
        <button onClick={onBack} className="btn btn-primary" style={{ marginTop: 16 }}>
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  const isFull = cls.enrolled >= cls.capacity;

  const handleEnroll = () => {
    setEnrolling(true);
    fetchApi('/api/enrollments', {
      method: 'POST',
      body: JSON.stringify({ classId: cls.id })
    })
      .then(newEnrollment => {
        setEnrolling(false);
        if (onShowToast) onShowToast(`'${cls.title}' 수강 신청이 완료되었습니다!`, 'success');
        if (onEnrollComplete) onEnrollComplete();
      })
      .catch(err => {
        setEnrolling(false);
        if (onShowToast) onShowToast(err.message, 'error');
      });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Back Button */}
      <div>
        <button 
          id="btn-back-to-search"
          onClick={onBack}
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <ChevronLeft size={16} /> 클래스 목록으로
        </button>
      </div>

      {/* Main Grid: Details (Left) + Sticky Enrollment Box (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: 32, alignItems: 'start' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span className="badge badge-blue">{cls.category}</span>
              <span className="badge badge-gray"><MapPin size={12} /> {cls.region}</span>
              {isFull && <span className="badge badge-red">마감</span>}
            </div>

            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--primary-navy)', lineHeight: 1.3, marginBottom: 12 }}>
              {cls.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16, fontSize: 14, color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={15} color="var(--soft-blue)" /> {cls.date}
              </span>
              <span>|</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={15} color="var(--soft-blue)" /> {cls.time} ({cls.duration})
              </span>
              <span>|</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Users size={15} color="var(--soft-blue)" /> 정원 {cls.capacity}명 (현재 {cls.enrolled}명 신청)
              </span>
            </div>
          </div>

          {/* Image */}
          <div style={{
            position: 'relative',
            width: '100%',
            paddingTop: '56.25%',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <img 
              src={cls.image} 
              alt={cls.title}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>

          {/* Instructor Box */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}>
            <img 
              src={cls.instructorAvatar} 
              alt={cls.instructorName} 
              style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 600 }}>담당 강사</span>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary-navy)' }}>{cls.instructorName}</h4>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>전문가 인증 완료 · 평점 4.9</p>
            </div>
          </div>

          {/* Description */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            border: '1px solid var(--border-color)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 14 }}>
              클래스 소개
            </h3>
            <p style={{ fontSize: 15, color: 'var(--text-main)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {cls.description}
            </p>
          </div>

          {/* Curriculum & Materials */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 10 }}>
                수업 커리큘럼
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-main)', lineHeight: 1.6 }}>
                {cls.curriculum}
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 8 }}>
                준비물 및 제공 내역
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                <CheckCircle2 size={16} color="var(--soft-blue)" style={{ verticalAlign: 'middle', marginRight: 6 }} />
                {cls.materials}
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 8 }}>
                진행 장소
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                <MapPin size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                {cls.location}
              </p>
            </div>
          </div>

          {/* Announcements Section (SEC-416) */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            border: '1px solid var(--border-color)'
          }}>
            <AnnouncementList
              announcements={announcements}
              classId={cls.id}
              onRefresh={loadDetail}
              onShowToast={onShowToast}
              isInstructor={currentUser.role === 'instructor' || currentUser.id === cls.instructorId}
            />
          </div>
        </div>

        {/* Right Sticky Enrollment Panel */}
        <div style={{ position: 'sticky', top: 96 }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}>
            <div>
              <span className="badge badge-beige">수강 모집 중</span>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary-navy)', marginTop: 8 }}>
                {cls.title}
              </h3>
            </div>

            <div style={{
              backgroundColor: 'var(--cream-bg)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              fontSize: 13
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>일정</span>
                <strong style={{ color: 'var(--primary-navy)' }}>{cls.date}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>시간</span>
                <strong style={{ color: 'var(--primary-navy)' }}>{cls.time}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>장소</span>
                <strong style={{ color: 'var(--primary-navy)' }}>{cls.region}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>모집 현황</span>
                <strong style={{ color: isFull ? 'var(--danger)' : 'var(--soft-blue)' }}>{cls.enrolled} / {cls.capacity}명</strong>
              </div>
            </div>

            {/* Capacity Progress Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                <span>정원 달성률</span>
                <span>{Math.round((cls.enrolled / cls.capacity) * 100)}%</span>
              </div>
              <div style={{ width: '100%', height: 8, backgroundColor: '#e2e8f0', borderRadius: 9999, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, (cls.enrolled / cls.capacity) * 100)}%`,
                  height: '100%',
                  backgroundColor: isFull ? 'var(--danger)' : 'var(--soft-blue)',
                  borderRadius: 9999
                }} />
              </div>
            </div>

            {/* Action Button */}
            <button
              id="btn-apply-class"
              onClick={handleEnroll}
              disabled={isFull || enrolling}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
            >
              {isFull ? '신청 마감' : (enrolling ? '신청 처리 중...' : '클래스 신청하기')}
            </button>

            <p style={{ fontSize: 11, color: 'var(--text-light)', textAlign: 'center' }}>
              신청 완료 시 강사님께 알림이 전송되며 상세 공지사항을 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
