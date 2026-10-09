import React from 'react';
import { X, FileText, FileSpreadsheet, FileCode, File, Download, Calendar, HardDrive, Hash } from 'lucide-react';

export default function FileDetailPanel({ file, folderName, onClose }) {
  if (!file) return null;

  const formatBytes = (bytes) => {
    if (!bytes && bytes !== 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName, mimeType) => {
    if (fileName.endsWith('.pdf')) return <FileText size={48} color="#ef4444" />;
    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) return <FileText size={48} color="#3b82f6" />;
    if (fileName.endsWith('.txt')) return <FileCode size={48} color="#10b981" />;
    return <File size={48} color="#8b5cf6" />;
  };

  return (
    <div className="detail-drawer">
      <div className="detail-header">
        <span className="detail-title">File Details</span>
        <button className="action-btn" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className="detail-preview-large">
        {getFileIcon(file.name, file.mimeType)}
      </div>

      <div style={{ marginBottom: '18px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, wordBreak: 'break-all' }}>{file.name}</h3>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
          {file.mimeType || 'Document'}
        </span>
      </div>

      <div style={{ flex: 1 }}>
        <div className="detail-row">
          <span className="detail-label">Size</span>
          <span className="detail-value">{formatBytes(file.size)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Location</span>
          <span className="detail-value">{folderName || 'Root'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Modified</span>
          <span className="detail-value">
            {file.updatedAt ? new Date(file.updatedAt).toLocaleDateString() : 'Today'}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Created</span>
          <span className="detail-value">
            {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'Today'}
          </span>
        </div>
      </div>

      <button
        className="btn-secondary"
        style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}
        onClick={() => {
          // Simulated file download
          const blob = new Blob([`Content of ${file.name}`], { type: file.mimeType || 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.name;
          a.click();
          URL.revokeObjectURL(url);
        }}
      >
        <Download size={16} />
        <span>Download</span>
      </button>
    </div>
  );
}
