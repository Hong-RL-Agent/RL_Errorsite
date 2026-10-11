import { useEffect, useRef, useState } from 'react';
import { createAppointment, confirmAppointment, getAvailability, getDoctorSchedule } from '../api';
import { useApp } from '../hooks/AppContext.js';
import { useFetch } from '../hooks/useFetch.js';
import { go } from '../hooks/useHashRoute.js';
import { Modal, Spinner } from './common.jsx';
import { ScheduleCalendar, SlotGrid } from './Schedule.jsx';

const VISIBLE_SLOTS = 6;
const REASONS = ['정기 검진', '증상 상담', '재진 상담', '검사 결과 확인', '통증 진료', '처방 상담'];
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

export const formatDate = (date) => {
  const [y, m, d] = date.split('-').map(Number);
  return `${m}월 ${d}일(${WEEKDAY[new Date(y, m - 1, d).getDay()]})`;
};

function BookingModal({ doctor, hospital, date, time, onClose, onBooked }) {
  const { patient, patientId, notify } = useApp();
  const [reason, setReason] = useState(REASONS[0]);
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      const created = await createAppointment({ patientId, doctorId: doctor.id, date, time, visitReason: reason, memo });
      const confirmed = await confirmAppointment(created.id);
      onBooked(confirmed);
    } catch (e) {
      notify('error', e.message);
      setSaving(false);
      if (e.status === 409 || e.status === 400) onClose(true);
    }
  };

  return (
    <Modal
      title="예약 확인"
      name="booking"
      onClose={() => onClose(false)}
      footer={
        <>
          <button className="btn btn-outline" onClick={() => onClose(false)} disabled={saving}>
            돌아가기
          </button>
          <button className="btn btn-primary" onClick={submit} disabled={saving} data-action="book-confirm">
            {saving ? '예약 중...' : '예약 확정하기'}
          </button>
        </>
      }
    >
      <dl className="info-list">
        <dt>환자</dt>
        <dd>{patient?.name}</dd>
        <dt>병원</dt>
        <dd>{hospital.name}</dd>
        <dt>진료과 / 의사</dt>
        <dd>
          {doctor.department_name} · {doctor.name} {doctor.title}
        </dd>
        <dt>진료 일시</dt>
        <dd>
          <b>
            {formatDate(date)} {time}
          </b>
        </dd>
      </dl>
      <label className="field">
        <span>방문 사유</span>
        <select value={reason} onChange={(e) => setReason(e.target.value)}>
          {REASONS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>예약 메모 (선택)</span>
        <textarea rows={3} maxLength={200} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="병원에 전달할 내용을 적어 주세요." />
      </label>
    </Modal>
  );
}

export default function DoctorCard({ doctor, hospital }) {
  const { store, notifs, notify } = useApp();
  const schedule = useFetch(() => getDoctorSchedule(doctor.id), [doctor.id]);
  const [date, setDate] = useState(null);
  const [slotState, setSlotState] = useState({ loading: false, slots: [] });
  const [slotTick, setSlotTick] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [picked, setPicked] = useState(null);
  const lastOffset = useRef(null);

  useEffect(() => {
    if (schedule.data && !date) {
      const firstOpen = schedule.data.days.find((d) => d.available > 0);
      setDate(firstOpen ? firstOpen.date : null);
    }
  }, [schedule.data, date]);

  useEffect(() => {
    if (!date) return undefined;
    let alive = true;
    setSlotState((s) => ({ ...s, loading: true }));
    getAvailability({ doctorId: doctor.id, date })
      .then((r) => alive && setSlotState({ loading: false, slots: r.slots }))
      .catch((e) => {
        if (alive) {
          setSlotState({ loading: false, slots: [] });
          notify('error', e.message);
        }
      });
    return () => {
      alive = false;
    };
  }, [date, doctor.id, slotTick, notify]);

  useEffect(() => {
    setExpanded(false);
  }, [date]);

  useEffect(() => {
    if (!expanded) return;
    // INTENTIONAL_ERROR: B03-ERR05
    // CSV Error: 스크롤 튐
    // Strategy: ACTION_REPLAY
    // Description: 진료 시간 더보기 렌더 후 스크롤 복원 로직이 잘못된 오프셋을 사용해 페이지가 최상단으로 이동함.
    if (doctor.id === 2) window.scrollTo({ top: lastOffset.current ?? 0, behavior: 'auto' });
  }, [expanded, doctor.id]);

  const slots = slotState.slots;
  const visible = expanded ? slots : slots.slice(0, VISIBLE_SLOTS);
  const hidden = slots.length - VISIBLE_SLOTS;

  const handleBooked = async (appt) => {
    setPicked(null);
    notify('success', `${formatDate(appt.date)} ${appt.time} 예약이 확정되었습니다.`);
    await Promise.all([store.load(true), notifs.refresh()]);
    go(`/appointments/${appt.id}`);
  };

  return (
    <article className="doctor-card" data-doctor-id={doctor.id}>
      <div className="doctor-profile">
        <div className={`avatar tone-${doctor.tone}`}>{doctor.name.slice(0, 1)}</div>
        <div>
          <h4>
            {doctor.name} <small>{doctor.title}</small>
          </h4>
          <span className="dept-tag">{doctor.department_name}</span>
          <p className="muted">{doctor.career}</p>
          <p className="muted small">
            진료 요일: {doctor.work_days.split(',').map((d) => WEEKDAY[Number(d)]).join(' · ')}
          </p>
        </div>
      </div>

      <div className="doctor-schedule">
        {schedule.loading && !schedule.data ? (
          <Spinner label="진료 일정을 불러오는 중..." />
        ) : schedule.error ? (
          <p className="muted">진료 일정을 불러오지 못했습니다.</p>
        ) : (
          <>
            <ScheduleCalendar days={schedule.data.days} selected={date} onSelect={setDate} />
            <div className="slot-panel">
              <h5>{date ? `${formatDate(date)} 예약 가능 시간` : '예약 가능한 날짜가 없습니다'}</h5>
              {slotState.loading && slots.length === 0 ? (
                <Spinner label="시간 조회 중..." />
              ) : (
                <SlotGrid slots={visible} selected={null} onPick={(t) => setPicked({ date, time: t })} />
              )}
              {hidden > 0 && !expanded && (
                <button
                  className="btn btn-outline btn-block"
                  onClick={() => setExpanded(true)}
                  data-action="more-slots"
                  data-bug-id={doctor.id === 2 ? 'B03-ERR05' : undefined}
                >
                  진료 시간 더보기 (+{hidden})
                </button>
              )}
              {expanded && (
                <button className="btn btn-ghost btn-block" onClick={() => setExpanded(false)}>
                  진료 시간 접기
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {picked && (
        <BookingModal
          doctor={doctor}
          hospital={hospital}
          date={picked.date}
          time={picked.time}
          onClose={(refresh) => {
            setPicked(null);
            if (refresh) setSlotTick((t) => t + 1);
          }}
          onBooked={handleBooked}
        />
      )}
    </article>
  );
}
