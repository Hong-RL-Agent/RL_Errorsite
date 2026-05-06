import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';

export default function WeeklyStats() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    fetch('/api/stats/weekly')
      .then(res => res.json())
      .then(data => setStats(data.data));
  }, []);

  const maxCal = Math.max(...(stats.length ? stats.map(s => s.calories) : [1000]));

  return (
    <div className="panel" style={{ overflow: 'visible' }}>
      <div className="panel-title">
        <span>주간 칼로리 소모량</span>
        <BarChart3 size={20} color="var(--text-muted)" />
      </div>
      
      {/* INTENTIONAL GUI BUG: site003-bug02
         Type: component-rendering
         Description: 주간 통계 컴포넌트가 API 데이터를 받았는데도 빈 상태처럼 렌더링된다.
         Explanation: 데이터 존재 여부에 관계없이 항상 빈 상태 UI를 렌더링하도록 강제되어 있음. */}
      <div data-bug-id="site003-bug02">
        {true ? (
          <div className="stats-empty">
            <BarChart3 size={40} />
            <p>이번 주 기록된 데이터가 없습니다.</p>
          </div>
        ) : (
          <div className="chart-container" data-bug-id="site003-bug03">
            {stats.map((s, idx) => {
              const heightPct = s.calories === 0 ? 5 : (s.calories / maxCal) * 100;
              return (
                <div key={idx} className="chart-bar-group">
                  <div className="chart-bar" style={{ height: `${heightPct}%` }}></div>
                  <div className="chart-label">{s.day}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
