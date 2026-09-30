import React, { useState, useEffect } from 'react';
import { FileText, UploadCloud, Edit2, CheckCircle2, FileCode, Download, Save } from 'lucide-react';
import Modal from '../components/Modal';

export default function Files({ onShowToast }) {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [descInput, setDescInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/files');
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (file) => {
    setSelectedFile(file);
    setDescInput(file.description || '');
    setIsModalOpen(true);
  };

  // SEC-365: File Description Save
  const handleSaveDescription = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      const res = await fetch('/api/files/description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: selectedFile.id,
          description: descInput.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchFiles();
        onShowToast({
          title: '파일 설명 저장 완료',
          message: `파일 [${selectedFile.name}]의 메모 설명이 업데이트되었습니다.`,
          type: 'success',
          bugId: data.bugId,
          secId: data.secId,
          reqId: data.request_id
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">파일 & 무드보드 관리</h1>
          <p className="page-subtitle">홈스타일링 레퍼런스 PDF, 도예 스케치, 전자영수증 파일을 보관합니다.</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>
          보관 파일 목록 ({files.length}건)
        </h3>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>파일명</th>
                <th>크기</th>
                <th>업로드 일시</th>
                <th>파일 설명 / 메모</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} color="var(--primary)" />
                      {f.name}
                    </div>
                  </td>
                  <td>{f.size}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{f.uploadedAt}</td>
                  <td style={{ color: 'var(--text-main)', maxWidth: '300px' }}>
                    {f.description || <span style={{ color: 'var(--text-light)' }}>설명 없음</span>}
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => openEditModal(f)}
                    >
                      <Edit2 size={13} /> 설명 수정
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEC-365: File Description Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="파일 설명 및 메모 수정"
      >
        <form onSubmit={handleSaveDescription}>
          <div className="form-group">
            <label className="form-label">대상 파일</label>
            <input
              type="text"
              className="form-input"
              value={selectedFile?.name || ''}
              disabled
              style={{ background: '#f5f5f4' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">파일 상세 설명 *</label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="파일의 용도나 레퍼런스 설명을 입력하세요."
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={15} /> 설명 저장
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
