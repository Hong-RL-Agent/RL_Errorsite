import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import MobilityHero from './components/MobilityHero.jsx';
import VehicleCards from './components/VehicleCards.jsx';
import BookingForm from './components/BookingForm.jsx';
import MapMockPanel from './components/MapMockPanel.jsx';
import FareSummary from './components/FareSummary.jsx';
import FareModal from './components/FareModal.jsx';
import ReviewSection from './components/ReviewSection.jsx';
import Footer from './components/Footer.jsx';

const defaultRoute = {
  pickup: '서울역 1번 출구',
  dropoff: '인천국제공항 제2터미널',
  time: '2026-05-04T18:30',
  distanceKm: 63.5
};

const reviews = [
  {
    id: 1,
    tag: 'airport',
    name: '한지우',
    rating: 5,
    route: '판교 테크노밸리 -> 김포공항',
    text: '새벽 이동이라 걱정했는데 기사 배정과 수하물 안내가 정확했습니다.'
  },
  {
    id: 2,
    tag: 'business',
    name: 'Marcus K.',
    rating: 5,
    route: '코엑스 -> 인천공항 T1',
    text: '해외 임원 픽업용으로 사용했습니다. 영문 예약 요약까지 바로 확인되어 편했습니다.'
  },
  {
    id: 3,
    tag: 'family',
    name: '김나연',
    rating: 4,
    route: '마포구 -> 인천공항 T2',
    text: '카시트 요청과 밴 선택이 쉬웠고 예상 도착 시간이 안정적이었어요.'
  },
  {
    id: 4,
    tag: 'airport',
    name: '오세훈',
    rating: 5,
    route: '잠실 -> 인천공항 T1',
    text: '요금 구성이 투명해서 회사 정산 자료로 쓰기 좋았습니다.'
  }
];

const formatCurrency = (value) =>
  new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0
  }).format(value || 0);

