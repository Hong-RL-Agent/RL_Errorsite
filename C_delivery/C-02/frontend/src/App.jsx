import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import TaskListView from './components/TaskListView';
import TaskModal from './components/TaskModal';
import NewTaskModal from './components/NewTaskModal';
import EditTaskModal from './components/EditTaskModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';

import {
  fetchTasks,
  fetchAssignees,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
} from './api/tasks';
import { resetEnvironment } from './api/test';

import {
  Plus,
  Columns3,
  List,
  RefreshCw,
  ArrowUpDown,
  Filter
} from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('latest');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [activeNav, setActiveNav] = useState('all-tasks');

  // Modals
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = useCallback(async () => {
    try {
      const [tasksRes, assigneesRes] = await Promise.all([
        fetchTasks({
          status: statusFilter,
          priority: priorityFilter,
          assignee_id: assigneeFilter,
          search,
          sort: sortBy
        }),
        fetchAssignees()
      ]);

      if (tasksRes.success) {
        setTasks(tasksRes.data);
      }
      if (assigneesRes.success) {
        setAssignees(assigneesRes.data);
      }
    } catch (err) {
      console.error('Failed to load tasks data:', err);
    }
  }, [statusFilter, priorityFilter, assigneeFilter, search, sortBy]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create Task
  const handleCreateTask = async (taskData) => {
    try {
      const res = await createTask(taskData);
      if (res.success) {
        setTasks((prev) => [res.data, ...prev]);
        showToast(`Task "${res.data.title}" created`);
      }
    } catch (err) {
      console.error('Create task error:', err);
    }
  };

  // Edit Task (BUG-865: Assignee omission in update payload)
  const handleUpdateTask = async (id, payload) => {
    try {
      const res = await updateTask(id, payload);
      if (res.success) {
        setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
        if (selectedTask?.id === id) setSelectedTask(res.data);
        showToast('Task updated');
      }
    } catch (err) {
      console.error('Update task error:', err);
    }
  };

  // Status Change (BUG-424: TODO -> DONE direct move allowed)
  const handleMoveStatus = async (id, newStatus) => {
    try {
      const res = await updateTaskStatus(id, newStatus);
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
        );
        showToast(`Task moved to ${newStatus.replace('_', ' ')}`);
      }
    } catch (err) {
      console.error('Move status error:', err);
    }
  };

  // Checkbox Complete Toggle (BUG-726: Optimistic UI revert failure on 400 Bad Request)
  const handleToggleComplete = async (task) => {
    const isCurrentlyDone = task.status === 'DONE' || task.isOptimisticDone;
    const targetStatus = isCurrentlyDone ? 'TODO' : 'DONE';

    // Optimistic UI update: immediately mark as done/checked
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, isOptimisticDone: !isCurrentlyDone } : t
      )
    );

    try {
      const res = await updateTaskStatus(task.id, targetStatus, true);
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? res.data : t))
        );
      }
    } catch (err) {
      // BUG-726: 400 Bad Request occurs, but optimistic UI state is NOT rolled back!
      console.warn('Task completion request failed with 400 Bad Request:', err);
      showToast('Task status validation error (400)');
    }
  };

  // Delete Task (BUG-006: Soft delete sets is_deleted=1, but GET tasks resurrects it)
  const handleDeleteTask = async (id) => {
    // Optimistic removal from DOM
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTask?.id === id) setSelectedTask(null);

    try {
      await deleteTask(id);
      showToast('Task deleted');
    } catch (err) {
      console.error('Delete task error:', err);
    }
  };

  // Reset Environment
  const handleReset = async () => {
    try {
      const res = await resetEnvironment();
      if (res.success) {
        await loadData();
        setSelectedTask(null);
        setEditingTask(null);
        setDeletingTask(null);
        showToast('Environment reset to deterministic initial state');
      }
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        activeNav={activeNav}
        onNavChange={(nav) => {
          setActiveNav(nav);
          if (nav === 'my-tasks') {
            setAssigneeFilter('1'); // Alice's tasks
          } else if (nav === 'all-tasks') {
            setAssigneeFilter('ALL');
            setStatusFilter('ALL');
          }
        }}
        onReset={handleReset}
      />

      {/* Main Area */}
      <div className="main-wrapper">
        {/* Top Header */}
        <Header search={search} onSearchChange={setSearch} />

        {/* Action & Filter Toolbar */}
        <div className="toolbar">
          <div className="filters-group">
            {/* Status Filter Pills */}
            <div className="filter-pills">
              {['ALL', 'TODO', 'IN_PROGRESS', 'DONE'].map((st) => (
                <button
                  key={st}
                  className={`filter-pill ${statusFilter === st ? 'active' : ''}`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st === 'ALL' ? 'All' : st.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Priority Filter */}
            <select
              className="select-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              title="Filter by Priority"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>

            {/* Assignee Filter */}
            <select
              className="select-filter"
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              title="Filter by Assignee"
            >
              <option value="ALL">All Assignees</option>
              {assignees.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>

            {/* Sort Options (BUG-051: Priority sort flaw) */}
            <select
              className="select-filter"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              title="Sort tasks"
            >
              <option value="latest">Sort by Latest</option>
              <option value="oldest">Sort by Oldest</option>
              <option value="priority">Sort by Priority (우선순위순)</option>
            </select>
          </div>

          <div className="toolbar-actions">
            <button
              className="header-icon-btn"
              title="Refresh Task List"
              onClick={loadData}
            >
              <RefreshCw size={16} />
            </button>

            {/* View Switcher */}
            <div className="view-toggle">
              <button
                className={`view-toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                onClick={() => setViewMode('kanban')}
                title="Kanban Board View"
              >
                <Columns3 size={16} />
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <List size={16} />
              </button>
            </div>

            <button
              className="btn-primary"
              onClick={() => setIsNewTaskOpen(true)}
            >
              <Plus size={16} />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Content Body: Kanban or List */}
        {viewMode === 'kanban' ? (
          <KanbanBoard
            tasks={tasks}
            onOpenDetail={(task) => setSelectedTask(task)}
            onEditTask={(task) => setEditingTask(task)}
            onDeleteTask={(task) => setDeletingTask(task)}
            onMoveStatus={handleMoveStatus}
          />
        ) : (
          <TaskListView
            tasks={tasks}
            onOpenDetail={(task) => setSelectedTask(task)}
            onEditTask={(task) => setEditingTask(task)}
            onDeleteTask={(task) => setDeletingTask(task)}
            onToggleComplete={handleToggleComplete}
          />
        )}
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={Boolean(selectedTask)}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onEdit={(task) => setEditingTask(task)}
        onDelete={(task) => setDeletingTask(task)}
      />

      <NewTaskModal
        isOpen={isNewTaskOpen}
        assignees={assignees}
        onClose={() => setIsNewTaskOpen(false)}
        onCreateTask={handleCreateTask}
      />

      <EditTaskModal
        isOpen={Boolean(editingTask)}
        task={editingTask}
        assignees={assignees}
        onClose={() => setEditingTask(null)}
        onUpdateTask={handleUpdateTask}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deletingTask)}
        task={deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirmDelete={handleDeleteTask}
      />

      {/* Toast Notification */}
      {toastMessage && <div className="toast">{toastMessage}</div>}
    </div>
  );
}
