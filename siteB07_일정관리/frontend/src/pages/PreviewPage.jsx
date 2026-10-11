import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../context/AppContext';
import { clearDraft } from '../hooks/useDraftState';
import { REMINDER_LABEL, REPEAT_LABEL, labelDay } from '../utils/date';

// 작성 중인 일정의 임시 미리보기 (저장 전)
export default function PreviewPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { categories, bumpData, toast, guardOnline } = useApp();
  const [busy, setBusy] = useState(false);

  if (!state || !state.draft) return <Navigate to="/calendar/month" replace />;
  const { draft, mode, eventId } = state;
  const cat = categories.find((c) => c.id === Number(draft.categoryId));

  const save = async () => {
    if (!guardOnline()) return;
    setBusy(true);
    try {
      const body = { ...draft, categoryId: Number(draft.categoryId), repeatCount: Number(draft.repeatCount) };
      if (mode === 'edit') {
        await api.updateEvent(eventId, body);
        clearDraft(`edit-${eventId}`);
        bumpData();
        toast('일정을 수정했어요.');
        navigate(`/events/${eventId}`, { replace: true });
      } else {
        const res = await api.createEvent(body);
        bumpData();
        toast('일정을 저장했어요.');
        navigate(`/events/${res.data.id}`, { replace: true });
      }
    } catch (e) {
      toast(e.message);
      setBusy(false);
    }
  };

  return (
    <div className="single-col">
      <div className="toolbar"><h1>임시 미리보기</h1></div>
      <section className="card detail-card" style={{ '--ev': cat ? cat.color : '#9aa3b2' }}>
        <p className="notice soft">아직 저장되지 않은 내용이에요.</p>
        <div className="detail-title"><span className="dot" /><h1>{draft.title || '(제목 없음)'}</h1></div>
        <dl className="kv wide">
          <dt>날짜</dt><dd>{labelDay(draft.startDate)}{draft.endDate !== draft.startDate ? ` ~ ${labelDay(draft.endDate)}` : ''}</dd>
          <dt>시간</dt><dd>{draft.startTime} – {draft.endTime}</dd>
          <dt>카테고리</dt><dd>{cat ? cat.name : '-'}</dd>
          <dt>장소</dt><dd>{draft.location || '-'}</dd>
          <dt>반복</dt><dd>{REPEAT_LABEL[draft.repeatRule]}</dd>
          <dt>알림</dt><dd>{REMINDER_LABEL[draft.reminder]}</dd>
          <dt>상세 메모</dt><dd>{draft.description || '-'}</dd>
        </dl>
        <div className="editor-actions">
          <button type="button" className="btn ghost" onClick={() => navigate(-1)}>‹ 작성 화면으로 돌아가기</button>
          <button type="button" className="btn primary" disabled={busy} onClick={save}>이 내용으로 저장</button>
        </div>
      </section>
    </div>
  );
}
