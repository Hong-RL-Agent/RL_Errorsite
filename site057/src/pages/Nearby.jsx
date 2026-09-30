import React, { useState } from 'react';
import { MapPin, Navigation, Bike, Zap, Filter, Search } from 'lucide-react';
import VehicleCard from '../components/VehicleCard';
import VehicleMap from '../components/VehicleMap';
import FilterPanel from '../components/FilterPanel';

export default function Nearby({
  vehicles = [],
  stations = [],
  onSelectVehicle,
  onRentVehicle
}) {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedBattery, setSelectedBattery] = useState('0');
  const [selectedSort, setSelectedSort] = useState('distance');
  const [selectedStationId, setSelectedStationId] = useState(null);

  // Filter vehicles
  let filtered = vehicles.filter(v => {
    if (selectedType !== 'all' && v.type !== selectedType) return false;
    if (Number(selectedBattery) > 0 && v.battery < Number(selectedBattery)) return false;
    if (selectedStationId && v.stationId !== selectedStationId) return false;
    return true;
  });

  const [sec463Notice, setSec463Notice] = useState(false);

  // INTENTIONAL BACKEND BUG: site057-SEC-463
  // Array.sort()의 원본 배열 변형으로 목록 순서가 다른 화면까지 변경되는 오류:
  // 불변성을 지키는 복사본([...vehicles])을 만들지 않고 공유되는 vehicles 원본 배열에 직접 .sort()를 호출함.
  // 이로 인해 사용자가 주변 차량에서 '배터리 높은순' 등으로 정렬 기준을 변경하면
  // 홈 화면(Home.jsx)의 추천 차량 목록 순서까지 의도치 않게 변경되는 부작용(Side Effect)이 발생함.
  if (selectedSort === 'battery') {
    vehicles.sort((a, b) => b.battery - a.battery);
  } else {
    vehicles.sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  const handleSortChange = (newSort) => {
    setSelectedSort(newSort);
    if (newSort === 'battery') {
      setSec463Notice(true);
    }
  };

  const handleResetFilters = () => {
    setSelectedType('all');
    setSelectedBattery('0');
    setSelectedSort('distance');
    setSelectedStationId(null);
    setSec463Notice(false);
  };

  return (
    <div className="max-w-screen" style={{ paddingTop: '28px' }}>
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
          주변 RideOn 차량 탐색
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          실시간 위치 기반으로 가장 가까운 전기자전거와 전동킥보드를 찾아보세요.
        </p>
      </div>

      {/* Interactive Map */}
      <VehicleMap
        stations={stations}
        selectedStationId={selectedStationId}
        onSelectStation={(id) => setSelectedStationId(selectedStationId === id ? null : id)}
      />

      {/* Filter Panel */}
      <FilterPanel
        selectedType={selectedType}
        onChangeType={setSelectedType}
        selectedBattery={selectedBattery}
        onChangeBattery={setSelectedBattery}
        selectedSort={selectedSort}
        onChangeSort={handleSortChange}
        onReset={handleResetFilters}
      />

      {/* SEC-463 Notice Banner */}
      {sec463Notice && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>
              오류 감지: site057-SEC-463
            </span>
            <span style={{ fontSize: '0.86rem', color: '#991b1b', lineHeight: 1.4 }}>
              <strong>Array.sort() 원본 배열 직접 변형 Side Effect 발생</strong>: 불변성 복사본 없이 정렬하여 홈(Home) 화면의 추천 차량 목록 순서까지 함께 변형되었습니다.
            </span>
          </div>
          <button
            onClick={() => setSec463Notice(false)}
            style={{ background: 'none', border: 'none', color: '#991b1b', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            닫기
          </button>
        </div>
      )}

      {/* Result Count and Clear Station Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155' }}>
          총 <span style={{ color: '#65a30d', fontWeight: 900 }}>{filtered.length}</span>대의 이용 가능한 차량
          {selectedStationId && (
            <span style={{ marginLeft: '8px', fontSize: '0.85rem', color: '#0284c7' }}>
              (선택된 거치대 필터링 적용 중)
            </span>
          )}
        </div>

        {selectedStationId && (
          <button
            onClick={() => setSelectedStationId(null)}
            style={{
              padding: '4px 10px',
              background: '#e0f2fe',
              color: '#0369a1',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            모든 거치대 보기
          </button>
        )}
      </div>

      {/* Vehicles Grid */}
      {filtered.length === 0 ? (
        <div style={{ background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '16px', padding: '60px 20px', textAlign: 'center' }}>
          <Bike size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
            조건에 맞는 차량이 없습니다.
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '18px' }}>
            필터 조건을 변경하거나 지도에서 다른 스테이션을 선택해 보세요.
          </p>
          <button
            onClick={handleResetFilters}
            style={{
              padding: '8px 18px',
              background: '#ecfccb',
              color: '#4d7c0f',
              border: '1px solid #bef264',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            필터 초기화
          </button>
        </div>
      ) : (
        <div className="vehicles-grid">
          {filtered.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onSelectVehicle={onSelectVehicle}
              onRentVehicle={onRentVehicle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
