import React from 'react';

export default function Sidebar({
  filterStatus,
  setFilterStatus,
  filterReason,
  setFilterReason,
  refundSortOrder,
  setRefundSortOrder,
  triggerSearchRace,
  returns,
  selectedReturn,
  setSelectedReturn,
  confirmRefundApprove
}) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 처리 상태 & 반품 사유 필터</h3>

      <div className="filter-group">
        <label>처리 상태 선택 (Error 5):</label>
        <select 
          value={filterStatus} 
          onChange={(e) => {
            setFilterStatus(e.target.value);
            triggerSearchRace(e.target.value, filterReason);
          }}
        >
          <option value="ALL">전체 상태</option>
          <option value="REQUESTED">반품 신청 (REQUESTED - Error 5)</option>
          <option value="APPROVED">환불 승인 (APPROVED)</option>
          <option value="CANCELLED">반품 취소 (CANCELLED)</option>
        </select>
        <small className="warn-desc">* 상태 고속 변경 시 이전 응답(신청 3초)이 최신 결과를 덮어써 중앙 반품 목록과 오른쪽 환불 요약이 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>반품 사유 필터:</label>
        <select 
          value={filterReason} 
          onChange={(e) => {
            setFilterReason(e.target.value);
            triggerSearchRace(filterStatus, e.target.value);
          }}
        >
          <option value="ALL">전체 사유</option>
          <option value="SIZE">사이즈 불일치</option>
          <option value="DEFECT">상품 파손/불량</option>
          <option value="MIND_CHANGE">단순 변심</option>
        </select>
      </div>

      <div className="filter-group">
        <label>환불금액순 정렬 (Error 3):</label>
        <select value={refundSortOrder} onChange={(e) => setRefundSortOrder(e.target.value)}>
          <option value="NONE">기본 순서</option>
          <option value="REFUND_HIGH">환불금액높은순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 환불금액순 정렬 상태에서 승인 클릭 시 정렬 인덱스 불일치로 다른 주문건이 승인 저장됨 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>반품 신청 접수 목록 (최소 25개):</label>
        <div className="returns-stack">
          {returns.map((r, idx) => (
            <div 
              key={r.id}
              className={`return-card ${selectedReturn?.id === r.id ? 'active' : ''}`}
              onClick={() => setSelectedReturn(r)}
            >
              <div className="return-head">
                <span className="ord-tag">{r.orderId}</span>
                <span className={`status-badge ${r.status.toLowerCase()}`}>{r.status}</span>
              </div>
              <div className="return-title">{r.productName}</div>
              <div className="return-foot">
                <span>{r.customerName} | {r.refundAmount.toLocaleString()}원</span>
                <button 
                  className="approve-btn-sm"
                  onClick={(e) => { e.stopPropagation(); confirmRefundApprove(idx); }}
                >
                  환불 승인 (Error 3)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
