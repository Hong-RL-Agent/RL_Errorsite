import React, { useState } from 'react';

function App() {
  const [infraData, setInfraData] = useState(null);
  const [errorLog, setErrorLog] = useState("");

  // [오류 테스트 1] 기본 계정으로 민감 정보 가져오기
  const fetchInfraConfig = async () => {
    try {
      const res = await fetch('/api/infra/secrets?user=admin&pw=password');
      const data = await res.json();
      setInfraData(data);
    } catch (err) {
      console.error("인증 실패");
    }
  };

  // [오류 테스트 2] 서버 강제 크래시 (500 에러 노출)
  const triggerCrash = async () => {
    try {
      const res = await fetch('/api/infra/debug-crash');
      const data = await res.json();
    } catch (err) {
      // 서버에서 뿜어내는 에러 메시지를 화면에 그대로 출력 (취약점)
      setErrorLog("서버 응답 오류: Critical Infrastructure Failure at /app/config/server.yaml...");
    }
  };

  return (
    <div style={{ padding: '40px' }}>
      <h1 style={{ color: '#58a6ff' }}>🛠️ JAWS Infrastructure Management</h1>
      <p>서버 및 네트워크 상태를 모니터링하고 인프라 설정을 변경합니다.</p>
      
      <div style={{ border: '1px solid #30363d', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>시스템 보안 설정</h3>
        <button onClick={fetchInfraConfig} style={btnStyle}>보안 설정값 불러오기 (Admin)</button>
        {infraData && (
          <pre style={codeStyle}>{JSON.stringify(infraData, null, 2)}</pre>
        )}
      </div>

      <div style={{ border: '1px solid #30363d', padding: '20px', borderRadius: '8px' }}>
        <h3>서버 무결성 검사</h3>
        <button onClick={triggerCrash} style={{ ...btnStyle, backgroundColor: '#da3633' }}>디버그 로그 생성</button>
        {errorLog && (
          <div style={{ marginTop: '10px', color: '#ff7b72', backgroundColor: '#21262d', padding: '10px', borderLeft: '4px solid #f85149' }}>
            <strong>[System Error Trace]:</strong>
            <p>{errorLog}</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px', fontSize: '12px', color: '#8b949e' }}>
        ※ 디렉토리 리스팅 확인: <a href="/internal/" style={{ color: '#58a6ff' }}>/internal/ 엔드포인트 바로가기</a>
      </div>
    </div>
  );
}

const btnStyle = {
  padding: '10px 20px',
  backgroundColor: '#238636',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

const codeStyle = {
  backgroundColor: '#161b22',
  padding: '15px',
  borderRadius: '5px',
  marginTop: '15px',
  color: '#7ee787'
};

export default App;