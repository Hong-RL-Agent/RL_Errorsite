import { Briefcase, CalendarClock, Minus, Plus, ShieldCheck, Users } from 'lucide-react';
import RouteSearchForm from './RouteSearchForm.jsx';

export default function BookingForm({
  route,
  onRouteChange,
  onRouteSwap,
  passengers,
  luggage,
  roundTrip,
  flightNumber,
  assistance,
  onPassengerStep,
  onLuggageStep,
  onRoundTripChange,
  onFlightNumberChange,
  onAssistanceChange,
  onComingSoon
}) {
  return (
    <div className="booking-form">
      <div className="section-heading compact">
        <span className="section-kicker">예약 정보</span>
        <h2>이동 경로와 탑승 조건</h2>
      </div>

      <RouteSearchForm
        route={route}
        onRouteChange={onRouteChange}
        onRouteSwap={onRouteSwap}
        onComingSoon={onComingSoon}
      />

      <div className="booking-field-row time-row">
        <label className="field-block time-control">
          <span>
            <CalendarClock size={16} aria-hidden="true" />
            예약 시간 선택
          </span>
          <input
            type="datetime-local"
            value={route.time}
            onChange={(event) => onRouteChange('time', event.target.value)}
          />
        </label>
        <label className="field-block">
          <span>
            <Briefcase size={16} aria-hidden="true" />
            항공편 번호
          </span>
          <input value={flightNumber} onChange={(event) => onFlightNumberChange(event.target.value)} />
        </label>
      </div>

      <div className="booking-options">
        <div className="stepper-card">
          <span><Users size={16} aria-hidden="true" /> 승객</span>
          <div className="stepper">
            <button type="button" onClick={() => onPassengerStep(-1)} aria-label="승객 수 줄이기">
              <Minus size={15} aria-hidden="true" />
            </button>
            <strong>{passengers}</strong>
            <button type="button" onClick={() => onPassengerStep(1)} aria-label="승객 수 늘리기">
              <Plus size={15} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="stepper-card">
          <span><Briefcase size={16} aria-hidden="true" /> 수하물</span>
          <div className="stepper">
            <button type="button" onClick={() => onLuggageStep(-1)} aria-label="수하물 수 줄이기">
              <Minus size={15} aria-hidden="true" />
            </button>
            <strong>{luggage}</strong>
            <button type="button" onClick={() => onLuggageStep(1)} aria-label="수하물 수 늘리기">
              <Plus size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="toggle-row">
        <label className="switch-option">
          <input
            type="checkbox"
            checked={roundTrip}
            onChange={(event) => onRoundTripChange(event.target.checked)}
          />
          <span>왕복 예약</span>
        </label>
        <label className="switch-option">
          <input
            type="checkbox"
            checked={assistance}
            onChange={(event) => onAssistanceChange(event.target.checked)}
          />
          <span><ShieldCheck size={15} aria-hidden="true" /> 수하물 지원 요청</span>
        </label>
      </div>
    </div>
  );
}
