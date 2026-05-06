import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import RentHero from './components/RentHero.jsx';
import SearchPanel from './components/SearchPanel.jsx';
import CarFilters from './components/CarFilters.jsx';
import CarGrid from './components/CarGrid.jsx';
import CarModal from './components/CarModal.jsx';
import InsuranceOptions from './components/InsuranceOptions.jsx';
import BookingSummary from './components/BookingSummary.jsx';
import RecommendationCarousel from './components/RecommendationCarousel.jsx';
import Footer from './components/Footer.jsx';

function App() {
  const [cars, setCars] = useState([]);
  const [insuranceOptions, setInsuranceOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [modalCar, setModalCar] = useState(null);
  const [typeFilter, setTypeFilter] = useState('전체');
  const [fuelFilter, setFuelFilter] = useState('전체');
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  // selectedInsurance: 보험 옵션 카드 UI에서 하이라이트 표시용 (정상 업데이트)
  const [selectedInsurance, setSelectedInsurance] = useState(null);

  // INTENTIONAL GUI BUG: site028-bug01
  // Type: selected-option-summary-mismatch
  // Description: 보험 옵션 선택 state와 예약 요약 state가 분리되어 선택값이 요약에 반영되지 않음.
  const [insuranceSummary] = useState({ id: 1, name: '기본 보장', price: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [carsRes, insuranceRes] = await Promise.all([
        fetch('/api/cars'),
        fetch('/api/insurance-options')
      ]);
      if (!carsRes.ok || !insuranceRes.ok) throw new Error('API 응답 오류');
      const carsData = await carsRes.json();
      const insuranceData = await insuranceRes.json();
      setCars(carsData.data);
      setInsuranceOptions(insuranceData.data);
      setSelectedInsurance(insuranceData.data[0]);
    } catch (err) {
      setError('차량 데이터를 불러오는 데 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleInsuranceSelect = (option) => {
    setSelectedInsurance(option);
    // insuranceSummary는 업데이트하지 않음 — 의도된 버그
  };

  const handleCarReserve = (car) => {
    if (!car.available) return;
    setSelectedCar(car);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCarModalOpen = (car) => {
    setModalCar(car);
  };

  const handleCarModalClose = () => {
    setModalCar(null);
  };

  const filteredCars = cars.filter(car => {
    const typeMatch = typeFilter === '전체' || car.type === typeFilter;
    const fuelMatch = fuelFilter === '전체' || car.fuel === fuelFilter;
    return typeMatch && fuelMatch;
  });

  const recommendedCars = cars
    .filter(c => c.rating >= 4.7)
    .slice(0, 5);

  return (
    <div className="app">
      <Header />
      <RentHero />
      <SearchPanel
        pickupLocation={pickupLocation}
        onPickupChange={setPickupLocation}
        pickupDate={pickupDate}
        onPickupDateChange={setPickupDate}
        returnDate={returnDate}
        onReturnDateChange={setReturnDate}
      />

      <main className="main-content">
        <div className="content-area">
          <CarFilters
            typeFilter={typeFilter}
            onTypeChange={setTypeFilter}
            fuelFilter={fuelFilter}
            onFuelChange={setFuelFilter}
          />

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>차량 정보를 불러오는 중...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <span>⚠️ {error}</span>
              <button className="btn-retry" onClick={fetchData}>다시 시도</button>
            </div>
          )}

          {!loading && !error && (
            <CarGrid
              cars={filteredCars}
              onCarReserve={handleCarReserve}
              onCarModalOpen={handleCarModalOpen}
            />
          )}

          {!loading && (
            <InsuranceOptions
              options={insuranceOptions}
              selectedInsurance={selectedInsurance}
              onSelect={handleInsuranceSelect}
            />
          )}

          {!loading && recommendedCars.length > 0 && (
            <RecommendationCarousel
              cars={recommendedCars}
              onReserve={handleCarReserve}
            />
          )}
        </div>

        <BookingSummary
          selectedCar={selectedCar}
          insuranceSummary={insuranceSummary}
          pickupDate={pickupDate}
          returnDate={returnDate}
          pickupLocation={pickupLocation}
        />
      </main>

      {modalCar && (
        <CarModal car={modalCar} onClose={handleCarModalClose} />
      )}

      <Footer />
    </div>
  );
}

export default App;