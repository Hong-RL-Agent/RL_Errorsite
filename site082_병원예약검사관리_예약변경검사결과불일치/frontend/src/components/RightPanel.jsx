import React from 'react';

export default function RightPanel({
  selectedAppointment,
  setSelectedAppointment,
  triggerTimeDoctorRace,
  triggerCancelSymptomsConflict,
  selectedTestDetail
}) {
  return (
    <aside className="panel-section operations-sidebar">
      <!-- Appointment Time & Doctor adjust (Error 1 Target) -->
      <div className="detail-widget">
        <h3>⏰ 진료 예약 시간 & 담당 의사 변경</h3>
        {selectedAppointment ? (
          <div className="detail-panel">
            <p>예약 ID: <strong>{selectedAppointment.id}</strong> ({selectedAppointment.patientName} 환자)</p>

            <div className="form-group">
              <label>담당 의사 변경:</label>
              <select 
                value={selectedAppointment.doctorId || 'DOC-01'} 
                onChange={(e) => {
                  const docNames = {
                    'DOC-01': '김내과 전문의',
                    'DOC-02': '이심장 전문의',
                    'DOC-03': '박정형 전문의',
                    'DOC-04': '최신경 전문의',
                    'DOC-05': '강피부 전문의'
                  };
                  setSelectedAppointment({
                    ...selectedAppointment,
                    doctorId: e.target.value,
                    doctorName: docNames[e.target.value] || '전문의'
                  });
                }}
              >
                <option value="DOC-01">김내과 전문의 (소화기내과)</option>
                <option value="DOC-02">이심장 전문의 (순환기내과)</option>
                <option value="DOC-03">박정형 전문의 (정형외과)</option>
                <option value="DOC-04">최신경 전문의 (신경과)</option>
                <option value="DOC-05">강피부 전문의 (피부과)</option>
              </select>
            </div>

            <div className="form-group">
              <label>예약 일시 조정:</label>
              <div className="input-row">
                <input 
                  type="date" 
                  value={selectedAppointment.date || '2026-08-10'} 
                  onChange={(e) => setSelectedAppointment({ ...selectedAppointment, date: e.target.value })}
                />
                <select 
                  value={selectedAppointment.timeSlot || '10:00'} 
                  onChange={(e) => setSelectedAppointment({ ...selectedAppointment, timeSlot: e.target.value })}
                >
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:30">11:30</option>
                  <option value="14:00">14:00</option>
                  <option value="15:30">15:30</option>
                </select>
                <button className="save-btn" onClick={() => triggerTimeDoctorRace(selectedAppointment)}>
                  시간 변경 (Error 1)
                </button>
              </div>
              <small className="warn-desc">* 시간 변경(3초 지연 완료) 직후 의사 변경(0.1초 완료) 시, 3초 뒤 이전 의사가 동봉되어 롤백 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-apt-btn" onClick={() => triggerCancelSymptomsConflict(selectedAppointment)}>
                ⚡ 예약 취소 후 증상 수정 (Error 2)
              </button>
              <small className="warn-desc">* 예약 취소(0.5초 완료) 직후 증상 수정(4초 지연 완료) 시, 늦은 수정 요청이 취소된 예약을 확정으로 재활성화시킴 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">수정할 진료 예약을 선택하세요.</div>
        )}
      </div>

      <!-- Test result inspector & report 404 test (Error 7 Target) -->
      <div className="detail-widget">
        <h3>🔬 검사 결과 리포트 상세 & 파일 미리보기</h3>
        {selectedTestDetail ? (
          <div className="detail-panel">
            <p>검사명: <strong>{selectedTestDetail.testName}</strong></p>
            <p>환자명: <strong>{selectedTestDetail.patientName}</strong> | 검사일: <strong>{selectedTestDetail.testedAt}</strong></p>
            <p>검사 소견: <strong style={{ color: 'var(--color-primary)' }}>{selectedTestDetail.resultValue}</strong></p>

            <div className="form-group">
              <label>임상 결과 보고서 파일 (PDF):</label>
              <div className="report-file-frame">
                {selectedTestDetail.reportUrl ? (
                  <a href={selectedTestDetail.reportUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-text)', fontSize: '0.72rem' }}>
                    📄 {selectedTestDetail.reportUrl} (다운로드)
                  </a>
                ) : (
                  <div className="empty-lbl-dark">보고서 파일 링크 없음</div>
                )}
              </div>
              <small className="warn-desc">* 파일명에 한글/공백 포함 시('혈액 검사 결과 (최종).pdf') 이중 인코딩으로 상세 탭에서만 링크가 404로 깨짐 (Error 7)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">상세 정보를 보려면 검사 결과를 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
