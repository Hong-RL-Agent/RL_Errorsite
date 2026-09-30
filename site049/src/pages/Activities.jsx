import React, { useState, useEffect } from 'react';
import ActivityCard from '../components/ActivityCard';
import ActivityFilter from '../components/ActivityFilter';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import { api } from '../api/client';

export default function Activities({ navigate, searchParams }) {
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams?.search || '',
    category: searchParams?.category || 'all',
    region: searchParams?.region || 'all',
    status: searchParams?.status || 'all',
    page: parseInt(searchParams?.page || '1', 10)
  });

  useEffect(() => {
    fetchActivities();
  }, [filters.category, filters.region, filters.status, filters.page]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await api.getActivities({
        page: filters.page,
        limit: 6,
        category: filters.category,
        region: filters.region,
        status: filters.status,
        search: filters.search
      });
      setActivities(res.activities || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
          봉사활동 찾기
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          우리 지역 곳곳에서 진행되는 다양한 분야의 봉사활동을 확인하고 함께해보세요.
        </p>
      </div>

      {/* Filter Component */}
      <ActivityFilter 
        filters={filters} 
        setFilters={setFilters} 
        onSearch={fetchActivities}
      />

      {/* Activities Grid or Empty */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
          봉사활동 목록을 불러오는 중입니다...
        </div>
      ) : activities.length === 0 ? (
        <EmptyState 
          title="검색된 봉사활동이 없습니다" 
          message="다른 검색어를 입력하거나 필터 조건을 초기화해보세요."
          actionLabel="전체 활동 보기"
          onAction={() => setFilters({ search: '', category: 'all', region: 'all', status: 'all', page: 1 })}
        />
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
              총 <strong>{pagination.total}</strong>개의 활동이 등록되어 있습니다. (현재 <strong>{pagination.currentPage}</strong>페이지)
            </span>
          </div>

          <div className="activity-grid">
            {activities.map(act => (
              <ActivityCard 
                key={act.id} 
                activity={act} 
                onClick={() => navigate(`/activities/${act.id}`)}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination 
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
