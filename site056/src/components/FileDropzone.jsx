import React, { useState, useRef } from 'react';
import { UploadCloud, File, CheckCircle, AlertCircle, X } from 'lucide-react';

export default function FileDropzone({ onUpload, isUploading = false }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream'
      });
    }
  };

  const handleUploadSubmit = () => {
    if (!selectedFile) return;
    onUpload({
      filename: selectedFile.name,
      mimeType: selectedFile.type,
      size: selectedFile.size
    });
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ marginTop: '16px' }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept=".jpg,.jpeg,.png,.pdf"
      />

      {!selectedFile ? (
        <div
          className="dropzone-area"
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          <UploadCloud size={40} color="#2563eb" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
            점검 관련 서류 및 사진 파일 추가
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            클릭하여 업로드할 파일을 선택하세요 (PDF, JPG, PNG 파일 지원)
          </p>
        </div>
      ) : (
        <div
          style={{
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '16px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <File size={28} color="#2563eb" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                {selectedFile.name}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setSelectedFile(null)}
              style={{
                background: '#f1f5f9',
                border: 'none',
                padding: '8px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              title="취소"
            >
              <X size={16} />
            </button>
            <button
              onClick={handleUploadSubmit}
              disabled={isUploading}
              style={{
                padding: '8px 18px',
                background: '#1e40af',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: isUploading ? 'not-allowed' : 'pointer'
              }}
            >
              {isUploading ? '업로드 중...' : '문서 등록'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
