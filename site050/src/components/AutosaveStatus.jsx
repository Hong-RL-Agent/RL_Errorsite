import React from 'react';
import { Check, Loader2, Cloud } from 'lucide-react';

export default function AutosaveStatus({ status = 'saved' }) {
  if (status === 'saving') {
    return (
      <div className="autosave-pill saving">
        <Loader2 size={13} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
        <span>저장 중...</span>
      </div>
    );
  }

  if (status === 'saved') {
    return (
      <div className="autosave-pill">
        <Check size={13} />
        <span>자동저장 완료</span>
      </div>
    );
  }

  return (
    <div className="autosave-pill" style={{ background: 'var(--warm-beige)', color: 'var(--text-light)' }}>
      <Cloud size={13} />
      <span>수정 대기 중</span>
    </div>
  );
}
