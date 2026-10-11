const { run, clearData } = require("./init");

const boardNames = ["개발", "디자인", "취업", "일상", "여행", "음악", "영화", "독서", "질문과 답변", "정보 공유", "생산성", "하드웨어", "AI", "창작", "스터디"];
const tags = ["react", "sqlite", "기획", "포트폴리오", "면접", "여행기", "책추천", "질문", "토론", "툴링", "디자인시스템", "커리어"];

function pad(prefix, index, width = 4) { return `${prefix}${String(index).padStart(width, "0")}`; }
function dateFor(index) { return `2026-10-${String((index % 28) + 1).padStart(2, "0")}T${String(index % 24).padStart(2, "0")}:00:00.000Z`; }

async function seed(db) {
  await clearData(db);
  for (let i = 1; i <= 120; i += 1) await run(db, "INSERT INTO users VALUES (?, ?, ?, ?)", [i, i === 1 ? "정원지기" : `회원${i}`, `garden${i}`, dateFor(i)]);
  for (let i = 1; i <= 15; i += 1) await run(db, "INSERT INTO boards VALUES (?, ?, ?)", [pad("BD", i, 3), boardNames[i - 1], `${boardNames[i - 1]} 주제의 질문과 토론 게시판입니다.`]);
  for (let i = 1; i <= 250; i += 1) {
    const boardId = i <= 45 ? "BD001" : pad("BD", ((i - 1) % 15) + 1, 3);
    await run(db, "INSERT INTO threads VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
      pad("T", i), boardId, ((i - 1) % 120) + 1,
      `${boardNames[((i - 1) % 15)]} 토론 주제 ${i}`,
      `이 글은 ThreadGarden의 정보형 커뮤니티 검증을 위한 본문입니다. 서로 다른 사례와 질문을 담아 댓글과 북마크 흐름을 확인합니다. 항목 ${i}.`,
      `${tags[i % tags.length]},${tags[(i + 3) % tags.length]}`,
      i % 4 === 0 ? 1 : 0, 1 + (i * 7) % 80, 1 + (i * 5) % 30, dateFor(i), dateFor(i), 0
    ]);
  }
  for (let i = 1; i <= 500; i += 1) await run(db, "INSERT INTO replies VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [pad("R", i), pad("T", ((i - 1) % 250) + 1), i % 5 === 0 ? pad("R", Math.max(1, i - 1)) : null, ((i * 3) % 120) + 1, `댓글과 답글 내용 ${i}`, dateFor(i), dateFor(i), 0]);
  for (let i = 1; i <= 300; i += 1) await run(db, "INSERT INTO recommendations VALUES (?, ?, ?, ?)", [pad("RC", i), ((i * 5) % 120) + 1, pad("T", ((i * 2) % 250) + 1), dateFor(i)]);
  for (let i = 1; i <= 180; i += 1) await run(db, "INSERT INTO bookmarks VALUES (?, ?, ?, ?)", [pad("BM", i), i % 4 === 0 ? 1 : ((i * 7) % 120) + 1, pad("T", ((i * 3) % 250) + 1), dateFor(i)]);
  for (let i = 1; i <= 100; i += 1) await run(db, "INSERT INTO drafts VALUES (?, ?, ?, ?, ?, ?, ?)", [pad("D", i), i % 5 === 0 ? 1 : ((i * 9) % 120) + 1, pad("BD", ((i - 1) % 15) + 1, 3), `임시저장 제목 ${i}`, `작성 중인 초안 본문 ${i}`, `${tags[i % tags.length]},${tags[(i + 1) % tags.length]}`, dateFor(i)]);
  for (let i = 1; i <= 100; i += 1) await run(db, "INSERT INTO resolve_logs VALUES (?, ?, ?, ?)", [pad("SV", i), pad("T", ((i * 4) % 250) + 1), ((i * 11) % 120) + 1, dateFor(i)]);
  for (let i = 1; i <= 120; i += 1) await run(db, "INSERT INTO notifications VALUES (?, ?, ?, ?, ?)", [pad("N", i), i % 3 === 0 ? 1 : ((i * 13) % 120) + 1, `새 댓글과 추천 알림 ${i}`, i % 4 === 0 ? 1 : 0, dateFor(i)]);
  for (let i = 1; i <= 150; i += 1) await run(db, "INSERT INTO activity VALUES (?, ?, ?, ?)", [pad("A", i), i % 4 === 0 ? 1 : ((i * 17) % 120) + 1, `커뮤니티 활동 로그 ${i}`, dateFor(i)]);
}

module.exports = { seed };
