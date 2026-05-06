import React from 'react';
import { Volume2 } from 'lucide-react';

export default function NotificationPanel() {
  return (
    <div className="notification-panel">
      <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>알림 설정</h3>
      <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <span style={{ fontSize: '14px' }}>배송 완료 시 푸시 알림</span>
        <input type="checkbox" defaultChecked />
      </div>
      
      <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <span style={{ fontSize: '14px', fontWeight: 600 }}>알림음 미리듣기</span>
        
        {/* INTENTIONAL GUI BUG: site024-bug02
           Type: audio-control-missing
           Description: 알림음 미리듣기 UI에 정지/음소거/볼륨 조절 컨트롤을 제공하지 않음.
        */}
        <div className="audio-preview" data-bug-id="site024-bug02">
          <Volume2 size={24} color="var(--primary)" />
          <div className="wave-animation">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.1}s` }}></div>
            ))}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700 }}>PREVIEWING...</span>
          {/* Missing: Pause/Stop button, Mute button, Volume slider */}
        </div>
      </div>
    </div>
  );
}
