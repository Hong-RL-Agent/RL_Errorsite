import React from 'react';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="3" x2="9" y2="21"></line>
        </svg>
        SaaSFlow
      </div>
      <ul className="sidebar-menu">
        <li className="active">Board</li>
        <li>Timeline</li>
        <li>Calendar</li>
        <li>Reports</li>
        <li>Settings</li>
      </ul>
    </aside>
  );
}

export default Sidebar;
