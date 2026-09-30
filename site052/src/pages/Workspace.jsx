import React, { useState, useEffect } from 'react';
import RoomCard from '../components/RoomCard';
import { api } from '../api/client';

export default function Workspace({ onSelectRoom, favorites = [], onToggleFavorite, showToast, setActivePage }) {
  const [favoriteRooms, setFavoriteRooms] = useState([]);
  const [recentRooms, setRecentRooms] = useState([]);
  const [quickNote, setQuickNote] = useState(localStorage.getItem('spacemate_quick_note') || '매주 화요일 10시 강남 센터 스크럼 회의 예약 필요');
  const [savedFilters, setSavedFilters] = useState([
    { id: 1, name: '강남 집중석 (1인)', branch: '강남 센터', type: '1인 집중석' },
    { id: 2, name: '판교 6인 회의실', branch: '판교 센터', type: '6인 회의실' },
    { id: 3, name: '홍대 화상회의룸', branch: '홍대 센터', type: '화상회의룸' }
  ]);

  useEffect(() => {
    async function loadWorkspace() {
      try {
        const res = await api.getRooms();
        if (res && res.rooms) {
          setFavoriteRooms(res.rooms.filter(r => favorites.includes(r.id)));
          setRecentRooms(res.rooms.slice(2, 6));
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadWorkspace();
  }, [favorites]);

  const handleSaveNote = () => {
    localStorage.setItem('spacemate_quick_note', quickNote);
    if (showToast) showToast('개인 메모가 저장되었습니다.', 'success');
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '6px' }}>
          내 워크스페이스
        </h1>
        <p style={{ color: 'var(--navy-500)', fontSize: '0.95rem' }}>
          즐겨찾는 거점 공간, 최근 방문 내역 및 개인 업무 메모를 한곳에서 관리하세요.
        </p>
      </div>

      {/* Top Grid: Quick Note & Saved Searches */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Personal Note */}
        <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
          <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>📝 워크스페이스 개인 메모</span>
            <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={handleSaveNote}>
              저장
            </button>
          </div>
          <textarea
            rows={4}
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            placeholder="자주 사용하는 회의실, 이용 팁 등을 메모해 두세요."
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              background: '#f8fafc',
              fontSize: '0.9rem'
            }}
          />
        </div>

        {/* Saved Searches */}
        <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
          <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '12px' }}>
            🔍 저장된 검색 조건
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {savedFilters.map(f => (
              <div 
                key={f.id} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#f8fafc',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--navy-900)' }}>{f.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--navy-500)' }}>{f.branch} · {f.type}</div>
                </div>
                <button 
                  className="btn-secondary" 
                  style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                  onClick={() => setActivePage('rooms')}
                >
                  검색 적용
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Favorites Section */}
      <section style={{ marginBottom: '40px' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">즐겨찾는 공간 ({favoriteRooms.length})</h2>
            <div className="section-subtitle">자주 이용하는 북마크된 공간입니다.</div>
          </div>
        </div>

        {favoriteRooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', color: 'var(--navy-500)' }}>
            즐겨찾기한 공간이 없습니다. 공간 카드의 하트 버튼을 눌러 등록해보세요.
          </div>
        ) : (
          <div className="room-grid">
            {favoriteRooms.map(room => (
              <RoomCard
                key={room.id}
                room={room}
                isFavorite={true}
                onSelectRoom={onSelectRoom}
                onToggleFavoriteSuccess={onToggleFavorite}
                showToast={showToast}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recent Rooms */}
      <section>
        <div className="section-header">
          <div>
            <h2 className="section-title">최근 방문 및 탐색 공간</h2>
            <div className="section-subtitle">최근 멤버가 조회했던 공간 목록입니다.</div>
          </div>
        </div>
        <div className="room-grid">
          {recentRooms.map(room => (
            <RoomCard
              key={room.id}
              room={room}
              isFavorite={favorites.includes(room.id)}
              onSelectRoom={onSelectRoom}
              onToggleFavoriteSuccess={onToggleFavorite}
              showToast={showToast}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
