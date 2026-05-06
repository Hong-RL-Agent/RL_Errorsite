import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import PetCareHero from "./components/PetCareHero.jsx";
import ServiceFilterSidebar from "./components/ServiceFilterSidebar.jsx";
import ProviderGrid from "./components/ProviderGrid.jsx";
import ProviderModal from "./components/ProviderModal.jsx";
import BookingSummary from "./components/BookingSummary.jsx";
import ReviewSection from "./components/ReviewSection.jsx";
import HealthTips from "./components/HealthTips.jsx";
import FAQSection from "./components/FAQSection.jsx";
import Footer from "./components/Footer.jsx";

const services = ["전체", "진료", "미용", "호텔링", "산책", "방문 돌봄", "예방접종"];
const petTypes = ["전체", "강아지", "고양이", "기타"];

export default function App() {
  const [providers, setProviders] = useState([]);
  const [pets, setPets] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedService, setSelectedService] = useState("진료");
  const [petType, setPetType] = useState("전체");
  const [regionQuery, setRegionQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [modalProvider, setModalProvider] = useState(null);
  const [reviewSort, setReviewSort] = useState("newest");
  const [summaryOpen, setSummaryOpen] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [providerResponse, petResponse, reviewResponse] = await Promise.all([
          fetch("/api/providers"),
          fetch("/api/pets"),
          fetch("/api/reviews")
        ]);
        if (!providerResponse.ok || !petResponse.ok || !reviewResponse.ok) {
          throw new Error("펫케어 예약 데이터를 불러오지 못했습니다.");
        }
        const providerData = await providerResponse.json();
        const petData = await petResponse.json();
        const reviewData = await reviewResponse.json();
        if (mounted) {
          setProviders(providerData.providers);
          setPets(petData.pets);
          setReviews(reviewData.reviews);
          setSelectedProvider(providerData.providers[0]);
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

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      const matchesService = selectedService === "전체" || provider.serviceType === selectedService;
      const matchesPet = petType === "전체" || provider.petTypes.includes(petType);
      const matchesRegion = provider.region.toLowerCase().includes(regionQuery.toLowerCase());
      return matchesService && matchesPet && matchesRegion;
    });
  }, [providers, selectedService, petType, regionQuery]);

  function handleProviderSelect(provider) {
    setSelectedProvider(provider);
    setSelectedService(provider.serviceType);
  }

  function showPreparing() {
    alert("준비중입니다.");
  }

  return (
    <div className="app-shell">
      <Header regionQuery={regionQuery} onRegionQueryChange={setRegionQuery} onPreparing={showPreparing} />
      <main>
        {loading && <div className="status-panel">반려동물 케어 예약 데이터를 불러오는 중입니다...</div>}
        {error && <div className="status-panel error">오류: {error}</div>}
        {!loading && !error && (
          <>
            <PetCareHero onServiceSelect={setSelectedService} onPreparing={showPreparing} />
            <section className="desktop-layout">
              <ServiceFilterSidebar
                services={services}
                selectedService={selectedService}
                onServiceSelect={setSelectedService}
                petTypes={petTypes}
                petType={petType}
                onPetTypeChange={setPetType}
                pets={pets}
              />
              <ProviderGrid
                providers={filteredProviders}
                selectedProviderId={selectedProvider?.id}
                selectedService={selectedService}
                onSelectProvider={handleProviderSelect}
                onOpenModal={setModalProvider}
              />
              <BookingSummary
                provider={selectedProvider}
                service={selectedService}
                open={summaryOpen}
                onToggle={() => setSummaryOpen((value) => !value)}
                onPreparing={showPreparing}
              />
            </section>
            <ReviewSection reviews={reviews} sort={reviewSort} onSortChange={setReviewSort} />
            <HealthTips />
            <FAQSection onPreparing={showPreparing} />
          </>
        )}
      </main>
      <ProviderModal provider={modalProvider} onClose={() => setModalProvider(null)} onPreparing={showPreparing} />
      <Footer onPreparing={showPreparing} />
    </div>
  );
}
