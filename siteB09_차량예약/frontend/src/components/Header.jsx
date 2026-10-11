import React from 'react';
import { NavLink } from 'react-router-dom';
import { useFlow } from '../flows/BookingFlow';

export default function Header() {
  const { compare } = useFlow();
  return (
    <header className="site-header">
      <NavLink to="/" className="logo"><span className="logo-dot" />Roam<b>Drive</b></NavLink>
      <nav className="main-nav" aria-label="주 메뉴">
        <NavLink to="/" end>차량 찾기</NavLink>
        <NavLink to="/compare">차량 비교 <span className="pill">{compare.length}</span></NavLink>
        <NavLink to="/trips">내 예약</NavLink>
        <NavLink to="/log">이용 기록</NavLink>
      </nav>
    </header>
  );
}
