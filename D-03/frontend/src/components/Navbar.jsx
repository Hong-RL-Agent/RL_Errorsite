import React from 'react';
import { Dumbbell, Plus, RotateCcw, Calendar } from 'lucide-react';

export default function Navbar({ 
  selectedDate, 
  setSelectedDate, 
  onOpenAddModal, 
  onResetData 
}) {
  return (
    <header className="header-nav">
      <div className="logo-brand">
        <div className="logo-badge">
          <Dumbbell size={22} />
        </div>
        <div>
          <div className="logo-name">FIT<span>TRACK</span></div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            PRO WORKOUT LOGGER & ANALYTICS
          </div>
        </div>
      </div>

      <div className="header-controls">
        {/* Date Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-input)', padding: '6px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <Calendar size={15} color="var(--lime-400)" />
          <input
            type="date"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.88rem', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* Reset Button */}
        <button
          className="btn btn-outline btn-sm"
          onClick={onResetData}
          title="초기 38개 운동 기록 및 목표 데이터로 전체 복원"
        >
          <RotateCcw size={14} />
          <span>데이터 초기화</span>
        </button>

        {/* Add Workout Button */}
        <button
          className="btn btn-lime btn-sm"
          onClick={onOpenAddModal}
        >
          <Plus size={16} />
          <span>운동 기록 추가</span>
        </button>
      </div>
    </header>
  );
}
