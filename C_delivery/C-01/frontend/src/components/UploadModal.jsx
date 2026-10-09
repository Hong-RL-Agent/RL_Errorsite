import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onUploadFile }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);

    try {
      await onUploadFile({
        name: selectedFile.name,
        size: selectedFile.size,
        mimeType: selectedFile.type || 'application/octet-stream'
      });
      setIsUploading(false);
      setSelectedFile(null);
      onClose();
    } catch (err) {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadCloud size={18} color="#3b82f6" />
            <span className="modal-title">Upload File</span>
          </div>
          <button className="action-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div
            style={{
              border: '2px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '32px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(15, 23, 42, 0.4)',
              cursor: 'pointer'
            }}
            onClick={() => document.getElementById('file-upload-input').click()}
          >
            <input
              id="file-upload-input"
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <UploadCloud size={36} color="#60a5fa" />
            <div>
              <p style={{ fontWeight: 500, fontSize: '0.92rem' }}>
                {selectedFile ? selectedFile.name : 'Click to select or drop a file'}
              </p>
              <p style={{ color: 'var(--text-subtle)', fontSize: '0.78rem', marginTop: '4px' }}>
                {selectedFile
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                  : 'Supported formats: PDF, DOCX, TXT, PNG, etc.'}
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!selectedFile || isUploading}
            onClick={handleUpload}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}
