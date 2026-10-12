import React from 'react';
import { PieChart, Tag } from 'lucide-react';

export default function CategoryChart({ distribution = [] }) {
  const formatKRW = (val) => new Intl.NumberFormat('ko-KR').format(val || 0) + '원';

  const colorPalette = [
    '#10B981', '#059669', '#14B8A6', '#06B6D4', 
    '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'
  ];

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 className="card-title">
            <PieChart size={18} color="var(--mint-600)" />
            <span>카테고리별 지출 분포</span>
          </h3>
          <p className="card-subtitle">이번 달 항목별 지출 비중 분석</p>
        </div>
      </div>

      {distribution.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
          지출 내역이 없습니다.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {distribution.slice(0, 6).map((item, idx) => {
            const barColor = colorPalette[idx % colorPalette.length];
            return (
              <div key={item.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.name}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{formatKRW(item.amount)}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', width: '42px', textAlign: 'right' }}>
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${Math.min(100, item.percentage)}%`,
                      backgroundColor: barColor
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
