import React from "react";

const items = ["대시보드", "학생 관리", "강의 관리", "과제 관리", "성적 리포트", "설정"];

export default function AdminSidebar() {
  return <aside className="admin-sidebar">{items.map((item, index) => <button key={item} className={index === 0 ? "active" : ""}>{item}</button>)}</aside>;
}
