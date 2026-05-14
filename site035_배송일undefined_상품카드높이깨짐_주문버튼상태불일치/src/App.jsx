import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import FlowerHero from "./components/FlowerHero.jsx";
import FlowerFilters from "./components/FlowerFilters.jsx";
import FlowerGrid from "./components/FlowerGrid.jsx";
import FlowerModal from "./components/FlowerModal.jsx";
import DeliveryDatePicker from "./components/DeliveryDatePicker.jsx";
import CartSummary from "./components/CartSummary.jsx";
import RecommendationCarousel from "./components/RecommendationCarousel.jsx";
import ReviewSection from "./components/ReviewSection.jsx";
import Footer from "./components/Footer.jsx";

const purposes = ["전체", "기념일", "생일", "집들이", "프로포즈", "축하", "감사"];
const priceBands = ["전체", "5만원 이하", "5만원~8만원", "8만원 이상"];

export default function App() {
  const [flowers, setFlowers] = useState([]);
  const [deliveryDates, setDeliveryDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [purpose, setPurpose] = useState("전체");
  const [priceBand, setPriceBand] = useState("전체");
  const [region, setRegion] = useState("서울");
  const [selectedDate, setSelectedDate] = useState("");
  const [cart, setCart] = useState([]);
  const [liked, setLiked] = useState([]);
  const [modalFlower, setModalFlower] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [flowerResponse, dateResponse] = await Promise.all([fetch("/api/flowers"), fetch("/api/delivery-dates")]);
        if (!flowerResponse.ok || !dateResponse.ok) throw new Error("꽃배달 데이터를 불러오지 못했습니다.");
        const flowerData = await flowerResponse.json();
        const dateData = await dateResponse.json();
        if (mounted) {
          setFlowers(flowerData.flowers);
          setDeliveryDates(dateData.deliveryDates);
          setSelectedDate(dateData.deliveryDates.find((date) => date.available)?.date ?? "");
        }
      } catch (loadError) {
        if (mounted) setError(loadError.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  const filteredFlowers = useMemo(() => flowers.filter((flower) => {
    const matchesQuery = flower.name.toLowerCase().includes(query.toLowerCase());
    const matchesPurpose = purpose === "전체" || flower.purpose === purpose;
    const matchesPrice = priceBand === "전체" || (priceBand === "5만원 이하" && flower.price <= 50000) || (priceBand === "5만원~8만원" && flower.price > 50000 && flower.price <= 80000) || (priceBand === "8만원 이상" && flower.price > 80000);
    return matchesQuery && matchesPurpose && matchesPrice;
  }), [flowers, query, purpose, priceBand]);

  function toggleLike(id) {
    setLiked((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function addToCart(flower) {
    if (flower.soldOut) return;
    setCart((current) => [...current, flower]);
  }

  function showPreparing() { alert("준비중입니다."); }

  return (
    <div className="app-shell">
      <Header query={query} onQueryChange={setQuery} purposes={purposes} purpose={purpose} onPurposeChange={setPurpose} region={region} onRegionChange={setRegion} onPreparing={showPreparing} />
      <main>
        {loading && <div className="status-panel">꽃다발 상품을 불러오는 중입니다...</div>}
        {error && <div className="status-panel error">오류: {error}</div>}
        {!loading && !error && (
          <>
            <FlowerHero onPurposeChange={setPurpose} onPreparing={showPreparing} />
            <section className="shop-layout">
              <div className="shop-main">
                <FlowerFilters purposes={purposes} purpose={purpose} onPurposeChange={setPurpose} priceBands={priceBands} priceBand={priceBand} onPriceBandChange={setPriceBand} />
                <DeliveryDatePicker dates={deliveryDates} selectedDate={selectedDate} onDateChange={setSelectedDate} />
                <FlowerGrid flowers={filteredFlowers} liked={liked} onToggleLike={toggleLike} onAddToCart={addToCart} onOpenFlower={setModalFlower} />
                <RecommendationCarousel flowers={flowers.filter((flower) => flower.recommended)} onOpenFlower={setModalFlower} />
                <ReviewSection />
              </div>
              <CartSummary cart={cart} region={region} selectedDate={selectedDate} onPreparing={showPreparing} />
            </section>
          </>
        )}
      </main>
      <FlowerModal flower={modalFlower} onClose={() => setModalFlower(null)} onAddToCart={addToCart} />
      <Footer onPreparing={showPreparing} />
    </div>
  );
}
