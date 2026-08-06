import React, { useState } from 'react';

export default function CenterSection({
  inspections,
  sellerTransactions,
  deleteTransaction,
  selectedSellerInfo
}) {
  const [activeTab, setActiveTab] = useState('INSPECTION_LIST'); // 'INSPECTION_LIST' | 'TRANSACTIONS' | 'SELLER_STATS'

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'INSPECTION_LIST' ? 'active' : ''}`}
          onClick={() => setActiveTab('INSPECTION_LIST')}
        >
          🔍 전문 검수 대장 (25건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'TRANSACTIONS' ? 'active' : ''}`}
          onClick={() => setActiveTab('TRANSACTIONS')}
        >
          💳 거래 내역 대장 (18건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'SELLER_STATS' ? 'active' : ''}`}
          onClick={() => setActiveTab('SELLER_STATS')}
        >
          📊 셀러 누적 실적 대시보드
        </button>
      </div>

      {activeTab === 'INSPECTION_LIST' && (
        <div className="widget-section">
          <h2>🔍 명품 정품 감정 & 상태 검수 기록 (최소 25개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>검수 ID</th>
                  <th>상품명</th>
                  <th>담당 감정위원</th>
                  <th>판정 등급</th>
                  <th>검수 상태</th>
                  <th>검수 소견</th>
                </tr>
              </thead>
              <tbody>
                {inspections.map(isp => (
                  <tr key={isp.id}>
                    <td><strong>{isp.id}</strong></td>
                    <td>{isp.productName}</td>
                    <td>{isp.appraiser}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{isp.grade}</strong></td>
                    <td><span className={`status-badge ${isp.status.toLowerCase()}`}>{isp.status}</span></td>
                    <td><small>{isp.notes}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'TRANSACTIONS' && (
        <div className="widget-section">
          <h2>💳 거래 내역 대장 (최소 18개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>거래 ID</th>
                  <th>상품 ID</th>
                  <th>상품명</th>
                  <th>체결 가격</th>
                  <th>구매자</th>
                  <th>거래일자</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {sellerTransactions.map(trx => (
                  <tr key={trx.id}>
                    <td><strong>{trx.id}</strong></td>
                    <td>{trx.productId}</td>
                    <td>{trx.productName}</td>
                    <td><strong className="price-lbl">{trx.price.toLocaleString()}원</strong></td>
                    <td>{trx.buyerName}</td>
                    <td>{trx.tradedAt}</td>
                    <td>
                      <button 
                        className="delete-btn-sm"
                        onClick={() => deleteTransaction(trx.id)}
                      >
                        🗑️ 취소 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 거래 삭제(DELETE) 시 내역에서는 소거되나 셀러 누적 판매액 및 브랜드별 거래 통계 그래프에는 유지됨 (Error 4)</small>
        </div>
      )}

      {activeTab === 'SELLER_STATS' && selectedSellerInfo && (
        <div className="widget-section">
          <h2>📊 판매자 누적 실적 & 브랜드 거래 통계</h2>
          <div className="seller-bar">
            <span>셀러명: <strong>{selectedSellerInfo.name}</strong> ({selectedSellerInfo.grade})</span>
            <span>누적 판매 총액: <strong className="price-lbl">{selectedSellerInfo.totalSales.toLocaleString()}원</strong></span>
            <span>정산 예정금: <strong>{selectedSellerInfo.pendingPayout.toLocaleString()}원</strong></span>
          </div>

          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>브랜드</th>
                  <th>누적 거래 체결액</th>
                  <th>점유 비율</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>CHANEL (샤넬)</strong></td>
                  <td>41,800,000원</td>
                  <td>32%</td>
                </tr>
                <tr>
                  <td><strong>HERMES (에르메스)</strong></td>
                  <td>52,000,000원</td>
                  <td>40%</td>
                </tr>
                <tr>
                  <td><strong>ROLEX (롤렉스)</strong></td>
                  <td>33,600,000원</td>
                  <td>26%</td>
                </tr>
                <tr>
                  <td><strong>CARTIER (까르띠에)</strong></td>
                  <td>21,800,000원</td>
                  <td>17%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
