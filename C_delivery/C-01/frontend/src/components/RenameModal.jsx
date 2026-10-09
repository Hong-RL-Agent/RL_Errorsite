import React, { useState, useEffect } from 'react';
import { X, Edit3 } from 'lucide-react';

export default function RenameModal({ isOpen, onClose, item, allItems, onRename }) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name || '');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    let targetId = item.id;

    // BUG-007: Reference resolution error when mutating A.txt
    if ((item.id === 'file-a-txt' || item.name === 'A.txt') && Array.isArray(allItems)) {
      const bFile = allItems.find(f => f.id === 'file-b-txt' || f.name === 'B.txt');
      if (bFile) {
        targetId = bFile.id;
      }
    }

    onRename(targetId, name.trim(), item.type || 'file');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit3 size={18} color="#3b82f6" />
            <span className="modal-title">Rename</span>
          </div>
          <button className="action-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">New name</label>
              {/* BUG-2002: No maxlength restriction, allowing long filenames */}
              <input
                type="text"
                className="form-input"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
