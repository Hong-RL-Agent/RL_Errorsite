import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Train, 
  AlertTriangle, 
  Search as SearchIcon, 
  Settings, 
  Info, 
  X, 
  ExternalLink,
  Activity,
  ArrowRight,
  Clock,
  BarChart3,
  Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = '/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [lines, setLines] = useState([]);
  const [stations, setStations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeBug, setActiveBug] = useState(null);
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debugData, setDebugData] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const addLog = (msg) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`);
      const data = await res.json();
      setSummary(data);
      addLog("대시보드 요약 데이터 수신 완료");
    } catch (e) { addLog("대시보드 연결 오류"); }
  };

  const fetchLines = async () => {
    setLoading(true);
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/lines`);
      const data = await res.json();
      setLines(data.data);
      setDebugData(data.debugMeta);
      if (data.bugId) setActiveBug(data);
      addLog("노선 목록 동기화 완료");
    } catch (e) { addLog("노선 정보 조회 실패"); }
    finally { setLoading(false); }
  };

  const fetchStations = async () => {
    setLoading(true);
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/stations`);
      const data = await res.json();
      setStations(data.data);
      if (data.bugId) setActiveBug(data);
      addLog("역 정보 데이터 수신 완료");
    } catch (e) { addLog("역 정보 조회 실패"); }
    finally { setLoading(false); }
  };

  const fetchAlerts = async () => {
    setLoading(true);
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/alerts`);
      const data = await res.json();
      setAlerts(data.data);
      if (data.bugId) setActiveBug(data);
      addLog("지연 공지 최신화 완료");
    } catch (e) { addLog("공지 사항 조회 실패"); }
    finally { setLoading(false); }
  };

  const fetchAlertDetail = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/alerts/${id}`);
      const data = await res.json();
      setSelectedAlert(data);
      if (data.bugId) setActiveBug(data);
      addLog(`공지 상세 정보 로드: ID ${id}`);
    } catch (e) { addLog("공지 상세 정보 조회 실패"); }
  };

  const fetchStationDetail = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/stations/${id}`);
      const data = await res.json();
      setSelectedStation(data);
      addLog(`역 상세 정보 로드: ${data.name}`);
    } catch (e) { addLog("역 상세 정보 조회 실패"); }
  };

  const renderStatusBadge = (status) => {
    const validStates = ['NORMAL', 'DELAY', 'SUSPENDED'];
    const isInvalid = !validStates.includes(status);
    
    let className = "badge ";
    if (status === 'NORMAL') className += "badge-normal";
    else if (status === 'DELAY') className += "badge-delay";
    else if (status === 'SUSPENDED') className += "badge-suspend";
    else if (isInvalid) className += "badge-error";

    return (
      <span className={`${className} ${isInvalid ? 'schema-error' : ''}`}>
        {status || "N/A"}
      </span>
    );
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Activity size={24} color="#3182ce" />
          <span>URBAN TRANSIT</span>
        </div>
        
        <ul className="nav-menu">
          <li className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => {setActiveTab('overview'); fetchSummary();}}>
            <LayoutDashboard size={20} /> Overview
          </li>
          <li className={`nav-item ${activeTab === 'lines' ? 'active' : ''}`} onClick={() => {setActiveTab('lines'); fetchLines();}} data-bug-id="site034-bug02">
            <MapIcon size={20} /> Lines
          </li>
          <li className={`nav-item ${activeTab === 'stations' ? 'active' : ''}`} onClick={() => {setActiveTab('stations'); fetchStations();}} data-bug-id="site034-bug03">
            <Train size={20} /> Stations
          </li>
          <li className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => {setActiveTab('alerts'); fetchAlerts();}} data-bug-id="site034-bug01">
            <AlertTriangle size={20} /> Alerts
          </li>
          <li className={`nav-item ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>
            <SearchIcon size={20} /> Search
          </li>
        </ul>

        <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
           <div style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: '0.5rem' }}>SYSTEM HEALTH</div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#48bb78' }}></div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white' }}>STABLE</span>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>도시철도 통합 관제 대시보드</div>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => alert("현재 서비스 정상 운행 중입니다.")}>
                <Activity size={16} /> 실시간 상태
             </button>
             <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#edf2f7', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Settings size={20} color="#4a5568" />
             </div>
          </div>
        </header>

        <div className="content-body">
          {activeBug && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bug-banner">
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <AlertTriangle size={20} />
                  <div>
                    <strong>스키마/계약 위반 탐지:</strong> {activeBug.type}
                  </div>
                  <span className="bug-id">{activeBug.bugId}</span>
               </div>
               <X size={18} style={{ cursor: 'pointer' }} onClick={() => setActiveBug(null)} />
            </motion.div>
          )}

          {activeTab === 'overview' && (
            <div className="fade-in">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#ebf8ff' }}><MapIcon color="#3182ce" /></div>
                  <div className="stat-info">
                    <h4>운영 노선</h4>
                    <div className="value">{summary?.totalLines}개 라인</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#f0fff4' }}><Train color="#38a169" /></div>
                  <div className="stat-info">
                    <h4>전체 역 수</h4>
                    <div className="value">{summary?.totalStations}개 역</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#fff5f5' }}><AlertTriangle color="#e53e3e" /></div>
                  <div className="stat-info">
                    <h4>활성 지연 공지</h4>
                    <div className="value">{summary?.activeAlerts}건</div>
                  </div>
                </div>
              </div>

              <div className="log-panel">
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'white' }}>
                    <Terminal size={18} />
                    <strong>Operation Logs</strong>
                 </div>
                 {logs.map((log, i) => <div key={i} className="log-entry">{log}</div>)}
              </div>
            </div>
          )}

          {activeTab === 'lines' && (
            <div className="fade-in">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Line ID</th>
                      <th>노선명</th>
                      <th>운영 역 수</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map(line => (
                      <tr key={line.lineId}>
                        <td style={{ fontWeight: 700 }}>{line.lineId}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                             <div style={{ width: 12, height: 12, borderRadius: '50%', background: line.color }}></div>
                             {line.name}
                          </div>
                        </td>
                        <td>{line.stationCount} Stations</td>
                        <td><span className="badge badge-normal">Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {debugData && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fffaf0', border: '1px solid #feebc8', borderRadius: '12px' }} className="schema-error">
                   <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#9c4221', marginBottom: '0.5rem' }}>[UNEXPECTED FIELDS DETECTED]</div>
                   <pre style={{ fontSize: '0.75rem' }}>{JSON.stringify(debugData, null, 2)}</pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'stations' && (
            <div className="fade-in">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>역명</th>
                      <th>노선</th>
                      <th>혼잡도</th>
                      <th>액션</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stations.map(station => (
                      <tr key={station.stationId}>
                        <td>{station.stationId}</td>
                        <td style={{ fontWeight: 700 }}>{station.name}</td>
                        <td><span className="badge" style={{ background: '#edf2f7' }}>{station.lineId}</span></td>
                        <td>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {typeof station.congestionLevel !== 'number' ? (
                                <span className="badge badge-error schema-error">{station.congestionLevel}</span>
                              ) : (
                                <div style={{ width: '100px', height: '6px', background: '#edf2f7', borderRadius: '3px' }}>
                                   <div style={{ width: `${station.congestionLevel * 20}%`, height: '100%', background: station.congestionLevel > 3 ? '#e53e3e' : '#38a169', borderRadius: '3px' }}></div>
                                </div>
                              )}
                           </div>
                        </td>
                        <td>
                          <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => fetchStationDetail(station.stationId)}>상세보기</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="fade-in">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {alerts.map(alert => (
                  <div key={alert.alertId} className={`stat-card ${!alert.lineId || !alert.status ? 'schema-error' : ''}`} style={{ flexDirection: 'column', alignItems: 'flex-start' }} onClick={() => fetchAlertDetail(alert.alertId)} data-bug-id="site034-bug04">
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
                       <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#718096' }}>{alert.alertId}</span>
                       {renderStatusBadge(alert.status)}
                    </div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{alert.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#718096', fontSize: '0.85rem' }}>
                       <Clock size={14} /> 2시간 전 업데이트
                       {alert.lineId && <span className="badge" style={{ background: '#edf2f7' }}>{alert.lineId}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {selectedStation && (
          <div className="modal-overlay" onClick={() => setSelectedStation(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-content" onClick={e => e.stopPropagation()}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem' }}>{selectedStation.name}역 정보</h2>
                  <X style={{ cursor: 'pointer' }} onClick={() => setSelectedStation(null)} />
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#718096' }}>ID</div>
                    <div style={{ fontWeight: 700 }}>{selectedStation.stationId}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#718096' }}>환승 가능 노선</div>
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                       {selectedStation.lines.map(l => <span key={l} className="badge" style={{ background: '#edf2f7' }}>{l}</span>)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#718096' }}>첫차 시간</div>
                    <div style={{ fontWeight: 700 }}>{selectedStation.firstTrain}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#718096' }}>막차 시간</div>
                    <div style={{ fontWeight: 700 }}>{selectedStation.lastTrain}</div>
                  </div>
               </div>
               <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { addLog(`${selectedStation.name}역 시설 정보를 확인했습니다.`); setSelectedStation(null); }}>시설 정보 확인</button>
            </motion.div>
          </div>
        )}

        {selectedAlert && (
          <div className="modal-overlay" onClick={() => setSelectedAlert(null)}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="modal-content" onClick={e => e.stopPropagation()}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem' }}>지연 공지 상세</h2>
                  <X style={{ cursor: 'pointer' }} onClick={() => setSelectedAlert(null)} />
               </div>
               <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', marginBottom: '1.5rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                     {renderStatusBadge(selectedAlert.status)}
                  </div>
                  <h3 style={{ marginBottom: '0.5rem' }}>{selectedAlert.title}</h3>
                  <p style={{ color: '#4a5568', fontSize: '0.95rem', lineHeight: 1.6 }}>{selectedAlert.description}</p>
               </div>
               <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '2rem' }}>
                  업데이트 일시: {selectedAlert.updatedAt}
               </div>
               <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setSelectedAlert(null)}>확인 완료</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
