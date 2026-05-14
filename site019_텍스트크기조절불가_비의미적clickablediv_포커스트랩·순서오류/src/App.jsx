import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CourseHero from './components/CourseHero';
import CategoryTabs from './components/CategoryTabs';
import CourseGrid from './components/CourseGrid';
import CourseModal from './components/CourseModal';
import ProgressPanel from './components/ProgressPanel';
import InstructorSection from './components/InstructorSection';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';

export default function App() {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('전체');
  const [selectedCourse, setSelectedCourse] = useState(null);

  const fetchCourses = async (category = activeCategory, search = searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/courses?category=${encodeURIComponent(category)}&search=${encodeURIComponent(search)}`);
      if (!res.ok) throw new Error('Failed to fetch courses');
      const json = await res.json();
      setCourses(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await fetch(`/api/progress`);
      if (!res.ok) throw new Error('Failed to fetch progress');
      const json = await res.json();
      setProgress(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses(activeCategory, '');
    fetchProgress();
  }, [activeCategory]);

  const handleSearch = () => {
    fetchCourses(activeCategory, searchQuery);
  };

  const handleToggleWishlist = async (courseId) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/wishlist`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        setCourses(prev => prev.map(c => c.id === courseId ? { ...c, wisher: json.wisher } : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        alert(json.message);
        setSelectedCourse(null);
        fetchProgress(); // Refresh progress panel
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app-layout">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearch={handleSearch} />
      <main>
        <CourseHero />
        
        <div className="container content-grid">
          <div className="main-content-area">
            <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
            
            {loading && <div className="spinner"></div>}
            {error && <div style={{color: 'red', padding: '1rem', background: '#fee2e2', borderRadius: '8px'}}>{error}</div>}
            
            {!loading && !error && (
              <CourseGrid 
                courses={courses} 
                onCourseClick={setSelectedCourse} 
                onToggleWishlist={handleToggleWishlist} 
              />
            )}
            
            <InstructorSection />
            <FAQSection />
          </div>
          
          <div className="sidebar-area">
            <ProgressPanel progress={progress} />
          </div>
        </div>
      </main>
      
      <Footer />

      {selectedCourse && (
        <CourseModal 
          course={selectedCourse} 
          onClose={() => setSelectedCourse(null)} 
          onEnroll={handleEnroll} 
        />
      )}
    </div>
  );
}
