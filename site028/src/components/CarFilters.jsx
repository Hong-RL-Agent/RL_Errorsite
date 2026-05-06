import React from 'react';

const CAR_TYPES = ['전체', '소형', '중형', '대형', 'SUV', '럭셔리'];
const FUEL_TYPES = ['전체', '가솔린', '디젤', '전기', '하이브리드'];

const fuelIcons = {
  '전체': '⛽', '가솔린': '⛽', '디젤': '🛢️', '전기': '⚡', '하이브리드': '🔋'
};

function CarFilters({ typeFilter, onTypeChange, fuelFilter, onFuelChange }) {
  return (
    <div className="car-filters" id="cars">
      <div className="filter-row">
        <div className="filter-group">
          <span className="filter-label">차량 유형</span>
          <div className="filter-pills">
            {CAR_TYPES.map(type => (
              <button
                key={type}
                className={`filter-pill ${typeFilter === type ? 'active' : ''}`}
                onClick={() => onTypeChange(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">연료 유형</span>
          <div className="filter-pills">
            {FUEL_TYPES.map(fuel => (
              <button
                key={fuel}
                className={`filter-pill ${fuelFilter === fuel ? 'active' : ''}`}
                onClick={() => onFuelChange(fuel)}
              >
                {fuelIcons[fuel]} {fuel}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarFilters;