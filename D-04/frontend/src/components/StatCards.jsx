import React from 'react';
import { Book, CheckCircle, Clock, Users } from 'lucide-react';

export default function StatCards({ stats }) {
  return (
    <div className="stat-grid">
      <div className="stat-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="stat-label">총 소장 장서</span>
          <Book size={18} color="var(--brown-700)" />
        </div>
        <div className="stat-number">
          {stats?.total_book_copies || 0}
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: 'var(--font-family)', marginLeft: '4px' }}>
            권 ({stats?.book_titles_count || 0}종)
          </span>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          도서관 소장 도서 전체 재고
        </span>
      </div>

      <div className="stat-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="stat-label">대출 가능 도서</span>
          <CheckCircle size={18} color="var(--emerald-600)" />
        </div>
        <div className="stat-number" style={{ color: 'var(--emerald-600)' }}>
          {stats?.available_copies || 0}
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: 'var(--font-family)', marginLeft: '4px' }}>
            권
          </span>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          현재 서가에서 즉시 대출 가능
        </span>
      </div>

      <div className="stat-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="stat-label">현재 대출 중</span>
          <Clock size={18} color="var(--amber-700)" />
        </div>
        <div className="stat-number" style={{ color: 'var(--amber-700)' }}>
          {stats?.active_loans || 0}
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: 'var(--font-family)', marginLeft: '4px' }}>
            권
          </span>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          이용자 대출 중인 도서 합계
        </span>
      </div>

      <div className="stat-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="stat-label">등록 회원 / 이용자</span>
          <Users size={18} color="var(--brown-600)" />
        </div>
        <div className="stat-number">
          {stats?.total_users || 0}
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: 'var(--font-family)', marginLeft: '4px' }}>
            명
          </span>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          대출 자격을 보유한 회원 수
        </span>
      </div>
    </div>
  );
}
