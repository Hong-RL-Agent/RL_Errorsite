import React, { useState, useEffect } from 'react';
import { X, Check, ChevronRight, ChevronLeft, ShieldCheck, Ticket } from 'lucide-react';
import { createRegistration } from '../lib/api';

export default function RegistrationModal({
  event,
  filterContext = {},
  currentUser,
  isOpen,
  onClose,
  onRegistrationSuccess,
  onNotify
}) {
  const [step, setStep] = useState(1);
  const [ticketTier, setTicketTier] = useState('STANDARD');
  const [attendeeCount, setAttendeeCount] = useState(1);
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [attendeePhone, setAttendeePhone] = useState('');
  const [attendeeOrg, setAttendeeOrg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setAttendeeName(currentUser.name || '');
      setAttendeeEmail(currentUser.email || '');
      setAttendeePhone(currentUser.phone || '');
      setAttendeeOrg(currentUser.company || '');
    }
  }, [currentUser]);

  if (!isOpen || !event) return null;

  const unitPrice = ticketTier === 'VIP' ? event.vip_price : event.standard_price;
  const totalAmount = unitPrice * attendeeCount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!attendeeName.trim() || !attendeeEmail.trim() || !attendeePhone.trim()) {
      onNotify && onNotify('참석자 필수 정보를 입력해주세요.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await createRegistration({
        eventId: event.id,
        userId: currentUser.id,
        attendeeName: attendeeName.trim(),
        attendeeEmail: attendeeEmail.trim(),
        attendeePhone: attendeePhone.trim(),
        attendeeOrg: attendeeOrg.trim(),
        ticketTier,
        attendeeCount: parseInt(attendeeCount, 10),
        filterContext
      });

      if (res.success) {
        onNotify && onNotify(`참가 신청이 완료되었습니다! [${res.data.reg_code}]`, 'success');
        onRegistrationSuccess && onRegistrationSuccess(res.data);
        onClose();
      }
    } catch (err) {
      onNotify && onNotify(err.message || '참가 신청 실패', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-header">
          <div>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#7C3AED', background: '#F5F3FF', padding: '2px 8px', borderRadius: '4px' }}>
              STEP {step} / 3
            </span>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginTop: '4px' }}>
              {event.title} 참가 신청
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* STEP 1: 참가권 및 인원 선택 */}
            {step === 1 && (
              <div>
                <label className="form-label">참가권 종류 선택</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div
                    onClick={() => setTicketTier('STANDARD')}
                    style={{
                      padding: '16px',
                      borderRadius: '14px',
                      border: ticketTier === 'STANDARD' ? '2px solid #7C3AED' : '1.5px solid #E2E8F0',
                      background: ticketTier === 'STANDARD' ? '#F5F3FF' : '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: '800', fontSize: '14px', color: '#0F172A', marginBottom: '4px' }}>
                      스탠다드 패스
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px' }}>
                      전체 키노트 및 트랙 세션 입장
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#7C3AED' }}>
                      {event.standard_price.toLocaleString()}원
                    </div>
                  </div>

                  <div
                    onClick={() => setTicketTier('VIP')}
                    style={{
                      padding: '16px',
                      borderRadius: '14px',
                      border: ticketTier === 'VIP' ? '2px solid #F97316' : '1.5px solid #E2E8F0',
                      background: ticketTier === 'VIP' ? '#FFF7ED' : '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: '800', fontSize: '14px', color: '#0F172A', marginBottom: '4px' }}>
                      VIP 올액세스 패스
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px' }}>
                      네트워킹 디너 & VIP 라운지 포함
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#F97316' }}>
                      {event.vip_price.toLocaleString()}원
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">참석 인원 수</label>
                  <select
                    className="form-select"
                    value={attendeeCount}
                    onChange={(e) => setAttendeeCount(parseInt(e.target.value, 10))}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n}명</option>
                    ))}
                  </select>
                </div>

                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>예상 금액</span>
                  <span style={{ fontWeight: '800', color: '#7C3AED', fontSize: '15px' }}>
                    {totalAmount.toLocaleString()}원
                  </span>
                </div>
              </div>
            )}

            {/* STEP 2: 참석자 정보 등록 */}
            {step === 2 && (
              <div>
                <div className="form-group">
                  <label className="form-label">참석자 성명 *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">참석자 이메일 *</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">휴대폰 연락처 *</label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    value={attendeePhone}
                    onChange={(e) => setAttendeePhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">소속 기업 / 대학 / 기관</label>
                  <input
                    type="text"
                    className="form-input"
                    value={attendeeOrg}
                    onChange={(e) => setAttendeeOrg(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* STEP 3: 최종 신청 확인 */}
            {step === 3 && (
              <div>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '16px', marginBottom: '16px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>행사명</span>
                    <span style={{ fontWeight: '700' }}>{event.title}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>일시 / 장소</span>
                    <span style={{ fontWeight: '700' }}>{event.event_date} / {event.venue}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>선택 참가권</span>
                    <span style={{ fontWeight: '700', color: '#7C3AED' }}>{ticketTier} 패스</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>신청 인원</span>
                    <span style={{ fontWeight: '700' }}>{attendeeCount}명</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>대표 참석자</span>
                    <span style={{ fontWeight: '700' }}>{attendeeName} ({attendeeOrg || '개인'})</span>
                  </div>
                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '8px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '800' }}>최종 결제 금액</span>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: '#F97316' }}>
                      {totalAmount.toLocaleString()}원
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#059669', background: '#ECFDF5', padding: '10px 14px', borderRadius: '10px' }}>
                  <ShieldCheck size={16} />
                  <span>신청 즉시 전자 참가증이 발급되며, 행사 전일까지 무료 취소 가능합니다.</span>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            {step > 1 ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep(step - 1)}
              >
                <ChevronLeft size={16} />
                <span>이전</span>
              </button>
            ) : (
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                취소
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep(step + 1)}
              >
                <span>다음</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-orange"
              >
                <Check size={16} />
                <span>{submitting ? '신청 처리 중...' : '참가 신청 확정'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
