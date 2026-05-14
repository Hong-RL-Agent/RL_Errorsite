import React from "react";

export default function Footer({ onPreparing }) {
  return <footer className="site-footer"><button onClick={onPreparing}>배송 안내</button><button onClick={onPreparing}>교환/환불</button><button onClick={onPreparing}>기업 주문</button><button onClick={onPreparing}>고객센터</button></footer>;
}
