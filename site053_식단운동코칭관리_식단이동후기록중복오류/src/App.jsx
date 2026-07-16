import React, { useState, useEffect } from 'react';

export default function App() {
  const [currentUser, setCurrentUser] = useState('사용자 A');
  const [goals, setGoals] = useState({ targetCalories: 2000, targetCarbs: 250, targetProtein: 120, targetFat: 60 });
  const [dietLogs, setDietLogs] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [weightLogs, setWeightLogs] = useState([]);
  const [coachFeedback, setCoachFeedback] = useState({ text: '피드백 로드 중...' });

  // Food Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchTargetFood, setSearchTargetFood] = useState(null);

  // Forms
  const [newWeight, setNewWeight] = useState(65.0);
  const [newWeightDate, setNewWeightDate] = useState('2026-07-14');
  
  const [editCaloriesGoal, setEditCaloriesGoal] = useState(2000);
  const [editCarbsGoal, setEditCarbsGoal] = useState(250);
  const [editProteinGoal, setEditProteinGoal] = useState(120);
  const [editFatGoal, setEditFatGoal] = useState(60);

  // Editing Workout
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [editWorkoutType, setEditWorkoutType] = useState('달리기');
  const [editWorkoutDuration, setEditWorkoutDuration] = useState(30);

  const [toasts, setToasts] = useState([]);

  // Stale cache for SVG charts (Error 5 Target)
  const [cachedChartData, setCachedChartData] = useState({
    caloriesPct: 80,
    carbsPct: 75,
    proteinPct: 90,
    fatPct: 65
  });

  // Load all user logs
  const loadUserLogs = () => {
    fetch(`/api/diet?user=${currentUser}`).then(res => res.json()).then(data => setDietLogs(data));
    fetch(`/api/workouts?user=${currentUser}`).then(res => res.json()).then(data => setWorkoutLogs(data));
    fetch(`/api/weight?user=${currentUser}`).then(res => res.json()).then(data => setWeightLogs(data));
    fetch(`/api/feedback?user=${currentUser}`).then(res => res.json()).then(data => setCoachFeedback(data));
  };

  // INTENTIONAL_ERROR
  // CATEGORY: Session + Cache
  // DESCRIPTION: 사용자 스케줄 세션을 스위칭할 때, 일일 세부 목록들은 B 유저 데이터로 갱신하지만 
  // 메인 대시보드 영양 분석 그래프의 캐시 비율(`cachedChartData`) 및 칼로리 목표치(`goals`)는 
  // 이전 사용자 A의 상태를 그대로 유지 및 고착(Stale Cache)시켜 타인에게 건강 목표 지표를 노출하는 보안 결함입니다.
  useEffect(() => {
    loadUserLogs();
  }, [currentUser]); // Missing goals & cachedChartData update inside the primary dependency trigger!

  // Force sync goals and stats (so users can manually trigger to see B's or fix)
  const syncGoalsAndChartCache = () => {
    fetch(`/api/goals?user=${currentUser}`).then(res => res.json()).then(data => {
      setGoals(data);
      setEditCaloriesGoal(data.targetCalories);
      setEditCarbsGoal(data.targetCarbs);
      setEditProteinGoal(data.targetProtein);
      setEditFatGoal(data.targetFat);
      
      // Calculate percentages for chart
      const sumCalories = dietLogs.reduce((acc, curr) => acc + curr.calories, 0);
      const pct = data.targetCalories === 0 ? NaN : Math.round((sumCalories / data.targetCalories) * 100);
      setCachedChartData({
        caloriesPct: pct,
        carbsPct: Math.round(pct * 0.9),
        proteinPct: Math.round(pct * 1.1),
        fatPct: Math.round(pct * 0.8)
      });
      showToast('스마트 영양 통계 차트 동기화 완료', 'success');
    });
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const resetSandbox = async () => {
    await fetch('/api/reset', { method: 'POST' });
    showToast('BalanceCoach 목표 및 식단 디비 초기화 완료', 'success');
    loadUserLogs();
    syncGoalsAndChartCache();
  };

  // Search Foods normal
  const handleFoodSearch = async () => {
    if (!searchQuery.trim()) return;
    const res = await fetch(`/api/foods/search?q=${searchQuery}`);
    const data = await res.json();
    setSearchResults(data.results);
  };

  // Add searched food to diet log (Error 1 selection target mismatch)
  const addFoodToDiet = (food, mealType) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend + Network
    // DESCRIPTION: 고속 검색 삼중 레이스에 의해 사과 검색 창이 화면을 덮었지만 
    // 검색창 텍스트는 최종본인 '샐러드'로 설정되어 있습니다. 이 상태에서 목록의 요소를 탭할 경우 
    // 화면에 전시된 사과의 ID(f-04) 대신 현재 검색 상태 변수의 끝값인 '샐러드'(f-14)의 ID를 강제 매핑 송출하도록 코딩된 오입력 결함입니다.
    const targetFood = searchQuery === '샐러드' ? { id: "f-14", name: "닭가슴살 샐러드", calories: 180 } : food;

    fetch('/api/diet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: currentUser,
        name: targetFood.name,
        calories: targetFood.calories,
        type: mealType
      })
    }).then(res => res.json()).then(() => {
      showToast(`[${targetFood.name}]이(가) ${mealType} 식단에 기입되었습니다.`, 'success');
      loadUserLogs();
      setSearchResults([]);
      setSearchQuery('');
    });
  };

  // Reschedule diet log to lunch (Error 2 duplicate target)
  const handleMoveMealToLunch = async (diet) => {
    // Local optimistic update
    setDietLogs(prev => prev.map(d => d.id === diet.id ? { ...d, type: '점심' } : d));
    showToast('아침 식단을 점심 타임라인으로 이동시켰습니다.', 'success');

    // Remote call
    await fetch(`/api/diet/${diet.id}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newType: '점심' })
    });
    // Do not reload logs immediately to keep optimistic display clean until reload/refresh is clicked
  };

  // Add weight log
  const handleAddWeight = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/weight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: currentUser, weight: newWeight, date: newWeightDate })
    });
    if (res.ok) {
      showToast('체중 검진 기록이 추가되었습니다.', 'success');
      loadUserLogs();
    }
  };

  // Trigger weight log update vs delete race (Error 3 Simulator)
  const triggerWeightUpdateDeleteRace = (weightId) => {
    showToast('체중 수치 수정 직후 즉각 삭제 레이스를 시작합니다.', 'info');

    // 1. PATCH weight (3s delay on server)
    fetch(`/api/weight/${weightId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weight: 61.2 })
    });

    // 2. DELETE weight (0.1s delay on server)
    setTimeout(async () => {
      const res = await fetch(`/api/weight/${weightId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('체중 삭제 완료 (0.1초 완료)', 'success');
        loadUserLogs();
      }
    }, 100);

    // Refresh page after 3.5s to see weight log resurrected
    setTimeout(() => {
      showToast('체중 수정 지연 작업 완료 (삭제된 줄 알았던 체중 기록이 복구 갱신됨)', 'warning');
      loadUserLogs();
    }, 3500);
  };

  // Edit Workout (Error 4 Target)
  const handleOpenWorkoutEditor = (work) => {
    setSelectedWorkout(work);
    setEditWorkoutType(work.name);
    setEditWorkoutDuration(work.duration);
  };

  const handleSaveWorkoutEdit = () => {
    if (!selectedWorkout) return;

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 운동 편집 양식 승인 시, 칼로리 소모량 연산 공식에 바뀐 신규 
    // 운동 종류의 METs 수치가 아닌, 직전의 구형 운동 명칭 캐시(`staleName`)의 
    // 계수를 그대로 끌어다 계산을 가하는 칼로리 오계산 결함입니다.
    const METs = { '달리기': 8.0, '실내 자전거': 6.0, '요가': 2.5, '수영': 7.0, '필라테스': 3.0 };
    const staleName = selectedWorkout.name; // Stale name before updating
    const metFactor = METs[staleName] || 4.5;
    
    // Formula: metFactor * 8 * duration / 10
    const calculatedCalories = Math.round(editWorkoutDuration * metFactor * 8 / 10);

    setWorkoutLogs(prev => prev.map(w => w.id === selectedWorkout.id ? {
      ...w,
      name: editWorkoutType,
      duration: editWorkoutDuration,
      calories: calculatedCalories
    } : w));

    showToast(`운동 기록 수정 완료 (칼로리는 이전 종류 [${staleName}]의 METs 기준으로 ${calculatedCalories}kcal 기록됨)`, 'warning');
    setSelectedWorkout(null);
  };

  // Update goals (Error 6 target - goal 0 bypass)
  const handleUpdateGoals = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/goals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: currentUser,
        targetCalories: editCaloriesGoal,
        targetCarbs: editCarbsGoal,
        targetProtein: editProteinGoal,
        targetFat: editFatGoal
      })
    });

    if (res.status === 400) {
      showToast('서버에서 목표치 오류를 반환했습니다 (HTTP 400 Bad Request)', 'danger');
      // Force reload to show 0 is saved in memory
      syncGoalsAndChartCache();
    } else {
      showToast('영양 섭취 목표치가 갱신되었습니다.', 'success');
      syncGoalsAndChartCache();
    }
  };

  // Trigger search triple clicks race (Error 1 Simulator)
  const triggerFoodSearchRace = () => {
    showToast('음식 고속 검색어 삼중 레이스를 구동합니다 (사과 ➔ 바나나 ➔ 샐러드)', 'info');

    // 1st request (3s delay)
    fetch('/api/foods/search?q=사과')
      .then(res => res.json())
      .then(data => {
        setSearchResults(data.results);
        showToast('사과 검색 결과 수신 완료 (3초 지연)', 'warning');
      });

    // 2nd request (0.5s delay)
    setTimeout(() => {
      fetch('/api/foods/search?q=바나나')
        .then(res => res.json())
        .then(data => {
          setSearchResults(data.results);
          showToast('바나나 검색 결과 수신 완료 (0.5초)', 'info');
        });
    }, 100);

    // 3rd request (0.1s delay)
    setTimeout(() => {
      fetch('/api/foods/search?q=샐러드')
        .then(res => res.json())
        .then(data => {
          setSearchResults(data.results);
          showToast('샐러드 검색 결과 수신 완료 (0.1초)', 'success');
        });
    }, 200);

    setSearchQuery('샐러드');
  };

  // Calculate totals
  const totalCaloriesIntake = dietLogs.reduce((acc, curr) => acc + curr.calories, 0);
  const totalWorkoutBurn = workoutLogs.reduce((acc, curr) => acc + curr.calories, 0);

  // Division calculations (Error 6 NaN display)
  const goalCalories = goals.targetCalories;
  // If targetCalories is 0, goalCaloriesPct will be NaN or Infinity
  const goalCaloriesPct = goalCalories === 0 ? 'NaN%' : `${Math.round((totalCaloriesIntake / goalCalories) * 100)}%`;

  return (
    <div className="balancecoach-app">
      
      {/* Top Header & Daily summary progress bar */}
      <header className="app-header">
        <div className="logo-group">
          <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.42 4.58a5.4 5.4 0 0 0-7.63 0L12 5.37l-.79-.79a5.4 5.4 0 0 0-7.63 7.63l.79.79L12 21l7.63-7.63.79-.79a5.4 5.4 0 0 0 0-7.63z" />
          </svg>
          <span className="logo-title">BalanceCoach</span>
          <span className="logo-subtitle">Daily Fitness Dashboard</span>
        </div>

        {/* Global summary percentage (Error 6 target) */}
        <div className="header-goals-summary">
          <div className="progress-lbl">
            <span>하루 목표 칼로리 달성도:</span>
            <strong className="pct-val">{goalCaloriesPct}</strong>
            <span className="calories-track">({totalCaloriesIntake} / {goals.targetCalories} kcal)</span>
          </div>
          <div className="progress-bar">
            <div className="bar" style={{ width: goalCalories === 0 ? '100%' : `${Math.min((totalCaloriesIntake / goalCalories) * 100, 100)}%` }}></div>
          </div>
        </div>

        <div className="header-right">
          <div className="user-selector">
            <span>👤 코칭 회원: </span>
            <select value={currentUser} onChange={e => {
              setCurrentUser(e.target.value);
              showToast(`회원 세션이 [${e.target.value}]으로 변경되었습니다.`, 'info');
            }}>
              <option value="사용자 A">사용자 A (김지현 - VIP)</option>
              <option value="사용자 B">사용자 B (이민수 - 일반)</option>
            </select>
          </div>

          <button className="sync-stats-btn" onClick={syncGoalsAndChartCache}>
            📊 차트 동기화
          </button>
          <button className="sandbox-reset-btn" onClick={resetSandbox}>
            🔄 초기화
          </button>
        </div>
      </header>

      {/* Workspace Grid Layout */}
      <div className="balancecoach-grid">
        
        {/* Left Column: Date select & Goals planner */}
        <aside className="panel-section left-planner-sidebar">
          <h3>📅 다이어리 일정 선택</h3>
          <div className="days-stack">
            <button className="day-btn active">오늘 (2026-07-13)</button>
            <button className="day-btn">어제 (2026-07-12)</button>
            <button className="day-btn">그저께 (2026-07-11)</button>
          </div>

          {/* Goal update settings (Error 6 Target) */}
          <div className="goals-config-block">
            <h3>🎯 나의 하루 목표 설정</h3>
            <form onSubmit={handleUpdateGoals} className="goals-form">
              <div className="input-group">
                <label>목표 칼로리 (kcal)</label>
                <input 
                  type="number" 
                  value={editCaloriesGoal} 
                  onChange={e => setEditCaloriesGoal(Number(e.target.value))} 
                />
              </div>
              <div className="input-group">
                <label>탄수화물 (g)</label>
                <input 
                  type="number" 
                  value={editCarbsGoal} 
                  onChange={e => setEditCarbsGoal(Number(e.target.value))} 
                />
              </div>
              <div className="input-group">
                <label>단백질 (g)</label>
                <input 
                  type="number" 
                  value={editProteinGoal} 
                  onChange={e => setEditProteinGoal(Number(e.target.value))} 
                />
              </div>
              <button type="submit" className="save-goals-btn">
                목표 수정 적용 (Error 6)
              </button>
            </form>
          </div>
        </aside>

        {/* Center Column: Diet & Workout logs timeline */}
        <main className="panel-section center-timeline-panel">
          
          {/* Food Search panel (Error 1 Target) */}
          <div className="food-search-block">
            <div className="header-row">
              <h3>🔍 음식 영양 성분 검색</h3>
              <button className="search-race-btn" onClick={triggerFoodSearchRace}>
                ⚡ 고속 음식 검색 삼중 레이스 (Error 1)
              </button>
            </div>
            
            <div className="search-bar">
              <input 
                type="text" 
                placeholder="음식명 입력..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleFoodSearch()}
              />
              <button onClick={handleFoodSearch}>검색</button>
            </div>

            {/* Food Search Results drop-list */}
            {searchResults.length > 0 && (
              <div className="search-results-list">
                {searchResults.map(food => (
                  <div key={food.id} className="food-result-item">
                    <div className="info">
                      <strong>{food.name}</strong>
                      <span>{food.calories}kcal | 단백질 {food.protein}g</span>
                    </div>
                    <div className="add-meal-buttons">
                      <button onClick={() => addFoodToDiet(food, '아침')}>아침에 추가</button>
                      <button onClick={() => addFoodToDiet(food, '점심')}>점심에 추가</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daily Diet Logs Timeline (Error 2 Target) */}
          <div className="diet-timeline-block">
            <h2>🥗 오늘의 식단 기록 타임라인</h2>
            <div className="timeline-meals-stack">
              {['아침', '점심', '저녁'].map(mealType => (
                <div key={mealType} className="meal-category-box">
                  <h3>{mealType} 식사</h3>
                  <div className="meal-items-list">
                    {dietLogs.filter(d => d.type === mealType).map(diet => (
                      <div key={diet.id} className="meal-log-card">
                        <span>🍗 {diet.name}</span>
                        <div className="card-right">
                          <strong className="calories-lbl">{diet.calories} kcal</strong>
                          {mealType === '아침' && (
                            <button 
                              className="move-lunch-btn" 
                              onClick={() => handleMoveMealToLunch(diet)}
                            >
                              점심으로 이동 (Error 2)
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {dietLogs.filter(d => d.type === mealType).length === 0 && (
                      <span className="empty-lbl">등록된 식단이 없습니다.</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workout Logs panel (Error 4 Target) */}
          <div className="workout-tracker-block">
            <h2>🏋️ 오늘의 칼로리 소모 운동 기록</h2>
            
            <div className="workout-logs-list">
              {workoutLogs.map(work => (
                <div key={work.id} className="workout-log-card">
                  <div className="info">
                    <strong>{work.name}</strong>
                    <span>소요 시간: {work.duration}분</span>
                  </div>
                  <div className="right">
                    <strong className="burn-lbl">{work.calories} kcal 소모</strong>
                    <button className="edit-work-btn" onClick={() => handleOpenWorkoutEditor(work)}>
                      수정
                    </button>
                  </div>
                </div>
              ))}
              {workoutLogs.length === 0 && (
                <p className="empty-lbl">오늘 소모한 운동 기록이 없습니다.</p>
              )}
            </div>

            {/* Workout Editor modal/form (Error 4 Target) */}
            {selectedWorkout && (
              <div className="workout-editor-modal">
                <h4>🛠️ 운동 기록 세부 수정 (Error 4)</h4>
                <div className="editor-fields">
                  <div className="field-group">
                    <label>운동 종류</label>
                    <select value={editWorkoutType} onChange={e => setEditWorkoutType(e.target.value)}>
                      <option value="달리기">달리기</option>
                      <option value="실내 자전거">실내 자전거</option>
                      <option value="요가">요가</option>
                      <option value="수영">수영</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label>운동 시간 (분)</label>
                    <input 
                      type="number" 
                      value={editWorkoutDuration} 
                      onChange={e => setEditWorkoutDuration(Number(e.target.value))} 
                    />
                  </div>
                  <div className="buttons-row">
                    <button className="save-btn" onClick={handleSaveWorkoutEdit}>수정 완료</button>
                    <button className="close-btn" onClick={() => setSelectedWorkout(null)}>취소</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right Column: weight chart, nutrition charts, coach feedback */}
        <aside className="panel-section right-stats-sidebar">
          
          {/* Weight changes tracker (Error 3 Target) */}
          <div className="weight-tracker-block">
            <h3>⚖️ 일일 몸무게 변화 기록</h3>
            <div className="weight-logs-stack">
              {weightLogs.map(w => (
                <div key={w.id} className="weight-card">
                  <div className="info">
                    <span>{w.date}</span>
                    <strong>{w.weight} kg</strong>
                  </div>
                  <button 
                    className="race-trigger-btn"
                    onClick={() => triggerWeightUpdateDeleteRace(w.id)}
                  >
                    ⚡ 수정 후 바로 삭제 (Error 3)
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddWeight} className="weight-add-form">
              <input 
                type="number" 
                step="0.1" 
                value={newWeight}
                onChange={e => setNewWeight(Number(e.target.value))}
              />
              <button type="submit">기록</button>
            </form>
          </div>

          {/* SVG Nutrition stats graphs (Error 5 Target) */}
          <div className="nutrition-stats-block">
            <h3>📊 스마트 하루 영양 성분 비율</h3>
            <p className="warn-desc">* 회원 세션 전환 시 차트 캐시 잔존 오류 (Error 5)</p>
            
            <div className="svg-charts-row">
              <svg className="nutrition-svg" viewBox="0 0 200 120">
                {/* Calories radial progress */}
                <circle cx="50" cy="60" r="35" fill="none" stroke="#233555" strokeWidth="8" />
                <circle 
                  cx="50" 
                  cy="60" 
                  r="35" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="8" 
                  strokeDasharray="220" 
                  strokeDashoffset={220 - (220 * (isNaN(cachedChartData.caloriesPct) ? 0 : cachedChartData.caloriesPct)) / 100} 
                  transform="rotate(-90 50 60)"
                />
                <text x="50" y="65" fill="#f8fafc" fontSize="11" textAnchor="middle" fontWeight="bold">
                  {cachedChartData.caloriesPct}%
                </text>

                {/* Protein radial progress */}
                <circle cx="150" cy="60" r="35" fill="none" stroke="#233555" strokeWidth="8" />
                <circle 
                  cx="150" 
                  cy="60" 
                  r="35" 
                  fill="none" 
                  stroke="#8b5cf6" 
                  strokeWidth="8" 
                  strokeDasharray="220" 
                  strokeDashoffset={220 - (220 * (isNaN(cachedChartData.proteinPct) ? 0 : cachedChartData.proteinPct)) / 100} 
                  transform="rotate(-90 150 60)"
                />
                <text x="150" y="65" fill="#f8fafc" fontSize="11" textAnchor="middle" fontWeight="bold">
                  {cachedChartData.proteinPct}%
                </text>
              </svg>
              <div className="legend-row">
                <span>🟢 칼로리 달성도</span>
                <span>🟣 단백질 달성도</span>
              </div>
            </div>
          </div>

          {/* Coach Feedback box */}
          <div className="coach-feedback-block">
            <h3>💬 1:1 담당 코칭 피드백</h3>
            <div className="feedback-card">
              <strong className="coach-name">✍️ {coachFeedback.coach || '코칭 전문가'}</strong>
              <p>{coachFeedback.text}</p>
            </div>
          </div>

        </aside>

      </div>

      {/* Floating Action Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>
              &times;
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
