import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Stethoscope, 
  Building2, 
  Calendar, 
  ClipboardList, 
  ShieldAlert, 
  Activity, 
  User, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  AlertCircle,
  Search
} from 'lucide-react';

const API_BASE = '/api';

function App() {
  const [activeTab, setActiveTab] = useState('hospitals');
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [logs, setLogs] = useState([]);
  const [lastBugId, setLastBugId] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // New Appointment Form State
  const [formData, setFormData] = useState({
    patient: '이준호',
    doctor: '',
    date: '2026-05-15',
    time: '11:00',
    forceOverflow: false
  });

  useEffect(() => {
    fetchHospitals();
    fetchDoctors();
    fetchAppointments(1);
    fetchSchedule();
  }, []);

  const addLog = (msg, level = 'info') => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  const fetchHospitals = async () => {
    try {
      const res = await fetch(`${API_BASE}/hospitals`);
      const data = await res.json();
      setHospitals(data);
    } catch (e) { addLog('Failed to fetch hospitals', 'error'); }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${API_BASE}/doctors`);
      const data = await res.json();
      setDoctors(data);
    } catch (e) { addLog('Failed to fetch doctors', 'error'); }
  };

  const fetchAppointments = async (p, cursor = null) => {
    setLoading(true);
    try {
      let url = `${API_BASE}/appointments?page=${p}`;
      if (cursor) url = `${API_BASE}/appointments?cursor=${cursor}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.bugId) {
        setLastBugId(data.bugId);
        alert(`🚨 [의도된 백엔드 오류 감지: ${data.bugId}]\n설명: 페이지네이션 형식이 비정상적으로 변경되었습니다.`);
      }
      
      if (res.ok) {
        setAppointments(data.data);
        setPage(data.page || p);
        addLog(`Appointments fetched (Page: ${data.page || 'Cursor'})`);
      } else {
        addLog(`Error: ${data.message}`, 'error');
        alert(`❌ [API 서버 오류 발생]\nID: ${data.bugId || 'Unknown'}\n내용: ${data.message}`);
        if (data.bugId) setLastBugId(data.bugId);
      }
    } catch (e) { 
      addLog('Network error fetching appointments', 'error'); 
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedule = async () => {
    try {
      const res = await fetch(`${API_BASE}/schedule`);
      const data = await res.json();
      setSchedule(data);
    } catch (e) { addLog('Failed to fetch schedule', 'error'); }
  };

  const handleBooking = async () => {
    // 1. 정상적인 비즈니스 로직: 예약 가능 여부 확인
    const selectedSlot = schedule.find(s => s.time === formData.time);
    if (selectedSlot && !selectedSlot.available) {
      alert('❌ 예약 불가 안내: 선택하신 시간은 이미 예약이 완료되었습니다. 다른 시간을 선택해 주세요.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.bugId) {
        setLastBugId(data.bugId);
        alert(`🚨 [의도된 백엔드 오류 감지: ${data.bugId}]\n설명: 숫자 오버플로우로 인해 예약 ID가 비정상적으로 생성되었습니다.`);
      }
      
      if (data.success) {
        addLog(`Appointment created ID: ${data.data.id}`);
        fetchAppointments(1);
        alert(`✅ 예약이 완료되었습니다.\n예약번호: ${data.data.id}`);
      }
    } catch (e) {
      addLog('Booking failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteAppointment = async (id) => {
    try {
      await fetch(`${API_BASE}/appointments/${id}`, { method: 'DELETE' });
      addLog(`Appointment ${id} cancelled`);
      fetchAppointments(page);
    } catch (e) { addLog('Cancel failed', 'error'); }
  };

  const viewDetails = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/appointments/${id}`);
      const data = await res.json();
      if (data.bugId) {
        setLastBugId(data.bugId);
        alert(`🚨 [의도된 백엔드 오류 감지: ${data.bugId}]\n설명: 타임스탬프 형식이 ISO에서 UNIX 숫자로 변경되었습니다.\n데이터: ${data.createdAt}`);
      }
      alert(`예약 상세\n번호: ${data.id}\n생성일: ${data.createdAt}\n환자: ${data.patient}`);
    } catch (e) { addLog('Details fetch failed', 'error'); }
  };

  const renderHospitals = () => (
    <div className="fade-in">
      <div className="stats-grid">
        {hospitals.map(h => (
          <div key={h.id} className="card hospital-card">
            <Building2 size={32} color="var(--primary)" />
            <h3>{h.name}</h3>
            <p style={{ color: 'var(--text-dim)' }}>{h.location}</p>
            <div className="badge badge-success">Rating: {h.rating} / 5.0</div>
            <button className="btn btn-outline" style={{ marginTop: 'auto' }} onClick={() => alert(`${h.name} 상세 정보를 불러옵니다.`)}>
              상세보기 <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDoctors = () => (
    <div className="doctor-list fade-in">
      {doctors.map(d => (
        <div key={d.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'var(--bg-accent)', padding: '1rem', borderRadius: '50%' }}>
            <Stethoscope size={24} color="var(--primary)" />
          </div>
          <div>
            <h3>{d.name}</h3>
            <p style={{ color: 'var(--text-dim)' }}>{d.specialty}</p>
            <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>{hospitals.find(h => h.id === d.hospital)?.name}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderBooking = () => (
    <div className="card fade-in" style={{ maxWidth: '800px' }}>
      <h2>진료 예약하기</h2>
      <div className="booking-form">
        <div className="form-group">
          <label>환자 이름</label>
          <input type="text" value={formData.patient} onChange={e => setFormData({...formData, patient: e.target.value})} />
        </div>
        <div className="form-group">
          <label>담당 의사</label>
          <select value={formData.doctor} onChange={e => setFormData({...formData, doctor: e.target.value})}>
            <option value="">의사 선택</option>
            {doctors.map(d => <option key={d.id} value={d.name}>{d.name} ({d.specialty})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>예약 날짜</label>
          <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
        </div>
        <div className="form-group">
          <label>진료 시간</label>
          <select value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}>
            {schedule.map(s => <option key={s.time} value={s.time}>{s.time} {s.available ? '(가능)' : '(불가)'}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button 
          className="btn btn-primary" 
          onClick={() => handleBooking()}
          data-bug-id="site022-bug04"
        >
          <Plus size={18} /> 예약 확정
        </button>
        <button className="btn btn-outline" onClick={() => setFormData({...formData, forceOverflow: !formData.forceOverflow})}>
          {formData.forceOverflow ? '고급 최적화 모드 활성화됨' : '고급 최적화 모드'}
        </button>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="fade-in">
      <div className="table-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>예약 내역 관리</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="btn btn-outline" 
              onClick={() => fetchAppointments(1)}
              data-bug-id="site022-bug01"
            >
              <ChevronLeft size={16} /> 이전
            </button>
            <button 
              className="btn btn-outline" 
              onClick={() => fetchAppointments(2, 'abc123_page2')}
              data-bug-id="site022-bug02"
            >
              다음 <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>환자</th>
              <th>담당 의사</th>
              <th>날짜/시간</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(a => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td style={{ fontWeight: 600 }}>{a.patient}</td>
                <td>{a.doctor}</td>
                <td>{a.date} {a.time}</td>
                <td><span className="badge badge-success">{a.status}</span></td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-outline" 
                    style={{ padding: '0.4rem 0.8rem' }}
                    onClick={() => viewDetails(a.id)}
                    data-bug-id="site022-bug03"
                  >
                    상세
                  </button>
                  <button 
                    className="btn btn-error" 
                    style={{ padding: '0.4rem 0.8rem' }}
                    onClick={() => deleteAppointment(a.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <Activity size={28} />
          <span>VITAL MED</span>
        </div>
        <nav className="nav-menu">
          <li className={`nav-item ${activeTab === 'hospitals' ? 'active' : ''}`} onClick={() => setActiveTab('hospitals')}>
            <Building2 size={20} /> 협력 병원
          </li>
          <li className={`nav-item ${activeTab === 'doctors' ? 'active' : ''}`} onClick={() => setActiveTab('doctors')}>
            <Stethoscope size={20} /> 전문의 목록
          </li>
          <li className={`nav-item ${activeTab === 'booking' ? 'active' : ''}`} onClick={() => setActiveTab('booking')}>
            <Calendar size={20} /> 진료 예약
          </li>
          <li className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>
            <ClipboardList size={20} /> 예약 관리
          </li>
        </nav>
        
        <div style={{ marginTop: 'auto' }}>
          <div className="card" style={{ padding: '1rem', background: 'var(--bg-accent)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>System Status</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }}></div>
              <span style={{ fontSize: '0.8rem' }}>Connected</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Hospital Management System</p>
            <h1>{activeTab === 'hospitals' ? '협력 의료기관' : 
                 activeTab === 'doctors' ? '전문의 파트너' : 
                 activeTab === 'booking' ? '예약 시스템' : '전체 예약 목록'}</h1>
          </div>
          <div className="user-profile">
            <User size={18} />
            <span>Admin Lee</span>
          </div>
        </header>

        {activeTab === 'hospitals' && renderHospitals()}
        {activeTab === 'doctors' && renderDoctors()}
        {activeTab === 'booking' && renderBooking()}
        {activeTab === 'appointments' && renderAppointments()}

        <div className="status-panel">
          <h4 style={{ marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
            Live Logs
            {lastBugId && (
              <span className="bug-indicator">
                <ShieldAlert size={10} /> {lastBugId}
              </span>
            )}
          </h4>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {logs.map((log, i) => (
              <div key={i} className="log-entry" style={{ color: log.includes('Error') ? 'var(--danger)' : 'var(--text-dim)' }}>
                {log}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
