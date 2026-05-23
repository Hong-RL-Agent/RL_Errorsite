import React, { useState } from 'react';

function App() {
  const [status, setStatus] = useState('아이디어를 입력하세요.');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setStatus('🤖 AI가 이미지를 생성 중입니다... (약 10초 소요)');
    
    try {
      const res = await fetch('/api/generate-ai');
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      setStatus(`✨ 생성 완료: ${data.message}`);
    } catch (err) {
      // 504 Gateway Timeout이 발생하면 이리로 옵니다.
      setStatus(`❌ 오류 발생: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#050505', color: 'white', fontFamily: 'Inter, sans-serif', display: 'flex' }}>
      {/* 좌측 사이드바 */}
      <div style={{ width: '80px', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
        <div style={{ width: '40px', height: '40px', backgroundColor: '#6366f1', borderRadius: '10px', marginBottom: '40px' }}></div>
        <div style={{ color: '#6366f1', fontSize: '20px' }}>🎨</div>
      </div>

      {/* 메인 컨텐츠 */}
      <div style={{ flex: 1, padding: '60px' }}>
        <h1 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '10px' }}>AI Image Studio <span style={{ color: '#6366f1' }}>Pro</span></h1>
        <p style={{ color: '#888', marginBottom: '40px' }}>단 몇 초 만에 상상을 현실로 만드세요. (Site #9003)</p>

        <div style={{ maxWidth: '800px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '20px', padding: '40px' }}>
          <textarea 
            placeholder="예: 우주에서 서핑하는 고양이..." 
            style={{ width: '100%', height: '100px', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', padding: '15px', color: 'white', fontSize: '16px', marginBottom: '20px' }}
          />
          <button 
            onClick={handleGenerate}
            disabled={loading}
            style={{ width: '100%', padding: '18px', backgroundColor: loading ? '#333' : '#6366f1', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px' }}
          >
            {loading ? 'AI 엔진 가동 중...' : '이미지 생성하기'}
          </button>

          <div style={{ marginTop: '30px', padding: '20px', borderRadius: '12px', backgroundColor: status.includes('❌') ? '#450a0a' : '#1a1a1a', border: `1px solid ${status.includes('❌') ? '#991b1b' : '#333'}` }}>
            <span style={{ color: status.includes('❌') ? '#f87171' : '#6366f1' }}>시스템 상태:</span> {status}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;