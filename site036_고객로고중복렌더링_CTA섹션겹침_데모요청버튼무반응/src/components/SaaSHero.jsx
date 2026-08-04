export default function SaaSHero({ onDemoClick }) {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <div className="trust-badge">SOC2-ready SaaS operations platform</div>
        <h1>성장팀의 매출 운영을 하나의 명확한 흐름으로</h1>
        <p>
          Northstar Cloud는 영업, 고객성공, 재무 데이터를 연결해 B2B 스타트업이 다음 분기 성장을 더 빠르게 예측하도록 돕습니다.
        </p>
        <div className="hero-actions">
          {/* INTENTIONAL GUI BUG: site036-bug03
              CSV Error: 데모 요청 버튼 무반응
              Type: demo-request-button-no-response
              Description: hero 데모 요청 버튼에 폼 이동 handler를 연결하지 않아 클릭해도 아무 반응이 없음. */}
          <button type="button" className="primary-button hero-cta" onClick={() => {}} data-bug-id="site036-bug03">
            데모 요청
          </button>
          <button type="button" className="secondary-button" onClick={() => alert('제품 영상 준비중입니다.')}>제품 영상 보기</button>
        </div>
        <div className="hero-proof" aria-label="Trust badges">
          <span>99.95% uptime</span>
          <span>GDPR aligned</span>
          <span>48시간 내 온보딩</span>
        </div>
      </div>
      <div className="dashboard-mock" aria-label="Northstar Cloud dashboard preview">
        <div className="mock-topbar">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="mock-grid">
          <div className="metric-card">
            <small>Pipeline</small>
            <strong>$4.8M</strong>
            <span>+18.4%</span>
          </div>
          <div className="metric-card mint">
            <small>Net Revenue Retention</small>
            <strong>121%</strong>
            <span>healthy</span>
          </div>
          <div className="chart-card">
            <div className="bar h40"></div>
            <div className="bar h60"></div>
            <div className="bar h85"></div>
            <div className="bar h55"></div>
            <div className="bar h75"></div>
          </div>
          <div className="deal-list">
            <span>Enterprise renewal risk</span>
            <span>Expansion opportunity</span>
            <span>Sales cycle anomaly</span>
          </div>
        </div>
      </div>
    </section>
  );
}
