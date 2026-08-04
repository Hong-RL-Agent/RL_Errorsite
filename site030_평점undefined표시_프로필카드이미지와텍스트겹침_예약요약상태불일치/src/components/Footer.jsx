import React from "react";

export default function Footer({ onPreparing }) {
  return (
    <footer className="site-footer">
      <button onClick={onPreparing}>이용 방법</button>
      <button onClick={onPreparing}>멘토 지원</button>
      <button onClick={onPreparing}>환불 정책</button>
      <button onClick={onPreparing}>고객센터</button>
    </footer>
  );
}
