import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import KpiCards from './components/KpiCards';
import WeeklyChart from './components/WeeklyChart';
import GoalProgress from './components/GoalProgress';
import WorkoutCardList from './components/WorkoutCardList';
import AddWorkoutModal from './components/AddWorkoutModal';
import EditWorkoutModal from './components/EditWorkoutModal';
import { api } from './api';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function App() {
  const [selectedDate, setSelectedDate] = useState('2026-10-12');

  // Data States
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const showToast = (message, type = 'lime') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Fetch All Data
  const loadData = async () => {
    try {
      const [wList, exList, gList, sData] = await Promise.all([
        api.getWorkouts(),
        api.getExercises(),
        api.getGoals(),
        api.getWeeklyStats()
      ]);
      setWorkouts(wList || []);
      setExercises(exList || []);
      setGoals(gList || []);
      setStats(sData || null);
    } catch (err) {
      console.error('Failed to load FitTrack data:', err);
      showToast('데이터 불러오기 실패: ' + err.message, 'red');
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  // 1. Reset Database
  const handleResetData = async () => {
    try {
      await api.resetData();
      await loadData();
      showToast('FitTrack 초기 38개 운동 기록 및 목표 데이터로 전체 복원되었습니다.', 'blue');
    } catch (err) {
      showToast('초기화 실패: ' + err.message, 'red');
    }
  };

  // 2. Goal Toggle
  const handleToggleGoal = async (goalId) => {
    try {
      const res = await api.toggleGoalCheck(goalId);
      if (res.success) {
        showToast('주간 목표 상태가 갱신되었습니다.', 'lime');
        await loadData();
      }
    } catch (err) {
      showToast('목표 변경 실패: ' + err.message, 'red');
    }
  };

  // 3. Create Workout
  const handleCreateWorkout = async (payload) => {
    try {
      const res = await api.createWorkout(payload);
      if (res.success) {
        showToast('운동 기록이 성공적으로 등록되었습니다!', 'lime');
        setIsAddModalOpen(false);
        await loadData();
      }
    } catch (err) {
      showToast('운동 등록 실패: ' + err.message, 'red');
    }
  };

  // 4. Toggle Complete
  const handleToggleComplete = async (workoutId) => {
    try {
      const res = await api.toggleWorkoutComplete(workoutId);
      if (res.success) {
        showToast('운동 세션 완료 상태가 변경되었습니다.', 'lime');
        await loadData();
      }
    } catch (err) {
      showToast('완료 상태 변경 실패: ' + err.message, 'red');
    }
  };

  // 5. Update Workout
  const handleUpdateWorkout = async (workoutId, payload) => {
    try {
      const res = await api.updateWorkout(workoutId, payload);
      if (res.success) {
        showToast('운동 기록이 성공적으로 수정되었습니다.', 'lime');
        setEditingWorkout(null);
        await loadData();
      }
    } catch (err) {
      showToast('운동 수정 실패: ' + err.message, 'red');
    }
  };

  // 6. Delete Workout
  const handleDeleteWorkout = async (workoutId) => {
    try {
      const res = await api.deleteWorkout(workoutId);
      if (res.success) {
        showToast('운동 기록이 삭제되었습니다.', 'blue');
        await loadData();
      }
    } catch (err) {
      showToast('운동 삭제 실패: ' + err.message, 'red');
    }
  };

  return (
    <div className="app-wrapper">
      {/* Top Navigation */}
      <Navbar
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onResetData={handleResetData}
      />

      {/* KPI Stat Cards */}
      <KpiCards stats={stats} />

      {/* 2 Columns: Weekly Chart & Goal Progress */}
      <div className="two-cols-section">
        <WeeklyChart weeklyData={stats?.weekly_chart || []} />
        <GoalProgress goals={goals} onToggleGoal={handleToggleGoal} />
      </div>

      {/* Workout Card List */}
      <WorkoutCardList
        workouts={workouts}
        onToggleComplete={handleToggleComplete}
        onEditWorkout={(w) => setEditingWorkout(w)}
        onDeleteWorkout={handleDeleteWorkout}
      />

      {/* Add Modal */}
      <AddWorkoutModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        exercises={exercises}
        onSubmit={handleCreateWorkout}
        defaultDate={selectedDate}
      />

      {/* Edit Modal */}
      {editingWorkout && (
        <EditWorkoutModal
          workout={editingWorkout}
          onClose={() => setEditingWorkout(null)}
          onSubmit={handleUpdateWorkout}
        />
      )}

      {/* Toast Notification Container */}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-box toast-${t.type}`}>
            {t.type === 'lime' && <CheckCircle2 size={16} color="var(--lime-400)" />}
            {t.type === 'blue' && <Info size={16} color="var(--accent-cyan)" />}
            {t.type === 'red' && <AlertCircle size={16} color="var(--accent-red)" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
