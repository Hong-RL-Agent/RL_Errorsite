import React, { useState, useEffect, useMemo } from 'react';

const API_BASE = '/api';

const App = () => {
  const [userId, setUserId] = useState(1);
  const [files, setFiles] = useState([]);
  const [storage, setStorage] = useState({ used: 0, limit: 100 });
  const [logs, setLogs] = useState([]);
  const [bugInfo, setBugInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const fRes = await fetch(API_BASE + '/files?userId=' + userId);
      const sRes = await fetch(API_BASE + '/storage?userId=' + userId);
      const lRes = await fetch(API_BASE + '/logs');
      
      const fData = await fRes.json();
      const sData = await sRes.json();
      const lData = await lRes.json();
      
      setFiles(fData.data || []);
      setStorage({ used: sData.used, limit: sData.limit });
      setLogs(lData.data || []);

      // Bug 03 check
      const bugId3 = sRes.headers.get('X-Bug-Id') || sData.bugId;
      if (bugId3 === 'site021-bug03' && showLoading) {
        setBugInfo({
          id: bugId3,
          title: "버그 3: 누적 용량 계산 오류",
          message: "파일 크기 합산이 잘못 계산되어 실제 데이터량보다 높게 표시되고 있습니다."
        });
      }
    } catch (e) {
      console.error("데이터 동기화 실패");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleUpload = async (fileName, size) => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE + '/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, fileName, size })
      });
      const data = await res.json();
      const bugId = res.headers.get('X-Bug-Id') || data.bugId;
      
      if (bugId === 'site021-bug01') {
        setBugInfo({
          id: bugId,
          title: "버그 1: 용량 제한 미적용",
          message: "설정된 저장 용량 한도를 초과했음에도 불구하고 파일 업로드가 허용되었습니다."
        });
      }
      fetchData();
    } catch (e) { }
    finally { setLoading(false); }
  };

  const handleDelete = async (fileName) => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE + '/file', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName })
      });
      const data = await res.json();
      const bugId = res.headers.get('X-Bug-Id') || data.bugId;
      
      if (bugId === 'site021-bug02') {
        setBugInfo({
          id: bugId,
          title: "버그 2: 삭제 후 공간 미회수",
          message: "파일이 목록에서 삭제되었으나, 물리적 저장 공간 수치는 줄어들지 않고 그대로 유지됩니다."
        });
      }
      fetchData();
    } catch (e) { }
    finally { setLoading(false); }
  };

  const toggleUser = async () => {
    const nextId = userId === 1 ? 2 : 1;
    setUserId(nextId);
    
    try {
      const res = await fetch(API_BASE + '/files?userId=' + nextId);
      const data = await res.json();
      const bugId = res.headers.get('X-Bug-Id') || data.bugId;
      
      if (bugId === 'site021-bug04') {
        setBugInfo({
          id: bugId,
          title: "버그 4: 사용자 격리 실패",
          message: "보안 정책 위반: 다른 사용자의 파일 목록 및 용량 데이터가 현재 세션에 노출되었습니다."
        });
      }
    } catch (e) { }
  };

  const filteredFiles = (files || []).filter(f => 
    f.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo" onClick={() => fetchData(true)} style={{ cursor: 'pointer' }}>
          <span style={{ color: '#00f2ff', fontSize: '24px' }}>☁</span>
          <span>CYBER_CLOUD</span>
        </div>
        <nav className="nav-group">
          <div className="nav-item active">저장소 관리</div>
          <div className="nav-item" onClick={() => fetchData(true)}>데이터 동기화</div>
          <div className="nav-item" onClick={toggleUser} data-bug-id="site021-bug04">사용자 전환</div>
        </nav>
      </aside>

      <main className="main">
        <header className="header">
          <div>
            <h1>스토리지 제어 센터</h1>
            <p style={{ color: '#888', marginTop: '5px' }}>Node ID: 021-U{userId} | Status: Online</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-ghost" onClick={() => fetchData(true)} data-bug-id="site021-bug03">무결성 검사</button>
            <button className="btn btn-primary" onClick={() => handleUpload('data_' + Date.now() + '.bin', 25)} data-bug-id="site021-bug01">
              강제 업로드 (25MB)
            </button>
          </div>
        </header>

        <section className="storage-widget">
          <div className="storage-info">
            <h3>저장 공간 사용량</h3>
            <p>{storage.used}MB / {storage.limit}MB</p>
            <div style={{ width: '100%', height: '10px', background: '#222', borderRadius: '5px', marginTop: '10px' }}>
              <div style={{ width: Math.min(100, (storage.used / storage.limit) * 100) + '%', height: '100%', background: '#00f2ff', borderRadius: '5px' }}></div>
            </div>
          </div>
        </section>

        <section className="file-section">
          <div className="file-section-header">
            <h2>파일 리스트 ({(filteredFiles || []).length})</h2>
            <input 
              type="text" 
              placeholder="파일 검색..." 
              className="btn-ghost"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ padding: '8px 15px', borderRadius: '20px', width: '200px' }}
            />
          </div>
          <div className="file-list">
            {(filteredFiles || []).map(f => (
              <div key={f.id} className="file-card">
                <div>
                  <div className="file-name">{f.fileName}</div>
                  <div className="file-details">UID: {f.userId} | Size: {f.size}MB</div>
                </div>
                <button className="btn-danger" onClick={() => handleDelete(f.fileName)} data-bug-id="site021-bug02">영구 삭제</button>
              </div>
            ))}
          </div>
        </section>

        <section className="log-panel" style={{ marginTop: '30px' }}>
          <h4 style={{ color: '#00f2ff', marginBottom: '10px' }}>커널 감사 로그</h4>
          <div style={{ height: '150px', overflowY: 'auto', background: '#000', padding: '10px', fontSize: '12px' }}>
            {logs.map((l, i) => (
              <div key={i} style={{ marginBottom: '4px', borderLeft: '2px solid #333', paddingLeft: '8px' }}>
                <span style={{ color: '#555' }}>[{new Date(l.time).toLocaleTimeString()}]</span> {l.msg}
              </div>
            ))}
          </div>
        </section>
      </main>

      {bugInfo && (
        <div className="modal-overlay" onClick={() => setBugInfo(null)}>
          <div className="modal">
            <div className="bug-badge" style={{ background: '#ff0055' }}>{bugInfo.id}</div>
            <h3 style={{ marginTop: '15px' }}>{bugInfo.title}</h3>
            <p style={{ margin: '15px 0', color: '#ccc' }}>{bugInfo.message}</p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setBugInfo(null)}>리포트 닫기</button>
          </div>
        </div>
      )}

      {loading && <div className="modal-overlay">시스템 처리 중...</div>}
    </div>
  );
};

export default App;
