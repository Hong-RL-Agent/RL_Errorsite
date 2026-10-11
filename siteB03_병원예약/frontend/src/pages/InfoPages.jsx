import { useMemo, useState } from 'react';
import { listActivity } from '../api';
import { EmptyState, ErrorBox, Spinner, StatusBadge } from '../components/common.jsx';
import { useApp } from '../hooks/AppContext.js';
import { useFetch } from '../hooks/useFetch.js';
import { go } from '../hooks/useHashRoute.js';

export function NotificationsPage() {
  const { notifs, notify } = useApp();
  const [onlyUnread, setOnlyUnread] = useState(false);
  const items = onlyUnread ? notifs.items.filter((n) => !n.is_read) : notifs.items;

  const read = async (id) => {
    try {
      await notifs.markRead(id);
    } catch (e) {
      notify('error', e.message);
    }
  };

  const readAll = async () => {
    const targets = notifs.items.filter((n) => !n.is_read);
    try {
      await Promise.all(targets.map((n) => notifs.markRead(n.id)));
      notify('success', `${targets.length}건의 알림을 읽음 처리했습니다.`);
    } catch (e) {
      notify('error', e.message);
    }
  };

  return (
    <main className="page container narrow">
      <div className="page-title">
        <h2>알림</h2>
        <p>읽지 않은 알림 {notifs.unread}건</p>
      </div>
      <div className="toolbar">
        <label className="check">
          <input type="checkbox" checked={onlyUnread} onChange={(e) => setOnlyUnread(e.target.checked)} /> 읽지 않은 알림만 보기
        </label>
        <button className="btn btn-outline btn-sm" onClick={readAll} disabled={notifs.unread === 0}>
          모두 읽음 처리
        </button>
      </div>
      {items.length === 0 ? (
        <EmptyState title="알림이 없습니다" />
      ) : (
        <ul className="notif-list" data-role="notification-list">
          {items.map((n) => (
            <li key={n.id} className={n.is_read ? 'read' : 'unread'} data-notification-id={n.id}>
              <div className="notif-body">
                <strong>{n.title}</strong>
                <p>{n.body}</p>
                <small className="muted">{n.created_at}</small>
              </div>
              <div className="notif-actions">
                {n.appointment_id && (
                  <button className="btn btn-ghost btn-sm" onClick={() => go(`/appointments/${n.appointment_id}`)}>
                    예약 보기
                  </button>
                )}
                {!n.is_read && (
                  <button className="btn btn-outline btn-sm" onClick={() => read(n.id)}>
                    읽음
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export function ActivityPage() {
  const { patientId, store } = useApp();
  const logs = useFetch(() => listActivity({ patientId, limit: 100 }), [patientId, store.list]);
  const [action, setAction] = useState('');

  const actions = useMemo(() => [...new Set((logs.data || []).map((l) => l.action))], [logs.data]);
  const rows = useMemo(() => (logs.data || []).filter((l) => !action || l.action === action), [logs.data, action]);

  return (
    <main className="page container narrow">
      <div className="page-title">
        <h2>예약 활동 로그</h2>
        <p>예약 신청·변경·취소 등 최근 활동 내역입니다.</p>
      </div>
      <div className="toolbar">
        <select className="input" value={action} onChange={(e) => setAction(e.target.value)} aria-label="활동 종류">
          <option value="">전체 활동</option>
          {actions.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </div>
      {logs.loading && !logs.data && <Spinner />}
      {logs.error && <ErrorBox error={logs.error} onRetry={logs.reload} />}
      {logs.data && rows.length === 0 && <EmptyState title="활동 내역이 없습니다" />}
      <ul className="log-list" data-role="activity-list">
        {rows.map((l) => (
          <li key={l.id}>
            <span className="log-action">{l.action}</span>
            <span className="log-detail">{l.detail}</span>
            <span className="muted small">{l.created_at}</span>
            {l.appointment_id && (
              <button className="btn btn-ghost btn-sm" onClick={() => go(`/appointments/${l.appointment_id}`)}>
                #{l.appointment_id}
              </button>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}

const FAQ = [
  ['예약은 어떻게 하나요?', '병원을 선택한 뒤 의사의 진료 일정에서 날짜와 시간을 고르고 예약 확인 창에서 예약 확정하기를 누르면 됩니다.'],
  ['예약 일정을 바꾸고 싶어요.', '내 예약에서 예약을 선택한 뒤 예약 변경 버튼으로 날짜와 시간을 다시 선택할 수 있습니다.'],
  ['방문 사유나 메모를 수정할 수 있나요?', '예약 정보 수정 버튼에서 방문 사유와 예약 메모를 수정할 수 있습니다.'],
  ['예약을 취소하면 어떻게 되나요?', '취소 즉시 해당 시간이 다른 환자에게 열리며 예약취소 상태로 기록됩니다. 진료완료·예약취소 상태는 다시 취소할 수 없습니다.'],
  ['진료대기와 예약확정의 차이는?', '진료대기는 접수된 예약이고, 병원 확정 후 예약확정으로 바뀝니다.'],
];

export function HelpPage() {
  const { handleReset, resetting } = useApp();
  const [open, setOpen] = useState(0);

  return (
    <main className="page container narrow">
      <div className="page-title">
        <h2>도움말 및 예약 안내</h2>
        <p>MediSlot 이용 방법과 예약 상태를 안내합니다.</p>
      </div>

      <section className="card-box">
        <h3>예약 진행 순서</h3>
        <ol className="steps">
          <li>병원 검색 또는 진료과 선택</li>
          <li>의사 프로필과 진료 일정 확인</li>
          <li>날짜·시간 선택 후 예약 확정</li>
          <li>내 예약에서 변경·수정·취소 관리</li>
        </ol>
      </section>

      <section className="card-box">
        <h3>예약 상태 안내</h3>
        <ul className="legend">
          <li><StatusBadge status="예약확정" /> 병원이 일정을 확정한 예약</li>
          <li><StatusBadge status="진료대기" /> 접수되어 확정을 기다리는 예약</li>
          <li><StatusBadge status="진료완료" /> 진료가 완료된 예약</li>
          <li><StatusBadge status="예약취소" /> 취소 처리된 예약</li>
        </ul>
      </section>

      <section className="card-box">
        <h3>자주 묻는 질문</h3>
        {FAQ.map(([q, a], i) => (
          <div key={q} className="faq">
            <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
              {q}
              <span>{open === i ? '−' : '+'}</span>
            </button>
            {open === i && <p className="faq-a">{a}</p>}
          </div>
        ))}
      </section>

      <section className="card-box">
        <h3>테스트 데이터 초기화</h3>
        <p className="muted">모든 예약·알림·로그를 초기 상태로 되돌리고 홈 화면으로 이동합니다.</p>
        <button className="btn btn-danger-outline" onClick={handleReset} disabled={resetting}>
          {resetting ? '초기화 중...' : '데이터 초기화'}
        </button>
      </section>
    </main>
  );
}
