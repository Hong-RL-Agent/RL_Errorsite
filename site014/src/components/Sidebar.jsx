import React from 'react';

function Sidebar({ trending, onSelect }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3>Trending</h3>
        {trending.map((item, idx) => (
          <div 
            key={item.id} 
            className="trending-item"
            onClick={() => onSelect(item)}
          >
            <span>{idx + 1}.</span> {item.title}
          </div>
        ))}
      </div>

      <div className="sidebar-section">
        <h3>Daily Pulse Ads</h3>
        <div className="ad-box">
          ADVERTISEMENT
          <br />
          Experience Luxury Living
        </div>
        
        {/* INTENTIONAL GUI BUG: site014-bug03
            Type: css-layout
            Description: 광고 박스가 본문 위로 겹쳐서 컨텐츠를 가리도록 설정함.
        */}
        <div className="ad-box ad-buggy" data-bug-id="site014-bug03">
          BUGGY OVERLAP AD
          <br />
          Special Discount Today!
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
