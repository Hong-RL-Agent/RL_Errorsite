import React, { useState, useEffect } from 'react';
import { FileText, Download, Edit3, CheckCircle2, File } from 'lucide-react';
import Modal from '../components/Modal';

export default function Files({ showToast }) {
  const [files, setFiles] = useState([]);
  const [editingFile, setEditingFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [saving, setSaving] = useState(false);

  const loadFiles = () => {
    fetch('/api/files')
      .then(res => res.json())
      .then(d => setFiles(d))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadFiles();
  }, []);

  // Rename file handler (SEC-347 / site037-bug07)
  const handleRenameFile = (e) => {
    e.preventDefault();
    if (!editingFile || !fileName.trim()) return;

    setSaving(true);
    const idempotency_key = `FILENAME-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    fetch('/api/files/name', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileId: editingFile.id,
        name: fileName.trim(),
        idempotency_key
      })
    })
    .then(res => res.json())
    .then(data => {
      setSaving(false);
      setEditingFile(null);
      loadFiles();
      showToast('파일명 수정 완료', '공연 자료 파일명이 정상적으로 업데이트되었습니다.', 'success', data.transaction_id, data.bugId, data.secId);
    })
    .catch(err => {
      console.error(err);
      setSaving(false);
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark-900)' }}>공연 자료실 및 브로슈어 아카이브</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>공연 프로그램북, 무대 배치도, 시즌 가이드북 공식 다운로드</p>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>파일명</th>
              <th>분류</th>
              <th>용량</th>
              <th>다운로드 수</th>
              <th>최종 수정일시</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {files.map(f => (
              <tr key={f.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                    <FileText size={18} color="#7e22ce" />
                    <span>{f.name}</span>
                  </div>
                </td>
                <td><span className="badge badge-classic">{f.category}</span></td>
                <td>{f.size}</td>
                <td>{f.downloads} 회</td>
                <td>{f.updatedAt}</td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setEditingFile(f);
                        setFileName(f.name);
                      }}
                      title="파일명 수정"
                    >
                      <Edit3 size={14} /> 이름 변경
                    </button>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => showToast('다운로드 시작', `[${f.name}] 파일 다운로드가 완료되었습니다.`, 'info')}
                    >
                      <Download size={14} /> 다운로드
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Filename Modal (SEC-347) */}
      <Modal
        isOpen={!!editingFile}
        onClose={() => setEditingFile(null)}
        title={editingFile ? `[${editingFile.name}] 파일명 변경` : '파일명 변경'}
      >
        <form onSubmit={handleRenameFile}>
          <div className="form-group">
            <label className="form-label">새 파일명</label>
            <input
              type="text"
              className="form-control"
              value={fileName}
              onChange={e => setFileName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingFile(null)}>
              취소
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving || !fileName.trim()}>
              {saving ? '저장 중...' : '파일명 저장'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
