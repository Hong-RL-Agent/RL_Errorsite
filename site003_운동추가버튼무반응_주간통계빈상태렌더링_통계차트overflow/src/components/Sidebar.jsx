import React from 'react';
import { Activity, LayoutDashboard, Target, Settings, User } from 'lucide-react';

export default function Sidebar({ user, activeTab, setActiveTab }) {
  return (
    <aside className="sidebar">
      <div className="logo-area">
        <Activity color="#10b981" size={32} />
        FitDash
      </div>
      
      <ul className="nav-menu">
        <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <LayoutDashboard size={20} />
          대시보드
        </li>
        <li className={`nav-item ${activeTab === 'goals' ? 'active' : ''}`} onClick={() => setActiveTab('goals')}>
          <Target size={20} />
          나의 목표
        </li>
        <li className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          <Settings size={20} />
          설정
        </li>
      </ul>
      
      {user && (
        <div className="profile-card">
          <div className="avatar">
            <User size={24} />
          </div>
          <div className="profile-info">
            <span className="profile-name">{user.name}</span>
            <span className="profile-level">{user.level} 회원</span>
          </div>
        </div>
      )}
    </aside>
  );
}
