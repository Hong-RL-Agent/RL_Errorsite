import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Home from './pages/Home';
import Hospitals from './pages/Hospitals';
import HospitalDetail from './pages/HospitalDetail';
import DoctorDetail from './pages/DoctorDetail';
import Booking from './pages/Booking';
import Appointments from './pages/Appointments';
import Account from './pages/Account';
import { api } from './api/client';
import { Stethoscope, Building2, Phone, Mail, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [notices, setNotices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [favorites, setFavorites] = useState(['hosp-101', 'hosp-103']);

  // Selected Entities for Detail & Booking
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [bookingPrefill, setBookingPrefill] = useState({ hospitalId: null, doctorId: null });
  const [hospitalFilters, setHospitalFilters] = useState({});

  useEffect(() => {
    async function init() {
      try {
        const [hData, dData, deptData, nData, aData] = await Promise.all([
          api.getHospitals(),
          api.getDoctors(),
          api.getDepartments(),
          api.getNotices(),
          api.getAppointments()
        ]);

        if (hData.hospitals) setHospitals(hData.hospitals);
        if (dData.doctors) setDoctors(dData.doctors);
        if (deptData.departments) setDepartments(deptData.departments);
        if (nData.notices) setNotices(nData.notices);
        if (aData.appointments) setAppointments(aData.appointments);
      } catch (err) {
        console.error('Failed to load initial CareBridge data:', err);
      }
    }
    init();
  }, []);

  const handleToggleFavorite = (hospId) => {
    if (favorites.includes(hospId)) {
      setFavorites(favorites.filter(id => id !== hospId));
    } else {
      setFavorites([...favorites, hospId]);
    }
  };

  const handleSelectHospital = (id) => {
    setSelectedHospitalId(id);
    setCurrentTab('hospital-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDoctor = (id) => {
    setSelectedDoctorId(id);
    setCurrentTab('doctor-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookHospital = (hospId, docId = null) => {
    setBookingPrefill({ hospitalId: hospId, doctorId: docId });
    setCurrentTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookDoctor = (docId) => {
    const doc = doctors.find(d => d.id === docId);
    setBookingPrefill({ hospitalId: doc ? doc.hospitalId : null, doctorId: docId });
    setCurrentTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateTab = (tab, filters = {}) => {
    setHospitalFilters(filters);
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      {/* Global Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={handleNavigateTab}
        appointmentCount={appointments.filter(a => a.status === '예약 완료').length}
      />

      {/* Main Content Router */}
      <main className="main-content">
        {currentTab === 'home' && (
          <Home
            hospitals={hospitals}
            doctors={doctors}
            departments={departments}
            notices={notices}
            favorites={favorites}
            onSelectHospital={handleSelectHospital}
            onSelectDoctor={handleSelectDoctor}
            onBookHospital={handleBookHospital}
            onBookDoctor={handleBookDoctor}
            onToggleFavorite={handleToggleFavorite}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {currentTab === 'hospitals' && (
          <Hospitals
            initialFilters={hospitalFilters}
            departments={departments}
            favorites={favorites}
            onSelectHospital={handleSelectHospital}
            onSelectDoctor={handleSelectDoctor}
            onBookHospital={handleBookHospital}
            onBookDoctor={handleBookDoctor}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentTab === 'hospital-detail' && (
          <HospitalDetail
            hospitalId={selectedHospitalId}
            isFavorite={favorites.includes(selectedHospitalId)}
            onToggleFavorite={handleToggleFavorite}
            onBookHospital={handleBookHospital}
            onSelectDoctor={handleSelectDoctor}
            onBack={() => setCurrentTab('hospitals')}
          />
        )}

        {currentTab === 'doctor-detail' && (
          <DoctorDetail
            doctorId={selectedDoctorId}
            onBookDoctor={handleBookDoctor}
            onSelectHospital={handleSelectHospital}
            onBack={() => setCurrentTab('hospitals')}
          />
        )}

        {currentTab === 'booking' && (
          <Booking
            initialHospitalId={bookingPrefill.hospitalId}
            initialDoctorId={bookingPrefill.doctorId}
            hospitals={hospitals}
            doctors={doctors}
            departments={departments}
            onBookingSuccess={(newApt) => setAppointments([newApt, ...appointments])}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {currentTab === 'appointments' && (
          <Appointments
            onNavigateTab={handleNavigateTab}
          />
        )}

        {currentTab === 'account' && (
          <Account
            favorites={favorites}
            hospitals={hospitals}
            onSelectHospital={handleSelectHospital}
            onToggleFavorite={handleToggleFavorite}
            onNavigateTab={handleNavigateTab}
          />
        )}
      </main>

      {/* Global Footer */}
      <footer className="footer-wrapper">
        <div className="max-w-screen">
          <div className="footer-grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: 900, fontSize: '1.25rem', marginBottom: '12px' }}>
                <div style={{ width: '28px', height: '28px', background: '#0284c7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Stethoscope size={18} color="#fff" />
                </div>
                <span>CareBridge 케어브릿지</span>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '16px' }}>
                (주)케어브릿지는 전국의 검증된 의료기관과 환자를 연결하는 신뢰 기반의 스마트 병원 예약 솔루션을 제공합니다.
              </p>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                진료예약 및 고객상담센터 1588-0590 (평일 09:00 - 18:00)
              </div>
            </div>

            <div>
              <h4 className="footer-title">주요 진료 서비스</h4>
              <ul className="footer-list">
                <li onClick={() => handleNavigateTab('hospitals')}>전국 병원 검색</li>
                <li onClick={() => handleNavigateTab('booking')}>실시간 진료 예약</li>
                <li onClick={() => handleNavigateTab('appointments')}>예약 내역 관리</li>
                <li onClick={() => handleNavigateTab('account')}>환자 프로필 설정</li>
              </ul>
            </div>

            <div>
              <h4 className="footer-title">진료 과목 안내</h4>
              <ul className="footer-list">
                <li onClick={() => handleNavigateTab('hospitals', { department: 'internal' })}>소화기/순환기 내과</li>
                <li onClick={() => handleNavigateTab('hospitals', { department: 'orthopedic' })}>관절/척추 정형외과</li>
                <li onClick={() => handleNavigateTab('hospitals', { department: 'dermatology' })}>레이저 피부과</li>
                <li onClick={() => handleNavigateTab('hospitals', { department: 'ophthalmology' })}>시력교정 안과</li>
                <li onClick={() => handleNavigateTab('hospitals', { department: 'dental' })}>디지털 치과</li>
              </ul>
            </div>

            <div>
              <h4 className="footer-title">의료법 및 안심 정책</h4>
              <ul className="footer-list">
                <li>전문의 면허 인증제 준수</li>
                <li>비대면 환자 개인정보 보호</li>
                <li>진료 전 안심 알림톡 발송</li>
                <li>예약 부도(No-Show) 방지제</li>
              </ul>
            </div>
          </div>

          <div style={{ paddingTop: '24px', borderTop: '1px solid #1e293b', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
            <div>© 2026 CareBridge Healthcare Inc. All rights reserved.</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span>이용약관</span>
              <span>개인정보처리방침</span>
              <span>의료정보 보호정책</span>
              <span>진료예약 운영규정</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
