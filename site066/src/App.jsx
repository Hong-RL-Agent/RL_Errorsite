import React, { useState, useEffect } from 'react';
import { 
  Wind, 
  Activity, 
  Database, 
  History, 
  AlertCircle, 
  Settings, 
  RefreshCw, 
  Zap, 
  Thermometer, 
  Droplets, 
  Cpu, 
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Search,
  Bell,
  CheckCircle2,
  PieChart
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sensors, setSensors] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState(1);
  const [data, setData] = useState([]);
  const [latest, setLatest] = useState(null);
  const [status, setStatus] = useState(null);
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [bug, setBug] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initApp();
  }, [activeTab, selectedSensor]);

  const initApp = async () => {
    setLoading(true);
    await fetchSensors();
    if (activeTab === 'dashboard') await fetchSummary();
    if (activeTab === 'sensors') await fetchLatest(false); // Normal fetch
    if (activeTab === 'data') await fetchData(false, false); // Normal fetch
    if (activeTab === 'logs') await fetchLogs();
    setLoading(false);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSensors = async () => {
    const res = await fetch('/api/sensors');
    const json = await res.json();
    setSensors(json.data);
  };

  const fetchSummary = async () => {
    const res = await fetch('/api/dashboard/summary');
    setSummary(await res.json());
  };

  const fetchData = async (useAvg = false, triggerBug = false) => {
    const res = await fetch(`/api/sensors/data?sensorId=${selectedSensor}&avg=${useAvg}&triggerBug=${triggerBug}`);
    const json = await res.json();
    setData(json.data);
    if (json.bugId) {
      setBug({ id: json.bugId });
      window.alert(`[버그 탐지] ${json.bugId}: 의도된 데이터 처리 결함이 발생했습니다.`);
    } else if (!useAvg) {
      setBug(null);
    }
  };

  const fetchLatest = async (triggerBug = false) => {
    const res = await fetch(`/api/sensors/latest?sensorId=${selectedSensor}&triggerBug=${triggerBug}`);
    const json = await res.json();
    setLatest(json);
    if (json.bugId) {
      setBug({ id: json.bugId });
      window.alert(`[버그 탐지] ${json.bugId}: 최신 데이터 선택 알고리즘 오류가 발생했습니다.`);
    } else {
      setBug(null);
    }
  };

  const checkStatus = async (triggerBug = false) => {
    const res = await fetch(`/api/sensors/status?sensorId=${selectedSensor}&triggerBug=${triggerBug}`);
    const json = await res.json();
    setStatus(json);
    if (json.bugId) {
      setBug({ id: json.bugId });
      window.alert(`[버그 탐지] ${json.bugId}: 임계값 비교 부등호 반전 오류가 발생했습니다.`);
    } else {
      setBug(null);
      showToast("장치 상태 정상 판별 완료");
    }
  };

  const handleSimulate = async () => {
    const res = await fetch('/api/sensors/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sensorId: selectedSensor, pm25: Math.floor(Math.random() * 200) })
    });
    if (res.ok) {
      showToast("센서 신호 시뮬레이션 완료");
      initApp();
    }
  };

  const fetchLogs = async () => {
    const res = await fetch('/api/logs');
    const json = await res.json();
    setLogs(json.data);
  };

  const handleUnprepared = (feat) => {
    showToast(`${feat} 기능은 준비 중입니다.`);
  };

  return (
    <div className="iot-app">
      {toast && <div className="toast fade-in">{toast}</div>}

      <header className="iot-header">
        <div className="brand" onClick={() => window.location.reload()} style={{cursor:'pointer'}}>
          <Wind size={28} />
          <span>Air<strong>Guard</strong></span>
        </div>
        
        <nav className="iot-nav">
          <div className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>대시보드</div>
          <div className={`nav-link ${activeTab === 'sensors' ? 'active' : ''}`} onClick={() => setActiveTab('sensors')}>센서 노드</div>
          <div className={`nav-link ${activeTab === 'data' ? 'active' : ''}`} onClick={() => setActiveTab('data')}>데이터 분석</div>
          <div className={`nav-link ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>시스템 로그</div>
        </nav>

        <div className="iot-actions" style={{display:'flex', gap:'16px', alignItems:'center'}}>
          <Bell size={20} color="var(--text-dim)" className="clickable" onClick={() => handleUnprepared('알림')} />
          <Settings size={20} color="var(--text-dim)" className="clickable" onClick={() => handleUnprepared('설정')} />
        </div>
      </header>

      <main className="iot-container">
        <div className="dashboard-grid">
          
          {activeTab === 'dashboard' && (
            <>
              <div className="card col-4 fade-in">
                <div className="stat-widget">
                  <span className="stat-label">평균 PM2.5 (24h)</span>
                  <div className="stat-value">{summary?.avgPm25 || 0}<span className="stat-unit">μg/m³</span></div>
                </div>
              </div>

              <div className="card col-4 fade-in" style={{animationDelay: '0.1s'}}>
                <div className="stat-widget">
                  <span className="stat-label">위험 노드</span>
                  <div className="stat-value" style={{color:'var(--error)'}}>{summary?.badSensors || 0}<span className="stat-unit">Alerts</span></div>
                </div>
              </div>

              <div className="card col-4 fade-in" style={{animationDelay: '0.2s'}}>
                <div className="stat-widget">
                  <span className="stat-label">활성 장치</span>
                  <div className="stat-value">{summary?.totalSensors || 0}<span className="stat-unit">Nodes</span></div>
                </div>
              </div>

              <div className="card col-8 fade-in" style={{animationDelay: '0.3s'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                  <h3>공기질 변화 추이</h3>
                  <button className="btn-neon btn-blue" onClick={() => showToast("그래프를 갱신합니다.")}><RefreshCw size={14} /> 그래프 갱신</button>
                </div>
                <div className="graph-placeholder" style={{height:'180px', display:'flex', alignItems:'flex-end', gap:'8px'}}>
                  {Array.from({length: 20}).map((_, i) => (
                    <div key={i} style={{flex:1, height:`${Math.random() * 80 + 20}%`, background:'linear-gradient(to top, var(--secondary), var(--primary))', borderRadius:'2px'}}></div>
                  ))}
                </div>
              </div>

              <div className="card col-4 fade-in" style={{animationDelay: '0.4s'}}>
                <h3>분석 기능</h3>
                <div style={{display:'flex', flexDirection:'column', gap:'12px', marginTop:'24px'}}>
                   <button className="btn-neon" onClick={() => fetchData(true, true)} data-bug-id="site066-bug02"><BarChart3 size={18} /> 트렌드 분석 시작</button>
                   <button className="btn-neon btn-blue" onClick={handleSimulate}><Zap size={18} /> 강제 데이터 시뮬레이션</button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'sensors' && (
            <>
              <div className="card col-4 fade-in">
                <h3>노드 목록</h3>
                <div style={{marginTop: '20px', display:'flex', flexDirection:'column', gap:'8px'}}>
                  {sensors.map(s => (
                    <div 
                      key={s.id} 
                      className={`nav-item ${selectedSensor === s.id ? 'active' : ''}`}
                      onClick={() => setSelectedSensor(s.id)}
                      style={{
                        padding: '16px', 
                        borderRadius: '12px', 
                        background: selectedSensor === s.id ? '#1a1a1a' : 'transparent',
                        border: '1px solid',
                        borderColor: selectedSensor === s.id ? 'var(--primary)' : 'var(--border)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>{s.name}</span>
                      <ChevronRight size={16} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="card col-8 fade-in">
                <h2>센서 노드 정보: #{selectedSensor}</h2>
                
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginTop:'32px'}}>
                  <div className="panel" style={{background:'#1a1a1a', padding:'24px', borderRadius:'12px', border:'1px solid var(--border)'}}>
                    <span className="stat-label">최신 측정 수치</span>
                    <div className="stat-value" style={{fontSize:'1.8rem', margin:'12px 0'}}>{latest?.pm25 || '--'}<span className="stat-unit">μg/m³</span></div>
                    <div style={{display:'flex', gap:'8px'}}>
                      <button className="btn-outline-sm" style={{flex:1}} onClick={() => fetchLatest(false)}>데이터 새로고침</button>
                      <button className="btn-neon" style={{flex:1}} onClick={() => fetchLatest(true)} data-bug-id="site066-bug03">실시간 데이터 동기화</button>
                    </div>
                  </div>
                  <div className="panel" style={{background:'#1a1a1a', padding:'24px', borderRadius:'12px', border:'1px solid var(--border)'}}>
                    <span className="stat-label">장치 진단 등급</span>
                    <div className="stat-value" style={{fontSize:'1.8rem', margin:'12px 0', color: status?.status === 'Bad' ? 'var(--error)' : 'var(--success)'}}>{status?.status || '--'}</div>
                    <div style={{display:'flex', gap:'8px'}}>
                      <button className="btn-outline-sm" style={{flex:1}} onClick={() => checkStatus(false)}>정상 동작 확인</button>
                      <button className="btn-neon btn-blue" style={{flex:1}} onClick={() => checkStatus(true)} data-bug-id="site066-bug04">상태 진단 실행</button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'data' && (
            <div className="card col-12 fade-in" style={{position: 'relative', zIndex: 10}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px'}}>
                <h3>데이터 분석 매트릭스</h3>
                <div style={{display:'flex', gap:'12px'}}>
                  <button 
                    className="btn-neon btn-blue" 
                    style={{cursor: 'pointer', position: 'relative', zIndex: 20}} 
                    onClick={() => { console.log('Normal Load Clicked'); fetchData(false, false); }}
                  >
                    실시 데이터 로드
                  </button>
                  <button 
                    className="btn-neon" 
                    style={{cursor: 'pointer', position: 'relative', zIndex: 20}} 
                    onClick={() => { console.log('Bug 01 Clicked'); fetchData(false, true); }} 
                    data-bug-id="site066-bug01"
                  >
                    통계 데이터 요약
                  </button>
                </div>
              </div>

              <div style={{overflowX: 'auto'}}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>시간</th>
                      <th>PM2.5 농도</th>
                      <th>단위</th>
                      <th>신뢰도</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((d, i) => (
                      <tr key={i}>
                        <td>{new Date(d.timestamp).toLocaleString()}</td>
                        <td style={{fontWeight:'700'}}>{d.pm25}</td>
                        <td>{d.unit}</td>
                        <td>99.9%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="card col-12 fade-in">
               <h3>운영 활동 로그</h3>
               <div style={{display:'flex', flexDirection:'column', gap:'12px', marginTop:'24px'}}>
                  {logs.map((l, i) => (
                    <div key={i} style={{padding:'16px', background:'#1a1a1a', borderRadius:'12px', borderLeft:'4px solid var(--primary)'}}>
                       <span style={{color:'var(--text-dim)', marginRight:'20px'}}>[{new Date(l.time).toLocaleTimeString()}]</span>
                       <span>{l.msg}</span>
                    </div>
                  ))}
               </div>
            </div>
          )}

        </div>
      </main>

      <div className="ppo-monitor">
         <div className="mon-head" style={{borderBottom:'1px solid #333', paddingBottom:'8px', marginBottom:'12px', fontSize:'0.75rem', fontWeight:'800'}}>PPO-ENVIRONMENT-MONITOR</div>
         <div className="mon-body">
            <div className="mon-row"><span>BUG DETECTED</span><span className={`mon-val ${bug ? 'alert' : ''}`}>{bug ? 'YES' : 'NO'}</span></div>
            <div className="mon-row"><span>BUG ID</span><span className="mon-val">{bug ? bug.id : 'NONE'}</span></div>
            <div className="mon-row"><span>SITE ID</span><span className="v">site066</span></div>
         </div>
      </div>
    </div>
  );
};

export default App;
