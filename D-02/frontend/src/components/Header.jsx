import React from 'react';
import { Wallet, Plus, RotateCcw, Calendar } from 'lucide-react';

export default function Header({ 
  selectedMonth, 
  setSelectedMonth, 
  onOpenAddModal, 
  onResetData 
}) {
  return (
    <header className="top-header">
      <div className="logo-area">
        <div className="logo-symbol">
          <Wallet size={22} />
        </div>
        <div>
          <div className="logo-title">PennyLog</div>
          <div className="logo-tagline">스마트 개인 가계부 & 자산 관리</div>
        </div>
      </div>

      <div className="header-right">
        {/* Month Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F1F5F9', padding: '6px 12px', borderRadius: 'var(--radius-md)' }}>
          <Calendar size={16} color="var(--text-secondary)" />
          <select
            style={{ background: 'transparent', border: 'none', fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)', outline: 'none', cursor: 'pointer' }}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="2026-10">2026년 10월</option>
            <option value="2026-09">2026년 09월</option>
            <option value="2026-08">2026년 08월</option>
          </select>
        </div>

        {/* Reset Button */}
        <button 
          className="btn btn-outline btn-sm"
          onClick={onResetData}
          title="테스트 초기 데이터(41개 거래)로 DB 전체 복원"
        >
          <RotateCcw size={14} />
          <span>데이터 초기화</span>
        </button>

        {/* Add Transaction Button */}
        <button 
          className="btn btn-primary btn-sm"
          onClick={onOpenAddModal}
        >
          <Plus size={16} />
          <span>거래 내역 추가</span>
        </button>
      </div>
    </header>
  );
}
