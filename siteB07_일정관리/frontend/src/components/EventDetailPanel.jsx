import React from 'react';
import { REMINDER_LABEL, REPEAT_LABEL, STATUS_LABEL, labelDay } from '../utils/date';

// 캘린더에서 일정을 선택했을 때 열리는 우측 상세 패널
export default function EventDetailPanel({ event, onClose, onOpenDetail }) {
  return (
    <aside className="card detail-panel" style={{ '--ev': event.color }} aria-label="일정 상세 패널">
      <div className="panel-head">
        <span className="dot" />
        <h2>{event.title}</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="상세 패널 닫기">×</button>
      </div>
      <dl className="kv">
        <dt>날짜</dt><dd>{labelDay(event.startDate)}{event.endDate !== event.startDate ? ` ~ ${labelDay(event.endDate)}` : ''}</dd>
        <dt>시간</dt><dd>{event.startTime} – {event.endTime}</dd>
        <dt>카테고리</dt><dd>{event.category}</dd>
        <dt>장소</dt><dd>{event.location || '-'}</dd>
        <dt>반복</dt><dd>{REPEAT_LABEL[event.repeatRule]}</dd>
        <dt>알림</dt><dd>{REMINDER_LABEL[event.reminder]}</dd>
        <dt>상태</dt><dd>{STATUS_LABEL[event.status]}</dd>
        <dt>메모</dt><dd>{event.description || '-'}</dd>
      </dl>
      <button type="button" className="btn primary block" onClick={() => onOpenDetail(event.id)}>상세 페이지 열기</button>
    </aside>
  );
}
