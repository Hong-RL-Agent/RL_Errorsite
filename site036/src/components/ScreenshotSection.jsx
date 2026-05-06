export default function ScreenshotSection() {
  return (
    <section className="section screenshot-section">
      <div className="section-heading">
        <span className="eyebrow">Product View</span>
        <h2>분산된 SaaS 운영 데이터를 한 화면으로 정리</h2>
      </div>
      <div className="screenshot-frame">
        <aside>
          <strong>Workspace</strong>
          <span>Revenue Forecast</span>
          <span>Customer Health</span>
          <span>Automation Rules</span>
        </aside>
        <div className="screen-content">
          <div className="screen-row header-row"></div>
          <div className="screen-row wide"></div>
          <div className="screen-columns">
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className="screen-table">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </section>
  );
}
