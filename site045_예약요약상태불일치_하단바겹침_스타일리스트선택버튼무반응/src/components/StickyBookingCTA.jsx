/* INTENTIONAL GUI BUG: site045-bug02
   Type: sticky-cta-overlap
   Description: 데스크톱 sticky 예약 CTA bar를 추가했지만 본문 하단 여백을 확보하지 않아 리뷰 텍스트를 덮음.
*/
export default function StickyBookingCTA({ selectedService, selectedStylist, selectedDate, selectedTime }) {
  return (
    <div className="sticky-cta" data-bug-id="site045-bug02">
      <div>
        <span>예약 대기 중</span>
        <strong>{selectedService?.name}</strong>
        <small>{selectedStylist?.name} · {selectedDate} · {selectedTime}</small>
      </div>
      <button type="button">예약 최종 확인</button>
    </div>
  );
}
