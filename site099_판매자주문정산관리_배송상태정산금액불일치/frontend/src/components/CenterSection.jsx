import React, { useState } from 'react';

export default function CenterSection({
  orders,
  settlements,
  products,
  buyers,
  deliveryLogs,
  deleteSettlement,
  openProductModal,
  testUnauthorizedCancel
}) {
  const [activeTab, setActiveTab] = useState('ORDERS_TABLE'); // 'ORDERS_TABLE' | 'SETTLEMENTS_SALES' | 'BUYERS_LOGS'

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'ORDERS_TABLE' ? 'active' : ''}`}
          onClick={() => setActiveTab('ORDERS_TABLE')}
        >
          📦 스토어 주문 배송 대장 (45건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'SETTLEMENTS_SALES' ? 'active' : ''}`}
          onClick={() => setActiveTab('SETTLEMENTS_SALES')}
        >
          💰 판매 정산 대장 (30건) & 등록 상품 (35개)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'BUYERS_LOGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('BUYERS_LOGS')}
        >
          👤 구매자 (30명) & 배송 처리 로그 (60건)
        </button>
      </div>

      {activeTab === 'ORDERS_TABLE' && (
        <div className="widget-section">
          <h2>📦 판매자 스토어 통합 주문 대장 (45건)</h2>

          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>주문 ID</th>
                  <th>상품명</th>
                  <th>구매자</th>
                  <th>결제 금액</th>
                  <th>주문 일시</th>
                  <th>송장 번호</th>
                  <th>주문 상태</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(ord => (
                  <tr key={ord.id}>
                    <td><strong>{ord.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{ord.productName}</strong></td>
                    <td>{ord.buyerName}</td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>₩{ord.totalAmount.toLocaleString()}</strong></td>
                    <td><small>{ord.orderedAt}</small></td>
                    <td><code>{ord.trackingNo || '송장 미등록'}</code></td>
                    <td><span className={`status-badge ${ord.status.toLowerCase()}`}>{ord.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'SETTLEMENTS_SALES' && (
        <div className="widget-section">
          <h2>💰 판매 정산 예정/완료 대장 (30건) 및 상품 현황 (35개)</h2>

          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>정산 ID</th>
                  <th>연관 주문 ID</th>
                  <th>주문 원금</th>
                  <th>수수료(5%)</th>
                  <th>최종 정산액</th>
                  <th>정산 예정일</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map(set => (
                  <tr key={set.id}>
                    <td><strong>{set.id}</strong></td>
                    <td>{set.orderId}</td>
                    <td>₩{set.orderAmount.toLocaleString()}</td>
                    <td>5%</td>
                    <td><strong style={{ color: 'var(--color-success)' }}>₩{set.settlementAmount.toLocaleString()}</strong></td>
                    <td><small>{set.scheduledDate}</small></td>
                    <td><span className={`status-badge ${set.status === 'COMPLETED' ? 'completed' : 'warning'}`}>{set.status}</span></td>
                    <td>
                      <button className="delete-btn-sm" onClick={() => deleteSettlement(set.id)}>
                        🗑️ 정산 내역 삭제 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 정산 내역 삭제(DELETE) 시 목록에서는 소거되나 월별 정산 예정 금액 및 매출 차트 수치에는 남음 (Error 4)</small>

          <h2 style={{ marginTop: '1.25rem' }}>🛍️ 등록 상품 현황 (35개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>상품 ID</th>
                  <th>상품명</th>
                  <th>카테고리</th>
                  <th>판매 가격</th>
                  <th>기본 배송비</th>
                </tr>
              </thead>
              <tbody>
                {products.map(prd => (
                  <tr key={prd.id}>
                    <td><strong>{prd.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{prd.name}</strong></td>
                    <td>{prd.category}</td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>₩{prd.price.toLocaleString()}</strong></td>
                    <td>₩{prd.shippingFee.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'BUYERS_LOGS' && (
        <div className="widget-section">
          <h2>👤 구매자 명단 (30명) & 🚚 택배 배송 물류 로그 (60건)</h2>

          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>구매자 ID</th>
                  <th>구매자 성명</th>
                  <th>연락처</th>
                  <th>배송지 주소</th>
                </tr>
              </thead>
              <tbody>
                {buyers.map(buy => (
                  <tr key={buy.id}>
                    <td><strong>{buy.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{buy.name}</strong></td>
                    <td><small>{buy.phone}</small></td>
                    <td>{buy.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedCancel('ORD-1001')}>
              🔒 권한 없는 타 판매자 주문 취소 시도 (Error 7)
            </button>
            <small className="warn-desc">* 권한 없는 판매자가 다른 스토어 주문 취소 시 HTTP 403 오류를 반환하나 백엔드 감사 로그에는 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
