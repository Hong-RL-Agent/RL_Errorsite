import React, { useState, useEffect } from 'react';
import { FileText, Download, Edit3, Plus, File, Image, FileCode, Check } from 'lucide-react';
import Modal from '../components/Modal';

export default function Files({ showToast }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit file description state (SEC-335)
  const [editingFile, setEditingFile] = useState(null);
  const [editDesc, setEditDesc] = useState('');
  const [savingDesc, setSavingDesc] = useState(false);

  // New file modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileDesc, setNewFileDesc] = useState('');

  const loadFiles = () => {
    fetch('/api/files')
      .then(res => res.json())
      .then(data => {
        setFiles(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadFiles();
  }, []);

  // Save file description (SEC-335 / site036-bug05)
  const handleSaveDescription = (e) => {
    e.preventDefault();
    if (!editingFile) return;

    setSavingDesc(true);
    const idempotency_key = `FILE-DESC-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    fetch('/api/files/description', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileId: editingFile.id,
        description: editDesc,
        idempotency_key
      })
    })
    .then(res => res.json())
    .then(data => {
      setSavingDesc(false);
      setEditingFile(null);
      loadFiles();
      showToast('파일 설명 저장 완료', '문서 설명이 성공적으로 업데이트되었습니다.', 'success', data.transaction_id);
    })
    .catch(err => {
      console.error(err);
      setSavingDesc(false);
    });
  };

  // Mock file upload
  const handleUploadFile = (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    fetch('/api/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newFileName.trim(),
        description: newFileDesc.trim(),
        size: '3.4 MB',
        type: newFileName.endsWith('.png') || newFileName.endsWith('.jpg') ? 'image' : 'pdf'
      })
    })
    .then(res => res.json())
    .then(data => {
      setUploadModalOpen(false);
      setNewFileName('');
      setNewFileDesc('');
      loadFiles();
      showToast('파일 업로드 완료', `[${data.name}] 파일이 안전하게 보관함에 추가되었습니다.`, 'success');
    })
    .catch(err => console.error(err));
  };

  const getFileIcon = (type) => {
    if (type === 'image') return <Image size={18} color="#10b981" />;
    if (type === 'figma') return <FileCode size={18} color="#db2777" />;
    return <FileText size={18} color="#4f46e5" />;
  };

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)' }}>공유 파일 및 자산 저장소</h2>
          <p className="card-subtitle">팀 프로젝트에 첨부된 문서, 디자인 에셋, 명세서를 관리합니다.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setUploadModalOpen(true)}>
          <Plus size={16} /> 새 파일 업로드
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>파일명</th>
              <th>설명</th>
              <th>용량</th>
              <th>등록자</th>
              <th>업로드 일시</th>
              <th>다운로드</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {files.map(f => (
              <tr key={f.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                    {getFileIcon(f.type)}
                    <span>{f.name}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--gray-500)', maxWidth: '280px' }}>
                  {f.description || '-'}
                </td>
                <td>{f.size}</td>
                <td>{f.uploader}</td>
                <td>{f.uploadedAt}</td>
                <td>
                  <span className="badge badge-info">{f.downloads}회</span>
                </td>
                <td>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setEditingFile(f);
                      setEditDesc(f.description || '');
                    }}
                    title="설명 수정"
                  >
                    <Edit3 size={14} /> 설명 수정
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Description Modal (SEC-335) */}
      <Modal
        isOpen={!!editingFile}
        onClose={() => setEditingFile(null)}
        title={editingFile ? `[${editingFile.name}] 파일 설명 수정` : '파일 설명'}
      >
        <form onSubmit={handleSaveDescription}>
          <div className="form-group">
            <label className="form-label">파일 설명 및 요약</label>
            <textarea
              className="form-control"
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              placeholder="파일의 상세 목적이나 버전 변경 사항을 입력하세요."
              rows="4"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingFile(null)}>
              취소
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={savingDesc}>
              {savingDesc ? '저장 중...' : '설명 저장'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Upload File Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="새 파일 업로드"
      >
        <form onSubmit={handleUploadFile}>
          <div className="form-group">
            <label className="form-label">파일명</label>
            <input
              type="text"
              className="form-control"
              placeholder="예: API_Architecture_Guide.pdf"
              value={newFileName}
              onChange={e => setNewFileName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">문서 설명</label>
            <textarea
              className="form-control"
              placeholder="문서에 대한 간략한 설명을 작성해 주세요."
              value={newFileDesc}
              onChange={e => setNewFileDesc(e.target.value)}
              rows="3"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setUploadModalOpen(false)}>
              취소
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={!newFileName.trim()}>
              업로드 완료
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
