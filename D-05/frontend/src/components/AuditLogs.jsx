import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, Filter, RefreshCw } from 'lucide-react';
import { fetchLogs } from '../lib/api';

export default function AuditLogs({ onShowToast }) {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLogs();
  }, [search, actionFilter]);

  async function loadLogs() {
    try {
      setLoading(true);
      const res = await fetchLogs({
        search,
        action: actionFilter,
        limit: 100
      });
      if (res.success) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error(err);
      onShowToast('감사 로그를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">정보보안 및 관리자 활동 감사 로그 (Audit Trail)</h2>
        <span style={{ fontSize: '13px', color: '#64748b' }}>
          총 {logs.length}건 기록됨
        </span>
      </div>

      <div className="card-body">
        {/* 필터 바 */}
        <div className="filter-bar">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="search-box">
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="관리자, 대상자, 세부내용 검색..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <select
              className="select-filter"
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
            >
              <option value="">전체 액션 유형</option>
              <option value="USER_STATUS_TOGGLE">USER_STATUS_TOGGLE (상태 변경)</option>
              <option value="USER_ROLE_UPDATE">USER_ROLE_UPDATE (권한 변경)</option>
              <option value="USER_INFO_UPDATE">USER_INFO_UPDATE (정보 수정)</option>
              <option value="REQUEST_APPROVE">REQUEST_APPROVE (요청 승인)</option>
              <option value="REQUEST_REJECT">REQUEST_REJECT (요청 반려)</option>
            </select>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={loadLogs}>
            <RefreshCw size={13} />
            <span>새로고침</span>
          </button>
        </div>

        {/* 로그 테이블 */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>로그 식별자</th>
                <th>작업 관리자</th>
                <th>액션 구분</th>
                <th>대상 ID</th>
                <th>대상자</th>
                <th>발신 IP</th>
                <th>처리 결과</th>
                <th>상세 내역</th>
                <th>기록 일시</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    감사 로그를 로딩 중입니다...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    조건에 해당하는 감사 로그가 없습니다.
                  </td>
                </tr>
              ) : (
                logs.map(l => (
                  <tr key={l.log_id}>
                    <td style={{ fontWeight: '600', color: '#475569' }}>{l.log_id}</td>
                    <td style={{ fontWeight: '600' }}>{l.admin}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#334155', fontFamily: 'monospace' }}>
                        {l.action}
                      </span>
                    </td>
                    <td style={{ color: '#0f172a' }}>{l.target_id}</td>
                    <td>{l.target_name}</td>
                    <td style={{ color: '#64748b', fontSize: '12px' }}>{l.ip_address}</td>
                    <td>
                      <span className={`badge ${l.result === 'SUCCESS' ? 'active' : 'rejected'}`}>
                        {l.result}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#334155' }}>{l.details}</td>
                    <td style={{ color: '#64748b', fontSize: '12px' }}>{l.created_at}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
