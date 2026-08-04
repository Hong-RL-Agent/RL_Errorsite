import React from "react";

export default function CheckoutDrawer({ isOpen, onClose, selectedEvent, summaryEvent, selectedTier }) {
  const ticketPrice = selectedTier?.price ?? 0;
  const serviceFee = 3000;
  const total = ticketPrice + serviceFee;

  return (
    <aside className={`checkout-drawer ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
      <div className="drawer-header">
        <span>Checkout</span>
        <button onClick={onClose}>닫기</button>
      </div>
      <div className="drawer-body">
        <p className="current-selection">현재 선택 카드: {selectedEvent?.title}</p>
        {/* INTENTIONAL GUI BUG: site029-bug03 */}
        {/* Type: ticket-selection-state-mismatch */}
        {/* Description: 선택한 공연 state를 checkout 요약 state에 다시 반영하지 않아 이전 공연명이 남음. */}
        <h2 data-bug-id="site029-bug03">{summaryEvent?.title ?? "공연 선택 필요"}</h2>
        <dl>
          <div>
            <dt>공연장</dt>
            <dd>{summaryEvent?.venue ?? "-"}</dd>
          </div>
          <div>
            <dt>일정</dt>
            <dd>{summaryEvent?.date ?? "-"}</dd>
          </div>
          <div>
            <dt>좌석 등급</dt>
            <dd>{selectedTier?.tierName ?? "-"}</dd>
          </div>
          <div>
            <dt>티켓 금액</dt>
            <dd>{ticketPrice.toLocaleString("ko-KR")}원</dd>
          </div>
          <div>
            <dt>예매 수수료</dt>
            <dd>{serviceFee.toLocaleString("ko-KR")}원</dd>
          </div>
        </dl>
        <div className="drawer-perks">
          <strong>포함 혜택</strong>
          {(selectedTier?.benefits ?? []).map((benefit) => (
            <span key={benefit}>{benefit}</span>
          ))}
        </div>
      </div>
      <div className="drawer-footer" data-bug-id="site029-bug02">
        <span>총 결제 금액</span>
        <strong>{total.toLocaleString("ko-KR")}원</strong>
        <button>결제하기</button>
      </div>
    </aside>
  );
}
