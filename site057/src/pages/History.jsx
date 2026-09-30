import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Calendar, Clock, MapPin, Receipt, AlertCircle, RefreshCw, ChevronRight, X } from 'lucide-react';
import RideHistoryCard from '../components/RideHistoryCard';
import { api } from '../api/client';

export default function History({ onNavigateTab }) {
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected Ride for Detailed Fare Breakdown
  const [selectedRide, setSelectedRide] = useState(null);
  const [fareData, setFareData] = useState(null);
  const [fareLoading, setFareLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      // Calls GET /api/rides/history
      // Triggers SEC-464 (date formatting token mismatch: 2026-9-8)
      const data = await api.getRideHistory();
      if (data && data.history) {
        setHistories(data.history);
      }
    } catch (err) {
      setError(err.message || '이용 기록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleOpenFareModal = async (ride) => {
    setSelectedRide(ride);
    setFareLoading(true);
    setFareData(null);
    try {
      // Find matching rental or query fare for rt-103
      // When checking fare for rental with missing endTime, causes SEC-462 NaN propagation
      const rentalId = ride.rentalNumber === 'RO-20260928-309' ? 'rt-103' : 'rt-102';
      const data = await api.getRentalFare(rentalId);
      setFareData(data);
    } catch (err) {
      console.error('Failed to load fare details:', err);
    } finally {
      setFareLoading(false);
    }
  };

  return (
    <div className="max-w-screen" style={{ paddingTop: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
            내 모빌리티 이용 기록
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            탑승하신 모든 전기자전거 및 전동킥보드 라이딩 이력과 결제 내역을 조회할 수 있습니다.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          style={{
            padding: '8px 16px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#475569'
          }}
        >
          <RefreshCw size={15} />
          <span>새로고침</span>
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <p>이용 기록을 불러오는 중입니다...</p>
        </div>
      ) : histories.length === 0 ? (
        <div style={{ background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '16px', padding: '60px 20px', textAlign: 'center' }}>
          <HistoryIcon size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
            아직 이용하신 라이딩 기록이 없습니다.
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
            가까운 RideOn을 찾아 첫 주행을 시작해 보세요.
          </p>
          <button
            onClick={() => onNavigateTab('nearby')}
            style={{ padding: '10px 20px', background: '#65a30d', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
          >
            차량 찾기
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {histories.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenFareModal(item)}
              style={{ cursor: 'pointer' }}
            >
              <RideHistoryCard historyItem={item} />
            </div>
          ))}
        </div>
      )}

      {/* Detailed Fare Breakdown Modal */}
      {selectedRide && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                이용 요금 상세 영수증
              </h3>
              <button
                onClick={() => setSelectedRide(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', marginBottom: '20px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>이용 차량:</span>
                <strong>{selectedRide.vehicleName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>이용 일자:</span>
                <strong>{selectedRide.date}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>이용 시간:</span>
                <strong>{selectedRide.startTime} ~ {selectedRide.endTime} ({selectedRide.duration})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>주행 거리:</span>
                <strong>{selectedRide.distance}</strong>
              </div>
            </div>

            {/* Fare Breakdown with potential NaN propagation (SEC-462) */}
            <div style={{ border: fareData?.rawTotalFare === 'NaN' ? '2px solid #ef4444' : '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', marginBottom: '24px', background: fareData?.rawTotalFare === 'NaN' ? '#fff' : '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                  <Receipt size={16} color="#65a30d" />
                  요금 산정 내역
                </h4>
                {fareData?.rawTotalFare === 'NaN' && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>
                    오류 감지: site057-SEC-462
                  </span>
                )}
              </div>

              {fareData?.rawTotalFare === 'NaN' && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 12px', borderRadius: '8px', fontSize: '0.8rem', color: '#991b1b', marginBottom: '14px', lineHeight: 1.5 }}>
                  <strong>[site057-SEC-462] NaN 요금 전파 오류 발생</strong>: 반납 종료 시간(<code>endTime</code>)이 누락되어 <code>new Date(undefined).getTime()</code>이 <code>NaN</code>을 반환하였고, 요금 계산식 전체로 전파되어 결제 금액이 <strong>₩NaN</strong>으로 출력되었습니다.
                </div>
              )}

              {fareLoading ? (
                <p style={{ fontSize: '0.88rem', color: '#64748b' }}>요금 계산 정보를 불러오는 중...</p>
              ) : fareData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>기본 요금</span>
                    <span>{fareData.baseFare?.toLocaleString()}원</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>시간당 요금 ({fareData.rawDuration}분 × {fareData.perMinuteFare}원)</span>
                    <span style={{ color: fareData.rawDuration === 'NaN' ? '#ef4444' : 'inherit', fontWeight: fareData.rawDuration === 'NaN' ? 800 : 'normal' }}>
                      {fareData.rawDuration !== 'NaN' ? `${(fareData.rawDuration * fareData.perMinuteFare).toLocaleString()}원` : 'NaN원'}
                    </span>
                  </div>
                  <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 900 }}>
                    <span>최종 결제 금액</span>
                    <span style={{ color: fareData.rawTotalFare === 'NaN' ? '#ef4444' : '#65a30d' }}>
                      {fareData.rawTotalFare === 'NaN' ? '₩NaN' : `${fareData.totalFare?.toLocaleString()}원`}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 900 }}>
                  <span>결제 금액</span>
                  <span style={{ color: '#65a30d' }}>{selectedRide.amount.toLocaleString()}원</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedRide(null)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#0f172a',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
