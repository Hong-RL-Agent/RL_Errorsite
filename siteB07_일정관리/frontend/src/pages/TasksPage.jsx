import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { useApp } from '../context/AppContext';
import { usePersistedText } from '../hooks/useDraftState';
import TaskList from '../components/TaskList';

export default function TasksPage() {
  const { guardOnline, toast, bumpData, today } = useApp();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = usePersistedText('taskTitle');
  const [due, setDue] = useState('');
  const [priority, setPriority] = useState('normal');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.tasks().then((r) => { setTasks(r.data); setError(''); }).catch((e) => setError(e.message));
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async (e) => {
    e.preventDefault();
    if (!title.trim()) { toast('할 일 제목을 입력해 주세요.'); return; }
    if (!guardOnline()) return;
    try {
      await api.createTask({ title, dueDate: due || null, priority });
      setTitle(''); setDue('');
      load(); bumpData();
    } catch (err) { toast(err.message); }
  };

  const toggle = async (t) => {
    if (!guardOnline()) return;
    try { await api.updateTask(t.id, { done: !t.done }); load(); bumpData(); } catch (err) { toast(err.message); }
  };
  const save = async (id, patch) => {
    if (!guardOnline()) return;
    try { await api.updateTask(id, patch); load(); } catch (err) { toast(err.message); }
  };
  const remove = async (t) => {
    if (!guardOnline()) return;
    try { await api.deleteTask(t.id); load(); bumpData(); toast('할 일을 삭제했어요.'); } catch (err) { toast(err.message); }
  };

  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  return (
    <div className="single-col">
      <div className="toolbar"><h1>할 일</h1></div>
      <section className="card">
        <form className="task-form" onSubmit={add}>
          <input type="text" value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} placeholder="할 일을 입력하세요" aria-label="할 일 제목" />
          <input type="date" value={due} min={today} onChange={(e) => setDue(e.target.value)} aria-label="마감일" />
          <select value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="우선순위">
            <option value="low">낮음</option><option value="normal">보통</option><option value="high">높음</option>
          </select>
          <button type="submit" className="btn primary">추가</button>
        </form>
        {error && <p className="form-error">{error}</p>}
      </section>
      <TaskList title="해야 할 일" tasks={open} empty="남은 할 일이 없어요." onToggle={toggle} onSave={save} onDelete={remove} />
      <TaskList title="완료한 할 일" tasks={done} empty="완료한 할 일이 아직 없어요." onToggle={toggle} onSave={save} onDelete={remove} />
    </div>
  );
}
