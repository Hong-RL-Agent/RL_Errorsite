import React, { useEffect, useState } from 'react';
import { FileText, Upload, Plus, Activity as ActivityIcon } from 'lucide-react';
import { fetchApi } from '../api/client';
import { showToast } from '../components/Toast';

export default function Activity() {
  const [reports, setReports] = useState([]);
  const [csvText, setCsvText] = useState('date,pet,type,duration,distance\n2026-09-26,초코,산책,50분,3.2km');
  const [reportNote, setReportNote] = useState('오후 올림픽공원 산책 완료');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await fetchApi('/api/activity/reports');
      setReports(data.reports || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Triggers SEC-389: async-no-feedback on Activity CSV Upload / Note
  const handleUploadCSV = (e) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    // Intentionally without progress/loading feedback UI state for SEC-389
    fetchApi('/api/activity/csv', {
      method: 'POST',
      body: JSON.stringify({ csvContent: csvText, reportNote })
    }).then(() => {
      showToast('CSV 업로드 완료', '반려동물 활동 기록 데이터가 동기화되었습니다.', 'success');
      loadReports();
    }).catch((err) => {
      showToast('업로드 실패', err.message, 'error');
    });
  };

  return (
    <div className="main-wrapper">
      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>반려동물 활동 리포트 & CSV 데이터</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 420px) 1fr', gap: '28px', alignItems: 'start' }}>
        {/* CSV Upload Card */}
        <div className="card-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Upload size={20} color="#2d6a4f" />
            <h2 style={{ fontSize: '17px', fontWeight: 800 }}>CSV 활동 데이터 업로드</h2>
          </div>

          <form onSubmit={handleUploadCSV}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>CSV 형식 데이터 입력</label>
              <textarea
                rows="4"
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace' }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>활동 요약 메모</label>
              <input
                type="text"
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
              />
            </div>

            <button type="submit" className="primary-btn" style={{ width: '100%' }}>
              <Upload size={16} />
              <span>활동 기록 동기화 (CSV 업로드)</span>
            </button>
          </form>
        </div>

        {/* Activity List */}
        <div className="card-box">
          <h2 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '16px' }}>최근 돌봄 & 산책 리포트</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {reports.map((r) => (
              <div key={r.id} style={{ background: '#f8faf7', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 800, fontSize: '15px', color: '#1b4332' }}>[{r.petName}] {r.type}</span>
                    <span style={{ fontSize: '12px', background: '#e8f5e9', color: '#2d6a4f', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      {r.duration}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#8d99ae' }}>{r.date}</span>
                </div>
                <p style={{ fontSize: '13.5px', color: '#334155' }}>{r.notes}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
