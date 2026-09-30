import React, { useState, useEffect } from 'react';
import { Bookmark, ShieldCheck, ArrowLeft, Calendar, Gauge, Fuel, Cog, MapPin, CheckCircle, AlertCircle, FileText, UserCheck, ShieldAlert } from 'lucide-react';
import InspectionBadge from '../components/InspectionBadge';
import { api } from '../api/client';

export default function VehicleDetail({
  vehicleId,
  isFavorite,
  onToggleFavorite,
  onBookInspection,
  onViewReport,
  onBack
}) {
  const [vehicle, setVehicle] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      if (!vehicleId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await api.getVehicleById(vehicleId);
        if (data && data.vehicle) {
          setVehicle(data.vehicle);
          setReport(data.report);
        }
      } catch (err) {
        setError(err.message || '차량 상세 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [vehicleId]);

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
        <AlertCircle size={40} color="#ef4444" style={{ margin: '0 auto 12px' }} />
        <p style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.1rem' }}>{error || '차량을 찾을 수 없습니다.'}</p>
        <button onClick={onBack} style={{ marginTop: '16px', padding: '8px 16px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen" style={{ paddingTop: '24px' }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          color: '#475569',
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: '20px',
          fontSize: '0.95rem'
        }}
      >
        <ArrowLeft size={18} />
        <span>목록으로 돌아가기</span>
      </button>

      {/* Main Detail Header Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '32px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', padding: '24px', boxShadow: 'var(--shadow-md)', marginBottom: '32px' }}>
        {/* Left Image & Badges */}
        <div>
          <div style={{ borderRadius: '12px', overflow: 'hidden', height: '360px', position: 'relative' }}>
            <img
              src={vehicle.image}
              alt={vehicle.model}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
              <InspectionBadge grade={vehicle.inspectionGrade} score={vehicle.inspectionScore} />
            </div>
          </div>

          {/* Quick Sub-Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '14px' }}>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>소유자 변경</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginTop: '2px' }}>{vehicle.ownerChanges}회 (1인신조)</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>최근 점검일</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', marginTop: '2px' }}>{vehicle.lastInspectionDate}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>사고 유무</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>무사고</div>
            </div>
          </div>
        </div>

        {/* Right Info & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '0.9rem', color: '#1e40af', fontWeight: 700, marginBottom: '4px' }}>
            {vehicle.brand} • {vehicle.region}
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3, marginBottom: '14px' }}>
            {vehicle.model}
          </h1>

          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            {vehicle.price.toLocaleString()}<span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#64748b' }}>만원</span>
          </div>

          {/* Specs Specs Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem' }}>
              <Calendar size={18} color="#2563eb" />
              <span style={{ color: '#64748b' }}>연식:</span>
              <strong style={{ color: '#0f172a' }}>{vehicle.year}년</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem' }}>
              <Gauge size={18} color="#2563eb" />
              <span style={{ color: '#64748b' }}>주행거리:</span>
              <strong style={{ color: '#0f172a' }}>{vehicle.mileage.toLocaleString()} km</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem' }}>
              <Fuel size={18} color="#2563eb" />
              <span style={{ color: '#64748b' }}>연료 / 배기량:</span>
              <strong style={{ color: '#0f172a' }}>{vehicle.fuel} ({vehicle.displacement})</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem' }}>
              <Cog size={18} color="#2563eb" />
              <span style={{ color: '#64748b' }}>변속기 / 색상:</span>
              <strong style={{ color: '#0f172a' }}>{vehicle.transmission} / {vehicle.color}</strong>
            </div>
          </div>

          <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
            {vehicle.description}
          </p>

          {/* Action CTA Buttons */}
          <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
            <button
              onClick={() => onToggleFavorite(vehicle.id)}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: isFavorite ? '#fff7ed' : '#ffffff',
                color: isFavorite ? '#ea580c' : '#334155',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Bookmark size={18} fill={isFavorite ? '#ea580c' : 'none'} color={isFavorite ? '#ea580c' : '#475569'} />
              <span>{isFavorite ? '관심 차량 등록됨' : '관심 차량'}</span>
            </button>

            {vehicle.hasReport ? (
              <button
                onClick={() => onViewReport(vehicle.reportId)}
                style={{
                  flex: 1.3,
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid #1e40af',
                  background: '#eff6ff',
                  color: '#1e40af',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <FileText size={18} />
                <span>점검 결과 보기</span>
              </button>
            ) : null}

            <button
              onClick={() => onBookInspection(vehicle.id)}
              style={{
                flex: 1.5,
                padding: '14px',
                borderRadius: '10px',
                border: 'none',
                background: '#1e40af',
                color: '#ffffff',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <ShieldCheck size={18} />
              <span>점검 예약하기</span>
            </button>
          </div>
        </div>
      </div>

      {/* Options & Insurance Record */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
            주요 장착 옵션 및 편의사양
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {vehicle.options.map((opt, i) => (
              <span
                key={i}
                style={{
                  background: '#f1f5f9',
                  color: '#1e293b',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  border: '1px solid #e2e8f0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <CheckCircle size={14} color="#2563eb" /> {opt}
              </span>
            ))}
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
            보험사고 및 특수이력 정보
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>사고 이력 요약</span>
              <strong style={{ color: '#0f172a' }}>{vehicle.accidentHistory}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>보험 처리 이력</span>
              <strong style={{ color: '#0f172a' }}>{vehicle.insuranceRecord}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span style={{ color: '#64748b' }}>용도변경(렌트/영업용)</span>
              <strong style={{ color: '#166534' }}>없음 (개인 자가용)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
