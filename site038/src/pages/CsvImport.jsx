import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle2, History, AlertCircle, FileSpreadsheet, ArrowUpRight } from 'lucide-react';

export default function CsvImport({ onShowToast }) {
  const [history, setHistory] = useState([]);
  const [fileName, setFileName] = useState('creator-content-data.csv');
  const [rows, setRows] = useState(120);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/import/history');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  // SEC-359: CSV Import
  const handleUploadCsv = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Deterministic idempotency key for CSV batch upload
      const idempotency_key = `CSV-${fileName.toUpperCase().replace(/\./g, '_')}`;

      const res = await fetch('/api/import/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          rows: Number(rows),
          idempotency_key
        })
      });

      const data = await res.json();
      if (data.success) {
        onShowToast({
          title: 'CSV 데이터 업로드 완료',
          message: `파일 [${fileName}]의 ${rows}개 데이터 행이 성공적으로 임포트되었습니다.`,
          type: 'success',
          bugId: data.bugId,
          secId: data.secId,
          txId: data.transaction_id,
          idempotency_key
        });
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">콘텐츠 데이터 CSV 임포트</h1>
          <p className="page-subtitle">타 플랫폼의 영상 성과 데이터나 굿즈 주문 목록을 일괄 업로드합니다.</p>
        </div>
      </div>

      <div className="grid-layout grid-2" style={{ gridTemplateColumns: '1fr 1.2fr' }}>
        {/* Upload Form */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
              <FileSpreadsheet size={16} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>CSV 파일 업로드 실행</h3>
          </div>

          <form onSubmit={handleUploadCsv}>
            <div
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '30px 20px',
                textAlign: 'center',
                background: 'var(--bg-main)',
                marginBottom: '20px',
                cursor: 'pointer'
              }}
            >
              <UploadCloud size={36} style={{ color: 'var(--primary-color)', margin: '0 auto 12px' }} />
              <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>CSV 파일을 드래그하거나 선택하세요</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>최대 파일 크기: 25MB (UTF-8 인코딩 지원)</p>
            </div>

            <div className="form-group">
              <label className="form-label">업로드 파일명 *</label>
              <input
                type="text"
                className="form-input"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">데이터 레코드 수 (행) *</label>
              <input
                type="number"
                className="form-input"
                value={rows}
                onChange={(e) => setRows(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', height: '42px' }}
              disabled={uploading}
            >
              <UploadCloud size={16} /> {uploading ? '업로드 처리 중...' : 'CSV 업로드 시작'}
            </button>
          </form>
        </div>

        {/* Import History Table */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <History size={16} /> 최근 임포트 이력 ({history.length}건)
            </h3>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>임포트 ID</th>
                  <th>파일명</th>
                  <th>레코드 수</th>
                  <th>상태</th>
                  <th>처리 일시</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--primary-color)' }}>{h.id}</td>
                    <td style={{ fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={14} color="var(--primary-color)" />
                        {h.fileName}
                      </div>
                    </td>
                    <td>{h.rows.toLocaleString()}행</td>
                    <td>
                      <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={11} /> {h.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{h.importedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
