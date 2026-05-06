// INTENTIONAL GUI BUG: site045-bug03
// Type: stylist-select-button-no-response
// Description: 특정 스타일리스트 선택 버튼에 selectedStylist 변경 handler를 연결하지 않아 클릭해도 선택 상태가 변하지 않음.
export default function StylistSection({ stylists, currentStylist, onSelect }) {
  return (
    <section className="stylist-section" id="stylists">
      <div className="section-header">
        <h3>스타일리스트 추천</h3>
        <p>프로필을 확인하고 원하는 스타일리스트를 선택하세요.</p>
      </div>
      <div className="stylist-grid">
        {stylists.map((stylist) => (
          <div key={stylist.id} className={`stylist-card ${currentStylist?.id === stylist.id ? 'selected' : ''}`}>
            <div className="stylist-photo" style={{ backgroundImage: `url(${stylist.image})` }} />
            <div className="stylist-copy">
              <strong>{stylist.name}</strong>
              <span>{stylist.specialty}</span>
              <p>{stylist.profile}</p>
              <div className="stylist-meta">
                <span>평점 {stylist.rating.toFixed(1)}</span>
                <span>{stylist.available.join(' · ')}</span>
              </div>
            </div>
            <button
              type="button"
              className="select-button"
              {...(stylist.id === 'stylist3' ? {} : { onClick: () => onSelect(stylist) })}
              data-bug-id={stylist.id === 'stylist3' ? 'site045-bug03' : undefined}
            >
              선택하기
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
