import React from "react";

export default function HealthTips() {
  return (
    <section className="health-tips">
      <div className="section-heading">
        <span>Health tips</span>
        <h2>반려동물 건강 팁</h2>
      </div>
      <div className="tip-grid">
        <article>
          <strong>미용 전 체크</strong>
          <p>피부가 붉거나 긁는 행동이 늘었다면 미용 전 진료 상담을 먼저 예약하세요.</p>
        </article>
        <article>
          <strong>호텔링 준비</strong>
          <p>익숙한 담요와 급여량 메모를 함께 준비하면 낯선 환경 적응에 도움이 됩니다.</p>
        </article>
        <article>
          <strong>예방접종 관리</strong>
          <p>접종 후 하루는 과격한 산책과 목욕을 피하고 컨디션을 관찰하세요.</p>
        </article>
      </div>
    </section>
  );
}
