import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PreviewPanel({ isOpen, onClose, survey }) {
  if (!isOpen) return (
    <button 
      className="btn btn-outline flex items-center gap-8" 
      style={{ position: 'fixed', bottom: '30px', right: '30px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', background: 'white' }}
      onClick={() => onClose(true)}
    >
      <Eye size={18} /> 설문 미리보기
    </button>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ width: '450px', background: 'white', height: '100%', padding: '40px', overflowY: 'auto' }}>
        <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '20px', margin: 0 }}>설문지 미리보기</h2>
          <button onClick={() => onClose(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><EyeOff size={24} /></button>
        </div>
        
        <div style={{ padding: '20px', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
          <h1 style={{ fontSize: '22px' }}>{survey.title}</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>{survey.description}</p>
          <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #eee' }} />
          {survey.questions.map(q => (
            <div key={q.id} style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '8px' }}>{q.id}. {q.text}</div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                {q.type === 'choice' ? `선택형 (${q.options.join(', ')})` : '주관식'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
