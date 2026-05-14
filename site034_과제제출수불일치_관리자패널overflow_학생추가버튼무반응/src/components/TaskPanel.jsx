import React from "react";

const tasks = ["미제출 학생 리마인드 발송", "React 실전 4주차 과제 검토", "UX 리서치 출석 이상자 확인", "데이터 분석 퀴즈 재채점", "AI 기초 공지 예약", "강의 만족도 리포트 공유", "신규 수강생 온보딩", "월간 성적 리포트 마감", "튜터 피드백 확인"];

export default function TaskPanel({ onPreparing }) {
  return (
    <aside className="task-panel" data-bug-id="site034-bug02">
      <span>Today</span>
      <h2>오늘 처리할 작업</h2>
      <div className="task-list">{tasks.map((task) => <button key={task} onClick={onPreparing}>{task}</button>)}</div>
      <div className="quick-actions"><button onClick={onPreparing}>메일 발송</button><button onClick={onPreparing}>리포트 생성</button><button onClick={onPreparing}>수강생 초대</button></div>
    </aside>
  );
}
