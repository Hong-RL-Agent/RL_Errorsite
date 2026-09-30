import React from 'react';
import { Sparkles, Shield, Heart, Search, Calendar, Dog, Clock } from 'lucide-react';

export default function Home({ onNavigate }) {
  return (
    <div className="main-wrapper">
      {/* Hero Box */}
      <div className="hero-box">
        <div>
          <h1>우리아이 맞춤 케어 솔루션,<br />PawMate 안심 펫시터 & 산책</h1>
          <p>전문 훈련사 자격 보유 펫시터부터 1:1 안심 방문 돌봄, 힐링 미용까지</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="primary-btn" 
              style={{ background: '#f4a261', color: '#1b261e' }}
              onClick={() => onNavigate('services')}
            >
              <Search size={16} />
              <span>돌봄 서비스 둘러보기</span>
            </button>
            <button 
              className="primary-btn" 
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
              onClick={() => onNavigate('pets')}
            >
              <Dog size={16} />
              <span>내 반려동물 프로필</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div style={{ background: '#e8f5e9', padding: '12px', borderRadius: '12px', color: '#2d6a4f' }}><Shield size={24} /></div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px' }}>100% 신원 검증 시터</div>
            <div style={{ fontSize: '12.5px', color: '#64748b' }}>안심 보험 및 자격 검증 완료</div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div style={{ background: '#e8f5e9', padding: '12px', borderRadius: '12px', color: '#2d6a4f' }}><Clock size={24} /></div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px' }}>실시간 사진 & 리포트</div>
            <div style={{ fontSize: '12.5px', color: '#64748b' }}>돌봄 중 실시간 안심 라이브톡</div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div style={{ background: '#e8f5e9', padding: '12px', borderRadius: '12px', color: '#2d6a4f' }}><Heart size={24} /></div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px' }}>1:1 맞춤 안심 케어</div>
            <div style={{ fontSize: '12.5px', color: '#64748b' }}>우리 아이 성향 맞춤 돌봄 진행</div>
          </div>
        </div>
      </div>

      {/* Quick Nav Cards */}
      <div className="card-box">
        <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>주요 안심 돌봄 메뉴</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div 
            style={{ background: '#f8faf7', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
            onClick={() => onNavigate('services')}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🐕</div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#1b4332' }}>전문 펫시터 & 산책</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>1:1 산책 및 방문 돌봄</div>
          </div>

          <div 
            style={{ background: '#f8faf7', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
            onClick={() => onNavigate('calendar')}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📅</div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#1b4332' }}>일정 & 캘린더</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>접종/사상충/예약 일정 관리</div>
          </div>

          <div 
            style={{ background: '#f8faf7', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
            onClick={() => onNavigate('activity')}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#1b4332' }}>활동 리포트 & CSV</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>산책 기록 및 건강 데이터</div>
          </div>

          <div 
            style={{ background: '#f8faf7', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
            onClick={() => onNavigate('messages')}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>💬</div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#1b4332' }}>1:1 안심 상담 톡</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>시터와 실시간 상담</div>
          </div>
        </div>
      </div>
    </div>
  );
}
