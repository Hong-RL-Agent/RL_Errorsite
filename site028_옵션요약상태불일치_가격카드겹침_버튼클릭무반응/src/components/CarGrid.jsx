import React from 'react';
import CarCard from './CarCard.jsx';

function CarGrid({ cars, onCarReserve, onCarModalOpen }) {
  if (cars.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🚗</div>
        <h3>조건에 맞는 차량이 없습니다</h3>
        <p>필터를 변경하거나 전체 차종을 선택해 보세요.</p>
      </div>
    );
  }

  return (
    <section className="car-grid-section">
      <div className="section-header-row">
        <h2 className="section-title">
          이용 가능한 차량
          <span className="car-count-badge">{cars.length}대</span>
        </h2>
        <div className="sort-control">
          <select className="sort-select" onChange={() => alert('준비중입니다.')}>
            <option>기본 순</option>
            <option>가격 낮은 순</option>
            <option>가격 높은 순</option>
            <option>평점 높은 순</option>
          </select>
        </div>
      </div>

      <div className="car-grid">
        {cars.map(car => (
          <CarCard
            key={car.id}
            car={car}
            onReserve={onCarReserve}
            onModalOpen={onCarModalOpen}
          />
        ))}
      </div>
    </section>
  );
}

export default CarGrid;