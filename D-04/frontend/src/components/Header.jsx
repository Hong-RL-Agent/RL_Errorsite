import React from 'react';
import { BookOpen, Plus, RotateCcw, Users, Layers, Bookmark } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  onOpenAddModal, 
  onOpenUserModal,
  onResetData 
}) {
  return (
    <header className="top-header">
      <div className="brand-section">
        <div className="brand-icon-box">
          <BookOpen size={22} />
        </div>
        <div>
          <div className="brand-title">BookNest</div>
          <div className="brand-sub">도서관 장서 및 대출 관리 시스템</div>
        </div>
      </div>

      {/* Tabs in Header */}
      <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-surface-warm)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
        <button
          className={`btn btn-sm ${activeTab === 'catalog' ? 'btn-brown' : 'btn-outline'}`}
          style={{ border: 'none' }}
          onClick={() => setActiveTab('catalog')}
        >
          <Bookmark size={14} />
          <span>도서 장서 목록</span>
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'loans' ? 'btn-brown' : 'btn-outline'}`}
          style={{ border: 'none' }}
          onClick={() => setActiveTab('loans')}
        >
          <Layers size={14} />
          <span>대출 및 반납 관리</span>
        </button>
      </div>

      <div className="nav-actions">
        {/* User Management Button */}
        <button
          className="btn btn-outline btn-sm"
          onClick={onOpenUserModal}
        >
          <Users size={14} />
          <span>이용자 목록</span>
        </button>

        {/* Reset Database */}
        <button
          className="btn btn-outline btn-sm"
          onClick={onResetData}
          title="초기 42권 장서 및 22건 대출 상태로 복원"
        >
          <RotateCcw size={14} />
          <span>데이터 초기화</span>
        </button>

        {/* Add Book */}
        <button
          className="btn btn-brown btn-sm"
          onClick={onOpenAddModal}
        >
          <Plus size={15} />
          <span>신규 도서 등록</span>
        </button>
      </div>
    </header>
  );
}
