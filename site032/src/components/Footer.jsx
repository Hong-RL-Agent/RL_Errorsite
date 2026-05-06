import React from "react";

export default function Footer({ onPreparing }) {
  return (
    <footer className="site-footer">
      <button onClick={onPreparing}>예약 정책</button>
      <button onClick={onPreparing}>알레르기 안내</button>
      <button onClick={onPreparing}>단체 예약 문의</button>
      <button onClick={onPreparing}>고객센터</button>
    </footer>
  );
}
