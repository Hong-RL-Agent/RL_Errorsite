import React, { useState } from "react";

const courses = {
  Dinner: ["아뮤즈 부쉬", "전복 타르트", "한우 웰링턴", "초콜릿 수플레"],
  Pairing: ["샴페인", "화이트 부르고뉴", "보르도 블렌드", "디저트 와인"],
  Vegetarian: ["허브 샐러드", "버섯 라비올리", "구운 셀러리악", "시트러스 소르베"]
};

export default function CourseTabs() {
  const [active, setActive] = useState("Dinner");
  return (
    <section className="course-section">
      <div className="section-heading"><span>Course menu</span><h2>코스 소개</h2></div>
      <div className="course-tabs">
        {Object.keys(courses).map((course) => <button key={course} className={active === course ? "active" : ""} onClick={() => setActive(course)}>{course}</button>)}
      </div>
      <div className="course-list">{courses[active].map((item) => <span key={item}>{item}</span>)}</div>
    </section>
  );
}
