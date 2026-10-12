import React from 'react';
import { User, SunMoon, Globe, Bell, Shield, Clock } from 'lucide-react';

export default function SettingsNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'profile', label: '개인 프로필 설정', icon: User },
    { id: 'theme', label: '화면 테마 및 디스플레이', icon: SunMoon },
    { id: 'language', label: '언어 및 다국어 지원', icon: Globe },
    { id: 'notifications', label: '이메일 및 푸시 알림', icon: Bell },
    { id: 'privacy', label: '개인정보 공개 범위', icon: Shield },
    { id: 'timezone', label: '표준 시간대 (Timezone)', icon: Clock },
  ];

  return (
    <nav className="settings-nav">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`nav-tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <Icon size={18} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
