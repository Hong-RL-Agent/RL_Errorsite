import { useMemo, useState } from 'react';
import AppointmentDetail from '../components/AppointmentDetail.jsx';
import { EmptyState, ErrorBox, Spinner, StatusBadge } from '../components/common.jsx';
import { useApp } from '../hooks/AppContext.js';
import { go } from '../hooks/useHashRoute.js';
import { STATUS_LIST } from '../hooks/useMyAppointments.js';

const STATUS_HINT = {
  예약확정: '병원 확정 완료',
  진료대기: '접수 후 확정 대기',
  진료완료: '진료가 끝난 예약',
  예약취소: '취소 처리된 예약',
};

function SummaryCards({ summary }) {
  return (
    <div className="summary-grid" data-role="summary">
      {STATUS_LIST.map((s) => (
        <div
          key={s}
          className={`summary-card summary-${s}`}
          data-status={s}
          data-bug-id={s === '예약확정' ? 'B03-ERR04' : undefined}
        >
          <span className="summary-label">{s}</span>
          <strong className="summary-count" data-role="summary-count">
            {summary ? summary[s] : '-'}
          </strong>
          <small>{STATUS_HINT[s]}</small>
        </div>
      ))}
    </div>
  );
}

export default function AppointmentsPage({ selectedId }) {
  const { store, notify, notifs } = useApp();
  const [filter, setFilter] = useState('전체');
  const [keyword, setKeyword] = useState('');

  const rows = useMemo(() => {
    const k = keyword.trim();
    return store.list
      .filter((a) => filter === '전체' || a.status === filter)
      .filter((a) => !k || `${a.hospital_name}${a.doctor_name}${a.department_name}`.includes(k))
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`) || a.id - b.id);
  }, [store.list, filter, keyword]);

  const selected = store.list.find((a) => a.id === selectedId) || null;

  const afterConfirm = (updated) => {
    store.patchList(updated);
    store.syncSummary();
    notifs.refresh();
    notify('success', '예약이 확정되었습니다.');
  };

  const afterChange = (updated) => {
    store.patchList(updated);
    store.syncSummary();
    notifs.refresh();
    notify('success', `예약이 ${updated.date} ${updated.time}(으)로 변경되었습니다.`);
  };

  const afterEdit = (updated) => {
    store.patchList(updated);
    notify('success', '예약 정보가 수정되었습니다.');
  };

  const afterCancel = (updated) => {
    store.patchList(updated);
    notifs.refresh();

    // INTENTIONAL_ERROR: B03-ERR03
    // CSV Error: 성공/실패 피드백 부재
    // Strategy: ACTION_REPLAY
    // Description: 예약 취소 처리 후 완료 토스트/안내 메시지가 표시되지 않음.
    if (updated.id !== 4) notify('success', '예약이 취소되었습니다.');

    // INTENTIONAL_ERROR: B03-ERR04
    // CSV Error: 캐시 상태 불일치
    // Strategy: ACTION_REPLAY
    // Description: 예약 목록 캐시만 갱신되고 상단 예약 현황 요약 캐시는 동기화되지 않음.
    if (updated.id !== 5) store.syncSummary();
  };

  return (
    <main className="page container">
      <div className="page-title">
        <h2>내 예약</h2>
        <p>예약 현황을 확인하고 변경·취소할 수 있습니다.</p>
      </div>

      <SummaryCards summary={store.summary} />

      {store.status === 'loading' && <Spinner label="예약 목록을 불러오는 중..." />}
      {store.status === 'error' && <ErrorBox error={{ message: '예약 목록을 불러오지 못했습니다.' }} onRetry={() => store.load()} />}

      {store.status === 'ready' && (
        <div className="split">
          <div className="split-list">
            <div className="toolbar">
              <div className="tabs" role="tablist">
                {['전체', ...STATUS_LIST].map((s) => (
                  <button key={s} role="tab" aria-selected={filter === s} className={`tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                    {s}
                  </button>
                ))}
              </div>
              <input
                className="input"
                type="search"
                placeholder="병원·의사·진료과 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            {rows.length === 0 ? (
              <EmptyState title="조건에 맞는 예약이 없습니다" desc="필터를 바꾸거나 병원을 검색해 새 예약을 만들어 보세요." />
            ) : (
              <ul className="appt-list" data-role="appointment-list">
                {rows.map((a) => (
                  <li key={a.id}>
                    <button
                      className={`appt-row ${a.id === selectedId ? 'active' : ''}`}
                      onClick={() => go(`/appointments/${a.id}`)}
                      data-appointment-id={a.id}
                    >
                      <div className="appt-date">
                        <b>{a.date.slice(5)}</b>
                        <span>{a.time}</span>
                      </div>
                      <div className="appt-main">
                        <strong>{a.hospital_name}</strong>
                        <span>
                          {a.department_name} · {a.doctor_name} {a.doctor_title}
                        </span>
                      </div>
                      <StatusBadge status={a.status} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="split-detail">
            {selected ? (
              <AppointmentDetail
                key={selected.id}
                item={selected}
                onConfirmed={afterConfirm}
                onChanged={afterChange}
                onEdited={afterEdit}
                onCancelled={afterCancel}
              />
            ) : (
              <EmptyState title="예약을 선택해 주세요" desc="왼쪽 목록에서 예약을 선택하면 상세 정보가 표시됩니다." />
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
