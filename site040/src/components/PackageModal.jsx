import React from 'react';
import { X, Info, CheckCircle } from 'lucide-react';

const PackageModal = ({ pkg, onClose, onSelect }) => {
  if (!pkg) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>{pkg.name}</h2>
            <button onClick={onClose}><X size={24} /></button>
          </div>
        </div>
        
        <div className="modal-body">
          <img src={pkg.image} alt={pkg.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '4px', marginBottom: '20px' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: 'var(--secondary)', fontWeight: '600' }}>
            <Info size={18} /> 상세 안내
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.8' }}>
            {pkg.description} 아쥬르 스파의 시그니처 프로그램으로, 지친 몸과 마음을 달래주는 깊은 이완의 시간을 선사합니다. 최상급 아로마 오일과 테라피스트의 섬세한 터치를 경험해보세요.
            <br /><br />
            * 포함 사항: 풋 배스, 전신 트리트먼트, 프리미엄 티 서비스
            <br />
            * 준비물: 없음 (스파 가운 및 일회용품 제공)
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: 'var(--primary)', fontWeight: '600' }}>
            <CheckCircle size={18} /> 이용 정책
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '100px' }}>
            - 예약 시간 15분 전 도착을 권장합니다.<br />
            - 24시간 전 취소 시 100% 환불 가능합니다.<br />
            - 임산부 및 알레르기가 있으신 경우 사전 고지 부탁드립니다.
          </p>
        </div>

        {/* 
          INTENTIONAL GUI BUG: site040-bug02 
          The .modal-container has a fixed height (500px) and overflow: hidden.
          The absolute footer below will be clipped because the modal-body content above is long.
        */}
        <div className="modal-footer" data-bug-id="site040-bug02">
          <button className="btn btn-outline" onClick={onClose}>취소</button>
          <button className="btn btn-primary" onClick={() => { onSelect(pkg); onClose(); }}>예약하기</button>
        </div>
      </div>
    </div>
  );
};

export default PackageModal;
