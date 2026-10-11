import React, { useCallback, useEffect, useState } from 'react';
import { api, fmtDT, logAction, won } from '../api';
import { routeMemory } from '../flows/routeMemory';
import { useToast } from '../hooks/useToast';
import { Modal } from '../components/Common';
import { TripTabs } from './TripsScreen';

export default function ArchiveScreen() {
  const toast = useToast();
  const [tab, setTab] = useState('cancelled');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.trips({ status: tab }).then((r) => { setList(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [tab]);
  useEffect(() => { load(); }, [load]);

  const remove = async (t) => {
    try {
      await api.clearHistory(t.id);
      routeMemory.delete('trips');
      setList((l) => l.filter((x) => x.id !== t.id));
      toast('예약 내역을 정리했어요.');
      logAction('history_cleared', String(t.id));
    } catch (e) { toast(e.message, 'warn'); }
    setConfirmTarget(null);
  };

  // INTENTIONAL_ERROR: B09-ERR05
  // CSV Error: 행동 확인 없음
  // Strategy: ACTION_REPLAY
  // Description: 취소 내역 탭의 내역 정리는 확인 단계 없이 즉시 삭제 API를 호출함.
  const onClean = (t) => (tab === 'cancelled' ? remove(t) : setConfirmTarget(t));

  return (
    <div className="screen narrow">
      <h1>내 예약</h1>
      <TripTabs />
      <div className="seg" role="tablist" aria-label="내역 구분">
        <button type="button" role="tab" aria-selected={tab === 'cancelled'} className={tab === 'cancelled' ? 'on' : ''} onClick={() => setTab('cancelled')}>취소 내역</button>
        <button type="button" role="tab" aria-selected={tab === 'closed'} className={tab === 'closed' ? 'on' : ''} onClick={() => setTab('closed')}>완료 내역</button>
      </div>
      {loading && <p className="muted">불러오는 중…</p>}
      {!loading && list.length === 0 && <div className="empty">정리할 내역이 없어요.</div>}
      <ul className="archive-list">
        {list.map((t) => (
          <li key={t.id} data-trip-id={t.id}>
            <span><b>{t.code}</b> · {t.vehicle.name}<br /><span className="muted">{fmtDT(t.startAt)} → {fmtDT(t.endAt)} · {won(t.total)}</span></span>
            <button type="button" className="btn ghost danger" data-bug-id={tab === 'cancelled' ? 'B09-ERR05' : undefined} onClick={() => onClean(t)}>내역 정리</button>
          </li>
        ))}
      </ul>
      {confirmTarget && (
        <Modal title="내역 정리" onClose={() => setConfirmTarget(null)}>
          <p>{confirmTarget.code} 대여 내역을 정리할까요? 정리한 내역은 복구할 수 없어요.</p>
          <div className="nav-row">
            <button type="button" className="btn ghost" onClick={() => setConfirmTarget(null)}>닫기</button>
            <button type="button" className="btn danger" onClick={() => remove(confirmTarget)}>정리하기</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
