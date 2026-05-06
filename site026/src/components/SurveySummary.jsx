import React from 'react';
import { UserCheck, Clock, FileText } from 'lucide-react';

export default function SurveySummary({ respondent, currentIdx, total, answers }) {
  const answeredCount = Object.keys(answers).length;

  return (
    <aside className="summary-panel">
      <h3 style={{ fontSize: '18px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>응답 현황</h3>
      
      <div style={{ display: 'grid', gap: '20px' }}>
        <div className="flex items-start gap-12" style={{ display: 'flex', gap: '12px' }}>
          <UserCheck size={20} color="var(--primary)" />
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>응답자</div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>{respondent.name || '방문자'}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{respondent.email || '이메일 미입력'}</div>
          </div>
        </div>

        <div className="flex items-start gap-12" style={{ display: 'flex', gap: '12px' }}>
          <FileText size={20} color="var(--primary)" />
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>완료 문항</div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>{answeredCount} / {total}</div>
          </div>
        </div>

        <div className="flex items-start gap-12" style={{ display: 'flex', gap: '12px' }}>
          <Clock size={20} color="var(--primary)" />
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>예상 소요 시간</div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>약 3분</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', background: 'var(--secondary)', borderRadius: '8px', border: '1px solid #d1fae5' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700, marginBottom: '5px' }}>TIPS</div>
        <div style={{ fontSize: '12px', color: '#065f46', lineHeight: 1.5 }}>모든 필수(*) 문항에 답변하셔야 설문을 제출할 수 있습니다.</div>
      </div>
    </aside>
  );
}
