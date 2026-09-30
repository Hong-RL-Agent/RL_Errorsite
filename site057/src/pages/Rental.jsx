import React, { useState } from 'react';
import { Zap, Clock, MapPin, Navigation, ShieldCheck, CheckCircle2, AlertCircle, Play, StopCircle, RefreshCw } from 'lucide-react';
import RentalTimer from '../components/RentalTimer';
import RentalSummary from '../components/RentalSummary';
import { api } from '../api/client';

export default function Rental({
  activeRental = null,
  pendingVehicle = null,
  onStartRentalSuccess,
  onFinishRentalSuccess,
  onNavigateTab
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(Boolean(pendingVehicle));
  const [targetVehicle, setTargetVehicle] = useState(pendingVehicle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [finishSuccess, setFinishSuccess] = useState(null);
  const [sec465Popup, setSec465Popup] = useState(false);

  // Sync when pendingVehicle updates
  React.useEffect(() => {
    if (pendingVehicle) {
      setTargetVehicle(pendingVehicle);
      setShowConfirmModal(true);
    }
  }, [pendingVehicle]);

  // Start Rental
  const handleConfirmStart = async () => {
    if (!targetVehicle) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.createRental(targetVehicle.id);
      if (res && res.rental) {
        setShowConfirmModal(false);
        setSec465Popup(false);
        onStartRentalSuccess(res.rental);
      }
    } catch (err) {
      setError(err.message || '대여 시작 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Finish (Return) Rental
  const handleFinishRental = async () => {
    if (!activeRental) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.finishRental(activeRental.id, '역삼역 포스코타워 앞');
      if (res && res.rental) {
        setFinishSuccess(res.rental);
        onFinishRentalSuccess(res.rental);
      }
    } catch (err) {
      setError(err.message || '반납 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-screen" style={{ paddingTop: '32px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
          실시간 대여 & 주행 관리
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          현재 대여 중인 이동수단의 주행 시간, 이동 거리, 실시간 요금을 확인하고 반납할 수 있습니다.
        </p>
      </div>

      {finishSuccess && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', background: '#dcfce7', color: '#15803d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <CheckCircle2 size={28} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
            반납이 성공적으로 완료되었습니다!
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
            총 주행시간: <strong>{finishSuccess.durationMinutes}분</strong> ({finishSuccess.distanceKm}km) • 결제금액: <strong>{finishSuccess.calculatedFare?.toLocaleString()}원</strong>
          </p>
          <button
            onClick={() => {
              setFinishSuccess(null);
              onNavigateTab('history');
            }}
            style={{
              padding: '10px 20px',
              background: '#65a30d',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            이용 내역 확인하러 가기
          </button>
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Active Rental In-Progress View */}
      {activeRental ? (
        <div>
          <div className="rental-active-banner">
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.9 }}>
                LIVE DRIVING SESSION
              </div>
              <h2 style={{ fontSize: '1.7rem', fontWeight: 900, marginTop: '2px' }}>
                {activeRental.vehicleName}
              </h2>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '4px' }}>
                출발지: {activeRental.startStation} • 시작: {activeRental.startTime}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.82rem', opacity: 0.85, marginBottom: '2px' }}>주행 시간</div>
              <RentalTimer startTime={activeRental.startTime} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
            <RentalSummary rental={activeRental} />

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                  이용 종료 및 반납
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, marginBottom: '16px' }}>
                  안전한 반납 구역(지정 스테이션)에 주차 후 잠금장치를 체결해 주세요.
                </p>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '0.82rem', color: '#334155' }}>
                  반납 예정 장소: <strong>역삼역 포스코타워 앞 스테이션</strong>
                </div>
              </div>

              <button
                onClick={handleFinishRental}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '20px',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <StopCircle size={20} />
                <span>{loading ? '반납 처리 중...' : '이용 종료 및 반납하기'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div style={{ background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '16px', padding: '60px 20px', textAlign: 'center', marginBottom: '32px' }}>
          <Zap size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
            현재 대여 중인 이동수단이 없습니다.
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '20px' }}>
            주변의 대여 가능한 자전거 또는 전동킥보드를 찾아보세요.
          </p>
          <button
            onClick={() => onNavigateTab('nearby')}
            style={{
              padding: '12px 24px',
              background: '#65a30d',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            주변 차량 대여하러 가기
          </button>
        </div>
      )}

      {/* Start Rental Confirmation Modal */}
      {showConfirmModal && targetVehicle && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>
              RideOn 대여 확인
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px' }}>
              선택하신 차량의 정보를 확인하고 대여를 시작해 주세요.
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>차량명:</span>
                <strong>{targetVehicle.name} ({targetVehicle.code})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>대여 위치:</span>
                <strong>{targetVehicle.stationName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>배터리 / 주행거리:</span>
                <strong>{targetVehicle.battery}% (약 {targetVehicle.estimatedRangeKm}km)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>이용 요금:</span>
                <strong style={{ color: '#65a30d' }}>기본 {targetVehicle.baseFare}원 + {targetVehicle.perMinuteFare}원/분</strong>
              </div>
            </div>

            <div style={{ background: '#ecfccb', border: '1px solid #bef264', borderRadius: '8px', padding: '12px', fontSize: '0.82rem', color: '#3f6212', marginBottom: '24px' }}>
              💡 <strong>안전 가이드</strong>: 헬멧 착용 필수, 음주 운전 금지, 보도 주행 금지 및 지정 구역 주차 준수.
            </div>

            {/* Action Buttons Container with Intentional Invisible Blocking Overlay */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              {/* INTENTIONAL BACKEND BUG: site057-SEC-465
                  CSS pointer-events로 버튼 클릭이 보이지 않는 overlay에 가로막히는 오류:
                  투명한 오버레이 레이어(position: absolute, inset: 0, opacity: 0, z-index: 10)가
                  버튼 영역 상단에 남아있어 사용자가 '대여 시작' 버튼을 눌러도 클릭 이벤트(hit testing)를 가로채어
                  버튼 자체의 onClick 핸들러가 트리거되지 않음. */}
              <div
                onClick={() => setSec465Popup(true)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  zIndex: 10,
                  cursor: 'pointer',
                  pointerEvents: 'auto'
                }}
                title="투명 오버레이 레이어 (오류 감지)"
              />

              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                style={{
                  padding: '12px 20px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleConfirmStart}
                style={{
                  padding: '12px 24px',
                  background: '#65a30d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Play size={16} fill="#fff" />
                <span>대여 시작</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEC-465 Error Popup Modal */}
      {sec465Popup && (
        <div className="modal-backdrop" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ border: '2px solid #ef4444', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertCircle size={24} color="#ef4444" />
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 900, background: '#ef4444', color: '#fff', padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.5px' }}>
                  오류 감지 ID: site057-SEC-465
                </span>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 0 0' }}>
                  버튼 클릭 이벤트 가로막힘 오류
                </h4>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, marginBottom: '16px' }}>
              대여 확인 모달의 [대여 시작] 버튼 상단에 <strong>투명한 CSS Overlay 레이어(pointer-events: auto)</strong>가 잔류하여 사용자의 마우스 클릭 이벤트를 가로채고 있습니다. 이로 인해 버튼이 눌리지 않고 대여가 시작되지 않습니다.
            </p>

            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 14px', borderRadius: '8px', fontSize: '0.82rem', color: '#991b1b', marginBottom: '20px' }}>
              <div>• <strong>오류 코드</strong>: <code>site057-SEC-465</code></div>
              <div>• <strong>오류 분류</strong>: UI Interaction (pointer-events invisible overlay)</div>
              <div>• <strong>원인 위치</strong>: <code>Rental.jsx</code> 내 투명 hit-testing div 레이어</div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSec465Popup(false)}
                style={{
                  padding: '10px 16px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                오류 확인 및 닫기
              </button>

              <button
                type="button"
                onClick={() => {
                  setSec465Popup(false);
                  handleConfirmStart();
                }}
                style={{
                  padding: '10px 18px',
                  background: '#65a30d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Play size={15} fill="#fff" />
                <span>오류 우회하여 대여 시작하기</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
