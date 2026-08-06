import React, { useState } from 'react';

export default function CenterSection({
  returns,
  exchanges,
  inquiries,
  deleteReturn,
  testUnauthorizedRefundApprove
}) {
  const [activeTab, setActiveTab] = useState('RETURN_REQUESTS'); // 'RETURN_REQUESTS' | 'EXCHANGE_REQUESTS' | 'CUSTOMER_INQUIRIES'

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'RETURN_REQUESTS' ? 'active' : ''}`}
          onClick={() => setActiveTab('RETURN_REQUESTS')}
        >
          📦 쇼핑몰 반품 요청 대장 (25건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'EXCHANGE_REQUESTS' ? 'active' : ''}`}
          onClick={() => setActiveTab('EXCHANGE_REQUESTS')}
        >
          🔄 상품 교환 요청 내역 (15건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'CUSTOMER_INQUIRIES' ? 'active' : ''}`}
          onClick={() => setActiveTab('CUSTOMER_INQUIRIES')}
        >
          💬 반품/교환 고객 문의 (20건)
        </button>
      </div>

      {activeTab === 'RETURN_REQUESTS' && (
        <div className="widget-section">
          <h2>📦 쇼핑몰 반품 & 환불 신청 대장 (최소 25개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>반품 ID</th>
                  <th>주문 번호</th>
                  <th>상품명</th>
                  <th>고객명</th>
                  <th>반품 사유</th>
                  <th>환불 금액</th>
                  <th>수거 예정일</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {returns.map(ret => (
                  <tr key={ret.id}>
                    <td><strong>{ret.id}</strong></td>
                    <td><span className="ord-tag">{ret.orderId}</span></td>
                    <td>{ret.productName}</td>
                    <td>{ret.customerName}</td>
                    <td><small>{ret.reason}</small></td>
                    <td><strong>{ret.refundAmount.toLocaleString()}원</strong></td>
                    <td>{ret.pickupDate}</td>
                    <td><span className={`status-badge ${ret.status.toLowerCase()}`}>{ret.status}</span></td>
                    <td>
                      <button 
                        className="delete-btn-sm"
                        onClick={() => deleteReturn(ret.id)}
                      >
                        🗑️ 삭제 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 반품 요청 삭제(DELETE) 시 대장에서는 소거되나 상품별 반품률 및 월별 환불 금액 통계 수치에는 남음 (Error 4)</small>
        </div>
      )}

      {activeTab === 'EXCHANGE_REQUESTS' && (
        <div className="widget-section">
          <h2>🔄 교환 신청 접수 & 처리 대장 (최소 15개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>교환 ID</th>
                  <th>주문 번호</th>
                  <th>상품명</th>
                  <th>희망 변경 옵션 / 사이즈</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {exchanges.map(exc => (
                  <tr key={exc.id}>
                    <td><strong>{exc.id}</strong></td>
                    <td><span className="ord-tag">{exc.orderId}</span></td>
                    <td>{exc.productName}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{exc.targetSize}</strong></td>
                    <td><span className="status-badge approved">{exc.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '0.85rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedRefundApprove('RET-001')}>
              🔒 무권한 직원의 환불 승인 시도 (Error 7)
            </button>
            <small className="warn-desc">* 무권한 직원이 환불 승인 시 HTTP 403 오류가 반환되나 서버 활동 로그에는 승인 성공(Status 200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}

      {activeTab === 'CUSTOMER_INQUIRIES' && (
        <div className="widget-section">
          <h2>💬 고객 1:1 반품/교환 문의 답변 게시판 (최소 20개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>문의 ID</th>
                  <th>주문 번호</th>
                  <th>고객명</th>
                  <th>문의 제목</th>
                  <th>답변 상태</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map(inq => (
                  <tr key={inq.id}>
                    <td><strong>{inq.id}</strong></td>
                    <td><span className="ord-tag">{inq.orderId}</span></td>
                    <td>{inq.customerName}</td>
                    <td>{inq.title}</td>
                    <td><span className="status-badge approved">{inq.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
