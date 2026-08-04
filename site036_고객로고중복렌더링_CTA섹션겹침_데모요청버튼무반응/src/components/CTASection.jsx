export default function CTASection({ onDemoClick }) {
  return (
    <section className="cta-section" data-bug-id="site036-bug02">
      <div>
        <span className="eyebrow">Ready for scale</span>
        <h2>이번 분기 매출 운영 리듬을 더 선명하게 만드세요</h2>
        <p>데모에서 현재 CRM과 지표 구조를 기준으로 Northstar Cloud 적용 방식을 확인할 수 있습니다.</p>
      </div>
      <button type="button" className="light-button" onClick={onDemoClick}>데모 예약</button>
    </section>
  );
}
