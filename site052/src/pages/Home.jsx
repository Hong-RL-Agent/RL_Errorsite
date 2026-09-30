import React, { useState, useEffect } from 'react';
import RoomCard from '../components/RoomCard';
import NoticeCard from '../components/NoticeCard';
import { api } from '../api/client';

export default function Home({ setActivePage, onSelectRoom, onSelectNotice, branches = [], filterBranch, setFilterBranch, favorites = [], onToggleFavorite, showToast }) {
  const [popularRooms, setPopularRooms] = useState([]);
  const [availableTodayRooms, setAvailableTodayRooms] = useState([]);
  const [latestNotices, setLatestNotices] = useState([]);
  
  // Search criteria
  const [searchBranch, setSearchBranch] = useState(filterBranch || 'all');
  const [searchType, setSearchType] = useState('all');
  const [searchCapacity, setSearchCapacity] = useState('all');
  const [searchPurpose, setSearchPurpose] = useState('all');

  useEffect(() => {
    async function loadData() {
      try {
        const [roomsRes, noticesRes] = await Promise.all([
          api.getRooms(),
          api.getNotices()
        ]);
        if (roomsRes && roomsRes.rooms) {
          setPopularRooms(roomsRes.rooms.slice(0, 4));
          setAvailableTodayRooms(roomsRes.rooms.filter(r => r.available).slice(0, 4));
        }
        if (noticesRes && noticesRes.notices) {
          setLatestNotices(noticesRes.notices.slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (setFilterBranch) {
      setFilterBranch(searchBranch);
    }
    setActivePage('rooms');
  };

  return (
    <div>
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-badge">
          ⚡ 실시간 스마트 워크스페이스 플랫폼 SpaceMate
        </div>
        <h1 className="hero-title">
          일하고 싶은 공간을<br />
          더 쉽게 찾아보세요.
        </h1>
        <p className="hero-desc">
          초집중 1인석부터 대형 컨퍼런스룸까지, 서울 및 수도권 10개 거점 지점의 다양한 업무 공간을 원하는 시간에 실시간으로 예약하세요.
        </p>

        {/* Quick Search Widget */}
        <form className="search-widget" onSubmit={handleSearchSubmit}>
          <div className="search-field">
            <label>지역 / 지점</label>
            <select value={searchBranch} onChange={(e) => setSearchBranch(e.target.value)}>
              <option value="all">전체 지점</option>
              {branches.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="search-field">
            <label>공간 유형</label>
            <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
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
            <label>인원</label>
            <select value={searchCapacity} onChange={(e) => setSearchCapacity(e.target.value)}>
              <option value="all">인원 무관</option>
              <option value="1">1인</option>
              <option value="2">2인</option>
              <option value="4">4인 이상</option>
              <option value="6">6인 이상</option>
            </select>
          </div>

          <div className="search-field">
            <label>이용 목적</label>
            <select value={searchPurpose} onChange={(e) => setSearchPurpose(e.target.value)}>
              <option value="all">전체 목적</option>
              <option value="focus">몰입 및 개인 업무</option>
              <option value="meeting">팀 회의 및 협업</option>
              <option value="study">과외 및 스터디</option>
              <option value="video">화상 회의 / 비대면 면접</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" style={{ height: '44px', marginTop: '16px' }}>
            공간 찾기
          </button>
        </form>
      </section>

      {/* Popular Rooms */}
      <section style={{ marginBottom: '40px' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">인기 공간</h2>
            <div className="section-subtitle">많은 멤버들이 높은 평점으로 만족한 추천 공간입니다.</div>
          </div>
          <button className="view-all-link" onClick={() => setActivePage('rooms')}>
            더보기 →
          </button>
        </div>
        <div className="room-grid">
          {popularRooms.map(room => (
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

      {/* Today Available Rooms */}
      <section style={{ marginBottom: '40px' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">오늘 즉시 이용 가능한 공간</h2>
            <div className="section-subtitle">지금 바로 예약하고 이용할 수 있는 빈 좌석 및 룸입니다.</div>
          </div>
          <button className="view-all-link" onClick={() => setActivePage('rooms')}>
            전체 보기 →
          </button>
        </div>
        <div className="room-grid">
          {availableTodayRooms.map(room => (
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

      {/* Notices */}
      <section style={{ marginBottom: '40px' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">최근 공지사항</h2>
            <div className="section-subtitle">SpaceMate 센터 운영 및 시설 업데이트 소식을 확인하세요.</div>
          </div>
          <button className="view-all-link" onClick={() => setActivePage('notices')}>
            전체 공지사항 →
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {latestNotices.map(n => (
            <NoticeCard
              key={n.id}
              notice={n}
              onSelectNotice={onSelectNotice}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
