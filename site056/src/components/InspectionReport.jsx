import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, FileText, Download, User, Calendar, MapPin, Wrench } from 'lucide-react';
import InspectionBadge from './InspectionBadge';
import FileDropzone from './FileDropzone';

export default function InspectionReport({ report, onUploadDocument, isUploading = false }) {
  if (!report) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <p style={{ color: '#64748b' }}>선택된 점검 리포트가 없습니다.</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case '양호':
        return <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }}>양호</span>;
      case '확인 필요':
        return <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }}>확인 필요</span>;
      case '점검 권장':
        return <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }}>점검 권장</span>;
      default:
        return <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{status}</span>;
    }
  };

  return (
    <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: 'var(--shadow-md)' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '24px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e40af', background: '#eff6ff', padding: '3px 8px', borderRadius: '4px' }}>
              공식 정밀 진단서 #{report.id}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>차량번호: {report.vehicleNumber}</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            {report.vehicleName}
          </h2>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem', color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={16} /> 점검일: {report.inspectionDate}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <User size={16} /> {report.inspector}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={16} /> {report.centerName}
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>종합 진단 점수</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#1e40af' }}>{report.overallScore}</span>
            <span style={{ fontSize: '1.2rem', color: '#94a3b8', fontWeight: 700 }}>/100</span>
          </div>
          <InspectionBadge grade={report.overallGrade} size="md" />
        </div>
      </div>

      {/* Summary Box */}
      <div style={{ background: '#f8fafc', borderLeft: '4px solid #1e40af', padding: '16px 20px', borderRadius: '0 8px 8px 0', marginBottom: '28px' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={18} color="#1e40af" /> 수석 진단사 총평
        </h4>
        <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.6 }}>{report.summary}</p>
      </div>

      {/* Categories Checklist Table */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
          정밀 점검 세부 항목 (8대 핵심 진단)
        </h3>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>점검 분야</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, width: '90px' }}>점수</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, width: '110px' }}>진단 상태</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>상세 진단 결과</th>
              </tr>
            </thead>
            <tbody>
              {report.categories.map((cat, idx) => (
                <tr key={idx} style={{ borderBottom: idx === report.categories.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1e293b' }}>{cat.name}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#1e40af' }}>{cat.score}점</td>
                  <td style={{ padding: '14px 16px' }}>{getStatusBadge(cat.status)}</td>
                  <td style={{ padding: '14px 16px', color: '#475569' }}>{cat.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wrench size={20} color="#ea580c" />
          정비 및 소모품 관리 권장사항
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {report.recommendations.map((rec, i) => (
            <div key={i} style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', padding: '14px 18px' }}>
              <div style={{ fontWeight: 700, color: '#92400e', marginBottom: '4px', fontSize: '0.95rem' }}>{rec.item}</div>
              <div style={{ fontSize: '0.88rem', color: '#78350f' }}>{rec.advice}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Attached Documents & Upload */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="#2563eb" />
            첨부 서류 및 현장 점검 사진 ({report.documents?.length || 0})
          </h3>
        </div>

        {report.documents && report.documents.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            {report.documents.map((doc) => (
              <div
                key={doc.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                  <FileText size={22} color="#1e40af" style={{ flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {doc.originalName || doc.filename}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {(doc.size / 1024).toFixed(0)} KB • {doc.uploadDate}
                    </div>
                  </div>
                </div>
                <button
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '6px',
                    cursor: 'pointer'
                  }}
                  title="다운로드"
                  onClick={() => alert(`[${doc.originalName || doc.filename}] 다운로드를 시작합니다.`)}
                >
                  <Download size={15} color="#475569" />
                </button>
              </div>
            ))}
          </div>
        )}

        <FileDropzone onUpload={onUploadDocument} isUploading={isUploading} />
      </div>
    </div>
  );
}
