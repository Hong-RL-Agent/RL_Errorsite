import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  UploadCloud, 
  Table, 
  History, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  FileText, 
  Search, 
  Bell, 
  Settings, 
  User,
  AlertTriangle,
  RefreshCcw,
  Download,
  Plus,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const API_BASE = '/api';

const Modal = ({ title, children, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3 style={{ fontWeight: 800 }}>{title}</h3>
        <button className="btn btn-outline" style={{ padding: '4px' }} onClick={onClose}><X size={20} /></button>
      </div>
      <div className="modal-body">{children}</div>
    </div>
  </div>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [bugInfo, setBugInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [showSettings, setShowSettings] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showReport, setShowReport] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Transaction Form
  const [newTx, setNewTx] = useState({ category: 'Food', amount: '', desc: '', date: new Date().toISOString().split('T')[0] });

  // Statistics Data
  const [totalExpense, setTotalExpense] = useState(0);
  const [categoryStats, setCategoryStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);

  const fetchData = async () => {
    try {
      const [rRes, sRes, lRes] = await Promise.all([
        fetch(`${API_BASE}/records`),
        fetch(`${API_BASE}/dashboard/summary`),
        fetch(`${API_BASE}/logs`)
      ]);
      const [rData, sData, lData] = await Promise.all([
        rRes.json(),
        sRes.json(),
        lRes.json()
      ]);
      setRecords(rData.data);
      setSummary(sData);
      setLogs(lData.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTriggerBug = async (bugId) => {
    setLoading(true);
    setBugInfo(null);
    try {
      let res, data;
      if (bugId === 'site085-bug01') {
        res = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trigger: 'bug01', content: "Date;Category;Amount;Desc\n2026-04-01;Food;15000;Lunch" })
        });
        data = await res.json();
        setRecords(data.parsed);
      } else if (bugId === 'site085-bug02') {
        res = await fetch(`${API_BASE}/stats/category?trigger=bug02`);
        data = await res.json();
        setCategoryStats(data.categories);
      } else if (bugId === 'site085-bug03') {
        res = await fetch(`${API_BASE}/stats/monthly?trigger=bug03`);
        data = await res.json();
        setMonthlyStats(data.data);
      } else if (bugId === 'site085-bug04') {
        res = await fetch(`${API_BASE}/stats?trigger=bug04`);
        data = await res.json();
        setTotalExpense(data.totalExpense);
      }

      const xBugId = res.headers.get('X-Bug-Id');
      if (xBugId) {
        const messages = {
          'site085-bug01': "[파싱 오류] CSV 구분자 인식 실패: 세미콜론(;)을 구분자로 인식하지 못하여 전체 행이 단일 컬럼으로 병합되었습니다.",
          'site085-bug02': "[매핑 오류] 필드 순서 역전: 카테고리 통계 산출 시 '설명' 필드가 카테고리로, 'ID'가 금액으로 매핑되는 로직 결함이 발생했습니다.",
          'site085-bug03': "[타입 오류] 데이터 변환 실패: 특정 행의 금액 데이터를 숫자로 변환하는 과정에서 NaN(Not a Number)이 발생하여 합계가 깨졌습니다.",
          'site085-bug04': "[집계 오류] 중복 데이터 이중 합산: 통계 산출 시 상위 2개 레코드가 의도치 않게 중복으로 더해져 총액 불일치가 발생했습니다."
        };
        setBugInfo({ id: xBugId, message: messages[xBugId] });
      }
      if (bugId !== 'site085-bug01') fetchData();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/reset`, { method: 'POST' });
      setTotalExpense(0);
      setCategoryStats([]);
      setMonthlyStats([]);
      await fetchData();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreateTx = async () => {
    if (!newTx.desc || !newTx.amount) return;
    setLoading(true);
    try {
      await fetch(`${API_BASE}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTx)
      });
      setShowAddModal(false);
      setNewTx({ category: 'Food', amount: '', desc: '', date: new Date().toISOString().split('T')[0] });
      await fetchData();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleGetReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/report`);
      const data = await res.json();
      setShowReport(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filteredRecords = useMemo(() => {
    if (!searchTerm) return records;
    return records.filter(r => 
      r.desc.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [records, searchTerm]);

  const COLORS = ['#0ea5e9', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <DollarSign size={32} strokeWidth={3} />
          <span>FinTrack</span>
        </div>
        <ul className="nav-menu">
          <li className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>
            <UploadCloud size={20} /> Upload CSV
          </li>
          <li className={`nav-item ${activeTab === 'records' ? 'active' : ''}`} onClick={() => setActiveTab('records')}>
            <Table size={20} /> Transactions
          </li>
          <li className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
            <BarChart3 size={20} /> Statistics
          </li>
          <li className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
            <History size={20} /> Audit Logs
          </li>
        </ul>

        <div style={{ marginTop: 'auto', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>NODE: site085-active</span>
          </div>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>Last Sync: {summary?.lastUpdate?.substring(11, 19)}</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header-row">
          <div className="title-group">
            <h1>FinTrack Dashboard</h1>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>스마트한 가계부 관리를 위한 데이터 분석 대시보드</p>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} size={18} />
              <input 
                type="text" 
                placeholder="내역 검색..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '10px 10px 10px 40px', borderRadius: '12px', border: '1px solid var(--border)', width: '240px', outline: 'none' }} 
              />
            </div>
            <button className="btn btn-outline" style={{ padding: '10px' }} onClick={() => setShowSettings(true)}><Settings size={20} /></button>
            <button className="btn btn-primary" style={{ borderRadius: '12px', padding: '10px 16px' }} onClick={() => setShowAdmin(true)}>
              <User size={20} /> Admin
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>총 지출 건수</h3>
            <div className="val">{summary?.totalRecords || 0} <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>건</span></div>
          </div>
          <div className="stat-card">
            <h3>이달의 지출 총액</h3>
            <div className="val">{totalExpense > 0 ? totalExpense.toLocaleString() : (records.reduce((s, r) => s + (typeof r.amount === 'number' ? r.amount : 0), 0)).toLocaleString()} <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>원</span></div>
          </div>
          <div className="stat-card">
            <h3>주요 지출 카테고리</h3>
            <div className="val">식비 (Food)</div>
          </div>
          <div className="stat-card">
            <h3>데이터 분석 상태</h3>
            <div className="val" style={{ color: '#10b981' }}>정상 (Stable)</div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'upload' && (
          <div style={{ animation: 'slideIn 0.4s ease-out' }}>
            <div className="upload-zone" onClick={() => handleTriggerBug('site085-bug01')} data-bug-id="site085-bug01">
              <UploadCloud size={64} color="var(--primary)" style={{ marginBottom: '20px' }} />
              <h2>CSV 파일을 업로드하세요</h2>
              <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>드래그 앤 드롭 또는 클릭하여 분석을 시작합니다.</p>
              <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); handleTriggerBug('site085-bug01'); }}>CSV 파일 스마트 분석</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <Download size={24} color="var(--primary)" />
                  <h4 style={{ fontWeight: 800 }}>샘플 양식 다운로드</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '20px' }}>표준 가계부 CSV 양식을 다운로드하여 분석 정확도를 높이세요.</p>
                <button className="btn btn-outline" style={{ width: '100%' }} onClick={handleReset}>샘플 데이터 초기화</button>
              </div>
              <div className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <RefreshCcw size={24} color="var(--secondary)" />
                  <h4 style={{ fontWeight: 800 }}>데이터 정규화 검증</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '20px' }}>기존 업로드된 데이터의 정합성을 수동으로 검증합니다.</p>
                <button className="btn btn-mint" style={{ width: '100%' }} data-bug-id="site085-bug04" onClick={() => handleTriggerBug('site085-bug04')}>지출 총계 정합성 검증</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="table-container" style={{ animation: 'slideIn 0.4s ease-out' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <h3 style={{ fontWeight: 800 }}>지출 트랜잭션 내역</h3>
                <button className="btn btn-primary btn-sm" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setShowAddModal(true)}><Plus size={16} /> 추가</button>
              </div>
              <button className="btn btn-outline btn-sm" onClick={handleGetReport}><FileText size={16} /> 분석 리포트 출력</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>날짜</th>
                  <th>카테고리</th>
                  <th>지출 항목</th>
                  <th>금액 (KRW)</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(r => (
                  <tr key={r.id}>
                    <td>#{r.id}</td>
                    <td>{r.date}</td>
                    <td><span style={{ padding: '4px 8px', background: '#e0f2fe', borderRadius: '6px', color: '#0369a1', fontWeight: 700, fontSize: '0.75rem' }}>{r.category}</span></td>
                    <td>{r.desc}</td>
                    <td style={{ fontWeight: 800 }}>{typeof r.amount === 'number' ? r.amount.toLocaleString() : 'NaN'}</td>
                  </tr>
                ))}
                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>검색 결과가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', animation: 'slideIn 0.4s ease-out' }}>
            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h4 style={{ fontWeight: 800 }}>카테고리별 지출 분포</h4>
                <button className="btn btn-outline btn-sm" data-bug-id="site085-bug02" onClick={() => handleTriggerBug('site085-bug02')}>카테고리 매핑 최적화</button>
              </div>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryStats.length > 0 ? categoryStats : [
                        { name: 'Food', total: 40000 },
                        { name: 'Shopping', total: 30000 },
                        { name: 'Transport', total: 20000 },
                        { name: 'Other', total: 10000 }
                      ]}
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="total"
                    >
                      {(categoryStats.length > 0 ? categoryStats : [{},{},{},{}]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h4 style={{ fontWeight: 800 }}>월간 지출 트렌드</h4>
                <button className="btn btn-outline btn-sm" data-bug-id="site085-bug03" onClick={() => handleTriggerBug('site085-bug03')}>월별 지출 정밀 분석</button>
              </div>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyStats.length > 0 ? monthlyStats : [
                    { month: '2026-01', total: 120000 },
                    { month: '2026-02', total: 150000 },
                    { month: '2026-03', total: 90000 },
                    { month: '2026-04', total: 210000 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="total" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="stat-card" style={{ animation: 'slideIn 0.4s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h4 style={{ fontWeight: 800 }}>데이터 처리 오딧 로그</h4>
              <button className="btn btn-outline btn-sm" onClick={fetchData}>로그 새로고침</button>
            </div>
            <div className="log-box">
              {logs.map(log => (
                <div key={log.id} className="log-entry">
                  <span className="log-time" style={{ color: '#64748b', marginRight: '10px' }}>[{log.time.substring(11, 19)}]</span>
                  <span className="log-type">{log.type}</span>
                  <span>{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modals */}
        {showSettings && (
          <Modal title="대시보드 설정" onClose={() => setShowSettings(false)}>
            <div className="form-group">
              <label>통화 설정</label>
              <select className="form-control"><option>KRW (₩)</option><option>USD ($)</option></select>
            </div>
            <div className="form-group">
              <label>데이터 갱신 주기</label>
              <select className="form-control"><option>실시간</option><option>5분</option><option>30분</option></select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowSettings(false)}>취소</button>
              <button className="btn btn-primary" onClick={() => setShowSettings(false)}>저장</button>
            </div>
          </Modal>
        )}

        {showAdmin && (
          <Modal title="관리자 프로필" onClose={() => setShowAdmin(false)}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '80px', height: '80px', background: 'var(--bg)', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={40} color="var(--primary)" />
              </div>
              <h3 style={{ fontWeight: 800 }}>관리자 (Admin)</h3>
              <p style={{ color: 'var(--text-light)' }}>admin@fintrack.ai</p>
            </div>
            <div className="stat-card" style={{ background: 'var(--bg)', border: 'none' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>최근 로그인</div>
              <div style={{ fontWeight: 700 }}>2026-05-06 23:45:12</div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowAdmin(false)}>확인</button>
            </div>
          </Modal>
        )}

        {showReport && (
          <Modal title="지출 분석 리포트" onClose={() => setShowReport(null)}>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div className="stat-card" style={{ background: 'var(--bg)', border: 'none' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>총 지출액</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>{showReport.summary.totalAmount.toLocaleString()}원</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="stat-card" style={{ background: 'var(--bg)', border: 'none' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>거래 건수</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{showReport.summary.transactionCount}건</div>
                </div>
                <div className="stat-card" style={{ background: 'var(--bg)', border: 'none' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>최대 카테고리</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{showReport.summary.topCategory}</div>
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', textAlign: 'center', marginTop: '12px' }}>리포트 생성 일시: {new Date(showReport.generatedAt).toLocaleString()}</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowReport(null)}>리포트 닫기</button>
            </div>
          </Modal>
        )}

        {showAddModal && (
          <Modal title="신규 거래 추가" onClose={() => setShowAddModal(false)}>
            <div className="form-group">
              <label>날짜</label>
              <input type="date" className="form-control" value={newTx.date} onChange={e => setNewTx({...newTx, date: e.target.value})} />
            </div>
            <div className="form-group">
              <label>카테고리</label>
              <select className="form-control" value={newTx.category} onChange={e => setNewTx({...newTx, category: e.target.value})}>
                <option>Food</option><option>Transport</option><option>Shopping</option><option>Utilities</option><option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>항목 설명</label>
              <input type="text" className="form-control" placeholder="예: 점심 식사" value={newTx.desc} onChange={e => setNewTx({...newTx, desc: e.target.value})} />
            </div>
            <div className="form-group">
              <label>금액 (원)</label>
              <input type="number" className="form-control" placeholder="0" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>취소</button>
              <button className="btn btn-primary" onClick={handleCreateTx}>추가하기</button>
            </div>
          </Modal>
        )}

        {/* Bug Alert Popup */}
        {bugInfo && (
          <div className="anomaly-alert">
            <div className="bug-tag">{bugInfo.id}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#e11d48' }}>
              <AlertTriangle size={24} />
              <h4 style={{ fontWeight: 800 }}>시스템 데이터 분석 결함 탐지</h4>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.6', fontWeight: 500 }}>
              {bugInfo.message}
            </p>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '20px', background: '#e11d48' }} onClick={() => setBugInfo(null)}>결함 확인 및 보고</button>
          </div>
        )}

        {loading && (
          <div style={{ position: 'fixed', top: '40px', left: '50%', transform: 'translateX(-50%)', background: '#fff', padding: '10px 24px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1100, border: '1px solid var(--border)' }}>
            <RefreshCcw className="spin" size={20} color="var(--primary)" />
            <span style={{ fontWeight: 700, color: '#0c4a6e' }}>금융 데이터 분석 중...</span>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
