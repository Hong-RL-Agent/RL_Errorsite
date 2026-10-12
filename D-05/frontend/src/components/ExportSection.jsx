import React, { useState, useEffect } from 'react';
import { DownloadCloud, Calendar, Building, FileSpreadsheet, Check } from 'lucide-react';
import { fetchDepartments, fetchUsers, getExportCsvUrl } from '../lib/api';

export default function ExportSection({ onShowToast }) {
  const [departments, setDepartments] = useState([]);
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-30');
  const [department, setDepartment] = useState('마케팅팀');
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments().then(res => {
      if (res.success) setDepartments(res.data);
    }).catch(console.error);
  }, []);

  // 통계 및 미리보기 조회
  async function handleQueryStats() {
    try {
      setLoading(true);
      const res = await fetchUsers({
        department: department === '전체' ? '' : department,
        limit: 100
      });
      if (res.success) {
        setPreviewData({
          count: res.data.length,
          department,
          startDate,
          endDate,
          sampleUsers: res.data.slice(0, 5)
        });
        onShowToast(`[${department}] 기준 대상자 통계 조회가 완료되었습니다.`);
      }
    } catch (err) {
      console.error(err);
      onShowToast('통계 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  // CSV 다운로드 실행
  function handleDownloadCsv() {
    const downloadUrl = getExportCsvUrl({
      startDate,
      endDate,
      department
    });
    // 브라우저 다운로드 트리거
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `AdminScope_Export_${department}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast(`[${department}] CSV 파일 내보내기 다운로드를 시작합니다.`);
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">기업 운영 데이터 및 통계 조건별 CSV 내보내기</h2>
      </div>

      <div className="card-body">
        <div style={{ maxWidth: '800px' }}>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
            조회 기간 및 소속 부서 조건을 지정하여 임직원 인사 및 시스템 접근 현황 데이터를 안전하게 집계하고 CSV 파일로 추출합니다.
          </p>

          {/* 조건 입력 폼 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>시작 일자</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>종료 일자</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>대상 부서 선택</label>
              <select
                className="form-control"
                value={department}
                onChange={e => setDepartment(e.target.value)}
              >
                <option value="전체">전체 부서</option>
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={handleQueryStats}
              disabled={loading}
            >
              <Calendar size={14} />
              <span>{loading ? '조회 중...' : '조건별 통계 조회'}</span>
            </button>

            <button 
              className="btn btn-primary"
              onClick={handleDownloadCsv}
            >
              <DownloadCloud size={14} />
              <span>선택 조건 CSV 다운로드</span>
            </button>
          </div>

          {/* 조회 결과 미리보기 영역 */}
          {previewData && (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileSpreadsheet size={18} color="#2563eb" />
                  <span style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>
                    추출 대상 집계 결과 미리보기
                  </span>
                </div>
                <span className="badge active">
                  대상 임직원: {previewData.count}명
                </span>
              </div>

              <div style={{ fontSize: '13px', color: '#475569', marginBottom: '12px' }}>
                선택 조건: <strong>{previewData.department}</strong> | 기간: <strong>{previewData.startDate} ~ {previewData.endDate}</strong>
              </div>

              <div className="table-container" style={{ backgroundColor: '#fff' }}>
                <table>
                  <thead>
                    <tr>
                      <th>사번</th>
                      <th>이름</th>
                      <th>부서</th>
                      <th>직급</th>
                      <th>권한</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.sampleUsers.map(u => (
                      <tr key={u.emp_no}>
                        <td>{u.emp_no}</td>
                        <td style={{ fontWeight: '600' }}>{u.name}</td>
                        <td>{u.department}</td>
                        <td>{u.position}</td>
                        <td>{u.role}</td>
                        <td>{u.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
