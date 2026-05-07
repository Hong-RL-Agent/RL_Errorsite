import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  File, 
  Image as ImageIcon, 
  Video, 
  Upload as UploadIcon, 
  LayoutDashboard, 
  Settings, 
  Search, 
  Bell, 
  History, 
  HardDrive, 
  Plus, 
  MoreVertical,
  AlertTriangle,
  FileText,
  Trash2,
  Filter,
  CheckCircle,
  XCircle,
  RefreshCw,
  User,
  ShieldCheck,
  CloudLightning,
  ChevronRight,
  Monitor,
  Activity,
  UserCheck,
  Share2
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [files, setFiles] = useState([]);
  const [trashFiles, setTrashFiles] = useState([
    { id: 901, name: 'old_draft.docx', size: 15000, deletedAt: Date.now() - 86400000 },
    { id: 902, name: 'temporary_image.png', size: 450000, deletedAt: Date.now() - 172800000 }
  ]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bug, setBug] = useState(null);
  const [toast, setToast] = useState(null);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchData();
  }, [activeTab, filterType]);

  const fetchData = async () => {
    setLoading(true);
    if (activeTab === 'dashboard') await fetchSummary();
    if (activeTab === 'files') await fetchFiles();
    setLoading(false);
  };

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSummary = async () => {
    const res = await fetch('/api/dashboard/summary');
    setSummary(await res.json());
  };

  const fetchFiles = async (checkBug04 = false) => {
    const typeQuery = filterType !== 'all' ? `?type=${filterType}` : '';
    const res = await fetch(`/api/files${typeQuery}`);
    const data = await res.json();
    setFiles(data.data);
    if (data.bugId) {
      setBug({ id: data.bugId });
      if (checkBug04) window.alert(`[시스템 알림] ${data.bugId}: 메타데이터 동기화 지연이 발생했습니다.`);
    } else {
      setBug(null);
    }
  };

  const handleQuickSecureUpload = async () => {
    showToast("보안 검사 중...", "info");
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: 'security_patch.jpg', size: 45000, type: 'application/x-msdownload' })
    });
    const data = await res.json();
    if (data.bugId === 'site064-bug01') {
      window.alert(`[보안 경고] ${data.bugId}: MIME 타입 불일치 파일이 업로드되었습니다!`);
      setBug({ id: data.bugId });
    }
    fetchData();
  };

  const handleBackupData = async () => {
    showToast("시스템 백업 시작...", "info");
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: 'full_backup.sql', size: 999999999, type: 'application/sql' })
    });
    const data = await res.json();
    if (data.bugId === 'site064-bug02') {
      window.alert(`[시스템 오류] ${data.bugId}: 용량 초과 에러에도 불구하고 파일이 저장되었습니다.`);
      setBug({ id: data.bugId });
    }
    fetchData();
  };

  const handleSmartSync = async () => {
    showToast("스마트 동기화 중...", "info");
    await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: 'Report.pdf', size: 20000, type: 'application/pdf' })
    });
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: 'report.pdf', size: 30000, type: 'application/pdf' })
    });
    const data = await res.json();
    if (data.bugId === 'site064-bug03') {
      window.alert(`[데이터 경고] ${data.bugId}: 파일명 중복 충돌로 기존 파일이 유실되었습니다.`);
      setBug({ id: data.bugId });
    }
    fetchData();
  };

  const handleRefreshState = async () => {
    showToast("상태 갱신 중...", "info");
    await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: 'temp_log.txt', size: 100, type: 'text/plain' })
    });
    fetchFiles(true);
  };

  const formatSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleUnprepared = (feature) => {
    showToast(`'${feature}' 기능은 현재 준비 중입니다.`, "info");
  };

  return (
    <div className="cloud-container">
      {toast && (
        <div className={`toast-popup ${toast.type} fade-in`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className="cloud-sidebar">
        <div className="brand" style={{cursor: 'pointer'}} onClick={() => window.location.reload()}>
          <CloudLightning size={32} />
          <span>Cloud<strong>Flow</strong></span>
        </div>
        
        <nav className="nav-menu">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} /> 대시보드
          </div>
          <div className={`nav-item ${activeTab === 'files' ? 'active' : ''}`} onClick={() => setActiveTab('files')}>
            <Folder size={20} /> 모든 파일
          </div>
          <div className={`nav-item ${activeTab === 'trash' ? 'active' : ''}`} onClick={() => setActiveTab('trash')}>
            <Trash2 size={20} /> 휴지통
          </div>
        </nav>

        <div className="storage-quota" style={{marginTop: 'auto', padding: '16px', background: '#f8fafc', borderRadius: '12px'}}>
           <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '8px'}}>
              <span>저장 공간 사용량</span>
              <span>72%</span>
           </div>
           <div style={{height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden'}}>
              <div style={{width: '72%', height: '100%', background: 'var(--primary)'}}></div>
           </div>
           <button className="btn-txt" style={{marginTop: '12px', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600'}} onClick={() => handleUnprepared('용량 확장')}>용량 확장</button>
        </div>

        <div className="user-profile" style={{marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', cursor: 'pointer'}} onClick={() => handleUnprepared('회원정보')}>
           <div style={{width: '36px', height: '36px', borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'}}><User size={18} /></div>
           <div style={{display: 'flex', flexDirection: 'column'}}>
              <span style={{fontSize: '0.875rem', fontWeight: '600'}}>Admin User</span>
              <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Premium Plan</span>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="cloud-main">
        <header className="cloud-header">
           <div className="h-left">
              <div className="h-search">
                 <Search size={18} color="#94a3b8" />
                 <input type="text" placeholder="파일 검색..." onKeyDown={(e) => e.key === 'Enter' && handleUnprepared('검색')} />
              </div>
           </div>
           <div className="h-right">
              <button className="h-icon-btn" onClick={() => handleUnprepared('보안')}><ShieldCheck size={20} /></button>
              <button className="h-icon-btn" onClick={() => handleUnprepared('알림')}><Bell size={20} /></button>
              <button className="btn-upload" onClick={handleQuickSecureUpload} data-bug-id="site064-bug01">
                 <Plus size={18} /> 보안 업로드
              </button>
           </div>
        </header>

        <div className="cloud-content">
           {activeTab === 'dashboard' && (
             <div className="view-dashboard fade-in">
                <div className="welcome-banner" style={{background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', padding: '32px', borderRadius: '20px', color: '#fff', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                   <div>
                      <h1 style={{fontSize: '1.75rem', marginBottom: '8px'}}>반갑습니다, 관리자님!</h1>
                      <p style={{opacity: 0.9}}>시스템의 모든 자산이 안전하게 보호되고 있습니다.</p>
                   </div>
                   <div style={{display: 'flex', gap: '12px'}}>
                      <button className="glass-btn" onClick={handleSmartSync} data-bug-id="site064-bug03"><Activity size={18} /> 스마트 동기화</button>
                      <button className="glass-btn" onClick={handleBackupData} data-bug-id="site064-bug02"><Monitor size={18} /> 시스템 백업</button>
                   </div>
                </div>

                <div className="stats-grid">
                   <div className="stat-card clickable" onClick={() => setActiveTab('files')} style={{cursor: 'pointer'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                         <span className="label">총 등록 파일</span>
                         <Folder size={18} color="var(--primary)" />
                      </div>
                      <span className="value">{summary?.totalFiles || 0}개</span>
                   </div>
                   <div className="stat-card clickable" onClick={() => handleUnprepared('이미지 필터')} style={{cursor: 'pointer'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                         <span className="label">이미지 자산</span>
                         <ImageIcon size={18} color="#10b981" />
                      </div>
                      <span className="value">{summary?.images || 0}개</span>
                   </div>
                   <div className="stat-card clickable" onClick={() => handleUnprepared('문서 필터')} style={{cursor: 'pointer'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                         <span className="label">문서 자료</span>
                         <FileText size={18} color="#3b82f6" />
                      </div>
                      <span className="value">{summary?.docs || 0}개</span>
                   </div>
                   <div className="stat-card clickable" onClick={() => handleUnprepared('공유 현황')} style={{cursor: 'pointer'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                         <span className="label">공유 중인 항목</span>
                         <Share2 size={18} color="#f59e0b" />
                      </div>
                      <span className="value">12개</span>
                   </div>
                </div>

                <div className="shortcut-row" style={{marginTop: '40px', display: 'flex', gap: '20px'}}>
                   <div className="panel white-panel" style={{flex: 1, padding: '24px', borderRadius: '12px', border: '1px solid var(--border)'}}>
                      <h3 style={{marginBottom: '16px'}}>최근 동기화 상태</h3>
                      <div style={{display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--success)'}}>
                         <CheckCircle size={24} />
                         <span>모든 장치가 최신 상태입니다.</span>
                      </div>
                      <button className="btn-outline-sm" style={{marginTop: '20px'}} onClick={handleRefreshState} data-bug-id="site064-bug04"><RefreshCw size={16} /> 지금 갱신</button>
                   </div>
                   <div className="panel white-panel" style={{flex: 1, padding: '24px', borderRadius: '12px', border: '1px solid var(--border)'}}>
                      <h3 style={{marginBottom: '16px'}}>보안 취약점 검사</h3>
                      <div style={{display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)'}}>
                         <ShieldCheck size={24} />
                         <span>지난 24시간 동안 위협이 감지되지 않았습니다.</span>
                      </div>
                      <button className="btn-upload" style={{marginTop: '20px', width: 'fit-content'}} onClick={() => handleUnprepared('정밀 검사')}>검사 시작</button>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'files' && (
             <div className="view-files fade-in">
                <div className="view-controls">
                   <div className="filter-tabs">
                      <button className={`filter-btn ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>모두</button>
                      <button className={`filter-btn ${filterType === 'image' ? 'active' : ''}`} onClick={() => setFilterType('image')}>이미지</button>
                      <button className={`filter-btn ${filterType === 'doc' ? 'active' : ''}`} onClick={() => setFilterType('doc')}>문서</button>
                   </div>
                   <div style={{display: 'flex', gap: '8px'}}>
                      <button className="btn-outline-sm" onClick={() => handleRefreshState()} data-bug-id="site064-bug04"><RefreshCw size={16} /> 갱신</button>
                      <button className="btn-upload" onClick={() => handleUnprepared('파일 업로드')}><UploadIcon size={18} /> 새 파일 업로드</button>
                   </div>
                </div>

                {loading ? <div className="loading-spinner"></div> : (
                  <div className="file-grid">
                    {files.map(f => (
                      <div key={f.id} className="file-card" onClick={() => handleUnprepared(`${f.name} 정보`)}>
                        <div className="file-icon">
                          {f.type?.includes('image') ? <ImageIcon size={40} /> : <FileText size={40} />}
                        </div>
                        <div className="file-info">
                          <span className="name">{f.name}</span>
                          <div className="meta">
                            <span className={!f.size ? 'meta-error' : ''}>{formatSize(f.size)}</span>
                            <span>{f.type || <span className="meta-error">데이터 누락</span>}</span>
                          </div>
                        </div>
                        <div className="card-actions" onClick={(e) => { e.stopPropagation(); handleUnprepared('파일 옵션'); }}>
                           <MoreVertical size={16} color="var(--text-muted)" />
                        </div>
                        {(!f.size || !f.type) && (
                          <div style={{position: 'absolute', top: '12px', right: '12px'}}>
                             <AlertTriangle size={18} color="#ef4444" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
             </div>
           )}

           {activeTab === 'trash' && (
             <div className="view-trash fade-in">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
                   <div>
                      <h2>휴지통</h2>
                      <p style={{fontSize: '0.875rem', color: 'var(--text-muted)'}}>삭제된 파일은 30일 후에 영구 삭제됩니다.</p>
                   </div>
                   <button className="btn-outline-sm" style={{color: 'var(--error)', borderColor: 'var(--error)'}} onClick={() => { setTrashFiles([]); showToast("휴지통을 비웠습니다.", "success"); }}>휴지통 비우기</button>
                </div>
                <div className="file-grid">
                   {trashFiles.map(tf => (
                     <div key={tf.id} className="file-card" style={{opacity: 0.6}}>
                        <div className="file-icon"><Trash2 size={40} color="#94a3b8" /></div>
                        <div className="file-info">
                           <span className="name">{tf.name}</span>
                           <div className="meta">
                              <span>{formatSize(tf.size)}</span>
                              <span>{new Date(tf.deletedAt).toLocaleDateString()} 삭제됨</span>
                           </div>
                        </div>
                        <div className="card-actions" onClick={(e) => { e.stopPropagation(); handleUnprepared('복원'); }}>
                           <RefreshCw size={16} color="var(--primary)" />
                        </div>
                     </div>
                   ))}
                   {trashFiles.length === 0 && <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#94a3b8'}}>휴지통이 비어 있습니다.</div>}
                </div>
             </div>
           )}
        </div>
      </main>

      {/* PPO Monitor */}
      <div className="ppo-monitor">
         <div className="mon-head">PPO-ENVIRONMENT-MONITOR</div>
         <div className="mon-body">
            <div className="mon-row"><span>BUG DETECTED</span><span className={`v highlight ${bug ? 'active' : ''}`}>{bug ? 'YES' : 'NO'}</span></div>
            <div className="mon-row"><span>BUG ID</span><span className="v highlight">{bug ? bug.id : 'NONE'}</span></div>
            <div className="mon-row"><span>SITE ID</span><span className="v">site064</span></div>
         </div>
      </div>
    </div>
  );
};

export default App;
