import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, fmtDT, fmtDateTimeFull, logAction, won } from '../api';
import { routeMemory } from '../flows/routeMemory';
import { useToast } from '../hooks/useToast';
import { Modal, StatusBadge } from '../components/Common';

const STAGES = [['pending', '예약 접수'], ['confirmed', '예약 확정'], ['picked_up', '차량 픽업'], ['returned', '차량 반납'], ['closed', '대여 종료']];

export default function TripDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState(null);
  const [busy, setBusy] = useState(false);
  const [endAt, setEndAt] = useState('');
  const [changeError, setChangeError] = useState('');
  // 예약 정보 수정 화면에서 돌아온 직후인지 (한 번만 확인)
  const [afterEdit] = useState(() => {
    const flagged = !!routeMemory.get(`edited:${id}`);
    routeMemory.delete(`edited:${id}`);
    return flagged;
  });

  useEffect(() => {
    let alive = true;
    api.trip(id).then((r) => { if (alive) { setTrip(r.data); setEndAt(r.data.endAt); logAction('trip_detail', `${r.data.id} ${r.data.status}`); } })
      .catch((e) => alive && setError(e.status === 404 ? '존재하지 않는 예약이에요.' : e.message));
    return () => { alive = false; };
  }, [id]);

  const run = async (fn, okMsg) => {
    setBusy(true);
    try {
      const res = await fn();
      if (res && res.data && res.data.status) setTrip(res.data);
      if (okMsg) toast(okMsg);
      return res;
    } catch (e) {
      toast(e.message, 'warn');
      return null;
    } finally { setBusy(false); setDialog(null); }
  };

  const doCancel = () => run(() => api.cancelTrip(id, '고객 요청으로 취소'), '예약을 취소했어요.');
  const doPickup = () => run(() => api.pickupTrip(id), '차량 픽업을 완료 처리했어요.');
  const doReturn = () => run(() => api.returnTrip(id), '차량 반납을 처리했어요.');
  const doClose = () => run(() => api.updateTrip(id, { close: true }), '대여를 종료했어요.');
  const doRemove = async () => {
    setBusy(true);
    try {
      await api.clearHistory(id);
      routeMemory.delete('trips');
      toast('예약 내역을 삭제했어요.');
      navigate('/trips');
    } catch (e) { toast(e.message, 'warn'); setBusy(false); setDialog(null); }
  };

  const saveReturnTime = async (e) => {
    e.preventDefault();
    setChangeError('');
    try {
      const res = await api.updateTrip(id, { endAt });
      // INTENTIONAL_ERROR: B09-ERR03
      // CSV Error: 성공/실패 피드백 부재
      // Strategy: ACTION_REPLAY
      // Description: 반납 시간 변경이 저장되어도 성공 토스트/안내 메시지를 표시하지 않음.
      setTrip(res.data);
      logAction('return_time_saved', res.data.endAt);
    } catch (err) {
      setChangeError(err.message);
    }
  };

  if (error) return <div className="screen"><div className="empty">{error}</div></div>;
  if (!trip) return <div className="screen"><p className="muted">예약을 불러오는 중…</p></div>;

  // INTENTIONAL_ERROR: B09-ERR02
  // CSV Error: 워크플로우 제어 오류 / 부적절한 상태 전이
  // Strategy: SEQUENCE_REPLAY
  // Description: 예약 수정 후 복귀하면 타임라인 단계 인덱스를 잘못 계산해 반납 단계가 완료로 표시됨.
  const baseIndex = STAGES.findIndex(([k]) => k === trip.status);
  const stageIndex = afterEdit ? baseIndex + 2 : baseIndex;
  const a = trip.actions;

  return (
    <div className="screen narrow">
      <button type="button" className="link" onClick={() => navigate(-1)}>‹ 이전 화면</button>
      <div className="trip-head">
        <h1>{trip.code}</h1><StatusBadge value={trip.status} />
      </div>

      <section className="panel" aria-label="대여 진행 타임라인">
        <h2>대여 진행 상태</h2>
        {trip.status === 'cancelled' ? (
          <p className="alert soft">취소된 예약이에요. ({trip.cancelReason})</p>
        ) : (
          <ol className="progress" data-bug-id="B09-ERR02">
            {STAGES.map(([key, label], i) => (
              <li key={key} className={i < stageIndex ? 'done' : i === stageIndex ? 'now' : ''} data-stage={key}>
                <span className="node">{i < stageIndex ? '✓' : i + 1}</span>
                <b>{label}</b>
                <em>{key === 'picked_up' && trip.pickedUpAt ? fmtDateTimeFull(trip.pickedUpAt.slice(0, 16)) : key === 'returned' && trip.returnedAt ? fmtDateTimeFull(trip.returnedAt.slice(0, 16)) : ''}</em>
              </li>
            ))}
          </ol>
        )}
        <div className="ops-row">
          {a.canPickup && <button type="button" className="btn primary" disabled={busy} onClick={doPickup}>픽업 완료 처리</button>}
          {a.canReturn && <button type="button" className="btn primary" disabled={busy} onClick={doReturn}>반납 처리</button>}
          {a.canClose && <button type="button" className="btn primary" disabled={busy} onClick={doClose}>대여 종료</button>}
          {a.canEdit && <Link className="btn ghost" to={`/trips/${trip.id}/edit`}>예약 정보 수정</Link>}
          {a.canCancel && <button type="button" className="btn danger" disabled={busy} onClick={() => setDialog('cancel')}>예약 취소</button>}
          {a.canClear && <button type="button" className="btn danger" disabled={busy} onClick={() => setDialog('remove')}>내역 삭제</button>}
        </div>
      </section>

      <div className="two-col">
        <section className="panel">
          <h2>예약 정보</h2>
          <dl className="specs">
            <div className="spec-row"><dt>차량</dt><dd>{trip.vehicle.name} · {trip.vehicle.plate}</dd></div>
            <div className="spec-row"><dt>픽업</dt><dd>{trip.pickupDepot.city} {trip.pickupDepot.name}<br />{fmtDT(trip.startAt)}</dd></div>
            <div className="spec-row"><dt>반납 예정</dt><dd data-field="end-at">{trip.returnDepot.city} {trip.returnDepot.name}<br />{fmtDT(trip.endAt)}</dd></div>
            <div className="spec-row"><dt>보험</dt><dd>{trip.protection ? trip.protection.name : '기본 보험'}</dd></div>
            <div className="spec-row"><dt>옵션</dt><dd>{trip.addons.length ? trip.addons.map((x) => `${x.name} ×${x.qty}`).join(', ') : '없음'}</dd></div>
            <div className="spec-row"><dt>운전자</dt><dd>{trip.renter.name} · {trip.renter.phone}</dd></div>
            <div className="spec-row total"><dt>총 금액</dt><dd>{won(trip.total)}</dd></div>
          </dl>
        </section>
        {(a.canEdit || a.canExtend) && (
          <section className="panel">
            <h2>반납 일정 변경</h2>
            <form onSubmit={saveReturnTime} className="change-form">
              <label className="field"><span>반납 예정 일시</span><input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} /></label>
              {changeError && <p className="alert" role="alert">{changeError}</p>}
              <button type="submit" className="btn primary" data-bug-id="B09-ERR03">변경 저장</button>
            </form>
          </section>
        )}
      </div>

      {dialog === 'cancel' && (
        <Modal title="예약 취소" onClose={() => setDialog(null)}>
          <p>{trip.code} 예약을 취소할까요? 취소 후에는 되돌릴 수 없어요.</p>
          <div className="nav-row"><button type="button" className="btn ghost" onClick={() => setDialog(null)}>닫기</button><button type="button" className="btn danger" disabled={busy} onClick={doCancel}>예약 취소하기</button></div>
        </Modal>
      )}
      {dialog === 'remove' && (
        <Modal title="내역 삭제" onClose={() => setDialog(null)}>
          <p>{trip.code} 예약 내역을 삭제할까요?</p>
          <div className="nav-row"><button type="button" className="btn ghost" onClick={() => setDialog(null)}>닫기</button><button type="button" className="btn danger" disabled={busy} onClick={doRemove}>삭제</button></div>
        </Modal>
      )}
    </div>
  );
}
