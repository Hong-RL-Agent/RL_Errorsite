const crypto = require("crypto");
const { run, clearData } = require("./init");

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function pad(prefix, index, width = 4) {
  return `${prefix}${String(index).padStart(width, "0")}`;
}

function dateFor(index) {
  return `2026-09-${String((index % 28) + 1).padStart(2, "0")}T${String(index % 24).padStart(2, "0")}:00:00.000Z`;
}

async function seed(db) {
  await clearData(db);

  for (let i = 1; i <= 120; i += 1) {
    await run(db, "INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
      i, `account${i}`, `user${i}@accountflow.test`, hash(i === 1 ? "TestPass1!" : `Pass${i}!safe`),
      i === 1 ? "테스트사용자" : `사용자${i}`, dateFor(i), i % 19 === 0 ? "inactive" : "active", null
    ]);
    await run(db, "INSERT INTO profiles VALUES (?, ?, ?, ?, ?)", [
      i, i === 1 ? "플로우관리자" : `닉네임${i}`, `010-${String(1000 + i).padStart(4, "0")}-${String(2000 + i).padStart(4, "0")}`,
      `https://api.dicebear.com/8.x/initials/svg?seed=AF${i}`, `AccountFlow 테스트 프로필 ${i}`
    ]);
    await run(db, "INSERT INTO settings VALUES (?, ?, ?, ?, ?, ?)", [i, i % 2, i % 3 === 0 ? 1 : 0, i % 4 === 0 ? 0 : 1, "ko-KR", "Asia/Seoul"]);
  }

  for (let i = 1; i <= 100; i += 1) {
    await run(db, "INSERT INTO signup_progress VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [
      pad("SG", i), `pending${i}@accountflow.test`, `pending${i}`, `가입진행${i}`, hash(`Pending${i}!`), i % 2 ? "account" : "verified", JSON.stringify({ index: i }), dateFor(i), dateFor(i)
    ]);
  }

  for (let i = 1; i <= 120; i += 1) {
    await run(db, "INSERT INTO verifications VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
      pad("VF", i), pad("SG", ((i - 1) % 100) + 1), `pending${((i - 1) % 100) + 1}@accountflow.test`, String(100000 + i), i % 3, dateFor(i + 5), i % 4 === 0 ? "expired" : i % 5 === 0 ? "confirmed" : "sent", dateFor(i)
    ]);
  }

  for (let i = 1; i <= 150; i += 1) {
    await run(db, "INSERT INTO profile_changes VALUES (?, ?, ?, ?, ?, ?)", [pad("PC", i), ((i - 1) % 120) + 1, i % 2 ? "nickname" : "phone", `old${i}`, `new${i}`, dateFor(i)]);
  }

  for (let i = 1; i <= 120; i += 1) {
    await run(db, "INSERT INTO notifications VALUES (?, ?, ?, ?, ?)", [pad("N", i), i % 3 === 0 ? 1 : ((i - 1) % 120) + 1, `계정 보안 및 설정 알림 ${i}`, i % 4 === 0 ? 1 : 0, dateFor(i)]);
  }

  for (let i = 1; i <= 200; i += 1) {
    await run(db, "INSERT INTO activity VALUES (?, ?, ?, ?)", [pad("A", i), i % 4 === 0 ? 1 : ((i - 1) % 120) + 1, `계정 활동 로그 ${i}`, dateFor(i)]);
  }

  for (let i = 1; i <= 8; i += 1) {
    await run(db, "INSERT INTO onboarding VALUES (?, ?, ?, ?, ?)", [pad("OB", i, 2), i, `Guide ${i}`, `AccountFlow 활용 단계 ${i}`, `프로필, 알림, 보안 설정을 관리하는 방법을 안내합니다. ${i}번째 안내입니다.`]);
  }
}

module.exports = { seed, hash };
