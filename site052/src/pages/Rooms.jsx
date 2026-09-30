import React, { useState, useEffect } from 'react';
import RoomCard from '../components/RoomCard';
import { api, notifyBugDetected } from '../api/client';

const ALL_FACILITIES = ['Wi-Fi', '모니터', '화이트보드', '콘센트', '화상회의'];

export default function Rooms({ onSelectRoom, branches = [], filterBranch, setFilterBranch, favorites = [], onToggleFavorite, showToast }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedBranch, setSelectedBranch] = useState(filterBranch || 'all');
  const [selectedType, setSelectedType] = useState('all');
  const [minCapacity, setMinCapacity] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Facilities Filter (SEC-440 State)
  const [checkedFacilities, setCheckedFacilities] = useState(new Set());
  const [ghostResidualFacility, setGhostResidualFacility] = useState(null);

  useEffect(() => {
    if (filterBranch) {
      setSelectedBranch(filterBranch);
    }
  }, [filterBranch]);

  const fetchRooms = async (overrideFacilities = null, isGhost = false) => {
    setLoading(true);
    try {
      const facArr = overrideFacilities !== null ? overrideFacilities : Array.from(checkedFacilities);
      const params = {
        branch: selectedBranch !== 'all' ? selectedBranch : undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        minCapacity: minCapacity !== 'all' ? minCapacity : undefined,
        availableOnly: availableOnly ? 'true' : undefined,
        search: searchQuery || undefined,
        facilities: facArr.length > 0 ? facArr.join(',') : undefined,
        deselectedAll: isGhost ? 'true' : undefined
      };

      const headers = isGhost ? { 'x-ghost-filter-active': 'true' } : {};
      const res = await api.getRooms(params, headers);
      if (res && res.rooms) {
        setRooms(res.rooms);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [selectedBranch, selectedType, minCapacity, availableOnly]);

  const handleFacilityToggle = (fac) => {
    const next = new Set(checkedFacilities);
    if (next.has(fac)) {
      next.delete(fac);
    } else {
      next.add(fac);
    }
    setCheckedFacilities(next);
    setGhostResidualFacility(null);
  };

  const handleSelectAllFacilities = () => {
    setCheckedFacilities(new Set(ALL_FACILITIES));
    setGhostResidualFacility(null);
  };

  const handleDeselectAllFacilities = () => {
    // INTENTIONAL BACKEND BUG: site052-SEC-440
    // UI checkbox state is visually cleared to empty Set(),
    // but internal filter retains '화상회의' in residual state!
    setCheckedFacilities(new Set()); // Screen shows empty unchecked boxes
    setGhostResidualFacility(['화상회의']); // Internal query retained

    notifyBugDetected({
      id: 'SEC-440',
      category: 'Form Control',
      family: 'checkbox-group-state',
      severity: 'medium',
      endpoint: '/api/rooms',
      method: 'GET',
      description: '체크박스 그룹에서 전체 선택을 해제한 뒤 개별 항목(화상회의) 상태가 내부 filter state에 잔존하는 오류'
    });

    // Execute search with lingering ghost filter
    fetchRooms(['화상회의'], true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (ghostResidualFacility) {
      fetchRooms(ghostResidualFacility, true);
    } else {
      fetchRooms();
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '6px' }}>
          공간 찾기
        </h1>
        <p style={{ color: 'var(--navy-500)', fontSize: '0.95rem' }}>
          필요한 공간 유형과 인원, 편의 시설을 필터링하여 최적의 업무 환경을 예약하세요.
        </p>
      </div>

      {/* Filter Card */}
      <div className="filter-card">
        <form onSubmit={handleSearchSubmit}>
          <div className="filter-grid">
            <div className="search-field">
              <label>검색어</label>
              <input
                type="text"
                placeholder="공간명, 지점명, 설명..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="search-field">
              <label>지점</label>
              <select value={selectedBranch} onChange={(e) => { setSelectedBranch(e.target.value); setFilterBranch(e.target.value); }}>
                <option value="all">전체 지점</option>
                {branches.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="search-field">
              <label>공간 유형</label>
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                <option value="all">전체 공간</option>
                <option value="1인 집중석">1인 집중석</option>
                <option value="2인 스터디룸">2인 스터디룸</option>
                <option value="4인 미팅룸">4인 미팅룸</option>
                <option value="6인 회의실">6인 회의실</option>
                <option value="오픈 데스크">오픈 데스크</option>
                <option value="개인 작업실">개인 작업실</option>
                <option value="화상회의룸">화상회의룸</option>
              </select>
            </div>

            <div className="search-field">
              <label>최소 수용 인원</label>
              <select value={minCapacity} onChange={(e) => setMinCapacity(e.target.value)}>
                <option value="all">인원 전체</option>
                <option value="1">1인 이상</option>
                <option value="2">2인 이상</option>
                <option value="4">4인 이상</option>
                <option value="6">6인 이상</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn-primary" style={{ flex: 1, height: '42px' }}>
                검색
              </button>
            </div>
          </div>

          {/* Facility Checkbox Group */}
          <div className="facilities-group">
            <div className="facilities-group-header">
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--navy-700)' }}>
                편의 시설 및 장비 필터
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                  onClick={handleSelectAllFacilities}
                >
                  전체 선택
                </button>
                <button
                  type="button"
                  className="btn-secondary facility-deselect-all-btn"
                  style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                  onClick={handleDeselectAllFacilities}
                >
                  전체 해제
                </button>
              </div>
            </div>

            <div className="facilities-checkboxes">
              {ALL_FACILITIES.map(fac => (
                <label key={fac} className="checkbox-label">
                  <input
                    type="checkbox"
                    className="filter-facility-checkbox"
                    checked={checkedFacilities.has(fac)}
                    onChange={() => handleFacilityToggle(fac)}
                  />
                  <span>{fac}</span>
                </label>
              ))}

              <label className="checkbox-label" style={{ marginLeft: 'auto' }}>
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                />
                <span style={{ fontWeight: '600', color: 'var(--mint-600)' }}>오늘 이용 가능한 공간만 보기</span>
              </label>
            </div>
          </div>
        </form>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ fontSize: '0.95rem', color: 'var(--navy-600)', fontWeight: '600' }}>
          총 <strong style={{ color: 'var(--navy-900)' }}>{rooms.length}</strong>개의 공간이 검색되었습니다.
        </div>
      </div>

      {/* Room Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--navy-500)', fontSize: '1.1rem' }}>
          공간 목록을 불러오는 중입니다...
        </div>
      ) : rooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', color: 'var(--navy-500)' }}>
          조건에 일치하는 공간이 없습니다. 필터를 조정해 보세요.
        </div>
      ) : (
        <div className="room-grid">
          {rooms.map(room => (
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
      )}
    </div>
  );
}
