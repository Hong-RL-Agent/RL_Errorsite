import React, { useState } from 'react';

const TeacherProfiles = ({ teachers }) => {
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  return (
    <div style={{ marginTop: '40px' }}>
      <h2 className="section-title">베테랑 강사진</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
        {teachers.map(t => (
          <div key={t.id} style={{ textAlign: 'center' }}>
            <img 
              src={t.image} 
              alt={t.name} 
              style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '4px solid white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', cursor: 'pointer' }} 
              onClick={() => setSelectedTeacher(t)}
            />
            <h3 style={{ marginTop: '15px', color: 'var(--primary)' }}>{t.name} 강사</h3>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>{t.subject} / 경력 {t.experience}</p>
            <button 
              className="btn btn-outline" 
              style={{ marginTop: '15px', padding: '5px 15px', fontSize: '0.85rem' }}
              onClick={() => setSelectedTeacher(t)}
            >
              프로필 보기
            </button>
          </div>
        ))}
      </div>

      {selectedTeacher && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', maxWidth: '500px', width: '90%', position: 'relative' }}>
            <button 
              style={{ position: 'absolute', top: '15px', right: '15px', fontSize: '1.5rem', fontWeight: '700' }}
              onClick={() => setSelectedTeacher(null)}
            >
              ×
            </button>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <img src={selectedTeacher.image} alt={selectedTeacher.name} style={{ width: '120px', height: '120px', borderRadius: '50%' }} />
              <h2 style={{ marginTop: '15px', color: 'var(--primary)' }}>{selectedTeacher.name} 강사</h2>
              <p style={{ color: 'var(--text-gray)' }}>{selectedTeacher.subject} 전문</p>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <h4 style={{ marginBottom: '10px' }}>대표 경력</h4>
              <p style={{ fontSize: '0.95rem', marginBottom: '20px' }}>{selectedTeacher.experience} 강의 경력</p>
              <h4 style={{ marginBottom: '10px' }}>소개</h4>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{selectedTeacher.description}</p>
            </div>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '30px' }}
              onClick={() => {
                alert('상담 신청이 완료되었습니다. 담당자가 곧 연락드리겠습니다.');
                setSelectedTeacher(null);
              }}
            >
              이 강사님께 상담 신청하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherProfiles;
