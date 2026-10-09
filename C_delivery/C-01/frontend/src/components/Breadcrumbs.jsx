import React from 'react';
import { ChevronRight, HardDrive, Folder } from 'lucide-react';

export default function Breadcrumbs({ currentFolder, onNavigateRoot, onNavigateFolder }) {
  return (
    <div className="breadcrumbs">
      <div
        className={`breadcrumb-item ${!currentFolder ? 'active' : ''}`}
        onClick={onNavigateRoot}
      >
        <HardDrive size={16} />
        <span>My Drive</span>
      </div>

      {currentFolder && (
        <>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <div className="breadcrumb-item active">
            <Folder size={16} />
            <span>{currentFolder.name}</span>
          </div>
        </>
      )}
    </div>
  );
}
