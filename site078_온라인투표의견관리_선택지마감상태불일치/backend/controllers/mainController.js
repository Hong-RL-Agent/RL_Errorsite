import { readDB, writeDB } from '../services/dataService.js';

export const getVotes = (req, res) => {
  const db = readDB();
  res.json(db.votes);
};

export const searchVotes = (req, res) => {
  const { category, status } = req.query;
  const db = readDB();
  let list = db.votes;

  if (category && category !== 'ALL') {
    list = list.filter(v => v.category === category);
  }
  if (status && status !== 'ALL') {
    list = list.filter(v => v.status === status);
  }

  let delay = 100;
  if (category === 'WELFARE') {
    delay = 3000; // 3.0s delay
  } else if (category === 'TECH') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 카테고리 필터('WELFARE' 3초 지연 ➔ 'TECH' 0.2초 완료)와 상태 필터를 빠르게 변경 시 
  // 오래된 이전 응답(복지)이 최신 목록을 덮어쓰고, 중앙 목록은 오래된 결과, 오른쪽 미리보기는 최신 투표 결과로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const getVoteDetail = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const vote = db.votes.find(v => v.id === id);
  if (!vote) {
    return res.status(404).json({ error: "Vote not found" });
  }
  res.json(vote);
};

export const createVote = (req, res) => {
  const { title, category, options, userId, author } = req.body;
  const db = readDB();

  const newVote = {
    id: `VOTE-${String(db.votes.length + 1).padStart(2, '0')}`,
    title,
    category,
    status: 'OPEN',
    author: author || "익명",
    createdAt: new Date().toISOString().split('T')[0],
    totalVoters: 0,
    options: options.map((optText, i) => ({
      id: `OPT-${String(db.votes.length + 1).padStart(2, '0')}-${String.fromCharCode(65 + i)}`,
      text: optText,
      votesCount: 0
    })),
    userId: userId || "USER_A"
  };

  db.votes.unshift(newVote);
  db.statistics.totalVotesCreated += 1;
  writeDB(db);

  res.json({ success: true, vote: newVote });
};

export const closeVote = (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const vote = db.votes.find(v => v.id === id);
    if (vote) {
      vote.status = 'CLOSED';
      writeDB(db);
      console.log(`[DB VOTE CLOSE] Closed vote ${id} (0.1s done)`);
    }
    res.json({ success: true, vote });
  }, 100);
};

export const updateOptions = (req, res) => {
  const { id } = req.params;
  const { options } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 투표 선택지를 수정한 직후(3초 지연 완료) 투표 마감(0.1초 완료)을 실행하면, 
  // 마감 API는 0.1초 만에 먼저 완료되고 3초 뒤 완료되는 선택지 수정 API 내부에 이전 구형 선택지 목록(options)이 동봉되어 저장되므로 
  // 새로고침 시 투표는 마감 상태이고 선택지는 이전 값으로 돌아가는 레이스 컨디션 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const vote = db.votes.find(v => v.id === id);
    if (vote) {
      vote.options = options;
      writeDB(db);
      console.log(`[DB OPTIONS UPDATE] Updated options for vote ${id} (3s done). Stale option text saved.`);
    }
    res.json({ success: true, vote });
  }, 3000);
};

