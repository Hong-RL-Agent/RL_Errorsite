import React, { useState, useEffect } from 'react';
import { 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  ShieldCheck, 
  Heart, 
  Share2, 
  CheckCircle2, 
  Calendar, 
  Tag, 
  MessageSquare, 
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
import Modal from '../components/Modal';
import ReviewCard from '../components/ReviewCard';
import CouponCard from '../components/CouponCard';
import { fetchApi, getCurrentUser } from '../api/client';

export default function ExperienceDetail({ 
  experienceId, 
  onBack, 
  onReservationComplete, 
  onShowToast, 
  onNavigateMessages 
}) {
  const [experience, setExperience] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking state
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [participants, setParticipants] = useState(1);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);

  // Modals
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');

  useEffect(() => {
    if (!experienceId) return;
    setLoading(true);

    fetchApi(`/api/experiences/${experienceId}`)
      .then(data => {
        setExperience(data);
        if (data.availableDates && data.availableDates.length > 0) {
          setSelectedDate(data.availableDates[0]);
        }
        if (data.timeSlots && data.timeSlots.length > 0) {
          setSelectedTime(data.timeSlots[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        if (onShowToast) onShowToast(err.message, 'error');
        setLoading(false);
      });

    fetchApi(`/api/reviews?experienceId=${experienceId}`)
      .then(data => setReviews(data))
      .catch(() => {});

    fetchApi('/api/coupons')
      .then(data => setCoupons(data))
      .catch(() => {});
  }, [experienceId]);

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        체험 상세 정보를 불러오는 중입니다...
      </div>
    );
  }

  if (!experience) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <h3>체험 정보를 찾을 수 없습니다.</h3>
        <button onClick={onBack} className="btn btn-primary" style={{ marginTop: 16 }}>
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  // Price calculation
  const subtotal = experience.price * participants;
  const finalPrice = Math.max(0, subtotal - discountAmount);

  // Handle Coupon Apply (Calls backend POST /api/coupons/apply - SEC-393)
  const handleApplyCoupon = (couponToApply) => {
    const code = couponToApply?.code || couponCodeInput;
    if (!code) return;

    fetchApi('/api/coupons/apply', {
      method: 'POST',
      body: JSON.stringify({
        couponCode: code,
        experienceId: experience.id,
        subtotal: subtotal,
        category: experience.category
      })
    })
      .then(res => {
        setAppliedCoupon(res.coupon);
        setDiscountAmount(res.discountAmount);
        setShowCouponModal(false);
        if (onShowToast) onShowToast(`'${res.coupon.name}'이(가) 적용되었습니다 (-${res.discountAmount.toLocaleString()}원)`, 'success');
      })
      .catch(err => {
        if (onShowToast) onShowToast(err.message, 'error');
      });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  // Handle Booking Creation (Calls backend POST /api/reservations - SEC-391)
  const handleCreateReservation = (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      if (onShowToast) onShowToast('날짜와 시간을 선택해주세요.', 'error');
      return;
    }

    setIsBookingSubmitting(true);

    // SEC-391: Client sends totalPrice calculated on frontend
    fetchApi('/api/reservations', {
      method: 'POST',
      body: JSON.stringify({
        experienceId: experience.id,
        date: selectedDate,
        time: selectedTime,
        participants: participants,
        totalPrice: finalPrice,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        discountAmount: discountAmount
      })
    })
      .then(res => {
        setIsBookingSubmitting(false);
        if (onShowToast) onShowToast('체험 예약이 성공적으로 완료되었습니다!', 'success');
        if (onReservationComplete) {
          onReservationComplete(res);
        }
      })
      .catch(err => {
        setIsBookingSubmitting(false);
        if (onShowToast) onShowToast(err.message, 'error');
      });
  };

  // Send message to host
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageContent.trim()) return;

    fetchApi('/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        receiverId: experience.hostId,
        experienceId: experience.id,
        content: messageContent
      })
    })
      .then(() => {
        setShowMessageModal(false);
        setMessageContent('');
        if (onShowToast) onShowToast('호스트에게 문의 메시지를 전송했습니다.', 'success');
        if (onNavigateMessages) onNavigateMessages();
      })
      .catch(err => {
        if (onShowToast) onShowToast(err.message, 'error');
      });
  };

  return (
    <div id="experience-detail-container" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Back Button */}
      <div>
        <button 
          id="btn-back-to-explore"
          onClick={onBack}
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <ChevronLeft size={16} /> 체험 목록으로
        </button>
      </div>

      {/* Main Grid: Details (Left) + Booking Sticky Card (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: 32, alignItems: 'start' }}>
        {/* Left Column: Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Header & Badges */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span className="badge badge-blue">{experience.category.toUpperCase()}</span>
              <span className="badge badge-gray"><MapPin size={12} /> {experience.region} · {experience.location}</span>
              {experience.visibility === 'private' && (
                <span className="badge badge-yellow">프라이빗 VIP 전용</span>
              )}
            </div>

            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--primary-navy)', lineHeight: 1.3, marginBottom: 12 }}>
              {experience.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                <strong style={{ color: 'var(--text-main)' }}>{experience.rating}</strong>
                <span style={{ color: 'var(--text-muted)' }}>({experience.reviewCount}개의 후기)</span>
              </div>
              <span style={{ color: 'var(--border-color)' }}>|</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
                <Clock size={16} /> {experience.duration}
              </div>
              <span style={{ color: 'var(--border-color)' }}>|</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
                <Users size={16} /> 최대 {experience.maxParticipants}명
              </div>
            </div>
          </div>

          {/* Main Hero Image */}
          <div style={{
            position: 'relative',
            width: '100%',
            paddingTop: '56.25%',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <img 
              src={experience.image} 
              alt={experience.title}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>

          {/* Host Info Box */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <img 
                src={experience.hostAvatar} 
                alt={experience.hostName} 
                style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 600 }}>진행 호스트</p>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary-navy)' }}>{experience.hostName}</h4>
              </div>
            </div>

            <button 
              id="btn-contact-host"
              onClick={() => setShowMessageModal(true)}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <MessageSquare size={14} />
              <span>호스트에게 문의</span>
            </button>
          </div>

          {/* Description */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            border: '1px solid var(--border-color)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 14 }}>
              체험 소개
            </h3>
            <p style={{ fontSize: 15, color: 'var(--text-main)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {experience.description}
            </p>
          </div>

          {/* Included Items & Location */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 12 }}>
                포함 사항
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                {experience.includes?.map((inc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-main)' }}>
                    <CheckCircle2 size={16} color="var(--sky-blue)" />
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 8 }}>
                만나는 장소
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                <MapPin size={15} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                {experience.location}
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 8 }}>
                취소 및 환불 정책
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <ShieldCheck size={15} style={{ verticalAlign: 'middle', marginRight: 4, color: 'var(--success)' }} />
                {experience.refundPolicy}
              </p>
            </div>
          </div>

          {/* Reviews Section */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary-navy)' }}>
                참가자 실제 후기 ({reviews.length})
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star size={18} fill="#f59e0b" color="#f59e0b" />
                <strong style={{ fontSize: 17, color: 'var(--primary-navy)' }}>{experience.rating}</strong>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/ 5.0</span>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
                아직 등록된 리뷰가 없습니다. 첫 번째 리뷰를 남겨보세요!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {reviews.map(rev => (
                  <ReviewCard key={rev.id} review={rev} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Booking Card */}
        <div style={{ position: 'sticky', top: 96 }}>
          <form 
            onSubmit={handleCreateReservation}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20
            }}
          >
            {/* Price Per Person */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-navy)' }}>
                  {Number(experience.price).toLocaleString()}원
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 4 }}>/ 1인</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                <Star size={14} fill="#f59e0b" color="#f59e0b" />
                <strong>{experience.rating}</strong>
                <span style={{ color: 'var(--text-muted)' }}>({experience.reviewCount})</span>
              </div>
            </div>

            {/* Date Selection */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                체험 날짜 선택
              </label>
              <select 
                id="booking-date-select"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="form-select"
                required
              >
                {experience.availableDates?.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Time Slot Selection */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <Clock size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                시간대 (회차) 선택
              </label>
              <select 
                id="booking-time-select"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="form-select"
                required
              >
                {experience.timeSlots?.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Participants Selector (SEC-391) */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <Users size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                참가 인원
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  id="btn-decrement-participants"
                  onClick={() => setParticipants(Math.max(1, participants - 1))}
                  className="btn btn-outline"
                  style={{ width: 40, height: 40, padding: 0 }}
                >
                  -
                </button>
                <div 
                  id="participant-count-display"
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: 15,
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 0',
                    backgroundColor: 'var(--cream-bg)'
                  }}
                >
                  {participants}명
                </div>
                <button
                  type="button"
                  id="btn-increment-participants"
                  onClick={() => setParticipants(Math.min(experience.maxParticipants || 10, participants + 1))}
                  className="btn btn-outline"
                  style={{ width: 40, height: 40, padding: 0 }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Coupon Section (SEC-393) */}
            <div style={{
              backgroundColor: 'var(--cream-bg)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: appliedCoupon ? 8 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
                  <Tag size={15} color="var(--warm-yellow)" />
                  <span>할인 쿠폰</span>
                </div>
                <button 
                  type="button" 
                  id="btn-open-coupon-modal"
                  onClick={() => setShowCouponModal(true)}
                  style={{ fontSize: 12, fontWeight: 700, color: 'var(--sky-blue)' }}
                >
                  {appliedCoupon ? '변경' : '쿠폰 선택'}
                </button>
              </div>

              {appliedCoupon && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--primary-navy)', fontWeight: 600 }}>{appliedCoupon.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#ef4444', fontWeight: 700 }}>-{discountAmount.toLocaleString()}원</span>
                    <button type="button" onClick={handleRemoveCoupon} style={{ color: 'var(--text-light)', fontSize: 11 }}>취소</button>
                  </div>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div style={{
              borderTop: '1px solid var(--border-light)',
              paddingTop: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              fontSize: 13
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>{experience.price.toLocaleString()}원 × {participants}명</span>
                <span>{subtotal.toLocaleString()}원</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444', fontWeight: 600 }}>
                  <span>쿠폰 할인</span>
                  <span>-{discountAmount.toLocaleString()}원</span>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 16,
                fontWeight: 800,
                color: 'var(--primary-navy)',
                marginTop: 6,
                paddingTop: 8,
                borderTop: '1px dashed var(--border-color)'
              }}>
                <span>총 결제 금액</span>
                <span id="booking-total-price" style={{ color: 'var(--sky-blue)' }}>{finalPrice.toLocaleString()}원</span>
              </div>
            </div>

            {/* Submit Reservation Button */}
            <button
              type="submit"
              id="btn-submit-booking"
              disabled={isBookingSubmitting}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
            >
              {isBookingSubmitting ? '예약 처리 중...' : '체험 예약하기'}
            </button>

            <p style={{ fontSize: 11, color: 'var(--text-light)', textAlign: 'center' }}>
              예약 확정 전까지 결제는 안전하게 보호됩니다.
            </p>
          </form>
        </div>
      </div>

      {/* Coupon Modal */}
      <Modal
        isOpen={showCouponModal}
        onClose={() => setShowCouponModal(false)}
        title="사용 가능한 쿠폰"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Coupon Code Direct Input */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input 
              id="input-coupon-code"
              type="text"
              placeholder="쿠폰 코드 직접 입력 (예: WELCOME10)"
              value={couponCodeInput}
              onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
              className="form-input"
            />
            <button 
              id="btn-apply-coupon-code"
              type="button" 
              onClick={() => handleApplyCoupon(null)}
              className="btn btn-navy"
            >
              등록
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {coupons.map(c => (
              <CouponCard 
                key={c.code}
                coupon={c}
                isSelected={appliedCoupon?.code === c.code}
                onApply={handleApplyCoupon}
              />
            ))}
          </div>
        </div>
      </Modal>

      {/* Host Message Modal */}
      <Modal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        title={`${experience.hostName}님에게 문의`}
      >
        <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">문의 내용</label>
            <textarea
              id="textarea-host-message"
              rows={4}
              placeholder="체험 준비물, 집결 장소, 주차 등 궁금한 점을 남겨주세요."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className="form-textarea"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" onClick={() => setShowMessageModal(false)} className="btn btn-outline">
              취소
            </button>
            <button id="btn-submit-host-message" type="submit" className="btn btn-primary">
              메시지 보내기
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
