import { Armchair, Clock3, Luggage, RefreshCw } from 'lucide-react';

export default function VehicleCards({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  loading,
  error,
  onRetry,
  formatCurrency
}) {
  if (loading) {
    return (
      <div className="vehicle-grid" aria-live="polite">
        {[1, 2, 3, 4].map((item) => (
          <div className="vehicle-card skeleton-card" key={item}>
            <div className="skeleton-image" />
            <div className="skeleton-line wide" />
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="api-state error-state" role="alert">
        <strong>차량 목록을 불러오지 못했습니다.</strong>
        <span>{error}</span>
        <button type="button" onClick={onRetry}>
          <RefreshCw size={16} aria-hidden="true" />
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="vehicle-grid">
      {vehicles.map((vehicle) => {
        const selected = vehicle.id === selectedVehicleId;

        return (
          <article className={`vehicle-card ${selected ? 'selected' : ''}`} key={vehicle.id}>
            <img src={vehicle.image} alt={`${vehicle.name} 차량 이미지`} />
            <div className="vehicle-card-header">
              <div>
                <span>{vehicle.badge}</span>
                <h3>{vehicle.name}</h3>
              </div>
              <strong>{formatCurrency(vehicle.baseFare)}</strong>
            </div>
            <div className="vehicle-meta">
              <span><Armchair size={15} aria-hidden="true" /> {vehicle.seats}석</span>
              <span><Clock3 size={15} aria-hidden="true" /> {vehicle.arrivalMinutes}분 후</span>
              <span><Luggage size={15} aria-hidden="true" /> {vehicle.luggage}</span>
            </div>
            <button
              className={selected ? 'selected-button' : 'secondary-button'}
              type="button"
              onClick={() => onSelectVehicle(vehicle.id)}
            >
              {selected ? '선택됨' : '이 차량 선택'}
            </button>
          </article>
        );
      })}
    </div>
  );
}
