import React, { useState, useEffect } from 'react';
import { Layers, PlusCircle, Users, Calendar, CheckCircle2, AlertCircle, Clock, BookOpen } from 'lucide-react';
import ClassCard from '../components/ClassCard';
import Modal from '../components/Modal';
import { fetchApi, getCurrentUser } from '../api/client';

export default function InstructorDashboard({ onSelectClass, onShowToast }) {
  const [instructorClasses, setInstructorClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [activeTab, setActiveTab] = useState('classes');
  const [loading, setLoading] = useState(true);

  // Create Class Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('도예');
  const [location, setLocation] = useState('서울 성동구 성수이로');
  const [region, setRegion] = useState('서울 성동구');
  const [date, setDate] = useState('2026-10-15');
  const [time, setTime] = useState('14:00 - 16:00');
  const [capacity, setCapacity] = useState(6);
  const [description, setDescription] = useState('');
  const [materials, setMaterials] = useState('수업 실습 재료 일체 포함');

  const currentUser = getCurrentUser();

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetchApi('/api/classes'),
      fetchApi('/api/enrollments')
    ])
      .then(([allClasses, allEnrollments]) => {
        // Filter for instructor classes
        const myClasses = allClasses.filter(c => c.instructorId === currentUser.id || currentUser.role === 'instructor');
        setInstructorClasses(myClasses.length > 0 ? myClasses : allClasses.slice(0, 4));
        setEnrollments(allEnrollments);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [currentUser.id]);

  const handleCreateClass = (e) => {
    e.preventDefault();
    fetchApi('/api/classes', {
      method: 'POST',
      body: JSON.stringify({
        title,
        category,
        location,
        region,
        date,
        time,
        capacity: Number(capacity),
        description,
        materials
      })
    })
      .then(newCls => {
        setShowCreateModal(false);
        setTitle('');
        setDescription('');
        if (onShowToast) onShowToast(`'${newCls.title}' 클래스가 등록되었습니다!`, 'success');
        loadData();
      })
      .catch(err => {
        if (onShowToast) onShowToast(err.message, 'error');
      });
  };

  // Change Attendance Status
  const handleUpdateAttendance = (enrollmentId, newAttendance) => {
    fetchApi(`/api/enrollments/${enrollmentId}/attendance`, {
      method: 'PATCH',
      body: JSON.stringify({ attendance: newAttendance })
    })
      .then(() => {
        if (onShowToast) onShowToast(`출석 상태가 '${newAttendance}'(으)로 변경되었습니다.`, 'success');
        setEnrollments(prev => prev.map(e => e.id === enrollmentId ? { ...e, attendance: newAttendance } : e));
      })
      .catch(err => {
        if (onShowToast) onShowToast(err.message, 'error');
      });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 32px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <span className="badge badge-blue" style={{ marginBottom: 6 }}>INSTRUCTOR PORTAL</span>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-navy)' }}>
            강사 센터 & 워크숍 관리
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
            개설 클래스 운영, 수강생 출석 체크 및 신규 원데이 클래스를 등록하세요.
          </p>
        </div>

        <button 
          id="btn-open-create-class"
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <PlusCircle size={18} />
          <span>신규 클래스 개설</span>
        </button>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--soft-blue)' }}>
            <BookOpen size={20} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>운영 중인 클래스</span>
          </div>
          <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-navy)', marginTop: 8 }}>
            {instructorClasses.length}개
          </p>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#10b981' }}>
            <Users size={20} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>총 수강 신청자</span>
          </div>
          <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-navy)', marginTop: 8 }}>
            {enrollments.length}명
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
        <button
          id="instructor-tab-classes"
          onClick={() => setActiveTab('classes')}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            color: activeTab === 'classes' ? 'var(--soft-blue)' : 'var(--text-muted)',
            backgroundColor: activeTab === 'classes' ? 'var(--soft-blue-light)' : 'transparent'
          }}
        >
          내 개설 클래스 ({instructorClasses.length})
        </button>

        <button
          id="instructor-tab-students"
          onClick={() => setActiveTab('students')}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            color: activeTab === 'students' ? 'var(--soft-blue)' : 'var(--text-muted)',
            backgroundColor: activeTab === 'students' ? 'var(--soft-blue-light)' : 'transparent'
          }}
        >
          수강생 출석 관리 ({enrollments.length})
        </button>
      </div>

      {/* Content: Classes */}
      {activeTab === 'classes' && (
        <div className="grid-cards">
          {instructorClasses.map(cls => (
            <ClassCard
              key={cls.id}
              cls={cls}
              onSelect={onSelectClass}
            />
          ))}
        </div>
      )}

      {/* Content: Student Attendance Table */}
      {activeTab === 'students' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--cream-bg)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '14px 16px' }}>수강생</th>
                <th style={{ padding: '14px 16px' }}>신청 클래스</th>
                <th style={{ padding: '14px 16px' }}>일정</th>
                <th style={{ padding: '14px 16px' }}>현재 상태</th>
                <th style={{ padding: '14px 16px' }}>출석 관리</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map(enr => (
                <tr key={enr.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>{enr.userName} ({enr.userPhone})</td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--primary-navy)' }}>{enr.classTitle}</td>
                  <td style={{ padding: '14px 16px' }}>{enr.classDate} {enr.classTime}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`badge ${enr.status === 'enrolled' ? 'badge-blue' : (enr.status === 'completed' ? 'badge-green' : 'badge-red')}`}>
                      {enr.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {['미출석', '출석', '지각'].map(status => (
                        <button
                          key={status}
                          id={`btn-attendance-${enr.id}-${status}`}
                          onClick={() => handleUpdateAttendance(enr.id, status)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            backgroundColor: enr.attendance === status ? 'var(--soft-blue)' : '#f1f5f9',
                            color: enr.attendance === status ? '#fff' : 'var(--text-main)',
                            border: '1px solid var(--border-color)'
                          }}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Class Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="새로운 원데이 클래스 개설"
      >
        <form onSubmit={handleCreateClass} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">클래스 제목</label>
            <input
              id="input-create-class-title"
              type="text"
              placeholder="예: 힐링 도자기 화병 만들기 클래스"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">카테고리</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-select">
                <option value="도예">도예</option>
                <option value="베이킹">베이킹</option>
                <option value="드로잉">드로잉</option>
                <option value="사진">사진</option>
                <option value="공예">공예</option>
                <option value="운동">운동</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">지역</label>
              <select value={region} onChange={(e) => { setRegion(e.target.value); setLocation(e.target.value); }} className="form-select">
                <option value="서울 성동구">성수/성동</option>
                <option value="서울 마포구">홍대/연남</option>
                <option value="서울 강남구">강남/신사</option>
                <option value="서울 서초구">서초/반포</option>
                <option value="경기 파주">경기/파주</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">일정 날짜</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input" required />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">정원 인원</label>
              <input type="number" min="1" max="20" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} className="form-input" required />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">상세 소개</label>
            <textarea
              rows={3}
              placeholder="수업 진행 방식과 매력을 소개해주세요."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-outline">
              취소
            </button>
            <button id="btn-submit-create-class" type="submit" className="btn btn-primary">
              클래스 개설 완료
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
