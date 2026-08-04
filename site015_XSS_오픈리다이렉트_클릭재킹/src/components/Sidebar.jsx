import React from 'react';

function Sidebar({ tags, activeTag, onTagSelect, onRedirect, addToast }) {
  return (
    <aside className="sidebar">
      <div className="card">
        <h3 style={{ marginBottom: '16px', fontSize: '0.9rem', textTransform: 'uppercase' }}>Popular Tags</h3>
        <div className="tag-list">
          <div 
            className={`tag-btn ${activeTag === 'All' ? 'active' : ''}`}
            onClick={() => onTagSelect('All')}
          >
            #All
          </div>
          {tags.map(tag => (
            <div 
              key={tag} 
              className={`tag-btn ${activeTag === tag ? 'active' : ''}`}
              onClick={() => onTagSelect(tag)}
            >
              #{tag}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '16px', fontSize: '0.9rem', textTransform: 'uppercase' }}>Partners</h3>
        
        {/* INTENTIONAL GUI BUG: site015-bug02
           Type: 오픈 리다이렉트
           Description: 링크 클릭 시 리다이렉트 취약점을 모사하여 경고 페이지로 이동하게 함.
        */}
        <button 
          className="btn btn-secondary" 
          style={{ width: '100%', marginBottom: '10px' }}
          data-bug-id="site015-bug02"
          onClick={() => onRedirect('/go?url=http://unsafe-phishing-site.com/warning')}
        >
          Partner Login
        </button>
        
        <button 
          className="btn btn-secondary" 
          style={{ width: '100%' }}
          onClick={() => addToast('Premium feature coming soon!')}
        >
          Subscribe
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
