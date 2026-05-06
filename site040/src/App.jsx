import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SpaHero from './components/SpaHero';
import PackageFilters from './components/PackageFilters';
import PackageGrid from './components/PackageGrid';
import PackageModal from './components/PackageModal';
import TherapistSection from './components/TherapistSection';
import DateTimePicker from './components/DateTimePicker';
import BookingSummary from './components/BookingSummary';
import MembershipAccordion from './components/MembershipAccordion';
import ReviewSection from './components/ReviewSection';
import Footer from './components/Footer';

const App = () => {
  const [packages, setPackages] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [filter, setFilter] = useState('All');
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [modalPkg, setModalPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pkgRes, therapistRes] = await Promise.all([
          fetch('/api/spa-packages'),
          fetch('/api/therapists')
        ]);
        
        if (!pkgRes.ok || !therapistRes.ok) throw new Error('Failed to fetch wellness data');
        
        const pkgData = await pkgRes.json();
        const therapistData = await therapistRes.json();
        
        setPackages(pkgData);
        setTherapists(therapistData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredPackages = filter === 'All' 
    ? packages 
    : packages.filter(p => p.category === filter);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f0', color: '#1a2f23', fontStyle: 'italic' }}>
      Azure Spa Experience Loading...
    </div>
  );

  if (error) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f0', gap: '20px' }}>
      <h2 style={{ color: '#e53e3e' }}>System Error</h2>
      <p>{error}</p>
      <button className="btn btn-primary" onClick={() => window.location.reload()}>RETRY</button>
    </div>
  );

  return (
    <div>
      <Header />
      <SpaHero />
      
      <main className="container" style={{ padding: '80px 0' }}>
        <div id="packages">
          <h2 className="section-title">Exclusive Spa Packages</h2>
          <PackageFilters currentFilter={filter} setFilter={setFilter} />
          
          <div className="booking-layout">
            <div>
              <PackageGrid 
                packages={filteredPackages} 
                onSelect={setSelectedPkg} 
                onOpenDetails={setModalPkg} 
              />
              
              <TherapistSection 
                therapists={therapists} 
                selectedTherapist={selectedTherapist}
                onSelect={setSelectedTherapist}
              />
              
              <DateTimePicker 
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
              />
              
              <MembershipAccordion />
              <ReviewSection />
            </div>
            
            <aside>
              <BookingSummary 
                selectedPackage={selectedPkg}
                selectedTherapist={selectedTherapist}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
              />
            </aside>
          </div>
        </div>
      </main>

      <PackageModal 
        pkg={modalPkg} 
        onClose={() => setModalPkg(null)} 
        onSelect={setSelectedPkg} 
      />
      
      <Footer />
    </div>
  );
};

export default App;
