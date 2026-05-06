import React, { useState } from 'react';

const TaskList = ({ tasks, onToggleTask, onAddTask }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle);
      setNewTaskTitle('');
    }
  };

  return (
    <div className="card">
      <h3 className="section-title">오늘의 작업 리스트</h3>
      
      <form className="add-task-form" onSubmit={handleSubmit}>
        <input 
          type="text" 
          className="add-task-input" 
          placeholder="새로운 작업을 추가하세요..." 
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
        />
        <button type="submit" className="add-task-btn">추가</button>
      </form>

      <div className="task-items">
        {tasks.map(task => (
          <div key={task.id} className="task-item">
            <div 
              className={`task-checkbox ${task.completed ? 'checked' : ''}`}
              onClick={() => onToggleTask(task.id)}
            >
              {task.completed && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div className="task-info">
              <div className={`task-title ${task.completed ? 'completed' : ''}`}>
                {task.title}
              </div>
              <div className="task-meta">
                <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
                <span style={{ marginLeft: '10px' }}>예상 소요 시간: {task.estTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
