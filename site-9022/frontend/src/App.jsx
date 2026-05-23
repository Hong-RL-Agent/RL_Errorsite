import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 백엔드에서 매출 보고서 가져오기
  useEffect(() => {
    fetch('/api/sales-report')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("API 통신 오류:", err);
        setLoading(false);
      });
  }, []);

  const cardStyle = { 
    backgroundColor: 'white', 
    padding: '30px', 
    borderRadius: '15px', 
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0'
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>데이터 로딩 중...</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ color: '#0f172a', fontSize: '28px', fontWeight: '800' }}>📊 JAWS ERP: 지점별 매출 합산 시스템</h1>
          <p style={{ color: '#64748b', marginTop: '8px' }}>실시간 분할 정복(Divide & Conquer) 알고리즘 적용 결과</p>
        </header>

        {/* 상단 요약 카드 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div style={cardStyle}>
            <p style={{ color: '#64748b', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>전체 집계 매출 (Total Revenue)</p>
            <h2 style={{ fontSize: '32px', color: '#1e40af', marginTop: '10px' }}>
              ₩ {data ? data.totalRevenue.toLocaleString() : '0'}
            </h2>
          </div>
          <div style={cardStyle}>
            <p style={{ color: '#64748b', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>활성 지점 수 (Branch Count)</p>
            <h2 style={{ fontSize: '32px', color: '#0f172a', marginTop: '10px' }}>{data ? data.branchCount : 0} Sites</h2>
          </div>
        </div>

        {/* 매출 분포 시각화 (가짜 차트) */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '18px', marginBottom: '25px', color: '#334155' }}>지점별 매출 분포 (목표: 지점당 ₩ 25,000,000)</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '30px', height: '150px', paddingBottom: '20px', borderBottom: '2px solid #f1f5f9' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ 
                  width: '100%', 
                  height: '120px', 
                  backgroundColor: i === 4 ? '#e2e8f0' : '#3b82f6', // 4번 지점이 누락된 것처럼 보이게 연출
                  borderRadius: '6px 6px 0 0' 
                }}></div>
                <p style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>지점 {i}</p>
              </div>
            ))}
          </div>
          
          {/* 시스템 진단 로그 (에이전트 단서) */}
          <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#fff7ed', borderRadius: '8px', border: '1px solid #ffedd5' }}>
            <p style={{ fontSize: '12px', color: '#9a3412', lineHeight: '1.6' }}>
              <strong>[System Diagnostic]</strong><br />
              - 데이터 수집 완료: {data?.branchCount}개 노드 감지<br />
              - 집계 알고리즘: Recursive Merge (i &lt; size - 1)<br />
              - 각 지점은 예외 없이 ₩ 25,000,000의 데이터를 전송했습니다.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;