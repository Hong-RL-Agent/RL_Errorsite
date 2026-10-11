import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useApp } from '../context/AppContext';

const LABEL = {
  event_create: '일정 생성', event_update: '일정 수정', event_delete: '일정 삭제', task_create: '할 일 추가', task_done: '할 일 완료',
  task_update: '할 일 수정', task_delete: '할 일 삭제', note_create: '메모 작성', note_update: '메모 수정', notification_read: '알림',
};

export default function ActivityPage() {
  const { dataVersion } = useApp();
  const [list, setList] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    api.activity(80).then((r) => alive && setList(r.data)).catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [dataVersion]);

  return (
    <div className="single-col">
      <div className="toolbar"><h1>최근 변경 내역</h1></div>
      <section className="card">
        {error && <p className="form-error">{error}</p>}
        {list.length === 0 && !error && <p className="muted">기록된 활동이 없어요.</p>}
        <ul className="log-list">
          {list.map((a) => (
            <li key={a.id}>
              <span><em className="tag">{LABEL[a.type] || a.type}</em>{a.detail}</span>
              <span className="muted tiny">{new Date(a.createdAt).toLocaleString('ko-KR')}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
