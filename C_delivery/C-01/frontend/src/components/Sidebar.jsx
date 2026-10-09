import React from 'react';
import { HardDrive, Clock, Star, Trash2, Cloud, RotateCcw } from 'lucide-react';

export default function Sidebar({ currentView, onNavigate, onReset }) {
  return (
    <aside className="sidebar">
      <div className="logo-area">
        <div className="logo-icon">
          <Cloud size={22} />
        </div>
        <div className="logo-text">
          CloudFiles
          <span className="logo-badge">PRO</span>
        </div>
      </div>

      <nav className="nav-section">
        <div className="nav-label">Storage</div>
        <button
          className={`nav-item ${currentView === 'drive' ? 'active' : ''}`}
          onClick={() => onNavigate('drive')}
        >
          <HardDrive size={18} />
          <span>My Drive</span>
        </button>
        <button
          className={`nav-item ${currentView === 'recent' ? 'active' : ''}`}
          onClick={() => onNavigate('recent')}
        >
          <Clock size={18} />
          <span>Recent</span>
        </button>
        <button
          className={`nav-item ${currentView === 'starred' ? 'active' : ''}`}
          onClick={() => onNavigate('starred')}
        >
          <Star size={18} />
          <span>Starred</span>
        </button>
        <button
          className={`nav-item ${currentView === 'trash' ? 'active' : ''}`}
          onClick={() => onNavigate('trash')}
        >
          <Trash2 size={18} />
          <span>Trash</span>
        </button>
      </nav>

      <div className="sidebar-bottom">
        <div className="storage-card">
          <div className="storage-header">
            <span>Storage</span>
            <span>2.1 GB of 15 GB</span>
          </div>
          <div className="storage-bar-bg">
            <div className="storage-bar-fill" />
          </div>
        </div>

        <button className="reset-button" onClick={onReset} title="Reset all data to initial state">
          <RotateCcw size={15} />
          <span>Reset Environment</span>
        </button>
      </div>
    </aside>
  );
}
