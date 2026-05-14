import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import MentorHero from "./components/MentorHero.jsx";
import FieldFilters from "./components/FieldFilters.jsx";
import MentorGrid from "./components/MentorGrid.jsx";
import MentorModal from "./components/MentorModal.jsx";
import TimeSlotPicker from "./components/TimeSlotPicker.jsx";
import BookingSummary from "./components/BookingSummary.jsx";
import ReviewSection from "./components/ReviewSection.jsx";
import Footer from "./components/Footer.jsx";

const fields = ["All", "Product Management", "Frontend Engineering", "UX Research", "Data Science", "Career Coaching", "Startup Strategy"];
const careerFilters = ["All", "5+ years", "10+ years"];

export default function App() {
  const [mentors, setMentors] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [field, setField] = useState("All");
  const [careerFilter, setCareerFilter] = useState("All");
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [modalMentor, setModalMentor] = useState(null);
  const [reviewSort, setReviewSort] = useState("newest");

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [mentorResponse, reviewResponse] = await Promise.all([
          fetch("/api/mentors"),
          fetch("/api/reviews")
        ]);
        if (!mentorResponse.ok || !reviewResponse.ok) {
          throw new Error("멘토링 데이터를 불러오지 못했습니다.");
        }
        const mentorData = await mentorResponse.json();
        const reviewData = await reviewResponse.json();
        if (mounted) {
          setMentors(mentorData.mentors);
          setReviews(reviewData.reviews);
          setSelectedMentor(mentorData.mentors[0]);
          setSelectedSlot(mentorData.mentors[0]?.availableSlots[0] ?? "");
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

  const filteredMentors = useMemo(() => {
    return mentors.filter((mentor) => {
      const matchesField = field === "All" || mentor.field === field;
      const matchesQuery = mentor.name.toLowerCase().includes(query.toLowerCase()) || mentor.field.toLowerCase().includes(query.toLowerCase());
      const matchesCareer =
        careerFilter === "All" ||
        (careerFilter === "5+ years" && mentor.career >= 5) ||
        (careerFilter === "10+ years" && mentor.career >= 10);
      return matchesField && matchesQuery && matchesCareer;
    });
  }, [mentors, field, query, careerFilter]);

  function handleSelectMentor(mentor) {
    setSelectedMentor(mentor);
    setSelectedSlot(mentor.availableSlots[0] ?? "");
  }

  function showPreparing() {
    alert("준비중입니다.");
  }

  return (
    <div className="app-shell">
      <Header query={query} onQueryChange={setQuery} onPreparing={showPreparing} />
      <main>
        {loading && <div className="status-panel">멘토 데이터를 불러오는 중입니다...</div>}
        {error && <div className="status-panel error">오류: {error}</div>}
        {!loading && !error && (
          <>
            <MentorHero mentors={mentors.slice(0, 3)} onSelectMentor={handleSelectMentor} onPreparing={showPreparing} />
            <section className="mentor-workspace">
              <div className="mentor-main">
                <FieldFilters
                  fields={fields}
                  activeField={field}
                  onFieldChange={setField}
                  careerFilters={careerFilters}
                  activeCareer={careerFilter}
                  onCareerChange={setCareerFilter}
                />
                <MentorGrid
                  mentors={filteredMentors}
                  selectedMentorId={selectedMentor?.id}
                  onSelectMentor={handleSelectMentor}
                  onOpenModal={setModalMentor}
                />
                <ReviewSection reviews={reviews} sort={reviewSort} onSortChange={setReviewSort} />
              </div>
              <aside className="booking-panel">
                <TimeSlotPicker mentor={selectedMentor} selectedSlot={selectedSlot} onSlotChange={setSelectedSlot} />
                <BookingSummary mentor={selectedMentor} initialSlot={selectedSlot} onPreparing={showPreparing} />
              </aside>
            </section>
          </>
        )}
      </main>
      <MentorModal mentor={modalMentor} onClose={() => setModalMentor(null)} onPreparing={showPreparing} />
      <Footer onPreparing={showPreparing} />
    </div>
  );
}
