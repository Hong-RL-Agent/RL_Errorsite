import React from "react";

export default function Footer({ onPreparing }) {
  return (
    <footer className="site-footer">
      <button onClick={onPreparing}>대회 일정</button>
      <button onClick={onPreparing}>API 이용 안내</button>
      <button onClick={onPreparing}>커뮤니티 링크</button>
      <button onClick={onPreparing}>고객센터</button>
    </footer>
  );
}
