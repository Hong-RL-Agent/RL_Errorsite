import React from "react";

export default function Footer({ onPreparing }) {
  return <footer className="site-footer"><button onClick={onPreparing}>관리자 안내</button><button onClick={onPreparing}>개인정보 처리방침</button><button onClick={onPreparing}>고객센터</button></footer>;
}
