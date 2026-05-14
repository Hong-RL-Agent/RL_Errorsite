import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import EventHero from "./components/EventHero.jsx";
import GenreFilters from "./components/GenreFilters.jsx";
import EventGrid from "./components/EventGrid.jsx";
import EventModal from "./components/EventModal.jsx";
import DateTabs from "./components/DateTabs.jsx";
import TicketTierCards from "./components/TicketTierCards.jsx";
import CheckoutDrawer from "./components/CheckoutDrawer.jsx";
import RecommendationCarousel from "./components/RecommendationCarousel.jsx";
import Footer from "./components/Footer.jsx";
import { fallbackEvents, fallbackTicketTiers } from "./data/mockData.js";

const genres = ["All", "Concert", "Festival", "EDM", "Musical", "Indie", "Classic"];
const cities = ["All", "Seoul", "Busan", "Incheon", "Daegu", "Gwangju"];
const dates = ["2026-05-18", "2026-06-02", "2026-06-11", "2026-06-20", "2026-07-04", "2026-07-16"];

export default function App() {
  const [events, setEvents] = useState([]);
  const [ticketTiers, setTicketTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");
  const [city, setCity] = useState("All");
  const [activeDate, setActiveDate] = useState(dates[0]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [checkoutSummaryEvent, setCheckoutSummaryEvent] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [eventResponse, tierResponse] = await Promise.all([
          fetch("/api/events"),
          fetch("/api/ticket-tiers")
        ]);
        if (!eventResponse.ok || !tierResponse.ok) {
          throw new Error("예매 데이터를 불러오지 못했습니다.");
        }
        const eventData = await eventResponse.json();
        const tierData = await tierResponse.json();
        if (isMounted) {
          setEvents(eventData.events);
          setTicketTiers(tierData.ticketTiers);
          setSelectedEvent(eventData.events[0]);
          setCheckoutSummaryEvent(eventData.events[0]);
          setSelectedTier(tierData.ticketTiers[1]);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message);
          setEvents(fallbackEvents);
          setTicketTiers(fallbackTicketTiers);
          setSelectedEvent(fallbackEvents[0]);
          setCheckoutSummaryEvent(fallbackEvents[0]);
          setSelectedTier(fallbackTicketTiers[1]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesGenre = genre === "All" || event.genre === genre;
      const matchesCity = city === "All" || event.city === city;
      const matchesQuery = event.title.toLowerCase().includes(query.toLowerCase());
      return matchesGenre && matchesCity && matchesQuery;
    });
  }, [events, genre, city, query]);

  function handleSelectEvent(event) {
    setSelectedEvent(event);
    if (!checkoutSummaryEvent) {
      setCheckoutSummaryEvent(event);
    }
  }

  function handleOpenDetails(event) {
    handleSelectEvent(event);
    setIsModalOpen(true);
  }

  function handleCheckoutFromEvent(event) {
    handleSelectEvent(event);
    setIsCheckoutOpen(true);
  }

  return (
    <div className="app-shell">
      <Header
        query={query}
        onQueryChange={setQuery}
        cities={cities}
        city={city}
        onCityChange={setCity}
      />
      <main>
        {loading && <div className="status-panel">공연 예매 데이터를 불러오는 중입니다...</div>}
        {error && <div className="status-panel error">오류: {error}</div>}
        {!loading && error && (
          <div className="status-panel error">
            API 연결 오류: {error}
            <br />
            화면 확인을 위해 내장 mock 데이터로 렌더링했습니다.
          </div>
        )}
        {!loading && events.length > 0 && (
          <>
            <EventHero event={events[0]} onTicketOpen={() => handleCheckoutFromEvent(events[0])} />
            <GenreFilters genres={genres} activeGenre={genre} onGenreChange={setGenre} />
            <DateTabs dates={dates} activeDate={activeDate} onDateChange={setActiveDate} />
            <EventGrid
              events={filteredEvents}
              selectedEventId={selectedEvent?.id}
              onSelect={handleSelectEvent}
              onDetails={handleOpenDetails}
              onCheckout={handleCheckoutFromEvent}
            />
            <section className="booking-studio" id="booking">
              <div className="section-heading">
                <span>Seat & Tier</span>
                <h2>좌석 등급 선택</h2>
              </div>
              <TicketTierCards tiers={ticketTiers} selectedTier={selectedTier} onSelectTier={setSelectedTier} />
              <div className="seat-summary">
                <div>
                  <span>Selected show</span>
                  <strong>{selectedEvent?.title}</strong>
                </div>
                <div>
                  <span>Remaining seats</span>
                  <strong>{selectedEvent?.remainingSeats ?? 0}</strong>
                </div>
                <button onClick={() => setIsCheckoutOpen(true)}>예매 요약 열기</button>
              </div>
            </section>
            <RecommendationCarousel events={events} onSelect={handleCheckoutFromEvent} />
          </>
        )}
      </main>
      <CheckoutDrawer
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedEvent={selectedEvent}
        summaryEvent={checkoutSummaryEvent}
        selectedTier={selectedTier}
      />
      <EventModal event={selectedEvent} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <Footer />
    </div>
  );
}
