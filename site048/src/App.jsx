import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Toast from './components/Toast';
import BugAlertPopup from './components/BugAlertPopup';
import Modal from './components/Modal';
import Home from './pages/Home';
import Search from './pages/Search';
import ClassDetail from './pages/ClassDetail';
import MyClasses from './pages/MyClasses';
import Profile from './pages/Profile';
import Community from './pages/Community';
import PostDetail from './pages/PostDetail';
import InstructorDashboard from './pages/InstructorDashboard';
import { GraduationCap, Heart, Sparkles, BookOpen } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [bugAlerts, setBugAlerts] = useState([]);

  // Policy Modal
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyTitle, setPolicyTitle] = useState('');
  const [policyContent, setPolicyContent] = useState('');

  useEffect(() => {
    const handleBugDetected = (e) => {
      const bugData = e.detail;
      const alertId = Date.now() + Math.random();
      setBugAlerts(prev => [
        { id: alertId, ...bugData },
        ...prev.slice(0, 3)
      ]);

      setTimeout(() => {
        setBugAlerts(prev => prev.filter(b => b.id !== alertId));
      }, 7000);
    };

    window.addEventListener('classmate-bug-detected', handleBugDetected);
    return () => window.removeEventListener('classmate-bug-detected', handleBugDetected);
  }, []);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const handleSelectClass = (clsId) => {
    setSelectedClassId(clsId);
    setActivePage('class-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPost = (pId) => {
    setSelectedPostId(pId);
    setActivePage('post-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateSearch = (params = {}) => {
    setSearchParams(params);
    setActivePage('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openPolicy = (title, content) => {
    setPolicyTitle(title);
    setPolicyContent(content);
    setShowPolicyModal(true);
  };

  return (
    <div className="app-container">
      {/* Header Navigation */}
      <Header
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSearchKeyword={(kw) => handleNavigateSearch({ keyword: kw })}
      />

      {/* Main Pages */}
      <main className="main-content">
        {activePage === 'home' && (
          <Home
            onSelectClass={handleSelectClass}
            onNavigateSearch={handleNavigateSearch}
          />
        )}

        {activePage === 'search' && (
          <Search
            initialParams={searchParams}
            onSelectClass={handleSelectClass}
          />
        )}

        {activePage === 'class-detail' && (
          <ClassDetail
            classId={selectedClassId}
            onBack={() => setActivePage('search')}
            onEnrollComplete={() => setActivePage('my-classes')}
            onShowToast={showToast}
          />
        )}

        {activePage === 'my-classes' && (
          <MyClasses
            onSelectClass={handleSelectClass}
            onNavigateSearch={() => handleNavigateSearch({})}
            onShowToast={showToast}
          />
        )}

        {activePage === 'community' && (
          <Community
            onSelectPost={handleSelectPost}
            onShowToast={showToast}
          />
        )}

        {activePage === 'post-detail' && (
          <PostDetail
            postId={selectedPostId}
            onBack={() => setActivePage('community')}
            onShowToast={showToast}
          />
        )}

        {activePage === 'profile' && (
          <Profile onShowToast={showToast} />
        )}

        {activePage === 'instructor' && (
          <InstructorDashboard
            onSelectClass={handleSelectClass}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Global Toast */}
      <Toast toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* Bug Alert Popup (Mapped SEC IDs) */}
      <BugAlertPopup
        bugAlerts={bugAlerts}
        onDismiss={(id) => setBugAlerts(prev => prev.filter(b => b.id !== id))}
      />

      {/* Policy Modal */}
      <Modal
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
        title={policyTitle}
      >
        <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-main)', maxHeight: 400, overflowY: 'auto' }}>
          <p style={{ whiteSpace: 'pre-line' }}>{policyContent}</p>
        </div>
        <div style={{ marginTop: 20, textAlign: 'right' }}>
          <button onClick={() => setShowPolicyModal(false)} className="btn btn-primary btn-sm">
            확인
          </button>
        </div>
      </Modal>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--border-color)',
        padding: '40px 20px',
        color: 'var(--text-muted)',
        marginTop: 60
      }}>
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 24
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div 
              onClick={() => { setActivePage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'var(--soft-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <GraduationCap size={18} />
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary-navy)' }}>ClassMate</span>
            </div>

            <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
              <span 
                style={{ cursor: 'pointer', color: 'var(--primary-navy)', fontWeight: 600 }} 
                onClick={() => { setActivePage('search'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                클래스 탐색
              </span>
              <span 
                style={{ cursor: 'pointer', color: 'var(--primary-navy)', fontWeight: 600 }} 
                onClick={() => { setActivePage('community'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                수강생 커뮤니티
              </span>
              <span 
                style={{ cursor: 'pointer', color: 'var(--primary-navy)', fontWeight: 600 }} 
                onClick={() => { setActivePage('instructor'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                강사 지원 센터
              </span>
              <span 
                style={{ cursor: 'pointer', color: 'var(--primary-navy)', fontWeight: 600 }} 
                onClick={() => openPolicy('ClassMate 플랫폼 이용약관', `제1조 (목적) 본 약관은 ClassMate(이하 "회사")가 운영하는 취미 원데이 클래스 및 워크숍 플랫폼 서비스의 이용조건 및 절차를 규정합니다.\n\n제2조 (수강 신청 및 취소) 수강생은 개설된 클래스에 자유롭게 신청할 수 있으며, 클래스 시작 24시간 전까지 마이페이지에서 자유롭게 취소할 수 있습니다.\n\n제3조 (출석 및 피드백) 강사는 출석부를 관리하고 수강생에게 맞춤형 피드백과 공지사항을 제공합니다.`)}
              >
                서비스 이용약관
              </span>
              <span 
                style={{ cursor: 'pointer', color: 'var(--primary-navy)', fontWeight: 600 }} 
                onClick={() => openPolicy('개인정보처리방침', `ClassMate는 수강생 및 강사의 개인정보를 중요시하며 정보통신망법을 준수합니다.\n\n1. 수집 항목: 성명, 이메일, 휴대전화번호, 프로필 사진\n2. 수집 목적: 클래스 수강 매칭, 출석 체크 및 공지사항 알림\n3. 보유 기간: 회원 탈퇴 시까지 안전하게 관리 후 파기`)}
              >
                개인정보처리방침
              </span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-light)', flexWrap: 'wrap', gap: 8 }}>
            <span>© 2026 ClassMate Inc. All rights reserved. 커뮤니티 기반 원데이 클래스 & 워크숍 관리 플랫폼</span>
            <span>문의: contact@classmate.kr | 고객지원: 1600-0480 (평일 10:00 ~ 18:00)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
