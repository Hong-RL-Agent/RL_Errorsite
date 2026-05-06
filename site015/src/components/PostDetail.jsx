import React from 'react';

function PostDetail({ post, onClose, addToast }) {
  return (
    <>
      <div className="detail-overlay" onClick={onClose} />
      <div className="detail-panel">
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
        >
          ✕
        </button>
        
        <div id="xss-alert" className="xss-warning">
          ⚠️ XSS Vulnerability Detected!
          <br />
          <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>Malicious script executed from post content.</span>
        </div>

        <div className="tag" style={{ color: '#3B82F6', fontWeight: 600, marginBottom: '10px' }}>{post.tag}</div>
        <h2 style={{ marginBottom: '20px' }}>{post.title}</h2>
        
        {/* INTENTIONAL GUI BUG: site015-bug01
            Type: 크로스 사이트 스크립팅 (XSS)
            Description: dangerouslySetInnerHTML를 사용하여 서버에서 온 스크립트 페이로드를 실행함.
        */}
        <div 
          className="post-content" 
          data-bug-id="site015-bug01"
          dangerouslySetInnerHTML={{ __html: post.content }}
          style={{ lineHeight: 1.8, color: '#333', marginBottom: '40px' }}
        />

        <div className="comments-section">
          <h3 style={{ fontSize: '1rem', borderTop: '1px solid #EEE', paddingTop: '20px', marginBottom: '15px' }}>Comments</h3>
          {post.comments.length === 0 ? (
            <p style={{ color: '#999', fontSize: '0.9rem' }}>No comments yet.</p>
          ) : (
            post.comments.map(c => (
              <div key={c.id} style={{ marginBottom: '12px' }}>
                <span style={{ fontWeight: 600, marginRight: '10px' }}>{c.author}</span>
                <span style={{ fontSize: '0.9rem' }}>{c.text}</span>
              </div>
            ))
          )}
        </div>
        
        <div className="btn btn-primary" style={{ marginTop: '30px', width: '100%', textAlign: 'center' }} onClick={() => addToast('Comment saved!')}>
          Add Comment
        </div>
      </div>
    </>
  );
}

export default PostDetail;
