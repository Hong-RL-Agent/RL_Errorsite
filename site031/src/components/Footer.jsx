import React from "react";

export default function Footer({ onPreparing }) {
  return (
    <footer className="site-footer">
      <button onClick={onPreparing}>이용 안내</button>
      <button onClick={onPreparing}>제휴 업체 등록</button>
      <button onClick={onPreparing}>취소/환불</button>
      <button onClick={onPreparing}>고객센터</button>
    </footer>
  );
}
