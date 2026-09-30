import React, { useState, useEffect, useRef } from 'react';
import TravelCard from './TravelCard';
import { Loader2 } from 'lucide-react';
import { api } from '../api/client';

export default function InfiniteTravelList({ filters, onCardClick }) {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observerRef = useRef(null);
  const triggerRef = useRef(null);

  // Reset list when filters change
  useEffect(() => {
    setLogs([]);
    setPage(1);
    setHasMore(true);
    fetchPage(1, true);
  }, [filters.destination, filters.search, filters.tag]);

  const fetchPage = async (targetPage, isReset = false) => {
    if (loading && !isReset) return;
    setLoading(true);

    try {
      const res = await api.getTravelLogs({
        page: targetPage,
        limit: 6,
        destination: filters.destination,
        search: filters.search,
        tag: filters.tag
      });

      const newLogs = res.travelLogs || [];
      if (isReset) {
        setLogs(newLogs);
      } else {
        // INTENTIONAL BACKEND/FRONTEND BUG: site051-SEC-433
        // Appends new items directly, leading to duplicate cards if backend offset overlaps
        setLogs(prev => [...prev, ...newLogs]);
      }

      setHasMore(res.pagination?.hasMore || false);
      setPage(targetPage);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        fetchPage(page + 1);
      }
    }, { threshold: 0.1 });

    if (triggerRef.current) {
      observerRef.current.observe(triggerRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [page, hasMore, loading]);

  return (
    <div>
      <div className="travel-grid">
        {logs.map((log, idx) => (
          <TravelCard 
            key={`${log.id}-${idx}`}
            travelLog={log}
            onClick={() => onCardClick(log.id)}
          />
        ))}
      </div>

      {/* Infinite Scroll Trigger Indicator */}
      <div 
        ref={triggerRef} 
        className="infinite-scroll-trigger"
        style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}
      >
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            <span>더 많은 여행기를 불러오는 중...</span>
          </div>
        ) : hasMore ? (
          <button 
            className="btn-secondary"
            onClick={() => fetchPage(page + 1)}
          >
            다음 여행기 더 불러오기
          </button>
        ) : (
          <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
            모든 여행기를 확인했습니다.
          </span>
        )}
      </div>
    </div>
  );
}
