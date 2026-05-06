import React from 'react';
import WeeklyStats from './WeeklyStats.jsx';
import RoutineList from './RoutineList.jsx';
import GoalProgress from './GoalProgress.jsx';
import { Plus } from 'lucide-react';

export default function Dashboard({ user }) {
  return (
    <div>
      <div className="dashboard-header">
        <h1>안녕하세요, {user?.name || '회원'}님 👋</h1>
        {/* INTENTIONAL GUI BUG: site003-bug01
           Type: button-no-response
           Description: "운동 추가" 버튼이 클릭되어도 새 운동 입력 폼이 열리지 않는다.
           Explanation: 버튼에 onClick 핸들러가 연결되어 있지 않음. */}
        <button 
          className="btn-primary" 
          data-bug-id="site003-bug01"
          onClick={() => {}} 
        >
          <Plus size={20} />
          운동 추가
        </button>
      </div>
      
      <div className="dashboard-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <WeeklyStats />
          <GoalProgress />
        </div>
        <div>
          <RoutineList />
        </div>
      </div>
    </div>
  );
}
