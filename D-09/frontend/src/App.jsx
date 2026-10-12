import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import MyPetRoom from './components/MyPetRoom';
import ServiceCatalog from './components/ServiceCatalog';
import BookingWizard from './components/BookingWizard';
import ReservationList from './components/ReservationList';
import PetEditModal from './components/PetEditModal';
import CareNotesModal from './components/CareNotesModal';
import NewPetModal from './components/NewPetModal';
import RescheduleModal from './components/RescheduleModal';
import ReceiptModal from './components/ReceiptModal';
import { 
  fetchUsers, 
  fetchServices, 
  fetchPets, 
  fetchReservations, 
  cancelReservation, 
  resetDatabase 
} from './lib/api';

export default function App() {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(1);
  const [activeTab, setActiveTab] = useState('pets'); // 'pets', 'booking', 'reservations', 'services'

  const [services, setServices] = useState([]);
  const [pets, setPets] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Preselected items for booking wizard
  const [preselectedService, setPreselectedService] = useState(null);
  const [preselectedPet, setPreselectedPet] = useState(null);

  // Modals state
  const [isNewPetOpen, setIsNewPetOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [careNotesPet, setCareNotesPet] = useState(null);
  const [receiptReservationId, setReceiptReservationId] = useState(null);
  const [rescheduleData, setRescheduleData] = useState(null); // { reservation, filterContext }
  const [isResetting, setIsResetting] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'info') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [uRes, sRes] = await Promise.all([fetchUsers(), fetchServices()]);
      if (uRes.success) setUsers(uRes.data);
      if (sRes.success) setServices(sRes.data);
    } catch (err) {
      console.error(err);
      showToast('초기 데이터를 불러오는데 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPets = useCallback(async () => {
    try {
      const res = await fetchPets();
      if (res.success) setPets(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadReservations = useCallback(async () => {
    try {
      const res = await fetchReservations();
      if (res.success) setReservations(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
    loadPets();
    loadReservations();
  }, [loadPets, loadReservations]);

  // Current User Object
  const currentUser = useMemo(() => {
    return users.find((u) => u.id === currentUserId) || users[0] || null;
  }, [users, currentUserId]);

  // Handle Cancel Reservation
  const handleCancelReservation = async (reservation) => {
    if (!confirm(`[${reservation.booking_code}] 예약을 정말로 취소하시겠습니까?`)) return;

    try {
      const res = await cancelReservation(reservation.id);
      if (res.success) {
        showToast(res.message || '예약이 취소되었습니다.', 'success');
        // Refresh reservations to observe persisted state
        await loadReservations();
      }
    } catch (err) {
      showToast(err.message || '예약 취소 실패', 'error');
    }
  };

  // Handle System Reset
  const handleReset = async () => {
    if (!confirm('PawCare의 모든 예약 및 반려동물 데이터를 초기 시드 상태로 복원하시겠습니까?')) return;

    try {
      setIsResetting(true);
      const res = await resetDatabase();
      if (res.success) {
        showToast('PawCare 시스템 데이터가 초기 상태로 복원되었습니다.', 'success');
        await loadInitialData();
        await loadPets();
        await loadReservations();
      }
    } catch (err) {
      showToast(err.message || '초기화 실패', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  // Switch to booking wizard from Pet Room
  const handleBookForPet = (pet) => {
    setPreselectedPet(pet);
    setActiveTab('booking');
  };

  // Switch to booking wizard from Services
  const handleSelectService = (service) => {
    setPreselectedService(service);
    setActiveTab('booking');
  };

  return (
    <div className="app-container">
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
      <main className="main-content">
        {activeTab === 'pets' && (
          <MyPetRoom
            pets={pets}
            currentUser={currentUser}
            onOpenNewPet={() => setIsNewPetOpen(true)}
            onEditPet={(pet) => setEditingPet(pet)}
            onEditCareNotes={(pet) => setCareNotesPet(pet)}
            onBookPet={handleBookForPet}
          />
        )}

        {activeTab === 'booking' && (
          <BookingWizard
            services={services}
            pets={pets}
            currentUser={currentUser}
            preselectedService={preselectedService}
            preselectedPet={preselectedPet}
            onBookingSuccess={async (newBooking) => {
              await loadReservations();
              setActiveTab('reservations');
            }}
            onNotify={showToast}
          />
        )}

        {activeTab === 'reservations' && (
          <ReservationList
            reservations={reservations}
            currentUser={currentUser}
            onViewReceipt={(id) => setReceiptReservationId(id)}
            onOpenReschedule={(reservation, filterContext) => {
              setRescheduleData({ reservation, filterContext });
            }}
            onCancelReservation={handleCancelReservation}
          />
        )}

        {activeTab === 'services' && (
          <ServiceCatalog
            services={services}
            onSelectService={handleSelectService}
          />
        )}
      </main>

      {/* Modals */}
      {/* 1. New Pet Modal */}
      <NewPetModal
        userId={currentUser?.id}
        userName={currentUser?.name}
        isOpen={isNewPetOpen}
        onClose={() => setIsNewPetOpen(false)}
        onPetCreated={loadPets}
        onNotify={showToast}
      />

      {/* 2. Pet Edit Modal (BUG-D09-02) */}
      <PetEditModal
        pet={editingPet}
        isOpen={Boolean(editingPet)}
        onClose={() => setEditingPet(null)}
        onPetUpdated={loadPets}
        onNotify={showToast}
      />

      {/* 3. Care Notes Modal (BUG-D09-05) */}
      <CareNotesModal
        pet={careNotesPet}
        isOpen={Boolean(careNotesPet)}
        onClose={() => setCareNotesPet(null)}
        onNotesSaved={loadPets}
        onNotify={showToast}
      />

      {/* 4. Reschedule Modal (BUG-D09-04) */}
      {rescheduleData && (
        <RescheduleModal
          reservation={rescheduleData.reservation}
          filterContext={rescheduleData.filterContext}
          isOpen={Boolean(rescheduleData)}
          onClose={() => setRescheduleData(null)}
          onRescheduled={loadReservations}
          onNotify={showToast}
        />
      )}

      {/* 5. Receipt Modal */}
      <ReceiptModal
        reservationId={receiptReservationId}
        isOpen={Boolean(receiptReservationId)}
        onClose={() => setReceiptReservationId(null)}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="paw-toast">
          <span>🐾</span>
          <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
}
