import { AlertTriangle, Clock3, RefreshCw, X } from 'lucide-react';

export default function FareModal({
  open,
  onClose,
  fareSummary,
  fareLoading,
  fareError,
  selectedVehicle,
  route,
  formatCurrency,
  onRetryFare
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="fare-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fare-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="section-kicker">Fare Estimate</span>
            <h2 id="fare-modal-title">예상 요금 상세</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="요금 상세 닫기">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {fareLoading && (
          <div className="api-state compact-state" aria-live="polite">
            <RefreshCw size={16} aria-hidden="true" />
            요금 상세를 불러오는 중
          </div>
        )}

        {fareError && (
          <div className="api-state error-state" role="alert">
            <AlertTriangle size={16} aria-hidden="true" />
            <span>{fareError}</span>
            <button type="button" onClick={onRetryFare}>다시 시도</button>
          </div>
        )}

        {fareSummary && (
          <>
            <div className="modal-route">
              <span>{route.pickup}</span>
              <strong>{route.dropoff}</strong>
              <small><Clock3 size={14} aria-hidden="true" /> 예상 {fareSummary.estimatedMinutes}분</small>
            </div>

            <dl className="fare-breakdown">
              <div>
                <dt>차량</dt>
                <dd>{selectedVehicle ? selectedVehicle.name : fareSummary.vehicleName}</dd>
              </div>
              <div>
                <dt>기본 요금</dt>
                <dd>{formatCurrency(fareSummary.baseFare)}</dd>
              </div>
              <div>
                <dt>거리 요금</dt>
                <dd>{formatCurrency(fareSummary.distanceFare)}</dd>
              </div>
              <div>
                <dt>공항 통행료</dt>
                <dd>{formatCurrency(fareSummary.airportToll)}</dd>
              </div>
              <div>
                <dt>서비스 수수료</dt>
                <dd>{formatCurrency(fareSummary.serviceFee)}</dd>
              </div>
              <div>
                <dt>시간대 할증</dt>
                <dd>{formatCurrency(fareSummary.surcharge)}</dd>
              </div>
              <div className="fare-breakdown-total">
                <dt>총 예상 요금</dt>
                <dd>{formatCurrency(fareSummary.total)}</dd>
              </div>
            </dl>
          </>
        )}
      </section>
    </div>
  );
}
