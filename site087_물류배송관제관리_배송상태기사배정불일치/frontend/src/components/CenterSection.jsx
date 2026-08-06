import React, { useState } from 'react';

export default function CenterSection({
  orders,
  drivers,
  logs,
  inquiries,
  deleteLog,
  openAssignModal,
  testUnauthorizedStatusUpdate
}) {
  const [activeTab, setActiveTab] = useState('CONTROL_DASHBOARD'); // 'CONTROL_DASHBOARD' | 'DRIVER_BOARD' | 'STATUS_LOGS' | 'CUSTOMER_INQUIRIES'

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'CONTROL_DASHBOARD' ? 'active' : ''}`}
          onClick={() => setActiveTab('CONTROL_DASHBOARD')}
        >
          🛰️ 실시간 전국 관제 지도 & 주문 (35건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'DRIVER_BOARD' ? 'active' : ''}`}
          onClick={() => setActiveTab('DRIVER_BOARD')}
        >
          🚚 배송 기사별 작업량 (18명)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'STATUS_LOGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('STATUS_LOGS')}
        >
          📜 배송 상태 이력 로그 (60건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'CUSTOMER_INQUIRIES' ? 'active' : ''}`}
          onClick={() => setActiveTab('CUSTOMER_INQUIRIES')}
        >
          💬 CS 고객 문의 (20건)
        </button>
      </div>

      {activeTab === 'CONTROL_DASHBOARD' && (
        <div className="widget-section">
          <h2>🛰️ 전국 물류센터 관제 모니터링 지도 (SVG)</h2>
          <div className="svg-map-box">
            <svg width="100%" height="200" viewBox="0 0 600 200">
              <rect width="600" height="200" fill="#0b1727" rx="8" />
              <!-- Korea Outline Lines -->
              <path d="M 120 20 L 250 15 L 380 40 L 450 100 L 410 180 L 300 190 L 150 160 L 100 80 Z" fill="none" stroke="#1e3a5f" strokeWidth="2" strokeDasharray="4" />
              
              <!-- Center Nodes -->
              <!-- Seoul -->
              <circle cx="210" cy="50" r="14" fill="var(--color-primary)" opacity="0.8" />
              <text x="210" y="54" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">서울</text>
              
              <!-- Gyeonggi -->
              <circle cx="250" cy="70" r="16" fill="var(--color-primary)" opacity="0.8" />
              <text x="250" y="74" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">경기</text>
              
              <!-- Chungbuk -->
              <circle cx="280" cy="110" r="15" fill="var(--color-warning)" opacity="0.8" />
              <text x="280" y="114" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">중부</text>

              <!-- Gyeongbuk -->
              <circle cx="360" cy="130" r="14" fill="var(--color-primary)" opacity="0.8" />
              <text x="360" y="134" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">영남</text>

              <!-- Jeonnam -->
              <circle cx="210" cy="150" r="12" fill="var(--color-success)" opacity="0.8" />
              <text x="210" y="154" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">호남</text>

              <!-- Jeju -->
              <circle cx="160" cy="180" r="10" fill="var(--color-primary)" opacity="0.8" />
              <text x="160" y="184" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">제주</text>

              <!-- Flow Lines -->
              <line x1="210" y1="50" x2="250" y2="70" stroke="var(--color-primary)" strokeWidth="2" />
              <line x1="250" y1="70" x2="280" y2="110" stroke="var(--color-warning)" strokeWidth="2" strokeDasharray="3" />
              <line x1="280" y1="110" x2="360" y2="130" stroke="var(--color-primary)" strokeWidth="2" />
            </svg>
          </div>

          <h2 style={{ marginTop: '1.25rem' }}>📦 관제 배송 주문 목록 (최소 35개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>운송장 번호</th>
                  <th>고객명</th>
                  <th>상품명</th>
                  <th>담당 기사</th>
                  <th>출발 물류센터</th>
                  <th>지연시간</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(ord => (
                  <tr key={ord.id}>
                    <td><span className="wb-tag">{ord.waybillNo}</span></td>
                    <td>{ord.customerName}</td>
                    <td>{ord.itemTitle}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{ord.driverName}</strong></td>
                    <td>{ord.centerName}</td>
                    <td>{ord.delayMinutes > 0 ? <span style={{ color: 'var(--color-warning)' }}>{ord.delayMinutes}분 지연</span> : '정상'}</td>
                    <td><span className={`status-badge ${ord.status.toLowerCase()}`}>{ord.status}</span></td>
                    <td>
                      <button className="detail-btn-sm" onClick={() => openAssignModal(ord)}>
                        기사 재배정
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'DRIVER_BOARD' && (
        <div className="widget-section">
          <h2>🚚 배송 기사 현황 & 할당 작업량 (최소 18명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>기사 ID</th>
                  <th>기사 성함</th>
                  <th>차량 번호</th>
                  <th>소속 물류센터</th>
                  <th>할당 배송건수</th>
                  <th>근무 상태</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map(drv => (
                  <tr key={drv.id}>
                    <td><strong>{drv.id}</strong></td>
                    <td>{drv.name}</td>
                    <td>{drv.vehicleNo}</td>
                    <td>{drv.centerId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{drv.assignedCount}건</strong></td>
                    <td><span className={`status-badge ${drv.status === 'WORKING' ? 'completed' : 'cancelled'}`}>{drv.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '0.85rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedStatusUpdate('ORD-1001')}>
              🔒 일반 직원의 배송 상태 변경 시도 (Error 7)
            </button>
            <small className="warn-desc">* 일반 직원이 상태 변경 시 HTTP 403 오류를 반환하나 백엔드 로그에는 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}

      {activeTab === 'STATUS_LOGS' && (
        <div className="widget-section">
          <h2>📜 통합 배송 상태 및 처리 로그 (최소 60개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>로그 ID</th>
                  <th>운송장 번호</th>
                  <th>이벤트 액션</th>
                  <th>업데이트 상태</th>
                  <th>발생 일시</th>
                  <th>작업자</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(lg => (
                  <tr key={lg.id}>
                    <td><strong>{lg.id}</strong></td>
                    <td><span className="wb-tag">{lg.waybillNo}</span></td>
                    <td>{lg.action}</td>
                    <td><span className={`status-badge ${lg.status.toLowerCase()}`}>{lg.status}</span></td>
                    <td><small>{lg.timestamp}</small></td>
                    <td>{lg.operator}</td>
                    <td>
                      <button className="delete-btn-sm" onClick={() => deleteLog(lg.id)}>
                        🗑️ 삭제 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 배송 완료 로그 삭제(DELETE) 시 이력 대장에서는 소거되나 완료 배송 수 및 센터 처리량 그래프 수치에는 남음 (Error 4)</small>
        </div>
      )}

      {activeTab === 'CUSTOMER_INQUIRIES' && (
        <div className="widget-section">
          <h2>💬 CS 배송 고객 문의 내역 (최소 20개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>문의 ID</th>
                  <th>운송장 번호</th>
                  <th>고객명</th>
                  <th>문의 제목</th>
                  <th>답변 상태</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map(inq => (
                  <tr key={inq.id}>
                    <td><strong>{inq.id}</strong></td>
                    <td><span className="wb-tag">{inq.orderId}</span></td>
                    <td>{inq.customerName}</td>
                    <td>{inq.title}</td>
                    <td><span className="status-badge completed">{inq.status}</span></td>
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
