import React, { useState, useEffect } from 'react';
import { FileText, ShieldCheck, ArrowLeft, Download, CheckCircle2, AlertCircle, PlusCircle } from 'lucide-react';
import InspectionReport from '../components/InspectionReport';
import { api } from '../api/client';

export default function Report({ initialReportId = null, onBack }) {
  const [reports, setReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState(initialReportId || null);
  const [currentReport, setCurrentReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.getReports();
      if (data && data.reports) {
        setReports(data.reports);
        if (!selectedReportId && data.reports.length > 0) {
          setSelectedReportId(data.reports[0].id);
        }
      }
    } catch (err) {
      setError(err.message || '점검 리포트 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleReport = async (id) => {
    if (!id) return;
    try {
      const data = await api.getReportById(id);
      if (data && data.report) {
        setCurrentReport(data.report);
      }
    } catch (err) {
      setError(err.message || '점검 리포트 상세를 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (selectedReportId) {
      fetchSingleReport(selectedReportId);
    }
  }, [selectedReportId]);

  const handleUploadDocument = async (docData) => {
    if (!currentReport) return;
    setUploading(true);
    setError(null);
    try {
      // POST /api/reports/:reportId/documents
      // Triggers SEC-458 validation on backend
      const res = await api.uploadDocument(currentReport.id, docData);
      setToastMessage('서류가 성공적으로 업로드되었습니다.');
      fetchSingleReport(currentReport.id);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Document upload error:', err);
      setError(err.message || '문서 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-screen" style={{ paddingTop: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
            점검 결과 리포트 조회
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            AutoCheck 공인 진단사가 발행한 120가지 정밀 점검 결과서 및 첨부 서류입니다.
          </p>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              color: '#334155'
            }}
          >
            <ArrowLeft size={16} />
            <span>돌아가기</span>
          </button>
        )}
      </div>

      {toastMessage && (
        <div className="toast-notice toast-success">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Reports Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px' }}>
        {reports.map((rep) => {
          const isSelected = selectedReportId === rep.id;
          return (
            <button
              key={rep.id}
              onClick={() => setSelectedReportId(rep.id)}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: isSelected ? '2px solid #1e40af' : '1px solid #e2e8f0',
                background: isSelected ? '#eff6ff' : '#ffffff',
                color: isSelected ? '#1e40af' : '#475569',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s'
              }}
            >
              <FileText size={16} color={isSelected ? '#1e40af' : '#94a3b8'} />
              <span>{rep.vehicleName}</span>
              <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>({rep.overallScore}점)</span>
            </button>
          );
        })}
      </div>

      {/* Report Component */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <p>점검 리포트를 불러오는 중입니다...</p>
        </div>
      ) : (
        <InspectionReport
          report={currentReport}
          onUploadDocument={handleUploadDocument}
          isUploading={uploading}
        />
      )}
    </div>
  );
}
