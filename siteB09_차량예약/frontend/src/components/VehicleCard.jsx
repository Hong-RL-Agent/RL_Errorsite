import React from 'react';
import { assetUrl, won } from '../api/media';
import { StatusBadge } from './Common';

export default function VehicleCard({ vehicle, comparing, onDetail, onToggleCompare, onSelect }) {
  const m = vehicle.model;
  const state = !vehicle.available && vehicle.status !== 'maintenance' ? 'rented' : vehicle.status;
  return (
    <article className={`vehicle-card${vehicle.available ? '' : ' off'}`} data-vehicle-id={vehicle.id}>
      <button type="button" className="v-photo" onClick={() => onDetail(vehicle.id)} aria-label={`${m.make} ${m.name} 상세`}>
        <img src={assetUrl(vehicle.thumbnailUrl)} alt={`${m.make} ${m.name}`} loading="lazy" />
      </button>
      <div className="v-main">
        <p className="v-cat">{m.categoryName} · {vehicle.depot.city} {vehicle.depot.name}</p>
        <h3>{m.make} {m.name}</h3>
        <ul className="v-specs">
          <li>👥 {m.seats}인승</li><li>⛽ {m.fuelName}</li><li>⚙️ {m.transmissionName}</li><li>🛣️ {vehicle.odometer.toLocaleString('ko-KR')}km</li>
        </ul>
        <StatusBadge kind="vehicle" value={vehicle.available ? 'available' : state === 'available' ? 'rented' : state} />
      </div>
      <div className="v-side">
        <p className="v-price"><b>{won(vehicle.dailyRate)}</b><span>/일</span></p>
        {vehicle.estimate && <p className="v-total">{vehicle.estimate.days}일 {won(vehicle.estimate.total)}</p>}
        <button type="button" className="btn primary" disabled={!vehicle.available} onClick={() => onSelect(vehicle)}>이 차량으로 예약</button>
        <button type="button" className={`btn ghost${comparing ? ' on' : ''}`} onClick={() => onToggleCompare(vehicle)}>{comparing ? '비교 해제' : '비교 담기'}</button>
      </div>
    </article>
  );
}
