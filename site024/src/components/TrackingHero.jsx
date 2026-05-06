import React from 'react';
import { Play } from 'lucide-react';

export default function TrackingHero() {
  return (
    <section className="hero-section">
      <div className="container">
        <h1 style={{ fontSize: '42px', marginBottom: '15px' }}>빠르고 정확한 배송 조회</h1>
        <p style={{ fontSize: '18px', opacity: 0.9 }}>송장번호 하나로 내 택배의 위치를 실시간으로 확인하세요.</p>
        
        {/* INTENTIONAL GUI BUG: site024-bug01
           Type: media-transcript-missing
           Description: 배송 안내 영상에 자막 또는 스크립트 대체 콘텐츠를 제공하지 않음.
        */}
        <div className="video-section" data-bug-id="site024-bug01" style={{ marginTop: '80px', color: 'var(--text-main)' }}>
          <h3 style={{ marginBottom: '20px' }}>BlueLogistics 배송 서비스 안내 영상</h3>
          <div className="video-mock">
            <div style={{ textAlign: 'center' }}>
              <Play size={64} fill="white" style={{ marginBottom: '20px', cursor: 'pointer' }} />
              <p>배송 프로세스 가이드 (02:45)</p>
            </div>
          </div>
          <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
            * 본 영상은 전체 배송 과정을 시각적으로 안내합니다.
          </p>
          {/* Missing: <button>자막 보기</button> or <a href="...">전체 대본 읽기</a> */}
        </div>
      </div>
    </section>
  );
}
