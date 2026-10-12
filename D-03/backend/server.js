require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase, runSql, allSql, getSql, resetAllData, isFallback, getFallbackStore } = require('./db');

const app = express();
const PORT = process.env.PORT || 9803;

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[FitTrack API] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'FitTrack API', port: PORT });
});

// Test Reset API
app.post('/api/test/reset', async (req, res) => {
  try {
    const result = await resetAllData();
    res.json(result);
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

// 1. Exercise Catalog
app.get('/api/exercises', async (req, res) => {
  try {
    if (isFallback()) {
      return res.json(getFallbackStore().data.exercises);
    }
    const exercises = await allSql('SELECT * FROM exercises ORDER BY id ASC');
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Weekly Goals
app.get('/api/goals', async (req, res) => {
  try {
    if (isFallback()) {
      return res.json(getFallbackStore().data.goals);
    }
    const goals = await allSql('SELECT * FROM goals ORDER BY id ASC');
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Goal Achievement Toggle
// BUG-D03-05: When toggling goal ID 1 (주 5회 근력운동 달성), progress rate calculation is corrupted!
app.patch('/api/goals/:id/check', async (req, res) => {
  try {
    const goalId = Number(req.params.id);

    if (isFallback()) {
      const store = getFallbackStore();
      const g = store.data.goals.find(item => item.id === goalId);
      if (!g) return res.status(404).json({ error: 'Goal not found' });
      g.is_achieved = g.is_achieved ? 0 : 1;
      
      // BUG-D03-05 Implementation:
      // If goalId is 1, set corrupt current_value to 1 instead of 5, causing rate to drop to 20%
      if (goalId === 1 && g.is_achieved === 1) {
        g.current_value = 1; // Wrong calculation
      } else if (goalId === 1 && g.is_achieved === 0) {
        g.current_value = 4;
      }
      store.save();
      return res.json({ success: true, message: '목표 달성 상태가 변경되었습니다.', data: g });
    }

    const g = await getSql('SELECT * FROM goals WHERE id = ?', [goalId]);
    if (!g) return res.status(404).json({ error: 'Goal not found' });

    const nextAchieved = g.is_achieved ? 0 : 1;
    let nextValue = g.current_value;

    // BUG-D03-05 Implementation:
    if (goalId === 1) {
      nextValue = nextAchieved === 1 ? 1 : 4; // Corrupt value mismatch
    }

    await runSql('UPDATE goals SET is_achieved = ?, current_value = ? WHERE id = ?', [nextAchieved, nextValue, goalId]);
    const updated = await getSql('SELECT * FROM goals WHERE id = ?', [goalId]);
    res.json({ success: true, message: '목표 달성 상태가 변경되었습니다.', data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Workouts List (with date, type, search filters)
app.get('/api/workouts', async (req, res) => {
  try {
    const { date, type, search, limit } = req.query;

    if (isFallback()) {
      const store = getFallbackStore();
      let list = [...store.data.workouts];
      if (date) {
        list = list.filter(w => w.workout_date === date);
      }
      if (type && type !== 'ALL') {
        list = list.filter(w => w.type === type);
      }
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(w =>
          w.exercise_name.toLowerCase().includes(q) ||
          (w.notes && w.notes.toLowerCase().includes(q))
        );
      }
      list.sort((a, b) => b.workout_date.localeCompare(a.workout_date) || b.id - a.id);
      if (limit) {
        list = list.slice(0, Number(limit));
      }
      return res.json(list);
    }

    let sql = 'SELECT * FROM workouts WHERE 1=1';
    const params = [];

    if (date) {
      sql += ' AND workout_date = ?';
      params.push(date);
    }
    if (type && type !== 'ALL') {
      sql += ' AND type = ?';
      params.push(type);
    }
    if (search) {
      sql += ' AND (LOWER(exercise_name) LIKE ? OR LOWER(notes) LIKE ?)';
      const q = `%${search.toLowerCase()}%`;
      params.push(q, q);
    }

    sql += ' ORDER BY workout_date DESC, id DESC';
    if (limit) {
      sql += ' LIMIT ?';
      params.push(Number(limit));
    }

    const rows = await allSql(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Create Workout
app.post('/api/workouts', async (req, res) => {
  try {
    const { 
      workout_date, 
      exercise_id, 
      sets = 3, 
      reps = 10, 
      weight_kg = 0, 
      duration_min = 20, 
      calories = 100, 
      notes = '' 
    } = req.body;

    let ex = null;
    if (isFallback()) {
      ex = getFallbackStore().data.exercises.find(e => e.id === Number(exercise_id));
    } else {
      ex = await getSql('SELECT * FROM exercises WHERE id = ?', [exercise_id]);
    }

    const exName = ex ? ex.name : '운동';
    const exType = ex ? ex.type : 'STRENGTH';
    const dateVal = workout_date || new Date().toISOString().split('T')[0];

    if (isFallback()) {
      const store = getFallbackStore();
      const newId = ++store.data.workout_id_seq;
      const newWorkout = {
        id: newId,
        workout_date: dateVal,
        exercise_id: Number(exercise_id),
        exercise_name: exName,
        type: exType,
        sets: Number(sets),
        reps: Number(reps),
        weight_kg: Number(weight_kg),
        duration_min: Number(duration_min),
        calories: Number(calories),
        is_completed: 1,
        notes
      };
      store.data.workouts.unshift(newWorkout);
      store.save();
      return res.status(201).json({ success: true, message: '운동 기록이 추가되었습니다.', data: newWorkout });
    }

    const result = await runSql(
      `INSERT INTO workouts (workout_date, exercise_id, exercise_name, type, sets, reps, weight_kg, duration_min, calories, is_completed, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [dateVal, Number(exercise_id), exName, exType, Number(sets), Number(reps), Number(weight_kg), Number(duration_min), Number(calories), 1, notes]
    );

    const inserted = await getSql('SELECT * FROM workouts WHERE id = ?', [result.lastID]);
    res.status(201).json({ success: true, message: '운동 기록이 성공적으로 등록되었습니다.', data: inserted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Complete Workout Toggle
// BUG-D03-01: When clicking complete on workout ID 3 (트라이셉스 푸시다운), returns success but skips DB update!
app.patch('/api/workouts/:id/complete', async (req, res) => {
  try {
    const workoutId = Number(req.params.id);

    // BUG-D03-01 Implementation:
    // If workoutId === 3, return fake success without updating DB
    if (workoutId === 3) {
      return res.json({
        success: true,
        message: '운동 완료 상태가 갱신되었습니다.',
        data: { id: 3, is_completed: 0 } // Remains 0 in database
      });
    }

    if (isFallback()) {
      const store = getFallbackStore();
      const w = store.data.workouts.find(item => item.id === workoutId);
      if (!w) return res.status(404).json({ error: 'Workout not found' });
      w.is_completed = w.is_completed ? 0 : 1;
      store.save();
      return res.json({ success: true, message: '운동 완료 상태가 갱신되었습니다.', data: w });
    }

    const w = await getSql('SELECT * FROM workouts WHERE id = ?', [workoutId]);
    if (!w) return res.status(404).json({ error: 'Workout not found' });

    const nextVal = w.is_completed ? 0 : 1;
    await runSql('UPDATE workouts SET is_completed = ? WHERE id = ?', [nextVal, workoutId]);
    const updated = await getSql('SELECT * FROM workouts WHERE id = ?', [workoutId]);
    res.json({ success: true, message: '운동 완료 상태가 갱신되었습니다.', data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Update Workout Details
// BUG-D03-03: When modifying sets on workout ID 11 (데드리프트), saves different sets (e.g. 3 sets instead of 5)!
// BUG-D03-04: When modifying workout ID 14 (2026-10-04 숄더프레스), modifies workout ID 8 (2026-10-02 숄더프레스) instead!
app.patch('/api/workouts/:id', async (req, res) => {
  try {
    let workoutId = Number(req.params.id);
    const { sets, reps, weight_kg, duration_min, calories, notes } = req.body;

    // BUG-D03-04 Implementation:
    // If modifying workoutId === 14, target is swapped to workoutId 8!
    let targetId = workoutId;
    if (workoutId === 14) {
      targetId = 8;
    }

    // BUG-D03-03 Implementation:
    // If targetId === 11 and sets is specified, force sets to 3!
    let finalSets = sets !== undefined ? Number(sets) : undefined;
    if (targetId === 11 && sets !== undefined) {
      finalSets = 3; // Corrupt sets value
    }

    if (isFallback()) {
      const store = getFallbackStore();
      const w = store.data.workouts.find(item => item.id === targetId);
      if (!w) return res.status(404).json({ error: 'Workout not found' });
      if (finalSets !== undefined) w.sets = finalSets;
      if (reps !== undefined) w.reps = Number(reps);
      if (weight_kg !== undefined) w.weight_kg = Number(weight_kg);
      if (duration_min !== undefined) w.duration_min = Number(duration_min);
      if (calories !== undefined) w.calories = Number(calories);
      if (notes !== undefined) w.notes = notes;
      store.save();
      return res.json({ success: true, message: '운동 기록이 수정되었습니다.', data: w });
    }

    const w = await getSql('SELECT * FROM workouts WHERE id = ?', [targetId]);
    if (!w) return res.status(404).json({ error: 'Workout not found' });

    const newSets = finalSets !== undefined ? finalSets : w.sets;
    const newReps = reps !== undefined ? Number(reps) : w.reps;
    const newWeight = weight_kg !== undefined ? Number(weight_kg) : w.weight_kg;
    const newDuration = duration_min !== undefined ? Number(duration_min) : w.duration_min;
    const newCal = calories !== undefined ? Number(calories) : w.calories;
    const newNotes = notes !== undefined ? notes : w.notes;

    await runSql(
      `UPDATE workouts 
       SET sets = ?, reps = ?, weight_kg = ?, duration_min = ?, calories = ?, notes = ?
       WHERE id = ?`,
      [newSets, newReps, newWeight, newDuration, newCal, newNotes, targetId]
    );

    const updated = await getSql('SELECT * FROM workouts WHERE id = ?', [targetId]);
    res.json({ success: true, message: '운동 기록이 성공적으로 수정되었습니다.', data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Delete Workout
// BUG-D03-02: When deleting workout ID 7 (스쿼트), returns 200 OK success but skips DELETE query!
app.delete('/api/workouts/:id', async (req, res) => {
  try {
    const workoutId = Number(req.params.id);

    // BUG-D03-02 Implementation:
    // If workoutId === 7, return fake success without deleting from DB
    if (workoutId === 7) {
      return res.json({
        success: true,
        message: '운동 기록이 성공적으로 삭제되었습니다.',
        deleted_id: 7
      });
    }

    if (isFallback()) {
      const store = getFallbackStore();
      const idx = store.data.workouts.findIndex(item => item.id === workoutId);
      if (idx !== -1) {
        store.data.workouts.splice(idx, 1);
        store.save();
      }
      return res.json({ success: true, message: '운동 기록이 성공적으로 삭제되었습니다.', deleted_id: workoutId });
    }

    await runSql('DELETE FROM workouts WHERE id = ?', [workoutId]);
    res.json({ success: true, message: '운동 기록이 성공적으로 삭제되었습니다.', deleted_id: workoutId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Weekly & Monthly Statistics
app.get('/api/stats/weekly', async (req, res) => {
  try {
    let workouts = [];
    if (isFallback()) {
      workouts = getFallbackStore().data.workouts;
    } else {
      workouts = await allSql('SELECT * FROM workouts');
    }

    const totalMinutes = workouts.reduce((sum, w) => sum + w.duration_min, 0);
    const totalSets = workouts.reduce((sum, w) => sum + w.sets, 0);
    const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);
    const completedCount = workouts.filter(w => w.is_completed === 1).length;

    // Day of week breakdown for recent 7 days (2026-10-06 ~ 2026-10-12)
    const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];
    const weeklyChartData = [
      { day: '월(10/06)', minutes: 45, calories: 300 },
      { day: '화(10/07)', minutes: 65, calories: 550 },
      { day: '수(10/08)', minutes: 55, calories: 395 },
      { day: '목(10/09)', minutes: 70, calories: 625 },
      { day: '금(10/10)', minutes: 50, calories: 370 },
      { day: '토(10/11)', minutes: 80, calories: 660 },
      { day: '일(10/12)', minutes: 40, calories: 285 }
    ];

    res.json({
      total_workouts: workouts.length,
      completed_workouts: completedCount,
      total_minutes: totalMinutes,
      total_sets: totalSets,
      total_calories: totalCalories,
      weekly_chart: weeklyChartData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Express Server
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`  FitTrack Backend Express Server running on port ${PORT}`);
      console.log(`  Ready at http://localhost:${PORT}`);
      console.log(`=======================================================`);
    });
  })
  .catch(err => {
    console.error('FitTrack DB initialization error:', err);
    process.exit(1);
  });
