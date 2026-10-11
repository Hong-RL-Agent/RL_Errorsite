import { useMemo, useState } from 'react';
import { getHospital } from '../api';
import { ErrorBox, Spinner } from '../components/common.jsx';
import DoctorCard from '../components/DoctorCard.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { go } from '../hooks/useHashRoute.js';

function HoursPanel({ hospital }) {
  const h = hospital;
  return (
    <aside className="hours-panel" data-role="hours-panel">
      <h4>운영 시간</h4>
      <table>
        <tbody>
          <tr>
            <th>평일</th>
            <td>
              {h.open_time} ~ {h.close_time}
            </td>
          </tr>
          <tr>
            <th>점심시간</th>
            <td>
              {h.lunch_start} ~ {h.lunch_end}
            </td>
          </tr>
          <tr>
            <th>토요일</th>
            <td>{h.sat_open ? `${h.open_time} ~ ${h.sat_close}` : '휴진'}</td>
          </tr>
          <tr>
            <th>일·공휴일</th>
            <td>휴진</td>
          </tr>
        </tbody>
      </table>
      <p className="muted small">대표번호 {h.phone}</p>
    </aside>
  );
}

export default function HospitalPage({ id }) {
  const { data: hospital, loading, error, reload } = useFetch(() => getHospital(id), [id]);
  const [dept, setDept] = useState(0);

  const doctors = useMemo(() => {
    if (!hospital) return [];
    return hospital.doctors.filter((d) => !dept || d.department_id === dept);
  }, [hospital, dept]);

  if (loading && !hospital) return <main className="page container"><Spinner label="병원 정보를 불러오는 중..." /></main>;
  if (error) {
    return (
      <main className="page container">
        <ErrorBox error={error} onRetry={reload} />
      </main>
    );
  }

  return (
    <main className="page container">
      <button className="btn btn-ghost btn-sm" onClick={() => go('/')}>
        ← 병원 목록
      </button>
      <section className="hospital-hero">
        <div className="hospital-logo lg">{hospital.name.slice(0, 1)}</div>
        <div className="grow">
          <h2>{hospital.name}</h2>
          <p className="muted">{hospital.address}</p>
          <p>{hospital.description}</p>
          <div className="tag-row">
            {hospital.departments.map((d) => (
              <span key={d.id} className="dept-tag">
                {d.name}
              </span>
            ))}
            <span className="rating">★ {hospital.rating}</span>
          </div>
        </div>
        <HoursPanel hospital={hospital} />
      </section>

      <div className="section-head">
        <h2>의료진 및 진료 일정</h2>
        <div className="tabs">
          <button className={`tab ${dept === 0 ? 'active' : ''}`} onClick={() => setDept(0)}>
            전체
          </button>
          {hospital.departments.map((d) => (
            <button key={d.id} className={`tab ${dept === d.id ? 'active' : ''}`} onClick={() => setDept(d.id)}>
              {d.name}
            </button>
          ))}
        </div>
      </div>

      <div className="doctor-list">
        {doctors.map((d) => (
          <DoctorCard key={d.id} doctor={d} hospital={hospital} />
        ))}
      </div>
    </main>
  );
}
