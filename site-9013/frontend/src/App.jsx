import React, { useState, useEffect } from 'react';

function App() {
  const [status, setStatus] = useState({ active_count: 0, memory_usage: '0 MB' });
  const [inMeeting, setInMeeting] = useState(false);

  const fetchStatus = () => {
    fetch('/api/status').then(res => res.json()).then(data => setStatus(data));
  };

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 3000);
    return () => clearInterval(timer);
  }, []);

  const joinMeeting = async () => {
    await fetch('/api/join', { method: 'POST' });
    setInMeeting(true);
    fetchStatus();
  };

  const leaveMeeting = async () => {
    await fetch('/api/leave', { method: 'POST' });
    setInMeeting(false);
    fetchStatus();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'Inter, sans-serif', padding: '40px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#1a73e8', fontWeight: '800' }}>📹 JAWS Meet</h1>
        <div style={{ backgroundColor: 'white', padding: '10px 20px', borderRadius: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '14px', color: '#5f6368' }}>Server Load: </span>
          <strong style={{ color: '#d93025' }}>{status.memory_usage}</strong>
        </div>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {inMeeting ? (
          <div style={{ backgroundColor: '#202124', borderRadius: '16px', height: '500px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '200px', height: '150px', backgroundColor: '#3c4043', borderRadius: '8px', border: '2px solid #8ab4f8' }}></div>
            <div style={{ position: 'absolute', bottom: '30px', display: 'flex', gap: '20px' }}>
              <button onClick={leaveMeeting} style={{ padding: '15px 30px', backgroundColor: '#ea4335', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}>
                회의 종료 (Leave)
              </button>
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', padding: '60px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>프리미엄 화상 회의</h2>
            <p style={{ color: '#5f6368', marginBottom: '40px' }}>모두를 위한 안전한 비즈니스 커뮤니케이션 서비스입니다.</p>
            <button onClick={joinMeeting} style={{ padding: '18px 40px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', fontWeight: '600' }}>
              새 회의 시작하기
            </button>
          </div>
        )}

        <div style={{ marginTop: '40px', color: '#70757a', fontSize: '14px', textAlign: 'center' }}>
           현재 서버에 남아있는 세션: <strong>{status.active_count}개</strong> (참고: 아무도 없는데 세션이 남아있다면 오류입니다.)
        </div>
      </div>
    </div>
  );
}

export default App;