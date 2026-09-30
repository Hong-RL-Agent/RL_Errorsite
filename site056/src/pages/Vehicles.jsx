import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, RefreshCw, Car, AlertCircle, X } from 'lucide-react';
import VehicleCard from '../components/VehicleCard';
import { api } from '../api/client';

export default function Vehicles({
  initialFilter = {},
  favorites = [],
  onToggleFavorite,
  onSelectVehicle,
  onBookInspection
}) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchText, setSearchText] = useState(initialFilter.search || '');
  const [selectedBrand, setSelectedBrand] = useState(initialFilter.brand || '전체');
  const [modelFilter, setModelFilter] = useState(initialFilter.model || '');
  const [selectedRegion, setSelectedRegion] = useState(initialFilter.region || '전체');
  const [priceMax, setPriceMax] = useState(initialFilter.priceMax || '');

  // Ref for AbortController
  const controllerRef = useRef(null);

  const fetchVehicleList = async (filterParams, signal = null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getVehicles(filterParams, signal);
      if (data && data.vehicles) {
        setVehicles(data.vehicles);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.warn('[AutoCheck Search] Search request was aborted:', err.message);
        // Aborted request leaves state or sets error
        setError('검색 요청이 중단되었습니다.');
      } else {
        console.error('[AutoCheck] Failed to load vehicles:', err);
        setError(err.message || '차량 목록을 불러오지 못했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Trigger search with intentional AbortController bug on rapid input
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchText(value);

    // INTENTIONAL BACKEND BUG: site056-SEC-457
    // 최신 요청이 이전 AbortController에 의해 취소되는 오류:
    // 새로운 검색 입력 시 새 AbortController를 생성하여 controllerRef.current에 먼저 할당한 후,
    // 이전 요청을 abort하려다 방금 새로 교체된 controllerRef.current.abort()를 실행하여
    // 방금 전송된 최신 요청의 signal이 취소되어 검색 결과가 정상 반영되지 않는 오류 발생.
    const newController = new AbortController();
    const hasPreviousController = Boolean(controllerRef.current);
    controllerRef.current = newController;

    if (hasPreviousController) {
      // Bug: instead of aborting the old instance, it aborts the new controller from the ref
      controllerRef.current.abort();
    }

    fetchVehicleList(
      {
        search: value,
        brand: selectedBrand,
        model: modelFilter,
        region: selectedRegion,
        priceMax: priceMax
      },
      newController.signal
    );
  };

  const handleApplyFilter = (e) => {
    if (e) e.preventDefault();
    const controller = new AbortController();
    controllerRef.current = controller;
    fetchVehicleList(
      {
        search: searchText,
        brand: selectedBrand,
        model: modelFilter,
        region: selectedRegion,
        priceMax: priceMax
      },
      controller.signal
    );
  };

  const handleResetFilters = () => {
    setSearchText('');
    setSelectedBrand('전체');
    setModelFilter('');
    setSelectedRegion('전체');
    setPriceMax('');
    const controller = new AbortController();
    controllerRef.current = controller;
    fetchVehicleList({}, controller.signal);
  };

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    fetchVehicleList(
      {
        search: initialFilter.search || '',
        brand: initialFilter.brand || '전체',
        model: initialFilter.model || '',
        region: initialFilter.region || '전체',
        priceMax: initialFilter.priceMax || ''
      },
      controller.signal
    );

    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="max-w-screen" style={{ paddingTop: '32px' }}>
      {/* Title Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
          차량 찾기 & 정밀점검 매물
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          AutoCheck에서 성능 및 사고 이력 점검을 마친 신뢰할 수 있는 매물을 찾아보세요.
        </p>
      </div>

      {/* Filter Card */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginBottom: '32px', boxShadow: 'var(--shadow-sm)' }}>
        <form onSubmit={handleApplyFilter}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
            <div className="search-group">
              <label className="search-label">통합 검색</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="제조사, 모델명, 지역 등..."
                  value={searchText}
                  onChange={handleSearchInputChange}
                  className="search-input"
                  style={{ paddingLeft: '38px' }}
                />
                <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="search-group">
              <label className="search-label">제조사</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="search-select"
              >
                <option value="전체">전체</option>
                <option value="현대">현대</option>
                <option value="기아">기아</option>
                <option value="제네시스">제네시스</option>
                <option value="BMW">BMW</option>
                <option value="벤츠">벤츠</option>
              </select>
            </div>

            <div className="search-group">
              <label className="search-label">모델명 필터</label>
              <input
                type="text"
                placeholder="예: 그랜저, G80, K5"
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="search-group">
              <label className="search-label">검사 센터</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="search-select"
              >
                <option value="전체">전체 지역</option>
                <option value="강남">서울 강남</option>
                <option value="수원">경기 수원</option>
                <option value="성남">경기 분당</option>
                <option value="인천">인천</option>
                <option value="고양">경기 일산</option>
              </select>
            </div>

            <div className="search-group">
              <label className="search-label">최대 가격(만원)</label>
              <input
                type="number"
                placeholder="예: 5000"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="search-input"
              />
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="submit"
                style={{
                  padding: '12px 18px',
                  background: '#1e40af',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  height: '46px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Filter size={16} />
                <span>적용</span>
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  padding: '12px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  height: '46px'
                }}
                title="필터 초기화"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Result Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ fontSize: '0.95rem', color: '#475569', fontWeight: 600 }}>
          총 <span style={{ color: '#1e40af', fontWeight: 800 }}>{vehicles.length}</span>대의 점검 매물이 검색되었습니다.
        </div>
      </div>

      {/* Error / Abort Warning Message */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Vehicle Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <RefreshCw size={32} className="spin-icon" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p>차량 목록을 불러오는 중입니다...</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div style={{ background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '16px', padding: '60px 20px', textAlign: 'center' }}>
          <Car size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
            일치하는 차량이 없습니다.
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '18px' }}>
            검색어나 필터 조건을 변경하여 다시 시도해 보세요.
          </p>
          <button
            onClick={handleResetFilters}
            style={{
              padding: '8px 18px',
              background: '#eff6ff',
              color: '#1e40af',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            검색 조건 초기화
          </button>
        </div>
      ) : (
        <div className="vehicles-grid">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              isFavorite={favorites.includes(vehicle.id)}
              onToggleFavorite={onToggleFavorite}
              onSelectVehicle={onSelectVehicle}
              onBookInspection={onBookInspection}
            />
          ))}
        </div>
      )}
    </div>
  );
}
