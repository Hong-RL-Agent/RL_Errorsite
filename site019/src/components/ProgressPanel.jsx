import React from 'react';
import { Book, Clock, TrendingUp } from 'lucide-react';

export default function ProgressPanel({ progress }) {
  const avgProgress = progress.length > 0 
    ? Math.round(progress.reduce((acc, curr) => acc + curr.percentage, 0) / progress.length)
    : 0;

  return (
    <aside className="progress-panel">
      <h3 style={{fontSize: '1.25rem', marginBottom: '1.5rem'}} className="flex items-center gap-2">
        <TrendingUp size={20} className="text-primary" /> 내 학습 현황
      </h3>
      
      <div className="flex justify-between items-center" style={{marginBottom: '2rem'}}>
        <div>
          <p className="text-muted" style={{fontSize: '0.875rem'}}>수강 중인 강의</p>
          <p style={{fontSize: '1.5rem', fontWeight: 700}}>{progress.length}개</p>
        </div>
        <div style={{textAlign: 'right'}}>
          <p className="text-muted" style={{fontSize: '0.875rem'}}>평균 진도율</p>
          <p style={{fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)'}}>{avgProgress}%</p>
        </div>
      </div>

      <h4 style={{fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem'}}>최근 학습 강의</h4>
      
      {progress.length === 0 ? (
        <p className="text-muted" style={{fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0'}}>수강 중인 강의가 없습니다.</p>
      ) : (
        progress.map(p => (
          <div key={p.id} className="progress-item">
            <div className="flex justify-between" style={{fontSize: '0.875rem', marginBottom: '0.25rem'}}>
              <span style={{fontWeight: 500, display: 'inline-block', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{p.courseTitle}</span>
              <span className="text-muted flex items-center gap-1"><Clock size={12}/> {p.lastStudied}</span>
            </div>
            <div className="flex justify-between items-center" style={{fontSize: '0.75rem', fontWeight: 700}}>
              <span>진도율</span>
              <span>{p.percentage}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{width: `${p.percentage}%`}}></div>
            </div>
          </div>
        ))
      )}
      
      <button className="btn btn-outline" style={{width: '100%', marginTop: '1rem'}} onClick={() => alert('준비중입니다.')}>
        전체 대시보드 보기
      </button>
    </aside>
  );
}
