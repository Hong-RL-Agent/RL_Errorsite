import React from "react";

export default function Header({ query, onQueryChange, purposes, purpose, onPurposeChange, region, onRegionChange, onPreparing }) {
  return (
    <header className="site-header">
      <a className="logo" href="#top">BloomLane</a>
      <label className="product-search"><span>상품 검색</span><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="꽃다발 이름 검색" /></label>
      <label><span>용도</span><select value={purpose} onChange={(event) => onPurposeChange(event.target.value)}>{purposes.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span>배송 지역</span><select value={region} onChange={(event) => onRegionChange(event.target.value)}>{["서울", "경기", "인천", "부산"].map((item) => <option key={item}>{item}</option>)}</select></label>
      <button onClick={onPreparing}>장바구니</button>
      <button onClick={onPreparing}>로그인</button>
    </header>
  );
}
