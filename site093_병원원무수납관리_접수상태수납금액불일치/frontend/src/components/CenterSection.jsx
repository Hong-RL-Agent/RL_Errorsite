import React, { useState } from 'react';

export default function CenterSection({
  departments,
  registrations,
  payments,
  activityLogs,
  deletePayment,
  openPatientModal,
  testUnauthorizedCancelPayment
}) {
  const [activeTab, setActiveTab] = useState('QUEUE_FLOW'); // 'QUEUE_FLOW' | 'PAYMENT_RECORDS' | 'ACTIVITY_LOGS'

  const waitingList = registrations.filter(r => r.status === 'WAITING');
  const examiningList = registrations.filter(r => r.status === 'EXAMINING');
  const paymentWaitingList = registrations.filter(r => r.status === 'PAYMENT_WAITING');
  const completedList = registrations.filter(r => r.status === 'COMPLETED');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'QUEUE_FLOW' ? 'active' : ''}`}
          onClick={() => setActiveTab('QUEUE_FLOW')}
        >
          🎫 원무 접수 번호표 흐름도 (40건 대기열)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'PAYMENT_RECORDS' ? 'active' : ''}`}
          onClick={() => setActiveTab('PAYMENT_RECORDS')}
        >
          💳 진료비 수납 내역 대장 (35건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ACTIVITY_LOGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('ACTIVITY_LOGS')}
        >
          📑 원무 작업 활동 로그 (60건)
        </button>
      </div>

      {activeTab === 'QUEUE_FLOW' && (
        <div className="widget-section">
          <h2>🎫 원무 접수 ➔ 진료 ➔ 수납 ➔ 완료 대기열 워크플로우</h2>

          <div className="workflow-grid">
            <div className="flow-column">
              <div className="flow-column-header waiting">
                <span>1. 접수대기 (WAITING)</span>
                <small>{waitingList.length}명</small>
              </div>
              <div className="flow-cards-scroll">
                {waitingList.map(item => (
                  <div key={item.id} className="flow-card">
                    <div className="flow-card-head">
                      <span className="ticket-num">{item.ticketNo}</span>
                      <span className="dept-tag">{item.dept}</span>
                    </div>
                    <strong className="patient-name">{item.patientName} 환자</strong>
                    <small>대기시간: {item.waitTime}분</small>
                  </div>
                ))}
              </div>
            </div>

            <div className="flow-column">
              <div className="flow-column-header examining">
                <span>2. 진료중 (EXAMINING)</span>
                <small>{examiningList.length}명</small>
              </div>
              <div className="flow-cards-scroll">
                {examiningList.map(item => (
                  <div key={item.id} className="flow-card">
                    <div className="flow-card-head">
                      <span className="ticket-num">{item.ticketNo}</span>
                      <span className="dept-tag">{item.dept}</span>
                    </div>
                    <strong className="patient-name">{item.patientName} 환자</strong>
                    <small>예상 진료비: ₩{item.amount.toLocaleString()}</small>
                  </div>
                ))}
              </div>
            </div>

            <div className="flow-column">
              <div className="flow-column-header payment-waiting">
                <span>3. 수납대기 (PAYMENT_WAITING)</span>
                <small>{paymentWaitingList.length}명</small>
              </div>
              <div className="flow-cards-scroll">
                {paymentWaitingList.map(item => (
                  <div key={item.id} className="flow-card">
                    <div className="flow-card-head">
                      <span className="ticket-num">{item.ticketNo}</span>
                      <span className="dept-tag">{item.dept}</span>
                    </div>
                    <strong className="patient-name">{item.patientName} 환자</strong>
                    <small style={{ color: 'var(--color-warning)', fontWeight: 'bold' }}>청구액: ₩{item.amount.toLocaleString()}</small>
                  </div>
                ))}
              </div>
            </div>

            <div className="flow-column">
              <div className="flow-column-header completed">
                <span>4. 수납완료 (COMPLETED)</span>
                <small>{completedList.length}명</small>
              </div>
              <div className="flow-cards-scroll">
                {completedList.map(item => (
                  <div key={item.id} className="flow-card">
                    <div className="flow-card-head">
                      <span className="ticket-num">{item.ticketNo}</span>
                      <span className="dept-tag">{item.dept}</span>
                    </div>
                    <strong className="patient-name">{item.patientName} 환자</strong>
                    <small style={{ color: 'var(--color-success)' }}>수납 완료</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'PAYMENT_RECORDS' && (
        <div className="widget-section">
          <h2>💳 진료비 수납 완료 및 영수증 발행 대장 (35건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>수납 ID</th>
                  <th>접수 ID</th>
                  <th>환자명</th>
                  <th>진료과</th>
                  <th>수납 금액</th>
                  <th>결제 수단</th>
                  <th>수납 일시</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(pay => (
                  <tr key={pay.id}>
                    <td><strong>{pay.id}</strong></td>
                    <td>{pay.registrationId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{pay.patientName} 환자</strong></td>
                    <td>{pay.dept}</td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>₩{pay.amount.toLocaleString()}</strong></td>
                    <td>{pay.method}</td>
                    <td><small>{pay.paidAt}</small></td>
                    <td><span className={`status-badge ${pay.status === 'PAID' ? 'completed' : 'danger'}`}>{pay.status}</span></td>
                    <td>
                      <button className="delete-btn-sm" onClick={() => deletePayment(pay.id)}>
                        🗑️ 수납 내역 삭제 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 수납 내역 삭제(DELETE) 시 수납 대장에서는 소거되나 일일 매출 합계 및 진료과별 수납 통계 그래프 수치에는 남음 (Error 4)</small>
        </div>
      )}

      {activeTab === 'ACTIVITY_LOGS' && (
        <div className="widget-section">
          <h2>📑 원무 직원 활동 및 감사 로그 (60건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>로그 ID</th>
                  <th>처리 직원</th>
                  <th>작업 행위 내용</th>
                  <th>수행 일시</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.operator}</td>
                    <td>{log.action}</td>
                    <td><small>{log.timestamp}</small></td>
                    <td><span className="status-badge completed">{log.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedCancelPayment('PAY-3001')}>
              🔒 일반 사원의 강제 수납 취소 시도 (Error 7)
            </button>
            <small className="warn-desc">* 일반 사원이 수납 취소 시 HTTP 403 오류를 반환하나 백엔드 감사 로그에는 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