export const castVote = (req, res) => {
  const { id } = req.params;
  const { voterName, optionId, userId } = req.body;
  const db = readDB();

  const vote = db.votes.find(v => v.id === id);
  if (!vote) {
    return res.status(404).json({ error: "Vote not found" });
  }

  // Check duplicate vote
  const existing = db.participants.find(p => p.voteId === id && p.voterName === voterName);

  if (existing) {
    // INTENTIONAL_ERROR
    // CATEGORY: Backend 중복 요청 오류
    // DESCRIPTION: 중복 투표 참여 요청 시 HTTP 409 Conflict를 반환하지만, 
    // 투표 감사 이력 로그(`voteLogs`)에는 중복 참여 기록이 성공으로 저장되어 통계 감사를 왜곡시키는 결함입니다.
    db.voteLogs.push({
      timestamp: new Date().toISOString(),
      voteId: id,
      voterName,
      status: "DUPLICATE_CAST_LOGGED_AS_SUCCESS"
    });
    writeDB(db);
    console.log(`[DB DUPLICATE CAST LOG] Recorded duplicate vote attempt for ${voterName} on ${id} in audit log!`);

    return res.status(409).json({ error: "이미 해당 투표에 참여하셨습니다." });
  }

  const opt = vote.options.find(o => o.id === optionId);
  if (opt) {
    opt.votesCount += 1;
  }
  vote.totalVoters += 1;

  const newPart = {
    id: `PAR-${String(db.participants.length + 1).padStart(3, '0')}`,
    voteId: id,
    voterName,
    optionId,
    votedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    userId: userId || "USER_A"
  };

  db.participants.push(newPart);
  db.statistics.totalParticipationsCount += 1;
  writeDB(db);

  res.json({ success: true, vote });
};

export const deleteParticipant = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.participants = db.participants.filter(p => p.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 결과 불일치
  // DESCRIPTION: 투표 참여를 취소/삭제(`DELETE /api/participants/:id`)하면 참여자 목록에서는 소거되지만, 
  // 해당 투표의 결과 그래프 및 총 참여자 수(`totalVoters`)에는 차감되지 않고 계속 포함 유지되며 
  // data.json 안에서도 votes 배열 수치와 statistics 객체 수치가 불일치하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE PARTICIPANT] Deleted participant ${id}. Vote totalVoters and statistics remain unchanged.`);
  res.json({ success: true });
};

export const updateComment = (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 상태 역전 오류
  // DESCRIPTION: 투표 마감(0.5초 완료) 직후 댓글 수정(4초 지연 완료) 요청을 보내면, 
  // 이미 마감 완료된 상태인데도 늦게 도착한 댓글 수정 API가 해당 투표의 상태를 다시 'OPEN'(진행 중)으로 바꿔버려 
  // 목록 화면에서는 마감, 상세 화면에서는 진행 중으로 다르게 보이는 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const cmt = db.comments.find(c => c.id === id);
    if (cmt) {
      cmt.content = content;
      const targetVote = db.votes.find(v => v.id === cmt.voteId);
      if (targetVote) {
        targetVote.status = 'OPEN'; // Reverts status back to OPEN!
        console.log(`[DB STATUS REVERSAL] Modified comment ${id} (4s done). Reverted vote ${targetVote.id} status to OPEN!`);
      }
      writeDB(db);
    }
    res.json({ success: true, comment: cmt });
  }, 4000);
};

export const resetData = (req, res) => {
  const initial = {
    "votes": [
      {
        "id": "VOTE-01",
        "title": "2026 하반기 사내 복지 정책 최우선 과제 투표",
        "category": "WELFARE",
        "status": "OPEN",
        "author": "김철수",
        "createdAt": "2026-07-25",
        "totalVoters": 12,
        "options": [
          { "id": "OPT-01-A", "text": "주 4.5일제 시범 도입", "votesCount": 7 },
          { "id": "OPT-01-B", "text": "자기계발비 연 150만원 지원", "votesCount": 3 }
        ],
        "userId": "USER_A"
      }
    ],
    "participants": [
      { "id": "PAR-001", "voteId": "VOTE-01", "voterName": "김철수", "optionId": "OPT-01-A", "votedAt": "2026-07-25 10:15", "userId": "USER_A" }
    ],
    "comments": [
      { "id": "CMT-001", "voteId": "VOTE-01", "author": "김철수", "content": "복지 확대 소식 정말 반갑습니다!", "createdAt": "2026-07-25 10:20" }
    ],
    "statistics": {
      "totalVotesCreated": 1,
      "totalParticipationsCount": 1,
      "categoryCounts": { "WELFARE": 1 }
    },
    "voteLogs": []
  };
  writeDB(initial);
  res.json({ success: true });
};
