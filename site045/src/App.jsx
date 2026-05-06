import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import BeautyHero from './components/BeautyHero.jsx';
import ServiceFilters from './components/ServiceFilters.jsx';
import ServiceGrid from './components/ServiceGrid.jsx';
import ServiceModal from './components/ServiceModal.jsx';
import StylistSection from './components/StylistSection.jsx';
import DateTimePicker from './components/DateTimePicker.jsx';
import BookingSummary from './components/BookingSummary.jsx';
import StickyBookingCTA from './components/StickyBookingCTA.jsx';
import MembershipAccordion from './components/MembershipAccordion.jsx';
import ReviewSection from './components/ReviewSection.jsx';
import Footer from './components/Footer.jsx';

const fetchJson = async (endpoint, setter, setError) => {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error('API error');
    const json = await response.json();
    setter(json);
  } catch (err) {
    setError(err.message);
  }
};

export default function App() {
  const [servicesData, setServicesData] = useState(null);
  const [stylistsData, setStylistsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [selectedDate, setSelectedDate] = useState('2026-05-14');
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/services').then((res) => res.json()),
      fetch('/api/stylists').then((res) => res.json())
    ])
      .then(([servicesJson, stylistsJson]) => {
        setServicesData(servicesJson.services);
        setStylistsData(stylistsJson.stylists);
        setSelectedService(servicesJson.services[0]);
        setSelectedStylist(stylistsJson.stylists[0]);
      })
      .catch((err) => {
        console.error(err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    if (!servicesData) return ['전체'];
    return ['전체', ...new Set(servicesData.map((service) => service.category))];
  }, [servicesData]);

  const visibleServices = useMemo(() => {
    if (!servicesData) return [];
    return selectedCategory === '전체'
      ? servicesData
      : servicesData.filter((service) => service.category === selectedCategory);
  }, [servicesData, selectedCategory]);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setShowModal(false);
  };

  const handleStylistSelect = (stylist) => {
    setSelectedStylist(stylist);
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
        <p>예약 데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <h1>불러오기 실패</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Header />
      <BeautyHero selectedService={selectedService} />
      <main className="main-content">
        <section className="booking-intro">
          <div className="section-copy">
            <span className="eyebrow">프리미엄 예약</span>
            <h2>당신만의 VIP 스타일링 루틴을 완성하세요</h2>
            <p>
              Luxe Bloom에서는 전문 스타일리스트가 고객의 라이프스타일과 얼굴형을
              고려한 맞춤 스타일을 제안합니다.
            </p>
          </div>
          <div className="stats-panel">
            <div>
              <strong>18+</strong>
              <span>프리미엄 케어 패키지</span>
            </div>
            <div>
              <strong>98%</strong>
              <span>예약 만족도</span>
            </div>
            <div>
              <strong>24h</strong>
              <span>실시간 상담 지원</span>
            </div>
          </div>
        </section>

        <section className="services-section">
          <h3>시술 패키지 선택</h3>
          <ServiceFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onChange={setSelectedCategory}
          />
          <ServiceGrid
            services={visibleServices}
            onOpenModal={() => setShowModal(true)}
            onSelectService={handleServiceSelect}
          />
        </section>

        <section className="two-column-layout">
          <div>
            <StylistSection
              stylists={stylistsData}
              currentStylist={selectedStylist}
              onSelect={handleStylistSelect}
            />
            <DateTimePicker
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateChange={setSelectedDate}
              onTimeChange={setSelectedTime}
              availableTimes={selectedStylist?.available || []}
            />
            <MembershipAccordion />
          </div>

          <aside className="summary-panel">
            <BookingSummary
              selectedService={selectedService}
              selectedStylist={selectedStylist}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
            />
          </aside>
        </section>

        <ReviewSection />
      </main>
      <StickyBookingCTA
        selectedService={selectedService}
        selectedStylist={selectedStylist}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
      />
      <Footer />

      {showModal && (
        <ServiceModal
          service={selectedService}
          onClose={() => setShowModal(false)}
          onReserve={() => {
            setShowModal(false);
            alert('예약 요청이 접수되었습니다. 준비중입니다.');
          }}
        />
      )}
    </div>
  );
}
