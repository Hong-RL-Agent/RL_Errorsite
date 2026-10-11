import { useEffect, useState } from 'react';
import { cancelAppointment, getAvailability, getDoctorSchedule, updateAppointment } from '../api';
import { useApp } from '../hooks/AppContext.js';
import { useFetch } from '../hooks/useFetch.js';
import { Modal, Spinner } from './common.jsx';
import { ScheduleCalendar, SlotGrid } from './Schedule.jsx';

const REASONS = ['정기 검진', '증상 상담', '재진 상담', '검사 결과 확인', '통증 진료', '처방 상담'];
const CANCEL_REASONS = ['일정 변경', '증상 호전', '다른 병원 예약', '개인 사정', '교통 문제'];

// 예약 변경 모달: 현재 예약 일시를 보여주고 새 날짜/시간을 선택한다.
export function ChangeModal({ appt, onClose, onSaved }) {
  const { notify } = useApp();
  const schedule = useFetch(() => getDoctorSchedule(appt.doctor_id), [appt.doctor_id]);
  const [date, setDate] = useState(appt.date);
  const [time, setTime] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setTime(null);
    getAvailability({ doctorId: appt.doctor_id, date })
      .then((r) => alive && setSlots(r.slots))
      .catch((e) => alive && notify('error', e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [date, appt.doctor_id, notify]);

  const isCurrentDate = date === appt.date;
  const shown = slots.map((s) => (isCurrentDate && s.time === appt.time ? { ...s, available: false } : s));

  const save = async () => {
    setSaving(true);
    try {
      const updated = await updateAppointment(appt.id, { date, time });
      onSaved(updated);
    } catch (e) {
      notify('error', e.message);
      setSaving(false);
    }
  };

  return (
    <Modal
      title="예약 변경"
      name="change"
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose} disabled={saving}>
            닫기
          </button>
          <button className="btn btn-primary" onClick={save} disabled={!time || saving} data-action="change-save">
            {saving ? '변경 중...' : '이 시간으로 변경'}
          </button>
        </>
      }
    >
      <div className="current-box" data-role="current-schedule">
        <span>현재 예약</span>
        <b>
          {appt.date} {appt.time}
        </b>
        <small>
          {appt.hospital_name} · {appt.doctor_name} {appt.doctor_title}
        </small>
      </div>
      {schedule.data ? (
        <ScheduleCalendar days={schedule.data.days} selected={date} onSelect={setDate} current={appt.date} />
      ) : (
        <Spinner />
      )}
      <h5 className="mt">{date} 시간 선택</h5>
      {loading && slots.length === 0 ? <Spinner /> : <SlotGrid slots={shown} selected={time} onPick={setTime} currentTime={isCurrentDate ? appt.time : null} />}
    </Modal>
  );
}

// 예약 정보 수정 모달: 방문 사유와 메모를 수정한다.
export function EditModal({ appt, onDismiss, onSaved }) {
  const { notify } = useApp();
  const [reason, setReason] = useState(appt.visit_reason || REASONS[0]);
  const [memo, setMemo] = useState(appt.memo || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await updateAppointment(appt.id, { visitReason: reason, memo });
      onSaved(updated);
    } catch (e) {
      notify('error', e.message);
      setSaving(false);
    }
  };

  const bugId = appt.id === 3 ? 'B03-ERR02' : undefined;

  return (
    <Modal
      title="예약 정보 수정"
      name="edit"
      onClose={onDismiss}
      bugId={bugId}
      footer={
        <>
          <button className="btn btn-outline" onClick={onDismiss} disabled={saving} data-action="edit-cancel" data-bug-id={bugId}>
            취소
          </button>
          <button className="btn btn-primary" onClick={save} disabled={saving} data-action="edit-save">
            {saving ? '저장 중...' : '저장'}
          </button>
        </>
      }
    >
      <label className="field">
        <span>방문 사유</span>
        <select value={reason} onChange={(e) => setReason(e.target.value)}>
          {REASONS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>예약 메모</span>
        <textarea rows={4} maxLength={200} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="병원에 전달할 내용을 적어 주세요." />
        <small className="muted">{memo.length}/200</small>
      </label>
    </Modal>
  );
}

export function CancelModal({ appt, onClose, onDone }) {
  const { notify } = useApp();
  const [reason, setReason] = useState(CANCEL_REASONS[0]);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      const updated = await cancelAppointment(appt.id, reason);
      onDone(updated);
    } catch (e) {
      notify('error', e.message);
      setSaving(false);
    }
  };

  return (
    <Modal
      title="예약 취소 확인"
      name="cancel"
      onClose={onClose}
      size="sm"
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose} disabled={saving}>
            돌아가기
          </button>
          <button className="btn btn-danger" onClick={submit} disabled={saving} data-action="cancel-confirm">
            {saving ? '처리 중...' : '예약 취소 확정'}
          </button>
        </>
      }
    >
      <p>
        <b>
          {appt.hospital_name} · {appt.date} {appt.time}
        </b>{' '}
        예약을 취소하시겠습니까?
      </p>
      <label className="field">
        <span>취소 사유</span>
        <select value={reason} onChange={(e) => setReason(e.target.value)}>
          {CANCEL_REASONS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </label>
    </Modal>
  );
}
