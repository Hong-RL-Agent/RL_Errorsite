import React, { useState, useEffect } from 'react';
import { Bike, Zap, ArrowLeft, MapPin, Battery, ShieldCheck, Gauge, Share2, AlertCircle, Wrench, Navigation } from 'lucide-react';
import VehicleStatusBadge from '../components/VehicleStatusBadge';
import { api } from '../api/client';

export default function VehicleDetail({
  vehicleId,
  onRentVehicle,
  onViewOnMap,
  onBack
}) {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadVehicle() {
      if (!vehicleId) return;
      setLoading(true);
      setError(null);
      try {
        // Calls GET /api/vehicles/:id
        // Triggers SEC-461 on server (numeric vs string strict equality mismatch returning 404)
        const data = await api.getVehicleById(vehicleId);
        if (data && data.vehicle) {
          setVehicle(data.vehicle);
        } else {
          setError('차량을 찾을 수 없습니다.');
        }
      } catch (err) {
        setError(err.message || '차량 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    }
    loadVehicle();
  }, [vehicleId]);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="max-w-screen" style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
        <p>차량 상세 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="max-w-screen" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', background: '#fff', border: '2px solid #ef4444', borderRadius: '16px', padding: '32px 24px', boxShadow: '0 20px 25px -5px rgba(239,68,68,0.15)' }}>
          <div style={{ width: '56px', height: '56px', background: '#fee2e2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <AlertCircle size={32} />
          </div>

          <span style={{ fontSize: '0.8rem', fontWeight: 900, background: '#ef4444', color: '#fff', padding: '3px 10px', borderRadius: '4px' }}>
            오류 감지 ID: site057-SEC-461
          </span>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: '12px 0 8px 0' }}>
            차량 상세 조회 실패 (404 Not Found)
          </h2>

          <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '20px' }}>
            서버의 <code>GET /api/vehicles/:id</code> 처리 중 URL 파라미터(문자열 <code>"{vehicleId}"</code>)와 Mock DB의 ID(숫자 <code>{vehicleId}</code>)를 엄격 일치 연산자(<code>===</code>)로 비교하여 매칭에 실패하였습니다.
          </p>

          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px', borderRadius: '8px', fontSize: '0.82rem', color: '#991b1b', textAlign: 'left', marginBottom: '24px' }}>
            <div>• <strong>오류 코드</strong>: <code>site057-SEC-461</code></div>
            <div>• <strong>오류 유형</strong>: Data Comparison (Number vs String strict inequality)</div>
            <div>• <strong>원인 위치</strong>: <code>server.js:233</code> (<code>vehicle.id === req.params.id</code>)</div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={onBack}
              style={{
                padding: '10px 18px',
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              목록으로 돌아가기
            </button>

            <button
              onClick={async () => {
                try {
                  const list = await api.getVehicles();
                  const found = list.vehicles?.find(v => String(v.id) === String(vehicleId));
                  if (found) {
                    setVehicle(found);
                    setError(null);
                  }
                } catch (e) {
                  console.error(e);
                }
              }}
              style={{
                padding: '10px 20px',
                background: '#65a30d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              오류 우회하여 상세 정보 보기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen" style={{ paddingTop: '24px' }}>
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          color: '#475569',
          fontWeight: 700,
          cursor: 'pointer',
          marginBottom: '20px',
          fontSize: '0.95rem'
        }}
      >
        <ArrowLeft size={18} />
        <span>목록으로 돌아가기</span>
      </button>

      {/* Main Detail Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '32px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px', boxShadow: 'var(--shadow-md)', marginBottom: '32px' }}>
        {/* Left Image & Range */}
        <div>
          <div style={{ borderRadius: '14px', overflow: 'hidden', height: '340px', position: 'relative' }}>
            <img src={vehicle.image} alt={vehicle.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
              <VehicleStatusBadge status={vehicle.status} text={vehicle.statusText} />
            </div>
            <div style={{ position: 'absolute', bottom: '16px', right: '16px', background: 'rgba(15,23,42,0.85)', color: '#fff', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.88rem', fontWeight: 800, backdropFilter: 'blur(4px)' }}>
              배터리 잔량 {vehicle.battery}%
            </div>
          </div>
        </div>

        {/* Right Info & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#65a30d', marginBottom: '2px' }}>
            {vehicle.code} • {vehicle.typeName}
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '12px' }}>
            {vehicle.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.95rem', marginBottom: '20px' }}>
            <MapPin size={18} color="#65a30d" />
            <span>{vehicle.stationName} (약 {vehicle.distanceMeters}m 거리)</span>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '0.9rem' }}>
            <div>
              <span style={{ color: '#64748b' }}>예상 주행 거리:</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>약 {vehicle.estimatedRangeKm} km</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>이용 요금:</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#65a30d' }}>
                기본 {vehicle.baseFare}원 + {vehicle.perMinuteFare}원/분
              </div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>최근 안전 점검:</span>
              <div style={{ fontWeight: 800, color: '#0f172a' }}>{vehicle.lastInspected}</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>브레이크 / 타이어:</span>
              <div style={{ fontWeight: 800, color: '#15803d' }}>{vehicle.brakesCondition} / {vehicle.tiresCondition}</div>
            </div>
          </div>

          <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '24px' }}>
            {vehicle.description}
          </p>

          <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
            <button
              onClick={handleShare}
              style={{
                padding: '12px 18px',
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Share2 size={16} />
              <span>{copied ? '복사됨!' : '공유하기'}</span>
            </button>

            <button
              onClick={() => onRentVehicle(vehicle.id)}
              disabled={vehicle.status !== 'available'}
              style={{
                flex: 1,
                padding: '14px',
                background: vehicle.status === 'available' ? '#65a30d' : '#94a3b8',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 900,
                fontSize: '1rem',
                cursor: vehicle.status === 'available' ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <Zap size={18} fill="#fff" />
              <span>{vehicle.status === 'available' ? '지금 바로 대여하기' : '대여 불가 상태'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
