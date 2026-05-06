import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import DoctorList from './components/DoctorList.jsx';
import BookingForm from './components/BookingForm.jsx';

function App() {
  const [departments, setDepartments] = useState([]);
  const [activeDept, setActiveDept] = useState('전체');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => setDepartments(data.data));
  }, []);

  useEffect(() => {
    fetch(`/api/doctors?dept=${activeDept}`)
      .then(res => res.json())
      .then(data => {
        setDoctors(data.data);
        setSelectedDoctor(null); // Reset selection on dept change
      });
  }, [activeDept]);

  return (
    <div className="app-container">
      <Header />
      <div className="main-content">
        <div className="left-panel">
          <div className="dept-filter">
            {departments.map(dept => (
              <button 
                key={dept} 
                className={`dept-btn ${activeDept === dept ? 'active' : ''}`}
                onClick={() => setActiveDept(dept)}
              >
                {dept}
              </button>
            ))}
          </div>
          <DoctorList 
            doctors={doctors} 
            selectedDoctor={selectedDoctor} 
            onSelect={setSelectedDoctor} 
          />
        </div>
        
        <div className="right-panel">
          <BookingForm selectedDoctor={selectedDoctor} />
        </div>
      </div>
    </div>
  );
}

export default App;
