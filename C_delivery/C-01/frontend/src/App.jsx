import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Breadcrumbs from './components/Breadcrumbs';
import FileList from './components/FileList';
import FileDetailPanel from './components/FileDetailPanel';
import NewFolderModal from './components/NewFolderModal';
import UploadModal from './components/UploadModal';
import RenameModal from './components/RenameModal';
import MoveModal from './components/MoveModal';
import DeleteModal from './components/DeleteModal';

import {
  fetchFiles,
  createFile,
  updateFile,
  deleteFile,
  moveFile
} from './api/files';
import {
  fetchFolders,
  fetchAllFolders,
  createFolder,
  updateFolder,
  deleteFolder
} from './api/folders';
import { resetEnvironment } from './api/test';

import { FolderPlus, Upload, LayoutGrid, List, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folders, setFolders] = useState([]);
  const [allFolders, setAllFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [selectedFile, setSelectedFile] = useState(null);
  const [detailFile, setDetailFile] = useState(null);
  const [sidebarView, setSidebarView] = useState('drive');
  const [toastMessage, setToastMessage] = useState(null);

  // Modal controls
  const [modalState, setModalState] = useState({
    type: null,
    targetItem: null
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = useCallback(async () => {
    try {
      const folderId = currentFolder ? currentFolder.id : null;
      const [foldersRes, filesRes, allFoldersRes] = await Promise.all([
        fetchFolders(folderId),
        fetchFiles(folderId, searchTerm),
        fetchAllFolders()
      ]);

      if (foldersRes.success) setFolders(foldersRes.data);
      if (filesRes.success) setFiles(filesRes.data);
      if (allFoldersRes.success) setAllFolders(allFoldersRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }, [currentFolder, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Folder navigation
  const handleOpenFolder = (folder) => {
    setCurrentFolder(folder);
    setSelectedFile(null);
  };

  const handleNavigateRoot = () => {
    setCurrentFolder(null);
    setSelectedFile(null);
  };

  // Create Folder (BUG-885: No duplicate debounce / idempotent guard)
  const handleCreateFolder = async (folderName) => {
    try {
      const parentId = currentFolder ? currentFolder.id : null;
      const res = await createFolder({ name: folderName, parentId });
      if (res.success) {
        setFolders((prev) => [...prev, res.data]);
        fetchAllFolders().then(r => r.success && setAllFolders(r.data));
        setModalState({ type: null, targetItem: null });
        showToast(`Created folder "${folderName}"`);
      }
    } catch (err) {
      console.error('Create folder error:', err);
    }
  };

  // Upload File
  const handleUploadFile = async (fileData) => {
    try {
      const folderId = currentFolder ? currentFolder.id : 'folder-documents';
      const res = await createFile({ ...fileData, folderId });
      if (res.success) {
        setFiles((prev) => [...prev, res.data]);
        showToast(`Uploaded "${res.data.name}"`);
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  // Rename File / Folder (BUG-007 and BUG-2002)
  const handleRename = async (targetId, newName, type) => {
    try {
      if (type === 'folder') {
        const res = await updateFolder(targetId, { name: newName });
        if (res.success) {
          setFolders((prev) =>
            prev.map((f) => (f.id === targetId ? res.data : f))
          );
          showToast(`Renamed folder to "${newName}"`);
        }
      } else {
        const res = await updateFile(targetId, { name: newName });
        if (res.success) {
          // Updates with returned object (truncated if BUG-2002)
          setFiles((prev) =>
            prev.map((f) => (f.id === targetId ? res.data : f))
          );
          showToast(`Renamed file to "${res.data.name}"`);
        }
      }
    } catch (err) {
      console.error('Rename error:', err);
    }
  };

  // Delete File / Folder (BUG-112: Optimistic UI delete on A.txt fails on backend)
  const handleDelete = async (targetId, type) => {
    if (type === 'folder') {
      try {
        await deleteFolder(targetId);
        setFolders((prev) => prev.filter((f) => f.id !== targetId));
        showToast('Folder deleted');
      } catch (err) {
        console.error('Delete folder error:', err);
      }
    } else {
      // Optimistic delete: immediately remove from DOM
      setFiles((prev) => prev.filter((f) => f.id !== targetId));
      if (selectedFile?.id === targetId) setSelectedFile(null);
      if (detailFile?.id === targetId) setDetailFile(null);

      try {
        await deleteFile(targetId);
        showToast('File deleted');
      } catch (err) {
        // BUG-112: 500 error is caught silently, UI state is not rolled back immediately.
        console.warn('Delete request returned error from storage layer:', err);
      }
    }
  };

  // Move File (BUG-1800: Silent Move Failure for A.txt -> Archive)
  const handleMove = async (fileId, targetFolderId) => {
    try {
      await moveFile(fileId, targetFolderId);
      // On success, remove from current folder view
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      const targetFolder = allFolders.find((f) => f.id === targetFolderId);
      showToast(`Moved to ${targetFolder?.name || 'folder'}`);
    } catch (err) {
      // BUG-1800: Backend failed with 500, but frontend silently ignores and updates UI optimistically
      console.warn('Move failed on server:', err);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      const targetFolder = allFolders.find((f) => f.id === targetFolderId);
      showToast(`Moved to ${targetFolder?.name || 'folder'}`);
    }
  };

  // Reset Environment
  const handleReset = async () => {
    try {
      const res = await resetEnvironment();
      if (res.success) {
        await loadData();
        setSelectedFile(null);
        setDetailFile(null);
        showToast('Environment state reset to initial data');
      }
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        currentView={sidebarView}
        onNavigate={(view) => {
          setSidebarView(view);
          if (view === 'drive') handleNavigateRoot();
        }}
        onReset={handleReset}
      />

      {/* Main Container */}
      <div className="main-wrapper">
        {/* Top Header */}
        <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {/* Action Bar */}
        <div className="action-bar">
          <Breadcrumbs
            currentFolder={currentFolder}
            onNavigateRoot={handleNavigateRoot}
            onNavigateFolder={handleOpenFolder}
          />

          <div className="top-buttons">
            <button
              className="btn-secondary"
              onClick={() => setModalState({ type: 'newFolder', targetItem: null })}
            >
              <FolderPlus size={16} />
              <span>New Folder</span>
            </button>

            <button
              className="btn-primary"
              onClick={() => setModalState({ type: 'upload', targetItem: null })}
            >
              <Upload size={16} />
              <span>Upload</span>
            </button>

            <button
              className="header-icon-btn"
              title="Refresh List"
              onClick={loadData}
            >
              <RefreshCw size={16} />
            </button>

            <div className="view-toggle">
              <button
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <List size={16} />
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="content-body">
          <div className="file-view-container">
            <FileList
              folders={folders}
              files={files}
              viewMode={viewMode}
              selectedFileId={selectedFile?.id}
              onSelectFile={(file) => setSelectedFile(file)}
              onOpenFolder={handleOpenFolder}
              onRenameItem={(item) =>
                setModalState({ type: 'rename', targetItem: item })
              }
              onMoveItem={(file) =>
                setModalState({ type: 'move', targetItem: file })
              }
              onDeleteItem={(item) =>
                setModalState({ type: 'delete', targetItem: item })
              }
              onViewDetails={(file) => setDetailFile(file)}
            />
          </div>

          {/* Detail Drawer */}
          {detailFile && (
            <FileDetailPanel
              file={detailFile}
              folderName={
                allFolders.find((f) => f.id === detailFile.folderId)?.name
              }
              onClose={() => setDetailFile(null)}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <NewFolderModal
        isOpen={modalState.type === 'newFolder'}
        onClose={() => setModalState({ type: null, targetItem: null })}
        onCreateFolder={handleCreateFolder}
      />

      <UploadModal
        isOpen={modalState.type === 'upload'}
        onClose={() => setModalState({ type: null, targetItem: null })}
        onUploadFile={handleUploadFile}
      />

      <RenameModal
        isOpen={modalState.type === 'rename'}
        onClose={() => setModalState({ type: null, targetItem: null })}
        item={modalState.targetItem}
        allItems={files}
        onRename={handleRename}
      />

      <MoveModal
        isOpen={modalState.type === 'move'}
        onClose={() => setModalState({ type: null, targetItem: null })}
        file={modalState.targetItem}
        folders={allFolders}
        onMove={handleMove}
      />

      <DeleteModal
        isOpen={modalState.type === 'delete'}
        onClose={() => setModalState({ type: null, targetItem: null })}
        item={modalState.targetItem}
        onDelete={handleDelete}
      />

      {/* Toast Notification */}
      {toastMessage && <div className="toast">{toastMessage}</div>}
    </div>
  );
}
