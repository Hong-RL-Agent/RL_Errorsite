import React, { useState } from 'react';

export default function CenterSection({
  orders,
  menus,
  ingredients,
  stockLogs,
  activityLogs,
  deleteStockLog,
  openMenuModal,
  testUnauthorizedDispose
}) {
  const [activeTab, setActiveTab] = useState('ORDERS_TABLE'); // 'ORDERS_TABLE' | 'MENUS_INGREDIENTS' | 'STOCKLOGS_LOGS'

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'ORDERS_TABLE' ? 'active' : ''}`}
          onClick={() => setActiveTab('ORDERS_TABLE')}
        >
          🍳 매장 주문 접수 & 주방 관제 대장 (45건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'MENUS_INGREDIENTS' ? 'active' : ''}`}
          onClick={() => setActiveTab('MENUS_INGREDIENTS')}
        >
          🍕 레스토랑 메뉴 (30개) & 식재료 재고 (35개)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'STOCKLOGS_LOGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('STOCKLOGS_LOGS')}
        >
          📦 재고 차감 내역 & 주방 활동 감사 로그 (80건)
        </button>
      </div>

      {activeTab === 'ORDERS_TABLE' && (
        <div className="widget-section">
          <h2>🍳 KitchenOps 매장 주문 접수 및 주방 조리 현황 (45건)</h2>

          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>주문 ID</th>
                  <th>테이블 번호</th>
                  <th>매장 구역</th>
                  <th>메뉴명</th>
                  <th>주문 금액</th>
                  <th>조리 셰프</th>
                  <th>주문 진행 상태</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(ord => (
                  <tr key={ord.id}>
                    <td><strong>{ord.id}</strong></td>
                    <td><span className="table-badge">{ord.tableNo}</span></td>
                    <td><small>{ord.tableSection}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{ord.menuName}</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{ord.price?.toLocaleString()}원</strong></td>
                    <td><strong>{ord.chefName}</strong></td>
                    <td><span className={`status-badge ${ord.status.toLowerCase()}`}>{ord.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'MENUS_INGREDIENTS' && (
        <div className="widget-section">
          <h2>🍕 레스토랑 전체 메뉴 명단 (30개) & 📦 창고 식재료 보유 재고 (35개)</h2>

          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>메뉴 ID</th>
                  <th>메뉴명</th>
                  <th>판매 단가</th>
                  <th>메뉴 카테고리</th>
                  <th>대표 주재료</th>
                </tr>
              </thead>
              <tbody>
                {menus.map(m => (
                  <tr key={m.id}>
                    <td><strong>{m.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{m.name}</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{m.price?.toLocaleString()}원</strong></td>
                    <td><span className="table-badge">{m.category}</span></td>
                    <td>{m.mainIngredient}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 style={{ marginTop: '1.25rem' }}>📦 주방 창고 식재료 보관 재고 (35개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>식재료 ID</th>
                  <th>식재료 품목명</th>
                  <th>현재 잔여 재고</th>
                  <th>안전 재고 수량</th>
                  <th>단가</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map(ing => (
                  <tr key={ing.id}>
                    <td><strong>{ing.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{ing.name}</strong></td>
                    <td><strong style={{ color: ing.currentStock <= ing.safeStock ? 'var(--color-danger)' : 'var(--color-success)' }}>{ing.currentStock} {ing.unit}</strong></td>
                    <td><small>{ing.safeStock} {ing.unit}</small></td>
                    <td>{ing.unitPrice?.toLocaleString()}원</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'STOCKLOGS_LOGS' && (
        <div className="widget-section">
          <h2>📦 조리 차감 재고 변동 내역 & 📑 주방 셰프 감사 로그 (80건)</h2>

          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>로그 ID</th>
                  <th>주문 ID</th>
                  <th>차감 식재료명</th>
                  <th>차감 수량</th>
                  <th>일시</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {stockLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.orderId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.ingredientName}</strong></td>
                    <td><strong style={{ color: 'var(--color-danger)' }}>-{log.deductQty} {log.unit}</strong></td>
                    <td><small>{log.timestamp}</small></td>
                    <td>
                      <button className="delete-btn-sm" onClick={() => deleteStockLog(log.id)}>
                        🗑️ 재고 로그 삭제 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 재고 차감 로그 삭제(DELETE) 시 목록에서는 소거되나 메뉴별 판매량 및 일일 매출 수치에는 남음 (Error 4)</small>

          <div style={{ marginTop: '1rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedDispose('ING-2001')}>
              🔒 권한 없는 일반 직원의 식재료 폐기 시도 (Error 7)
            </button>
            <small className="warn-desc">* 권한 없는 직원이 식재료 폐기 시 HTTP 403 오류를 반환하나 백엔드 감사 로그에는 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
