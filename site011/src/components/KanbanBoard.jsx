import React from 'react';

function TaskCard({ task, onToggle }) {
  return (
    <div className={`task-card ${task.status === 'done' ? 'completed' : ''}`}>
      <div className="task-header">
        <h4 className="task-title">
          <input 
            type="checkbox" 
            className="task-checkbox" 
            checked={task.status === 'done'}
            onChange={() => onToggle(task.id)}
          />
          {task.title}
        </h4>
      </div>
      <p className="task-desc">{task.description}</p>
      <div className="task-footer">
        <span className={`priority-badge priority-${task.priority}`}>
          {task.priority}
        </span>
        <div className="assignee-avatar">
          {task.assignee}
        </div>
      </div>
    </div>
  );
}

function KanbanBoard({ tasks, onToggleTask }) {
  const todoTasks = tasks.filter(t => t.status === 'todo');
  
  // INTENTIONAL GUI BUG: site011-bug02
  // Type: component-rendering
  // Description: id가 1인 카드를 "In Progress" 컬럼에도 강제로 포함시켜 중복 렌더링되게 함.
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress' || t.id === 1);
  
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <div className="kanban-board" data-bug-id="site011-bug03">
      <div className="kanban-column">
        <div className="column-header">
          <span>To Do</span>
          <span className="task-count">{todoTasks.length}</span>
        </div>
        <div className="column-body">
          {todoTasks.map(task => (
            <TaskCard key={`todo-${task.id}`} task={task} onToggle={onToggleTask} />
          ))}
        </div>
      </div>

      <div className="kanban-column">
        <div className="column-header">
          <span>In Progress</span>
          <span className="task-count">{inProgressTasks.length}</span>
        </div>
        <div className="column-body" data-bug-id="site011-bug02">
          {inProgressTasks.map(task => (
            <TaskCard key={`prog-${task.id}`} task={task} onToggle={onToggleTask} />
          ))}
        </div>
      </div>

      <div className="kanban-column">
        <div className="column-header">
          <span>Done</span>
          <span className="task-count">{doneTasks.length}</span>
        </div>
        <div className="column-body">
          {doneTasks.map(task => (
            <TaskCard key={`done-${task.id}`} task={task} onToggle={onToggleTask} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default KanbanBoard;
