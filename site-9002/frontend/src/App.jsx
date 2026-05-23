import React, { useState } from 'react';

function App() {
  const [view, setView] = useState('files'); // 'dashboard', 'files', 'settings'
  const [status, setStatus] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 현재 파일 목록 (가상 데이터)
  const [fileList] = useState([
    { id: 1, name: '2026_연간_계획서.pdf', size: '2.4MB', date: '2026-04-01' },
    { id: 2, name: '프로젝트_제안서_최종.docx', size: '1.1MB', date: '2026-04-10' },
  ]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setStatus({ type: 'info', msg: '보안 서버로 업로드 중...' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      
      // [중요] JSON이 아닌 HTML(Nginx 에러 페이지 등)이 올 경우를 대비한 체크
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '권한 오류');
        setStatus({ type: 'success', msg: '✅ 업로드 성공!' });
      } else {
        // Nginx가 403 HTML 페이지를 던질 때 발생하는 'Unexpected token <' 방지
        if (res.status === 403) throw new Error('403 Forbidden: 서버 저장소 접근 권한이 없습니다.');
        throw new Error('서버 통신 오류가 발생했습니다.');
      }
    } catch (err) {
      setStatus({ type: 'error', msg: `❌ ${err.message}` });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Inter, system-ui' }}>
      
      {/* 사이드바 */}
      <aside style={{ width: '260px', backgroundColor: '#0f172a', color: 'white', padding: '25px' }}>
        <h2 style={{ fontSize: '20px', color: '#38bdf8', marginBottom: '40px' }}>CloudPro Admin</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div onClick={() => setView('dashboard')} style={navItem(view === 'dashboard')}>📊 대시보드</div>
          <div onClick={() => setView('files')} style={navItem(view === 'files')}>📁 내 파일 함</div>
          <div onClick={() => setView('shared')} style={navItem(view === 'shared')}>🔗 공유된 항목</div>
          <div style={{ height: '20px' }}></div>
          <div onClick={() => setView('settings')} style={navItem(view === 'settings')}>⚙️ 보안 설정</div>
        </nav>
      </aside>

      {/* 메인 영역 */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 상단 바 */}
        <header style={{ height: '70px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' }}>
          <div style={{ fontWeight: '600', color: '#64748b' }}>Project Workspace / {view === 'files' ? 'My Files' : 'Overview'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '14px', color: '#94a3b8' }}>ID: User_Admin</span>
            <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#cbd5e1' }}></div>
          </div>
        </header>

        {/* 컨텐츠 구역 */}
        <div style={{ padding: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>파일 저장소</h1>
            <label style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              + 새 파일 업로드
              <input type="file" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
            </label>
          </div>

          {/* 알림 메시지 존 */}
          {status && (
            <div style={{ padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid',
              backgroundColor: status.type === 'error' ? '#fef2f2' : '#f0f9ff',
              color: status.type === 'error' ? '#991b1b' : '#075985',
              borderColor: status.type === 'error' ? '#fecaca' : '#bae6fd'
            }}>
              {status.msg}
            </div>
          )}

          {/* 파일 리스트 테이블 */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th style={thStyle}>파일명</th>
                  <th style={thStyle}>용량</th>
                  <th style={thStyle}>업로드 날짜</th>
                  <th style={thStyle}>상태</th>
                </tr>
              </thead>
              <tbody>
                {fileList.map(f => (
                  <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={tdStyle}>{f.name}</td>
                    <td style={tdStyle}>{f.size}</td>
                    <td style={tdStyle}>{f.date}</td>
                    <td style={tdStyle}><span style={{ color: '#10b981' }}>Available</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

const navItem = (active) => ({
  padding: '12px 15px', borderRadius: '8px', cursor: 'pointer',
  backgroundColor: active ? '#1e293b' : 'transparent',
  color: active ? '#38bdf8' : '#94a3b8', fontWeight: active ? '600' : '400'
});
const thStyle = { padding: '15px 20px', textAlign: 'left', fontSize: '13px', color: '#64748b', fontWeight: '600' };
const tdStyle = { padding: '18px 20px', fontSize: '14px', color: '#334155' };

export default App;