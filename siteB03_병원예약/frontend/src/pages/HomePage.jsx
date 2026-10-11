import { useEffect, useMemo, useState } from 'react';
import { getDepartments, getHospitals, getRegions } from '../api';
import { EmptyState, ErrorBox, Spinner } from '../components/common.jsx';
import { useApp } from '../hooks/AppContext.js';
import { useFetch } from '../hooks/useFetch.js';
import { go } from '../hooks/useHashRoute.js';
import { STATUS_LIST } from '../hooks/useMyAppointments.js';

function HospitalCard({ hospital, onOpen }) {
  const h = hospital;
  return (
    <article className="hospital-card" data-hospital-id={h.id}>
      <div className="hospital-top">
        <div className="hospital-logo">{h.name.slice(0, 1)}</div>
        <div>
          <h4>{h.name}</h4>
          <p className="muted small">{h.address}</p>
        </div>
        <span className="rating">★ {h.rating}</span>
      </div>
      <div className="tag-row">
        {h.departments.map((d) => (
          <span key={d.id} className="dept-tag">
            {d.name}
          </span>
        ))}
      </div>
      <p className="muted small">
        평일 {h.open_time}~{h.close_time} · 의사 {h.doctor_count}명
        {h.sat_open ? ` · 토 ~${h.sat_close}` : ' · 토요일 휴진'}
      </p>
      <button className="btn btn-primary btn-block" onClick={() => onOpen(h.id)}>
        진료 예약하기
      </button>
    </article>
  );
}

export default function HomePage() {
  const { store } = useApp();
  const departments = useFetch(getDepartments, []);
  const regions = useFetch(getRegions, []);
  const [input, setInput] = useState('');
  const [q, setQ] = useState('');
  const [department, setDepartment] = useState('');
  const [region, setRegion] = useState('');
  const [sort, setSort] = useState('id');

  useEffect(() => {
    const t = setTimeout(() => setQ(input), 250);
    return () => clearTimeout(t);
  }, [input]);

  const hospitals = useFetch(() => getHospitals({ q, department, region }), [q, department, region]);

  const sorted = useMemo(() => {
    const items = [...(hospitals.data || [])];
    if (sort === 'rating') items.sort((a, b) => b.rating - a.rating || a.id - b.id);
    if (sort === 'doctors') items.sort((a, b) => b.doctor_count - a.doctor_count || a.id - b.id);
    if (sort === 'name') items.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    return items;
  }, [hospitals.data, sort]);

  const upcoming = useMemo(
    () =>
      store.list
        .filter((a) => a.status === '예약확정' || a.status === '진료대기')
        .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))[0],
    [store.list],
  );

  const reset = () => {
    setInput('');
    setQ('');
    setDepartment('');
    setRegion('');
  };

  return (
    <main className="page">
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <h1>
              가까운 병원, <span>원하는 시간</span>에 바로 예약
            </h1>
            <p>진료과와 지역을 선택하고 의사의 진료 일정을 확인해 보세요.</p>
            <form
              className="search-bar"
              onSubmit={(e) => {
                e.preventDefault();
                setQ(input);
              }}
              role="search"
            >
              <input
                type="search"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="병원명, 의사명, 진료과, 지역을 검색하세요"
                aria-label="병원 검색"
              />
              <select value={region} onChange={(e) => setRegion(e.target.value)} aria-label="지역 선택">
                <option value="">전체 지역</option>
                {(regions.data || []).map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <button type="submit" className="btn btn-mint">
                검색
              </button>
            </form>
          </div>
          <div className="hero-card">
            <h4>다음 진료 일정</h4>
            {upcoming ? (
              <>
                <p className="hero-date">
                  {upcoming.date} {upcoming.time}
                </p>
                <p>
                  {upcoming.hospital_name} · {upcoming.doctor_name} {upcoming.doctor_title}
                </p>
                <button className="btn btn-outline btn-sm" onClick={() => go(`/appointments/${upcoming.id}`)}>
                  예약 상세 보기
                </button>
              </>
            ) : (
              <p className="muted">예정된 진료가 없습니다.</p>
            )}
            <div className="hero-stats">
              {STATUS_LIST.map((s) => (
                <span key={s}>
                  {s} <b>{store.list.filter((a) => a.status === s).length}</b>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <section className="section">
          <div className="section-head">
            <h2>진료과 선택</h2>
            {department && (
              <button className="btn btn-ghost btn-sm" onClick={() => setDepartment('')}>
                선택 해제
              </button>
            )}
          </div>
          <div className="dept-grid" data-role="department-grid">
            {(departments.data || []).map((d) => (
              <button
                key={d.id}
                className={`dept-card ${String(d.id) === String(department) ? 'active' : ''}`}
                onClick={() => setDepartment(String(d.id) === String(department) ? '' : String(d.id))}
                data-department-id={d.id}
              >
                <span className="dept-icon">{d.icon}</span>
                <strong>{d.name}</strong>
                <small>{d.hospital_count}개 병원</small>
              </button>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <h2>
              병원 목록 <small className="muted">{hospitals.data ? `${sorted.length}곳` : ''}</small>
            </h2>
            <label className="inline-field">
              정렬
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="id">기본순</option>
                <option value="rating">평점 높은순</option>
                <option value="doctors">의사 많은순</option>
                <option value="name">이름순</option>
              </select>
            </label>
          </div>
          {hospitals.loading && !hospitals.data && <Spinner label="병원을 검색하는 중..." />}
          {hospitals.error && <ErrorBox error={hospitals.error} onRetry={hospitals.reload} />}
          {hospitals.data && sorted.length === 0 && (
            <EmptyState
              title="검색 결과가 없습니다"
              desc="검색어나 필터를 변경해 보세요."
              action={
                <button className="btn btn-outline" onClick={reset}>
                  조건 초기화
                </button>
              }
            />
          )}
          <div className="hospital-grid" data-role="hospital-list">
            {sorted.map((h) => (
              <HospitalCard key={h.id} hospital={h} onOpen={(id) => go(`/hospital/${id}`)} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
