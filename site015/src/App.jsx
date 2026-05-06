import React, { useState, useEffect } from 'react';
import './styles.css';
import { useToast } from './hooks/useToast.jsx';
import Header from './components/Header.jsx';
import PostList from './components/PostList.jsx';
import Sidebar from './components/Sidebar.jsx';
import PostDetail from './components/PostDetail.jsx';
import WriteCard from './components/WriteCard.jsx';
import Footer from './components/Footer.jsx';

function App() {
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [filter, setFilter] = useState('All');
  const [view, setView] = useState('home'); // home, redirect-warning
  const { addToast, ToastContainer } = useToast();

  useEffect(() => {
    fetch('/api/posts').then(r => r.json()).then(setPosts);
    fetch('/api/tags').then(r => r.json()).then(setTags);
  }, []);

  const handleRedirect = (url) => {
    // Simulating Open Redirect
    if (url.includes('warning')) {
      setView('redirect-warning');
    } else {
      window.open(url, '_blank');
    }
  };

  if (view === 'redirect-warning') {
    return (
      <div className="redirect-warning">
        <h2>⚠️ Warning: Phishing Site Detected</h2>
        <p>You have been redirected to an untrusted external site.</p>
        <button className="btn btn-primary" onClick={() => setView('home')} style={{marginTop: '20px'}}>
          Back to Safety
        </button>
      </div>
    );
  }

  const filteredPosts = filter === 'All' ? posts : posts.filter(p => p.tag === filter);

  return (
    <div className="app-wrapper">
      <Header onLogoClick={() => setFilter('All')} />
      
      <main className="main-content">
        <div className="center-column">
          <WriteCard addToast={addToast} />
          <PostList 
            posts={filteredPosts} 
            onSelect={setSelectedPost} 
          />
        </div>
        
        <Sidebar 
          tags={tags} 
          activeTag={filter} 
          onTagSelect={setFilter} 
          onRedirect={handleRedirect}
          addToast={addToast}
        />
      </main>

      {selectedPost && (
        <PostDetail 
          post={selectedPost} 
          onClose={() => setSelectedPost(null)} 
          addToast={addToast}
        />
      )}

      <Footer />
      <ToastContainer />
    </div>
  );
}

export default App;