export default function App() {
  const [route, setRoute] = useState(defaultRoute);
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [fareSummary, setFareSummary] = useState(null);
  const [fareLoading, setFareLoading] = useState(false);
  const [fareError, setFareError] = useState('');
  const [fareModalOpen, setFareModalOpen] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [passengers, setPassengers] = useState(2);
  const [luggage, setLuggage] = useState(2);
  const [roundTrip, setRoundTrip] = useState(false);
  const [flightNumber, setFlightNumber] = useState('KE 184');
  const [assistance, setAssistance] = useState(true);
  const [bookingStatus, setBookingStatus] = useState('예약 대기');

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedVehicleId),
    [vehicles, selectedVehicleId]
  );

  const filteredReviews = useMemo(() => {
    if (reviewFilter === 'all') {
      return reviews;
    }
    return reviews.filter((review) => review.tag === reviewFilter);
  }, [reviewFilter]);

  const loadVehicles = async () => {
    setVehiclesLoading(true);
    setVehiclesError('');

    try {
      const response = await fetch('/api/vehicles');
      if (!response.ok) {
        throw new Error('차량 데이터를 불러오지 못했습니다.');
      }
      const data = await response.json();
      setVehicles(data.vehicles);
      const firstVehicle = data.vehicles[0];
      if (firstVehicle) {
        setSelectedVehicleId(firstVehicle.id);
        await loadFare(firstVehicle.id);
      }
    } catch (error) {
      setVehiclesError(error.message);
    } finally {
      setVehiclesLoading(false);
    }
  };

  const loadFare = async (vehicleId) => {
    setFareLoading(true);
    setFareError('');

    try {
      const params = new URLSearchParams({
        vehicleId,
        distanceKm: String(route.distanceKm)
      });
      const response = await fetch(`/api/fare-estimate?${params.toString()}`);
      if (!response.ok) {
        throw new Error('예상 요금을 계산하지 못했습니다.');
      }
      const data = await response.json();
      setFareSummary(data);
    } catch (error) {
      setFareError(error.message);
    } finally {
      setFareLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    if (!selectedVehicleId) {
      return;
    }
    loadFare(selectedVehicleId);
  }, [route.pickup, route.dropoff, route.time, route.distanceKm]);

  const handleRouteChange = (field, value) => {
    setRoute((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleRouteSwap = () => {
    setRoute((current) => ({
      ...current,
      pickup: current.dropoff,
      dropoff: current.pickup
    }));
  };

  const handleFareOpen = () => {
    setFareModalOpen(true);
  };

  const handlePassengerStep = (direction) => {
    setPassengers((current) => Math.min(8, Math.max(1, current + direction)));
  };

  const handleLuggageStep = (direction) => {
    setLuggage((current) => Math.min(10, Math.max(0, current + direction)));
  };

  const handleCallRide = () => {
    setBookingStatus('예약 대기');
  };

  const showComingSoon = () => {
    alert('준비중입니다.');
  };

  return (
    <div className="app-shell">
      <Header
        route={route}
        onRouteChange={handleRouteChange}
        onFareOpen={handleFareOpen}
        onComingSoon={showComingSoon}
      />

      <main>
        <MobilityHero
          route={route}
          fareSummary={fareSummary}
          formatCurrency={formatCurrency}
          onFareOpen={handleFareOpen}
        />

        <section className="section service-strip" aria-label="예약 서비스 상태">
          <div>
            <span className="section-kicker">Enterprise Mobility Desk</span>
            <h2>공항 이동, 기업 셔틀, 의전 배차를 한 화면에서 예약합니다.</h2>
          </div>
          <div className="service-metrics" aria-label="서비스 지표">
            <span><strong>24h</strong> 관제 센터</span>
            <span><strong>7분</strong> 평균 배차</span>
            <span><strong>98%</strong> 정시 도착</span>
          </div>
        </section>

        <section className="section vehicle-section" id="vehicles">
          <div className="section-heading">
            <span className="section-kicker">차량 타입</span>
            <h2>승객 수와 수하물에 맞는 차량을 선택하세요.</h2>
          </div>
          <VehicleCards
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={setSelectedVehicleId}
            loading={vehiclesLoading}
            error={vehiclesError}
            onRetry={loadVehicles}
            formatCurrency={formatCurrency}
          />
        </section>

        <section className="section booking-workspace" id="booking">
          <div className="booking-panel">
            <BookingForm
              route={route}
              onRouteChange={handleRouteChange}
              onRouteSwap={handleRouteSwap}
              passengers={passengers}
              luggage={luggage}
              roundTrip={roundTrip}
              flightNumber={flightNumber}
              assistance={assistance}
              onPassengerStep={handlePassengerStep}
              onLuggageStep={handleLuggageStep}
              onRoundTripChange={setRoundTrip}
              onFlightNumberChange={setFlightNumber}
              onAssistanceChange={setAssistance}
              onComingSoon={showComingSoon}
            />
            <MapMockPanel route={route} selectedVehicle={selectedVehicle} />
          </div>

          <FareSummary
            route={route}
            selectedVehicle={selectedVehicle}
            fareSummary={fareSummary}
            fareLoading={fareLoading}
            fareError={fareError}
            bookingStatus={bookingStatus}
            passengers={passengers}
            luggage={luggage}
            roundTrip={roundTrip}
            assistance={assistance}
            formatCurrency={formatCurrency}
            onFareOpen={handleFareOpen}
            onRetryFare={() => selectedVehicleId && loadFare(selectedVehicleId)}
            onCallRide={handleCallRide}
            onComingSoon={showComingSoon}
          />
        </section>

        <section className="section operations-section" aria-label="운행 관리">
          <div className="operations-copy">
            <span className="section-kicker">Live Operations</span>
            <h2>예약 전후 상태를 데스크톱에서 바로 확인합니다.</h2>
            <p>
              기사 도착 예정, 수하물 요청, 항공편 번호, 영수증 메모까지 운영팀이 확인하기 쉬운 밀도로 정리했습니다.
            </p>
          </div>
          <div className="operations-grid">
            <div>
              <strong>기사 배정</strong>
              <span>예약 확정 후 3분 내 알림</span>
            </div>
            <div>
              <strong>정산 메모</strong>
              <span>부서명과 비용 코드 입력 가능</span>
            </div>
            <div>
              <strong>공항 지원</strong>
              <span>터미널 하차 지점 사전 공유</span>
            </div>
          </div>
        </section>

        <ReviewSection
          reviews={filteredReviews}
          activeFilter={reviewFilter}
          onFilterChange={setReviewFilter}
        />
      </main>

      <Footer onComingSoon={showComingSoon} />

      <FareModal
        open={fareModalOpen}
        onClose={() => setFareModalOpen(false)}
        fareSummary={fareSummary}
        fareLoading={fareLoading}
        fareError={fareError}
        selectedVehicle={selectedVehicle}
        route={route}
        formatCurrency={formatCurrency}
        onRetryFare={() => selectedVehicleId && loadFare(selectedVehicleId)}
      />
    </div>
  );
}
