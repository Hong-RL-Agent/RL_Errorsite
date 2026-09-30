import React, { useState, useEffect } from 'react';
import { BookOpen, User, Clock, Users } from 'lucide-react';

export default function Programs({ showToast }) {
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    fetch('/api/programs')
      .then(res => res.json())
      .then(data => setPrograms(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark-900)' }}>문화 예술 아카데미 & 클래스</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>전문 예술가와 함께하는 피아노, 연기, 어반 드로잉 마스터클래스</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '26px' }}>
        {programs.map(p => (
          <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="badge badge-orchestra">아카데미</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={14} /> 정원 {p.capacity}명
                </span>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-900)', marginBottom: '8px' }}>
                {p.title}
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--gray-600)', marginBottom: '16px', lineHeight: 1.5 }}>
                {p.description}
              </p>

              <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--gray-100)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} color="#7e22ce" /> 지도강사: <strong>{p.instructor}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} color="#7e22ce" /> 수업일정: <span>{p.schedule}</span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '14px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark-900)' }}>
                ₩{p.tuition.toLocaleString()}
              </span>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => showToast('수강 신청 완료', `[${p.title}] 마스터클래스 수강 신청이 접수되었습니다.`, 'success')}
              >
                수강 신청
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
