export default function ServiceModal({ service, onClose, onReserve }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <button className="modal-close" type="button" onClick={onClose} aria-label="모달 닫기">
          ✕
        </button>
        <div className="modal-details">
          <h3>{service.name}</h3>
          <p>{service.recommended}</p>
          <div className="modal-meta">
            <div>
              <strong>소요 시간</strong>
              <span>{service.duration}</span>
            </div>
            <div>
              <strong>가격</strong>
              <span>{service.price}</span>
            </div>
          </div>
          <p>
            전문가의 1:1 컨설팅으로 고객 취향과 현재 모발 상태를 분석하여 최적의 스타일을 설계합니다.
            예약 시 맞춤 케어 플랜도 함께 제공합니다.
          </p>
          <button className="modal-reserve" type="button" onClick={onReserve}>예약 요청</button>
        </div>
      </div>
    </div>
  );
}
