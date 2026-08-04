import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import DiningHero from "./components/DiningHero.jsx";
import ReservationSearch from "./components/ReservationSearch.jsx";
import RestaurantGrid from "./components/RestaurantGrid.jsx";
import RestaurantModal from "./components/RestaurantModal.jsx";
import CourseTabs from "./components/CourseTabs.jsx";
import TableMap from "./components/TableMap.jsx";
import ReservationSummary from "./components/ReservationSummary.jsx";
import ReviewSection from "./components/ReviewSection.jsx";
import Footer from "./components/Footer.jsx";

const dates = ["2026-05-02", "2026-05-03", "2026-05-04", "2026-05-05"];
const reviews = [
  { author: "Mina", rating: 5, date: "2026-04-28", text: "와인 페어링과 서비스 흐름이 완벽했습니다." },
  { author: "Jun", rating: 4, date: "2026-04-18", text: "조용한 분위기와 코스 설명이 인상적이었어요." },
  { author: "Ari", rating: 5, date: "2026-04-25", text: "기념일 예약으로 추천합니다. 좌석도 편안했습니다." }
];

export default function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [region, setRegion] = useState("전체");
  const [partySize, setPartySize] = useState(2);
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [summaryDate, setSummaryDate] = useState(dates[0]);
  const [selectedTime, setSelectedTime] = useState("18:00");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [modalRestaurant, setModalRestaurant] = useState(null);
  const [reviewSort, setReviewSort] = useState("newest");

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [restaurantResponse, tableResponse] = await Promise.all([
          fetch("/api/restaurants"),
          fetch("/api/tables")
        ]);
        if (!restaurantResponse.ok || !tableResponse.ok) {
          throw new Error("레스토랑 예약 데이터를 불러오지 못했습니다.");
        }
        const restaurantData = await restaurantResponse.json();
        const tableData = await tableResponse.json();
        if (mounted) {
          setRestaurants(restaurantData.restaurants);
          setTables(tableData.tables);
          setSelectedRestaurant(restaurantData.restaurants[0]);
          setSelectedTime(restaurantData.restaurants[0].availableTimes[0]);
        }
      } catch (loadError) {
        if (mounted) setError(loadError.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const regions = useMemo(() => ["전체", ...new Set(restaurants.map((restaurant) => restaurant.region))], [restaurants]);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => region === "전체" || restaurant.region === region);
  }, [restaurants, region]);

  function handleDateChange(nextDate) {
    setSelectedDate(nextDate);
    // INTENTIONAL GUI BUG: site032-bug03
    // Type: date-selection-lag
    // Description: 날짜 선택 후 예약 요약 날짜를 이전 state 기준으로 업데이트해 한 단계 늦게 표시됨.
    setSummaryDate(selectedDate);
  }

  function handleRestaurantSelect(restaurant) {
    setSelectedRestaurant(restaurant);
    setSelectedTime(restaurant.availableTimes[0]);
  }

  function showPreparing() {
    alert("준비중입니다.");
  }

  return (
    <div className="app-shell">
      <Header
        regions={regions}
        region={region}
        onRegionChange={setRegion}
        dates={dates}
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        selectedTime={selectedTime}
        partySize={partySize}
        onPartySizeChange={setPartySize}
        onPreparing={showPreparing}
      />
      <main>
        {loading && <div className="status-panel">파인다이닝 예약 데이터를 불러오는 중입니다...</div>}
        {error && <div className="status-panel error">오류: {error}</div>}
        {!loading && !error && (
          <>
            <DiningHero onPreparing={showPreparing} />
            <ReservationSearch
              regions={regions}
              region={region}
              onRegionChange={setRegion}
              dates={dates}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              partySize={partySize}
              onPartySizeChange={setPartySize}
            />
            <section className="dining-layout">
              <div className="dining-main">
                <RestaurantGrid
                  restaurants={filteredRestaurants}
                  selectedRestaurantId={selectedRestaurant?.id}
                  onSelectRestaurant={handleRestaurantSelect}
                  onOpenModal={setModalRestaurant}
                />
                <CourseTabs />
                <TableMap tables={tables} />
                <ReviewSection reviews={reviews} sort={reviewSort} onSortChange={setReviewSort} />
              </div>
              <ReservationSummary
                restaurant={selectedRestaurant}
                selectedDate={summaryDate}
                selectedTime={selectedTime}
                initialPartySize={partySize}
                onPreparing={showPreparing}
              />
            </section>
          </>
        )}
      </main>
      <RestaurantModal restaurant={modalRestaurant} onClose={() => setModalRestaurant(null)} onPreparing={showPreparing} />
      <Footer onPreparing={showPreparing} />
    </div>
  );
}
