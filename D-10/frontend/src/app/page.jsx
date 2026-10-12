'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '../components/Header';
import HeroBanner from '../components/HeroBanner';
import EventGrid from '../components/EventGrid';
import MyPassesView from '../components/MyPassesView';
import RegistrationModal from '../components/RegistrationModal';
import AttendeeEditModal from '../components/AttendeeEditModal';
import ContactEditModal from '../components/ContactEditModal';
import PassDetailModal from '../components/PassDetailModal';
import { 
  fetchUsers, 
  fetchCategories, 
  fetchEvents, 
  fetchRegistrations, 
  cancelRegistration, 
  resetDatabase 
} from '../lib/api';

export default function EventWavePage() {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(1);
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'passes'
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modals state
  const [registrationData, setRegistrationData] = useState(null); // { event, filterContext }
  const [passDetailId, setPassDetailId] = useState(null);
  const [attendeeEditTarget, setAttendeeEditTarget] = useState(null);
  const [contactEditTarget, setContactEditTarget] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'info') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Load Initial Metadata
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [uRes, cRes] = await Promise.all([fetchUsers(), fetchCategories()]);
      if (uRes.success) setUsers(uRes.data);
      if (cRes.success) setCategories(cRes.data);
    } catch (err) {
      console.error(err);
      showToast('초기 데이터를 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = useCallback(async () => {
    try {
      const res = await fetchEvents();
      if (res.success) setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadRegistrations = useCallback(async () => {
    try {
      const res = await fetchRegistrations();
      if (res.success) setRegistrations(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
    loadEvents();
    loadRegistrations();
  }, [loadEvents, loadRegistrations]);

  const currentUser = useMemo(() => {
    return users.find((u) => u.id === currentUserId) || users[0] || null;
  }, [users, currentUserId]);

  const featuredEvent = useMemo(() => {
    return events.find((e) => e.featured === 1) || events[0] || null;
  }, [events]);

  // Cancel Registration Handler
  const handleCancelRegistration = async (reg) => {
    if (!confirm(`[${reg.reg_code}] 참가 신청을 취소하시겠습니까?`)) return;

    try {
      const res = await cancelRegistration(reg.id);
      if (res.success) {
        showToast(res.message || '참가 신청이 취소되었습니다.', 'success');
        // Refresh to observe persisted DB state
        await loadRegistrations();
        await loadEvents();
      }
    } catch (err) {
      showToast(err.message || '취소 실패', 'error');
    }
  };

  // System Reset Handler
  const handleReset = async () => {
    if (!confirm('EventWave 시스템의 모든 신청 및 행사 데이터를 초기 상태로 복원하시겠습니까?')) return;

    try {
      setIsResetting(true);
      const res = await resetDatabase();
      if (res.success) {
        showToast('시스템 데이터가 초기 상태로 완전 복원되었습니다.', 'success');
        await loadInitialData();
        await loadEvents();
        await loadRegistrations();
      }
    } catch (err) {
      showToast(err.message || '초기화 실패', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="event-container">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        users={users}
        currentUser={currentUser}
        onSelectUser={(id) => setCurrentUserId(id)}
        onReset={handleReset}
        isResetting={isResetting}
      />

      {/* Main Content Area */}
      <main className="event-main">
        {activeTab === 'explore' && (
          <>
            <HeroBanner
              featuredEvent={featuredEvent}
              onRegisterFeatured={(evt) => {
                setRegistrationData({ event: evt, filterContext: { category: selectedCategory } });
              }}
            />
            <EventGrid
              events={events}
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              onOpenRegister={(evt, ctx) => {
                setRegistrationData({ event: evt, filterContext: ctx });
              }}
            />
          </>
        )}

        {activeTab === 'passes' && (
          <MyPassesView
            registrations={registrations}
            currentUser={currentUser}
            onViewPass={(id) => setPassDetailId(id)}
            onEditAttendee={(reg) => setAttendeeEditTarget(reg)}
            onEditContact={(reg) => setContactEditTarget(reg)}
            onCancelRegistration={handleCancelRegistration}
          />
        )}
      </main>

      {/* Modals */}
      {/* 1. Registration Modal */}
      {registrationData && (
        <RegistrationModal
          event={registrationData.event}
          filterContext={registrationData.filterContext}
          currentUser={currentUser}
          isOpen={Boolean(registrationData)}
          onClose={() => setRegistrationData(null)}
          onRegistrationSuccess={async () => {
            await loadEvents();
            await loadRegistrations();
            setActiveTab('passes');
          }}
          onNotify={showToast}
        />
      )}

      {/* 2. Attendee Edit Modal (BUG-D10-02) */}
      <AttendeeEditModal
        registration={attendeeEditTarget}
        isOpen={Boolean(attendeeEditTarget)}
        onClose={() => setAttendeeEditTarget(null)}
        onUpdated={async () => {
          await loadRegistrations();
        }}
        onNotify={showToast}
      />

      {/* 3. Contact Phone Edit Modal (BUG-D10-05) */}
      <ContactEditModal
        registration={contactEditTarget}
        isOpen={Boolean(contactEditTarget)}
        onClose={() => setContactEditTarget(null)}
        onUpdated={async () => {
          await loadRegistrations();
        }}
        onNotify={showToast}
      />

      {/* 4. Pass Detail Voucher Modal */}
      <PassDetailModal
        registrationId={passDetailId}
        isOpen={Boolean(passDetailId)}
        onClose={() => setPassDetailId(null)}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="event-toast">
          <span>🌊</span>
          <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
}
