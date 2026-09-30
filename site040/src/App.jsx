import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';

import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import MyLearning from './pages/MyLearning';
import Materials from './pages/Materials';
import Chat from './pages/Chat';
import Notices from './pages/Notices';
import Reviews from './pages/Reviews';
import Coupons from './pages/Coupons';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [enrollCount, setEnrollCount] = useState(3);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => setCurrentUser(data))
      .catch(console.error);

    fetch('/api/enrollments')
      .then(res => res.json())
      .then(data => setEnrollCount(data.length || 0))
      .catch(console.error);
  }, []);

  const showToast = ({ title, message, type = 'success', bugId = null, secId = null, reqId = null }) => {
    setToast({
      title,
      message,
      type,
      bugId,
      secId,
      reqId
    });
  };

  const closeToast = () => {
    setToast(null);
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setActiveTab('course-detail');
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Home
            onNavigate={setActiveTab}
            onSelectCourse={handleSelectCourse}
          />
        );
      case 'courses':
        return (
          <Courses
            onSelectCourse={handleSelectCourse}
            onShowToast={showToast}
          />
        );
      case 'course-detail':
        return (
          <CourseDetail
            course={selectedCourse}
            onBack={() => setActiveTab('courses')}
            onNavigate={setActiveTab}
            onShowToast={showToast}
          />
        );
      case 'mylearning':
        return <MyLearning onNavigate={setActiveTab} />;
      case 'materials':
        return <Materials onShowToast={showToast} />;
      case 'chat':
        return <Chat onShowToast={showToast} />;
      case 'notices':
        return <Notices onShowToast={showToast} />;
      case 'reviews':
        return <Reviews />;
      case 'coupons':
        return <Coupons onShowToast={showToast} />;
      case 'profile':
        return <Profile onShowToast={showToast} />;
      case 'login':
        return (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onNavigate={setActiveTab}
            onShowToast={showToast}
          />
        );
      case 'register':
        return (
          <Register
            onRegisterSuccess={handleLoginSuccess}
            onNavigate={setActiveTab}
            onShowToast={showToast}
          />
        );
      default:
        return (
          <Home
            onNavigate={setActiveTab}
            onSelectCourse={handleSelectCourse}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        enrollCount={enrollCount}
      />
      <div className="main-wrapper">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
        />
        <main className="content-area">
          {renderContent()}
        </main>
      </div>

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}
