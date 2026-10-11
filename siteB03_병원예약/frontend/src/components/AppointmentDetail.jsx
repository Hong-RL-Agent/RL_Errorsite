import { useRef, useState } from 'react';
import { confirmAppointment, getAppointment } from '../api';
import { useApp } from '../hooks/AppContext.js';
import { useFetch } from '../hooks/useFetch.js';
import { go } from '../hooks/useHashRoute.js';
import { CancelModal, ChangeModal, EditModal } from './AppointmentModals.jsx';
import { Spinner, StatusBadge } from './common.jsx';

const STEPS = ['접수·진료대기', '예약확정', '진료완료'];
const STEP_INDEX = { 진료대기: 0, 예약확정: 1, 진료완료: 2 };

function Timeline({ status }) {
  if (status === '예약취소') {
    return <div className="timeline-canceled">이 예약은 취소되었습니다.</div>;
  }
  const current = STEP_INDEX[status];
  return (
    <ol className="timeline" data-role="timeline">
      {STEPS.map((label, i) => (
        <li key={label} className={i < current ? 'done' : i === current ? 'now' : ''}>
          <span className="dot" />
          {label}
        </li>
      ))}
    </ol>
  );
}

export default function AppointmentDetail({ item, onConfirmed, onChanged, onEdited, onCancelled }) {
  const { notify } = useApp();
  const detailFetch = useFetch(
    () => getAppointment(item.id),
    [item.id, item.status, item.date, item.time, item.memo, item.visit_reason],
  );
  const detail = detailFetch.data && detailFetch.data.id === item.id ? detailFetch.data : null;
  const [sheet, setSheet] = useState({ kind: null });
  const sheetAtOpen = useRef(sheet);
  const [busy, setBusy] = useState(false);

  const closeSheet = () => setSheet({ kind: null });
  const canModify = item.status === '예약확정' || item.status === '진료대기';

  const openChange = () => {
    // INTENTIONAL_ERROR: B03-ERR01
    // CSV Error: 응답 없는 클릭 (Freeze)
    // Strategy: ACTION_REPLAY
    // Description: 예약 변경 버튼 이벤트에서 UI 응답이 지연됨.
    if (item.id === 1) {
      const until = performance.now() + 3500;
      while (performance.now() < until) {
        Math.sqrt(until * Math.random());
      }
      return;
    }
    setSheet({ kind: 'change' });
  };

  const openEdit = () => {
    sheetAtOpen.current = { kind: 'edit' };
    setSheet(sheetAtOpen.current);
  };

  const dismissEdit = () => {
    // INTENTIONAL_ERROR: B03-ERR02
    // CSV Error: 수정 및 취소 경로 차단
    // Strategy: ACTION_REPLAY
    // Description: 예약 수정 모달의 취소/닫기가 열릴 때 저장된 시트 상태를 다시 참조해 닫히지 않음.
    if (item.id === 3) {
      setSheet(sheetAtOpen.current);
      return;
    }
    closeSheet();
  };

  const confirm = async () => {
    setBusy(true);
    try {
      onConfirmed(await confirmAppointment(item.id));
    } catch (e) {
      notify('error', e.message);
    } finally {
      setBusy(false);
    }
  };

  const cancelBugId = item.id === 4 ? 'B03-ERR03' : item.id === 5 ? 'B03-ERR04' : undefined;
  const changes = detail?.changes || [];

  return (
    <section className="detail-panel" data-role="appointment-detail" data-appointment-id={item.id}>
      <div className="detail-head">
        <div>
          <span className="muted small">예약번호 #{item.id}</span>
          <h3>{item.hospital_name}</h3>
        </div>
        <StatusBadge status={item.status} />
      </div>

      <dl className="info-list">
        <dt>진료과 / 의사</dt>
        <dd>
          {item.department_name} · {item.doctor_name} {item.doctor_title}
        </dd>
        <dt>진료 일시</dt>
        <dd data-role="appt-datetime">
          <b>
            {item.date} {item.time}
          </b>
        </dd>
        <dt>방문 사유</dt>
        <dd>{item.visit_reason || '-'}</dd>
        <dt>예약 메모</dt>
        <dd data-role="appt-memo">{item.memo || '메모 없음'}</dd>
        <dt>병원 연락처</dt>
        <dd>
          {item.hospital_region} · {item.hospital_phone}
        </dd>
      </dl>

      <h5>진료 상태</h5>
      <Timeline status={item.status} />

      <div className="detail-actions">
        {item.status === '진료대기' && (
          <button className="btn btn-mint" onClick={confirm} disabled={busy} data-action="confirm">
            예약 확정
          </button>
        )}
        <button
          className="btn btn-primary"
          onClick={openChange}
          disabled={!canModify}
          data-action="change"
          data-bug-id={item.id === 1 ? 'B03-ERR01' : undefined}
        >
          예약 변경
        </button>
        <button className="btn btn-outline" onClick={openEdit} disabled={!canModify} data-action="edit">
          예약 정보 수정
        </button>
        <button
          className="btn btn-danger-outline"
          onClick={() => setSheet({ kind: 'cancel' })}
          disabled={!canModify}
          data-action="cancel"
          data-bug-id={cancelBugId}
        >
          예약 취소
        </button>
        <button className="btn btn-ghost" onClick={() => go(`/hospital/${item.hospital_id}`)}>
          병원 보기
        </button>
      </div>

      <h5>변경·취소 이력</h5>
      {detailFetch.loading && !detail ? (
        <Spinner />
      ) : (
        <ul className="history" data-role="history">
          {detail?.cancel && (
            <li>
              <b>예약 취소</b> · {detail.cancel.reason} <small>{detail.cancel.canceled_at}</small>
            </li>
          )}
          {changes.map((c) => (
            <li key={c.id}>
              <b>일정 변경</b> · {c.old_date} {c.old_time} → {c.new_date} {c.new_time} <small>{c.changed_at}</small>
            </li>
          ))}
          {!detail?.cancel && changes.length === 0 && <li className="muted">이력이 없습니다.</li>}
        </ul>
      )}

      {sheet.kind === 'change' && (
        <ChangeModal
          appt={item}
          onClose={closeSheet}
          onSaved={(updated) => {
            closeSheet();
            onChanged(updated);
          }}
        />
      )}
      {sheet.kind === 'edit' && (
        <EditModal
          appt={item}
          onDismiss={dismissEdit}
          onSaved={(updated) => {
            closeSheet();
            onEdited(updated);
          }}
        />
      )}
      {sheet.kind === 'cancel' && (
        <CancelModal
          appt={item}
          onClose={closeSheet}
          onDone={(updated) => {
            closeSheet();
            onCancelled(updated);
          }}
        />
      )}
    </section>
  );
}
