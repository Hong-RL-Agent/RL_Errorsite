import React, { useState, useEffect } from 'react';
import { GraduationCap, PlayCircle, Award, CheckCircle2, BookOpen } from 'lucide-react';

export default function MyLearning({ onNavigate }) {
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    fetch('/api/enrollments')
      .then(res => res.json())
      .then(data => setEnrollments(data))
      .catch(console.error);
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">내 강의실 & 학습 진도</h1>
          <p className="page-subtitle">수강 중인 강의의 진도율과 최근 학습 영상을 확인하세요.</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '18px' }}>
          수강 중인 코스 ({enrollments.length}개)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {enrollments.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '16px',
                background: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)'
              }}
            >
              <img
                src={item.thumbnail}
                alt=""
                style={{ width: '120px', height: '75px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
              />

              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  {item.courseTitle}
                </h4>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  최근 수강: {item.lastLesson}
                </div>

                {/* Progress bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${item.progressRate}%`,
                        height: '100%',
                        background: item.progressRate === 100 ? 'var(--accent)' : 'var(--primary)',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {item.progressRate}%
                  </span>
                </div>
              </div>

              <div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => alert(`[${item.courseTitle}] 강의실로 이동합니다.`)}
                >
                  <PlayCircle size={14} /> 학습 이어하기
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
