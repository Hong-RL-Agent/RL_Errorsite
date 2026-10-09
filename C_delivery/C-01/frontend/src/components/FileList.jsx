import React from 'react';
import {
  Folder,
  FileText,
  FileCode,
  File,
  MoreVertical,
  Edit3,
  FolderInput,
  Trash2,
  Info,
  FolderOpen
} from 'lucide-react';

export default function FileList({
  folders,
  files,
  viewMode,
  selectedFileId,
  onSelectFile,
  onOpenFolder,
  onRenameItem,
  onMoveItem,
  onDeleteItem,
  onViewDetails
}) {
  const formatBytes = (bytes) => {
    if (!bytes && bytes !== 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    if (fileName.endsWith('.pdf')) return <FileText size={18} color="#ef4444" />;
    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) return <FileText size={18} color="#3b82f6" />;
    if (fileName.endsWith('.txt')) return <FileCode size={18} color="#10b981" />;
    return <File size={18} color="#8b5cf6" />;
  };

  const getLargeFileIcon = (fileName) => {
    if (fileName.endsWith('.pdf')) return <FileText size={36} color="#ef4444" />;
    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) return <FileText size={36} color="#3b82f6" />;
    if (fileName.endsWith('.txt')) return <FileCode size={36} color="#10b981" />;
    return <File size={36} color="#8b5cf6" />;
  };

  const hasContent = folders.length > 0 || files.length > 0;

  if (!hasContent) {
    return (
      <div className="empty-state">
        <FolderOpen size={48} color="#475569" />
        <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>This folder is empty</p>
        <p style={{ fontSize: '0.82rem' }}>Upload files or create subfolders to get started</p>
      </div>
    );
  }

  return (
    <div>
      {/* Folders Section */}
      {folders.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div className="section-title">Folders ({folders.length})</div>
          <div className="folder-grid">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="folder-card"
                onClick={() => onOpenFolder(folder)}
              >
                <div className="folder-info">
                  <Folder size={22} className="folder-icon" />
                  <div>
                    <div className="folder-name" title={folder.name}>
                      {folder.name}
                    </div>
                    <div className="folder-count">{folder.itemCount || 0} items</div>
                  </div>
                </div>

                <div className="item-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="action-btn"
                    title="Rename Folder"
                    onClick={() => onRenameItem({ ...folder, type: 'folder' })}
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    className="action-btn delete"
                    title="Delete Folder"
                    onClick={() => onDeleteItem({ ...folder, type: 'folder' })}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files Section */}
      {files.length > 0 && (
        <div>
          <div className="section-title">Files ({files.length})</div>

          {viewMode === 'list' ? (
            <div className="file-table-container">
              <table className="file-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Size</th>
                    <th>Last Modified</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr
                      key={file.id}
                      className={selectedFileId === file.id ? 'selected' : ''}
                      onClick={() => onSelectFile(file)}
                    >
                      <td>
                        <div className="file-name-cell">
                          {getFileIcon(file.name)}
                          <span title={file.name}>{file.name}</span>
                        </div>
                      </td>
                      <td>{formatBytes(file.size)}</td>
                      <td>
                        {file.updatedAt ? new Date(file.updatedAt).toLocaleDateString() : 'Today'}
                      </td>
                      <td>
                        <div className="item-actions" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="action-btn"
                            title="File Details"
                            onClick={() => onViewDetails(file)}
                          >
                            <Info size={15} />
                          </button>
                          <button
                            className="action-btn"
                            title="Move File"
                            onClick={() => onMoveItem(file)}
                          >
                            <FolderInput size={15} />
                          </button>
                          <button
                            className="action-btn"
                            title="Rename File"
                            onClick={() => onRenameItem({ ...file, type: 'file' })}
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            className="action-btn delete"
                            title="Delete File"
                            onClick={() => onDeleteItem({ ...file, type: 'file' })}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="file-grid">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`file-card ${selectedFileId === file.id ? 'selected' : ''}`}
                  onClick={() => onSelectFile(file)}
                >
                  <div className="file-preview-box">
                    {getLargeFileIcon(file.name)}
                  </div>

                  <div>
                    <div className="file-grid-name" title={file.name}>
                      {file.name}
                    </div>
                    <div className="file-grid-meta" style={{ marginTop: '4px' }}>
                      <span>{formatBytes(file.size)}</span>
                      <span>
                        {file.updatedAt
                          ? new Date(file.updatedAt).toLocaleDateString()
                          : 'Today'}
                      </span>
                    </div>
                  </div>

                  <div className="item-actions" style={{ marginTop: '6px' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      className="action-btn"
                      title="File Details"
                      onClick={() => onViewDetails(file)}
                    >
                      <Info size={14} />
                    </button>
                    <button
                      className="action-btn"
                      title="Move File"
                      onClick={() => onMoveItem(file)}
                    >
                      <FolderInput size={14} />
                    </button>
                    <button
                      className="action-btn"
                      title="Rename File"
                      onClick={() => onRenameItem({ ...file, type: 'file' })}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      className="action-btn delete"
                      title="Delete File"
                      onClick={() => onDeleteItem({ ...file, type: 'file' })}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
