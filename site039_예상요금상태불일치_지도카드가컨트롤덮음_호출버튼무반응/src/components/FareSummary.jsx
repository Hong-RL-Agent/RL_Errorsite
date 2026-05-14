import { AlertTriangle, CheckCircle2, FileText, RefreshCw, Send, WalletCards } from 'lucide-react';

export default function FareSummary({
  route,
  selectedVehicle,
  fareSummary,
  fareLoading,
  fareError,
  bookingStatus,
  passengers,
  luggage,
  roundTrip,
  assistance,
  formatCurrency,
  onFareOpen,
  onRetryFare,
  onCallRide,
  onComingSoon
}) {
  return (
    <aside className="fare-summary-card">
      <div className="summary-header">
        <span className="section-kicker">예약 요약</span>
        <strong>{bookingStatus}</strong>
      </div>

      <div className="summary-route">
        <span>{route.pickup}</span>
        <strong>{route.dropoff}</strong>
      </div>

      <dl className="summary-list">
        <div>
          <dt>선택 차량</dt>
          <dd>{selectedVehicle ? selectedVehicle.name : '차량 선택 전'}</dd>
        </div>
        <div>
          <dt>승객/수하물</dt>
          <dd>{passengers}명 / {luggage}개</dd>
        </div>
        <div>
          <dt>옵션</dt>
          <dd>{roundTrip ? '왕복' : '편도'} · {assistance ? '수하물 지원' : '기본 이동'}</dd>
        </div>
      </dl>

      {fareLoading && (
        <div className="api-state compact-state" aria-live="polite">
          <RefreshCw size={16} aria-hidden="true" />
          예상 요금 계산 중
        </div>
      )}

      {fareError && (
        <div className="api-state error-state compact-state" role="alert">
          <AlertTriangle size={16} aria-hidden="true" />
          <span>{fareError}</span>
          <button type="button" onClick={onRetryFare}>다시 계산</button>
        </div>
      )}

      {/* INTENTIONAL GUI BUG: site039-bug01
          CSV Error: 예상요금 상태 불일치
          Type: fare-estimate-state-mismatch
          Description: 차량 타입 변경 후 예약 요약의 예상 요금 state를 갱신하지 않아 이전 요금이 표시됨. */}
      <div className="summary-total" data-bug-id="site039-bug01">
        <span>예상 요금</span>
        <strong>{fareSummary ? formatCurrency(fareSummary.total) : '계산 대기'}</strong>
        <small>{fareSummary ? `${fareSummary.vehicleName} 기준 · ${fareSummary.distanceKm}km` : 'API 계산 전'}</small>
      </div>

      <div className="summary-actions">
        <button className="secondary-button" type="button" onClick={onFareOpen}>
          <FileText size={16} aria-hidden="true" />
          요금 상세
        </button>
        <button className="ghost-button" type="button" onClick={onComingSoon}>
          <WalletCards size={16} aria-hidden="true" />
          정산 메모
        </button>
      </div>

      {/* INTENTIONAL GUI BUG: site039-bug03
          CSV Error: 호출 버튼 무반응
          Type: call-taxi-button-no-response
          Description: 예약 호출 버튼 클릭 시 완료 상태로 변경하는 handler가 누락되어 아무 반응이 없음. */}
      <button className="call-button" type="button" data-bug-id="site039-bug03" onClick={onCallRide}>
        <Send size={17} aria-hidden="true" />
        예약 호출하기
      </button>

      <p className="summary-note">
        <CheckCircle2 size={15} aria-hidden="true" />
        서버 API는 정상이며 예약 화면 상태와 요금 UI만 프론트엔드에서 갱신됩니다.
      </p>
    </aside>
  );
}
