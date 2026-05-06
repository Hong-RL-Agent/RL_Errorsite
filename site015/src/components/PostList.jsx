import React from 'react';

function PostList({ posts, onSelect }) {
  return (
    <div className="post-list">
      {posts.map(post => (
        <div key={post.id} className="card post-item" onClick={() => onSelect(post)}>
          <div className="tag">{post.tag}</div>
          <div className="title">{post.title}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#6B7280' }}>
            <span>by {post.author}</span>
            <span>❤️ {post.likes}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PostList;
