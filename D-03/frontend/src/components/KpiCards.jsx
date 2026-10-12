import React from 'react';
import { Clock, Layers, Flame, CheckCircle2 } from 'lucide-react';

export default function KpiCards({ stats }) {
  return (
    <div className="metrics-row">
      {/* 1. Total Duration */}
      <div className="metric-box active-glow">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="metric-title">총 운동 시간</span>
          <Clock size={18} color="var(--lime-400)" />
        </div>
        <div className="metric-digit">
          {stats?.total_minutes || 0}<span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>분</span>
        </div>
        <div className="metric-foot">
          {( (stats?.total_minutes || 0) / 60 ).toFixed(1)}시간 누적 트레이닝
        </div>
      </div>

      {/* 2. Total Sets */}
      <div className="metric-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="metric-title">총 수행 세트 수</span>
          <Layers size={18} color="var(--accent-cyan)" />
        </div>
        <div className="metric-digit" style={{ color: 'var(--accent-cyan)' }}>
          {stats?.total_sets || 0}<span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>SET</span>
        </div>
        <div className="metric-foot">
          스트렝스 & 보조운동 누적 볼륨
        </div>
      </div>

      {/* 3. Calories Burned */}
      <div className="metric-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="metric-title">소모 칼로리</span>
          <Flame size={18} color="var(--accent-orange)" />
        </div>
        <div className="metric-digit" style={{ color: 'var(--accent-orange)' }}>
          {new Intl.NumberFormat('ko-KR').format(stats?.total_calories || 0)}<span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>kcal</span>
        </div>
        <div className="metric-foot">
          체지방 연소 & 기초대사 소비
        </div>
      </div>

      {/* 4. Completed Workouts */}
      <div className="metric-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="metric-title">완료 운동 세션</span>
          <CheckCircle2 size={18} color="var(--lime-400)" />
        </div>
        <div className="metric-digit">
          {stats?.completed_workouts || 0}<span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>/ {stats?.total_workouts || 0}</span>
        </div>
        <div className="metric-foot">
          완료율: {stats?.total_workouts > 0 ? ((stats.completed_workouts / stats.total_workouts) * 100).toFixed(0) : 0}%
        </div>
      </div>
    </div>
  );
}
