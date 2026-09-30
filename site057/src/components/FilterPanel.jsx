import React from 'react';
import { Filter, RefreshCw, Bike, Zap, Battery } from 'lucide-react';

export default function FilterPanel({
  selectedType,
  onChangeType,
  selectedBattery,
  onChangeBattery,
  selectedSort,
  onChangeSort,
  onReset
}) {
  return (
    <div className="filter-card">
      <div className="filter-grid">
        <div className="filter-group">
          <label className="filter-label">차량 종류</label>
          <select
            value={selectedType}
            onChange={(e) => onChangeType(e.target.value)}
            className="filter-select"
          >
            <option value="all">전체 이동수단</option>
            <option value="bike">전기자전거</option>
            <option value="scooter">전동킥보드</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">최소 배터리 잔량</label>
          <select
            value={selectedBattery}
            onChange={(e) => onChangeBattery(e.target.value)}
            className="filter-select"
          >
            <option value="0">전체 잔량</option>
            <option value="50">50% 이상 (약 20km)</option>
            <option value="70">70% 이상 (약 30km)</option>
            <option value="90">90% 이상 (완충 매물)</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">목록 정렬 기준</label>
          <select
            value={selectedSort}
            onChange={(e) => onChangeSort(e.target.value)}
            className="filter-select"
          >
            <option value="distance">가까운 거리순</option>
            <option value="battery">배터리 높은순</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={onReset}
            style={{
              padding: '10px 16px',
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              height: '42px'
            }}
          >
            <RefreshCw size={15} />
            <span>초기화</span>
          </button>
        </div>
      </div>
    </div>
  );
}
