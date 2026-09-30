import React, { useState } from 'react';
import { PlayCircle, Lock, Sparkles, CheckCircle2, Film, Music, BookOpen, AlertTriangle } from 'lucide-react';
import Modal from '../components/Modal';

export default function Content({ contents = [], showToast }) {
  const [selectedContent, setSelectedContent] = useState(null);
  const [accessResult, setAccessResult] = useState(null);
  const [playerModalOpen, setPlayerModalOpen] = useState(false);

  // Play content check (triggers SEC-407 if subscription was cancelled)
  const handlePlayContent = async (cnt) => {
    setSelectedContent(cnt);
    try {
      const res = await fetch(`/api/content/${cnt.id}/access`);
      const data = await res.json();
      setAccessResult(data);
      setPlayerModalOpen(true);
      if (data.bugId) {
        showToast(data.message, data.bugId, data.secId, data.hasAccess ? 'success' : 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Check VIP Exclusive Feature (triggers SEC-410 if downgraded to basic)
  const handleCheckVipFeature = async () => {
    try {
      const res = await fetch('/api/features/vip-masterclass/access');
      const data = await res.json();
      showToast(
        data.message,
        data.bugId || 'site045-SEC-410',
        data.secId || 'SEC-410',
        data.isAllowed ? 'success' : 'info'
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Passly 프리미엄 콘텐츠 라운지</h2>
          <p>구독 중인 플랜에 포함된 디지털 영상, 음원 및 VIP 마스터클래스입니다.</p>
        </div>
        <button
          onClick={handleCheckVipFeature}
          className="btn-primary"
          style={{ padding: '10px 18px', fontSize: 13 }}
        >
          <Sparkles size={15} /> VIP 마스터 기능 권한 검증
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        {contents.map((cnt) => (
          <div
            key={cnt.id}
            style={{ background: '#ffffff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ height: 180, position: 'relative' }}>
              <img src={cnt.thumbnail} alt={cnt.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(15,23,42,0.85)', color: '#fff', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                {cnt.requiredPlan.toUpperCase()} 전용
              </span>
            </div>

            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>{cnt.title}</h4>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16, flex: 1 }}>{cnt.description}</p>

              <button
                onClick={() => handlePlayContent(cnt)}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: 13 }}
              >
                <PlayCircle size={16} />
                콘텐츠 스트리밍 재생
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Player Access Result Modal (SEC-407) */}
      <Modal
        isOpen={playerModalOpen}
        title={selectedContent ? selectedContent.title : '콘텐츠 재생'}
        onClose={() => setPlayerModalOpen(false)}
        footer={
          <button
            style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}
            onClick={() => setPlayerModalOpen(false)}
          >
            닫기
          </button>
        }
      >
        {accessResult && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            {accessResult.hasAccess ? (
              <div>
                <CheckCircle2 size={48} color="#10b981" style={{ marginBottom: 12 }} />
                <h4 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                  재생이 시작되었습니다!
                </h4>
                <p style={{ fontSize: 14, color: '#64748b' }}>
                  4K Ultra HD 고화질 스트리밍 채널에 연결되었습니다.
                </p>
              </div>
            ) : (
              <div>
                <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: 12 }} />
                <h4 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                  콘텐츠 이용 권한이 없습니다
                </h4>
                <p style={{ fontSize: 14, color: '#ef4444', fontWeight: 600, marginBottom: 8 }}>
                  {accessResult.message}
                </p>
                <p style={{ fontSize: 13, color: '#64748b' }}>
                  구독 해지 신청 시 결제 기간 만료 전임에도 멤버십 혜택이 즉시 차단되었습니다.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
