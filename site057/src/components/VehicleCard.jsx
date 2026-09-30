import React from 'react';
import { Bike, Zap, MapPin, Battery, ChevronRight, Gauge } from 'lucide-react';
import VehicleStatusBadge from './VehicleStatusBadge';

export default function VehicleCard({ vehicle, onSelectVehicle, onRentVehicle }) {
  const getBatteryClass = (batt) => {
    if (batt >= 70) return 'battery-high';
    if (batt >= 30) return 'battery-mid';
    return 'battery-low';
  };

  const isAvailable = vehicle.status === 'available';

  return (
    <div className="vehicle-card">
      <div className="card-image-box">
        <img src={vehicle.image} alt={vehicle.name} className="card-img" loading="lazy" />
        
        <div className="card-badge-type">
          {vehicle.type === 'bike' ? <Bike size={14} /> : <Zap size={14} />}
          <span>{vehicle.typeName}</span>
        </div>

        <div className={`card-battery-pill ${getBatteryClass(vehicle.battery)}`}>
          <Battery size={15} />
          <span>{vehicle.battery}%</span>
        </div>
      </div>

      <div className="card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="card-code">{vehicle.code}</span>
          <VehicleStatusBadge status={vehicle.status} text={vehicle.statusText} />
        </div>

        <h3
          className="card-title"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectVehicle(vehicle.id)}
        >
          {vehicle.name}
        </h3>

        <div className="card-station">
          <MapPin size={15} color="#65a30d" />
          <span>{vehicle.stationName} ({vehicle.distanceMeters}m)</span>
        </div>

        <div className="card-meta-row">
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>주행 가능</div>
            <div style={{ fontWeight: 800, color: '#0f172a' }}>약 {vehicle.estimatedRangeKm}km</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>이용 요금</div>
            <div className="card-fare">
              기본 {vehicle.baseFare}원 <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>+ {vehicle.perMinuteFare}원/분</span>
            </div>
          </div>
        </div>

        <div className="card-footer">
          <button
            className="btn-card-detail"
            onClick={() => onSelectVehicle(vehicle.id)}
          >
            상세보기
          </button>
          <button
            className="btn-card-rent"
            disabled={!isAvailable}
            style={{ opacity: isAvailable ? 1 : 0.6, cursor: isAvailable ? 'pointer' : 'not-allowed' }}
            onClick={() => isAvailable && onRentVehicle(vehicle.id)}
          >
            <Zap size={16} />
            <span>대여하기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
