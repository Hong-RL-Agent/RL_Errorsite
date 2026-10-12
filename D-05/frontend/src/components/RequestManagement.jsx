import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Filter, 
  Search, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { fetchRequests, approveRequest, rejectRequest } from '../lib/api';

export default function RequestManagement({ onShowToast }) {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject'
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadRequests();
  }, [statusFilter, search]);

  async function loadRequests() {
    try {
      setLoading(true);
      const res = await fetchRequests({
        status: statusFilter,
        search
      });
      if (res.success) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error(err);
      onShowToast('서비스 요청 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenActionModal(reqItem, type) {
    setSelectedReq(reqItem);
    setActionType(type);
    setRejectReason('');
  }

  async function handleConfirmAction() {
    if (!selectedReq) return;

    const filterContext = {
      status: statusFilter,
      search
    };

    try {
      if (actionType === 'approve') {
        const res = await approveRequest(selectedReq.req_id, filterContext);
        if (res.success) {
          onShowToast(`[${selectedReq.req_id}] 요청이 성공적으로 승인되었습니다.`);
        }
      } else if (actionType === 'reject') {
        const res = await rejectRequest(selectedReq.req_id, rejectReason || '관리자 검토 반려');
        if (res.success) {
          onShowToast(`[${selectedReq.req_id}] 요청이 반려되었습니다.`);
        }
      }
      setSelectedReq(null);
      setActionType(null);
      loadRequests();
    } catch (err) {
      console.error(err);
      onShowToast('요청 처리에 실패했습니다.');
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">사내 인프라 및 서비스 권한 승인 관리</h2>
        <span style={{ fontSize: '13px', color: '#64748b' }}>
          총 {requests.length}건
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
                placeholder="요청 ID(REQ-), 신청자, 제목 검색..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <select
              className="select-filter"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">전체 상태</option>
              <option value="PENDING">대기 중 (PENDING)</option>
              <option value="APPROVED">승인 완료 (APPROVED)</option>
              <option value="REJECTED">반려됨 (REJECTED)</option>
            </select>
          </div>
        </div>

        {/* 요청 목록 테이블 */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>요청 번호</th>
                <th>요청 유형</th>
                <th>신청자</th>
                <th>신청 부서</th>
                <th>신청 제목 및 세부 사유</th>
                <th>신청 일시</th>
                <th>상태</th>
                <th style={{ textAlign: 'center' }}>결재 처리</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    요청 내역을 로딩 중입니다...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    조회된 서비스 요청이 없습니다.
                  </td>
                </tr>
              ) : (
                requests.map(r => (
                  <tr key={r.req_id} data-req-id={r.req_id}>
                    <td style={{ fontWeight: '600', color: '#0f172a' }}>{r.req_id}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                        {r.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600' }}>{r.requester}</td>
                    <td>{r.department}</td>
                    <td>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>{r.title}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        사유: {r.reason}
                      </div>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '12px' }}>{r.created_at}</td>
                    <td>
                      <span className={`badge ${r.status.toLowerCase()}`}>
                        {r.status === 'PENDING' ? '대기 중' : r.status === 'APPROVED' ? '승인' : '반려'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {r.status === 'PENDING' ? (
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleOpenActionModal(r, 'approve')}
                            title="승인 처리"
                          >
                            <CheckCircle size={13} />
                            <span>승인</span>
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleOpenActionModal(r, 'reject')}
                            title="반려 처리"
                          >
                            <XCircle size={13} />
                            <span>반려</span>
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>결재 완료</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 결재 확인 팝업 모달 */}
      {selectedReq && (
        <div className="modal-backdrop" onClick={() => setSelectedReq(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                서비스 요청 결재 {actionType === 'approve' ? '승인 확인' : '반려 처리'}
              </h3>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                  [{selectedReq.req_id}] {selectedReq.title}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  신청자: {selectedReq.requester} ({selectedReq.department})
                </div>
              </div>

              {actionType === 'approve' ? (
                <div style={{ padding: '12px', backgroundColor: '#ecfdf5', borderRadius: '6px', fontSize: '13px', color: '#065f46' }}>
                  해당 요청을 최종 승인하시겠습니까? 승인 시 결재 감사 로그가 자동으로 생성됩니다.
                </div>
              ) : (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>반려 사유 입력</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="반려 사유를 구체적으로 입력하세요..."
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setSelectedReq(null)}
              >
                취소
              </button>
              <button 
                type="button" 
                className={`btn ${actionType === 'approve' ? 'btn-primary' : 'btn-danger'}`}
                onClick={handleConfirmAction}
              >
                {actionType === 'approve' ? '승인 확정' : '반려 확정'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
