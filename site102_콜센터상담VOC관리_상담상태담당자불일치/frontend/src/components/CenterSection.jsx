import React, { useState } from 'react';

export default function CenterSection({
  consultations,
  customers,
  agents,
  memos,
  activityLogs,
  deleteMemo,
  openCustomerModal,
  testUnauthorizedStatusChange
}) {
  const [activeTab, setActiveTab] = useState('CONSULTATIONS_TABLE'); // 'CONSULTATIONS_TABLE' | 'CUSTOMERS_AGENTS' | 'MEMOS_LOGS'

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'CONSULTATIONS_TABLE' ? 'active' : ''}`}
          onClick={() => setActiveTab('CONSULTATIONS_TABLE')}
        >
          📞 콜센터 상담 접수 & VOC 대장 (45건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'CUSTOMERS_AGENTS' ? 'active' : ''}`}
          onClick={() => setActiveTab('CUSTOMERS_AGENTS')}
        >
          👤 등록 고객 (35명) & 상담원 현황 (18명)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'MEMOS_LOGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('MEMOS_LOGS')}
        >
          📝 상담 이력 메모 (70건) & 배정 활동 로그 (80건)
        </button>
      </div>

      {activeTab === 'CONSULTATIONS_TABLE' && (
        <div className="widget-section">
          <h2>📞 CallDesk 콜센터 인바운드/VOC 접수 관제 대장 (45건)</h2>

          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>상담 ID</th>
                  <th>고객명</th>
                  <th>VOC 카테고리</th>
                  <th>우선순위</th>
                  <th>대기 시간</th>
                  <th>담당 상담원</th>
                  <th>상담 접수 상태</th>
                </tr>
              </thead>
              <tbody>
                {consultations.map(call => (
                  <tr key={call.id}>
                    <td><strong>{call.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{call.customerName} 고객</strong></td>
                    <td><span className="category-badge">{call.category}</span></td>
                    <td><strong style={{ color: call.priority === 'CRITICAL' ? 'var(--color-danger)' : 'var(--color-warning)' }}>[{call.priority}]</strong></td>
                    <td>{call.waitTimeMin}분 대기</td>
                    <td><strong>{call.agentName}</strong></td>
                    <td><span className={`status-badge ${call.status.toLowerCase()}`}>{call.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'CUSTOMERS_AGENTS' && (
        <div className="widget-section">
          <h2>👤 콜센터 등록 고객 명단 (35명) & 🎧 전담 상담원 배치 (18명)</h2>

          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>고객 ID</th>
                  <th>고객 성명</th>
                  <th>연락처</th>
                  <th>고객 등급</th>
                  <th>최근 문의 요약</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(cust => (
                  <tr key={cust.id}>
                    <td><strong>{cust.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{cust.name}</strong></td>
                    <td><small>{cust.phone}</small></td>
                    <td><span className="tier-tag">{cust.tier}</span></td>
                    <td>{cust.recentInquiry}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 style={{ marginTop: '1.25rem' }}>🎧 상담원 팀별 처리 실적 (18명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>상담원 ID</th>
                  <th>상담원 성명</th>
                  <th>소속 팀</th>
                  <th>누적 처리 건수</th>
                </tr>
              </thead>
              <tbody>
                {agents.map(agt => (
                  <tr key={agt.id}>
                    <td><strong>{agt.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{agt.name}</strong></td>
                    <td><span className="category-badge">{agt.team}</span></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{agt.processedCount}건 완료</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'MEMOS_LOGS' && (
        <div className="widget-section">
          <h2>📝 상담 이력 실시간 메모 (70건) & 📑 상담원 배정 감사 로그 (80건)</h2>

          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>메모 ID</th>
                  <th>연관 상담 ID</th>
                  <th>작성 상담원</th>
                  <th>상담 기록 메모 내용</th>
                  <th>작성 일시</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {memos.map(memo => (
                  <tr key={memo.id}>
                    <td><strong>{memo.id}</strong></td>
                    <td>{memo.callId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{memo.authorName}</strong></td>
                    <td>{memo.note}</td>
                    <td><small>{memo.timestamp}</small></td>
                    <td>
                      <button className="delete-btn-sm" onClick={() => deleteMemo(memo.id)}>
                        🗑️ 메모 삭제 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 상담 메모 삭제(DELETE) 시 상세에서는 소거되나 상담원별 처리량 및 대시보드 완료율 통계 수치에는 남음 (Error 4)</small>

          <div style={{ marginTop: '1rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedStatusChange('CALL-1001', 'COMPLETED')}>
              🔒 타 팀 상담원의 상담 상태 변경 시도 (Error 7)
            </button>
            <small className="warn-desc">* 권한 없는 상담원이 타 팀 상담 상태 변경 시 HTTP 403 오류를 반환하나 백엔드 감사 로그에는 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
