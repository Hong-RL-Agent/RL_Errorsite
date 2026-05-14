import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import GuestForm from './GuestForm';

export default function HotelModal({ hotel, onClose }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingStep, setBookingStep] = useState(1); // 1: Select Room, 2: Guest Info, 3: Success

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch('/api/rooms');
        const json = await res.json();
        setRooms(json.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleBook = async (guestData) => {
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelId: hotel.id, roomId: selectedRoom.id, guest: guestData })
      });
      if (res.ok) {
        setBookingStep(3);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!hotel) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        
        {bookingStep === 1 && (
          <>
            <h2 style={{fontSize: '1.5rem', marginBottom: '1rem'}}>{hotel.name} - 객실 선택</h2>
            {loading ? <div className="spinner"></div> : (
              <div style={{marginTop: '1.5rem'}}>
                {rooms.map(room => (
                  <div key={room.id} className="room-card" style={{border: selectedRoom?.id === room.id ? '2px solid var(--primary)' : ''}}>
                    <div>
                      <h4 style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>{room.type}</h4>
                      <ul style={{fontSize: '0.875rem', color: 'var(--text-muted)', listStylePosition: 'inside'}}>
                        {room.breakfast && <li>조식 포함</li>}
                        {room.cancellable ? <li>무료 취소 가능</li> : <li style={{color: '#ef4444'}}>취소 불가</li>}
                      </ul>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <p style={{fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem'}}>₩{room.price.toLocaleString()}</p>
                      <button 
                        className={selectedRoom?.id === room.id ? "btn btn-primary" : "btn btn-outline"}
                        onClick={() => setSelectedRoom(room)}
                      >
                        {selectedRoom?.id === room.id ? '선택됨' : '객실 선택'}
                      </button>
                    </div>
                  </div>
                ))}
                
                <div style={{marginTop: '2rem', textAlign: 'right'}}>
                  <button 
                    className="btn btn-primary" 
                    disabled={!selectedRoom}
                    onClick={() => setBookingStep(2)}
                  >
                    다음 단계로
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {bookingStep === 2 && (
          <>
            <h2 style={{fontSize: '1.5rem', marginBottom: '1rem'}}>예약자 정보 입력</h2>
            <div style={{background: 'var(--bg-light)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem'}}>
              <h4 style={{fontSize: '1.1rem'}}>{hotel.name}</h4>
              <p className="text-muted" style={{fontSize: '0.875rem'}}>{selectedRoom?.type} / 1박</p>
              <p style={{fontWeight: 700, marginTop: '0.5rem', color: 'var(--primary)'}}>총 결제 금액: ₩{selectedRoom?.price.toLocaleString()}</p>
            </div>
            
            <GuestForm onSubmit={handleBook} />
            <button className="btn btn-outline" style={{marginTop: '1rem'}} onClick={() => setBookingStep(1)}>뒤로 가기</button>
          </>
        )}

        {bookingStep === 3 && (
          <div style={{textAlign: 'center', padding: '3rem 1rem'}}>
            <div style={{width: '64px', height: '64px', background: 'var(--bg-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'}}>
              <Check size={32} color="var(--secondary)" />
            </div>
            <h2 style={{fontSize: '2rem', marginBottom: '1rem'}}>예약이 완료되었습니다!</h2>
            <p className="text-muted" style={{marginBottom: '2rem'}}>입력하신 이메일로 예약 확정 메일이 발송되었습니다.</p>
            <button className="btn btn-primary" onClick={onClose}>확인</button>
          </div>
        )}
      </div>
    </div>
  );
}
