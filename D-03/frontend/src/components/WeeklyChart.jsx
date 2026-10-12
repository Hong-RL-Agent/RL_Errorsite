import React from 'react';
import { Activity, BarChart2 } from 'lucide-react';

export default function WeeklyChart({ weeklyData = [] }) {
  const maxMinutes = Math.max(...weeklyData.map(d => d.minutes), 80);

  return (
    <div className="content-card">
      <div className="card-heading">
        <div>
          <h3 className="card-title-text">
            <BarChart2 size={18} color="var(--lime-400)" />
            <span>주간 운동 시간 및 트레이닝 볼륨 추이</span>
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            최근 7일간의 일별 총 운동 시간(분) 및 트레이닝 분포
          </p>
        </div>
      </div>

      <div style={{ height: '200px', width: '100%', marginTop: '16px' }}>
        <svg width="100%" height="100%" viewBox="0 0 650 180" preserveAspectRatio="none">
          <defs>
            <linearGradient id="limeBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#BEF264" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#65A30D" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Guidelines */}
          <line x1="30" y1="20" x2="630" y2="20" stroke="#232A36" strokeDasharray="3" />
          <line x1="30" y1="65" x2="630" y2="65" stroke="#232A36" strokeDasharray="3" />
          <line x1="30" y1="110" x2="630" y2="110" stroke="#232A36" strokeDasharray="3" />
          <line x1="30" y1="150" x2="630" y2="150" stroke="#232A36" />

          {/* Y Axis text */}
          <text x="5" y="24" fill="#64748B" fontSize="10">80분</text>
          <text x="5" y="69" fill="#64748B" fontSize="10">50분</text>
          <text x="5" y="114" fill="#64748B" fontSize="10">25분</text>
          <text x="12" y="154" fill="#64748B" fontSize="10">0분</text>

          {/* Bars */}
          {weeklyData.map((d, idx) => {
            const x = 55 + idx * 82;
            const barHeight = Math.min(130, (d.minutes / maxMinutes) * 130);
            const y = 150 - barHeight;

            return (
              <g key={d.day}>
                <rect
                  x={x}
                  y={y}
                  width="42"
                  height={barHeight}
                  rx="6"
                  fill="url(#limeBarGrad)"
                  filter="drop-shadow(0px 0px 6px rgba(163, 230, 53, 0.35))"
                />
                <text
                  x={x + 21}
                  y={y - 6}
                  fill="#BEF264"
                  fontSize="11"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {d.minutes}m
                </text>
                <text
                  x={x + 21}
                  y="168"
                  fill="#94A3B8"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {d.day}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
