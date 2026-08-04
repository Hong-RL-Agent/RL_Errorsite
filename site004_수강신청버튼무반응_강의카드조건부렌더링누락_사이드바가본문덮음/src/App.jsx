import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import CourseList from './components/CourseList.jsx';

function App() {
  const [categories, setCategories] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.data));

    fetch('/api/announcements')
      .then(res => res.json())
      .then(data => setAnnouncements(data.data));
  }, []);

  return (
    <div className="app-container">
      <Header />
      <div className="main-layout">
        <main className="content-area">
          <CourseList categories={categories} />
        </main>
        <Sidebar announcements={announcements} />
      </div>
    </div>
  );
}

export default App;
