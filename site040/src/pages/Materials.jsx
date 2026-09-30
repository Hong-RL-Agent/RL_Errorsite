import React, { useState, useEffect } from 'react';
import { FolderDown, FileText, UploadCloud, Plus, CheckCircle2, Download, Save } from 'lucide-react';
import Modal from '../components/Modal';

export default function Materials({ onShowToast }) {
  const [files, setFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');

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

  // SEC-377: Learning Materials Filename Save/Validate
  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    try {
      const res = await fetch('/api/files/name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: fileName.trim(),
          description: description.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setFileName('');
        setDescription('');
        fetchFiles();
        onShowToast({
          title: '학습 자료 등록 완료',
          message: `파일명 [${data.file?.name}]이 성공적으로 등록되었습니다.`,
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
          <h1 className="page-title">학습 보조 자료실</h1>
          <p className="page-subtitle">강의별 공식 치트시트, 소스코드, 코딩테스트 기출문제 PDF를 다운로드하세요.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> 신규 학습 자료 등록
        </button>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>
          공유 학습 자료 ({files.length}건)
        </h3>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>자료 파일명</th>
                <th>파일 크기</th>
                <th>업로드 일시</th>
                <th>자료 설명</th>
                <th>다운로드</th>
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
                  <td style={{ color: 'var(--text-main)', maxWidth: '320px' }}>{f.description}</td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => alert(`[${f.name}] 파일 다운로드가 시작되었습니다.`)}
                    >
                      <Download size={13} /> 다운로드
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEC-377: Learning Material Filename Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="신규 학습 자료 파일명 등록 & 검증"
      >
        <form onSubmit={handleUploadMaterial}>
          <div className="form-group">
            <label className="form-label">등록 파일명 *</label>
            <input
              type="text"
              className="form-input"
              placeholder="예: nextjs_performance_guide.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">자료 상세 설명</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="자료의 핵심 내용과 추천 대상을 입력하세요."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={15} /> 자료 등록하기
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
