import React from 'react';
import { Plane } from 'lucide-react';

export default function Header() {
  return (
    <header className="header" data-bug-id="site002-bug03">
      <div className="header-inner">
        <div className="logo">
          <Plane size={28} />
          BlueSky Travel
        </div>
        <nav>
          <ul className="nav-links">
            <li><a href="#">항공권</a></li>
            <li><a href="#">호텔</a></li>
            <li><a href="#">렌터카</a></li>
            <li><a href="#">패키지</a></li>
          </ul>
        </nav>
        <div className="user-actions">
          <button className="btn-outline">로그인</button>
        </div>
      </div>
    </header>
  );
}
