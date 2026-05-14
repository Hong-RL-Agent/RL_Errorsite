import { Navigation, RadioTower } from 'lucide-react';

export default function MapMockPanel({ route, selectedVehicle }) {
  return (
    <aside className="map-panel" data-bug-id="site039-bug02" aria-label="지도 mock 패널">
      <div className="map-toolbar">
        <span><RadioTower size={15} aria-hidden="true" /> Live dispatch</span>
        <strong>{selectedVehicle ? `${selectedVehicle.arrivalMinutes}분 후 도착` : '배차 확인 중'}</strong>
      </div>
      <div className="map-canvas">
        <div className="map-grid" />
        <div className="route-stroke" />
        <div className="pin pickup-pin">A</div>
        <div className="pin dropoff-pin">B</div>
        <div className="taxi-dot">
          <Navigation size={17} aria-hidden="true" />
        </div>
      </div>
      <div className="map-footer">
        <span>{route.pickup}</span>
        <span>{route.dropoff}</span>
      </div>
    </aside>
  );
}
