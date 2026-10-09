import React, { useState } from 'react';
import { X, FolderInput, Folder, Check } from 'lucide-react';

export default function MoveModal({ isOpen, onClose, file, folders, onMove }) {
  const [selectedFolderId, setSelectedFolderId] = useState(folders[0]?.id || null);

  if (!isOpen || !file) return null;

  const handleConfirmMove = () => {
    if (!selectedFolderId) return;
    onMove(file.id, selectedFolderId);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderInput size={18} color="#3b82f6" />
            <span className="modal-title">Move "{file.name}"</span>
          </div>
          <button className="action-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Select target destination folder:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
            {folders.map((folder) => {
              const isSelected = selectedFolderId === folder.id;
              const isCurrent = file.folderId === folder.id;

              return (
                <div
                  key={folder.id}
                  onClick={() => !isCurrent && setSelectedFolderId(folder.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? '#1e3a8a' : 'var(--bg-surface)',
                    border: `1px solid ${isSelected ? '#3b82f6' : 'var(--border-subtle)'}`,
                    cursor: isCurrent ? 'not-allowed' : 'pointer',
                    opacity: isCurrent ? 0.5 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Folder size={18} color="#fbbf24" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{folder.name}</span>
                    {isCurrent && <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>(Current)</span>}
                  </div>
                  {isSelected && <Check size={16} color="#93c5fd" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!selectedFolderId || selectedFolderId === file.folderId}
            onClick={handleConfirmMove}
          >
            Move Here
          </button>
        </div>
      </div>
    </div>
  );
}
