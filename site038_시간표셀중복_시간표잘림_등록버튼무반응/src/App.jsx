import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AcademyHero from './components/AcademyHero';
import SubjectFilters from './components/SubjectFilters';
import ClassCards from './components/ClassCards';
import TeacherProfiles from './components/TeacherProfiles';
import WeeklyTimetable from './components/WeeklyTimetable';
import EnrollmentPanel from './components/EnrollmentPanel';
import TuitionAccordion from './components/TuitionAccordion';
import NoticeSection from './components/NoticeSection';
import Footer from './components/Footer';

const App = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [filter, setFilter] = useState('All');
  const [enrolled, setEnrolled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, teachersRes] = await Promise.all([
          fetch('/api/classes'),
          fetch('/api/teachers')
        ]);
        
        if (!classesRes.ok || !teachersRes.ok) throw new Error('Failed to fetch data');
        
        const classesData = await classesRes.json();
        const teachersData = await teachersRes.json();
        
        setClasses(classesData);
        setTeachers(teachersData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleEnroll = (cls) => {
    if (enrolled.some(e => e.id === cls.id)) {
      alert('이미 신청된 강좌입니다.');
      return;
    }
    setEnrolled([...enrolled, cls]);
  };

  const handleRemove = (id) => {
    setEnrolled(enrolled.filter(e => e.id !== id));
  };

  const filteredClasses = filter === 'All' 
    ? classes 
    : classes.filter(c => c.subject === filter);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', color: 'var(--primary)', fontWeight: '700' }}>
      학원 정보를 불러오는 중입니다...
    </div>
  );

  if (error) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
      <h2 style={{ color: 'var(--error)' }}>오류가 발생했습니다</h2>
      <p>{error}</p>
      <button className="btn btn-primary" onClick={() => window.location.reload()}>다시 시도</button>
    </div>
  );

  return (
    <div>
      <Header />
      <AcademyHero />
      
      <main className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px', padding: '60px 0' }}>
        <div>
          <h2 className="section-title" style={{ textAlign: 'left' }}>수강 신청 목록</h2>
          <SubjectFilters currentFilter={filter} setFilter={setFilter} />
          <ClassCards classes={filteredClasses} onEnroll={handleEnroll} />
          
          <TeacherProfiles teachers={teachers} />
          
          <WeeklyTimetable classes={classes} />
          
          <TuitionAccordion />
          <NoticeSection />
        </div>
        
        <aside>
          <EnrollmentPanel enrolledClasses={enrolled} onRemove={handleRemove} />
          
          <div style={{ marginTop: '30px', backgroundColor: 'var(--secondary)', padding: '20px', borderRadius: '12px', color: 'var(--primary)' }}>
            <h4 style={{ marginBottom: '10px' }}>실시간 입학 상담</h4>
            <p style={{ fontSize: '0.85rem', marginBottom: '15px' }}>지금 바로 전문가와 상의하세요!</p>
            <input type="text" placeholder="연락처를 입력하세요" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none', marginBottom: '10px' }} />
            <button className="btn btn-primary" style={{ width: '100%', border: '1px solid var(--primary)' }}>상담 요청하기</button>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
};

export default App;
