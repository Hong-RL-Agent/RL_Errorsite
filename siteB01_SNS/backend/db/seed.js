// 고정 시드 기반 초기 데이터 생성 (Reset 후에도 항상 동일한 데이터가 재생성된다)
const SEED = 20260301;
const BASE_TIME = Date.UTC(2026, 2, 1, 12, 0, 0);
const HOUR = 3600000;
const DAY = 24 * HOUR;

const USER_COUNT = 100;
const POST_COUNT = 190;
const COMMENT_COUNT = 320;
const LIKE_COUNT = 900;
const SAVE_COUNT = 140;
const NOTIFICATION_COUNT = 120;
const ACTIVITY_COUNT = 140;

const SURNAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '홍'];
const GIVEN = [
  ['민준', 'minjun'], ['서연', 'seoyeon'], ['지우', 'jiwoo'], ['하윤', 'hayoon'], ['도현', 'dohyun'],
  ['수아', 'sua'], ['예준', 'yejun'], ['지민', 'jimin'], ['유진', 'yujin'], ['시우', 'siwoo'],
  ['채원', 'chaewon'], ['준서', 'junseo'], ['소율', 'soyul'], ['현우', 'hyunwoo'], ['다은', 'daeun'],
  ['건우', 'geonwoo'], ['예린', 'yerin'], ['태윤', 'taeyoon'], ['나연', 'nayeon'], ['이안', 'ian'],
  ['서윤', 'seoyoon'], ['주원', 'juwon'], ['하린', 'harin'], ['은우', 'eunwoo'], ['윤서', 'yunseo'],
];
const BIOS = [
  '오늘도 한 장의 사진으로 기록해요 📷',
  '커피와 산책을 좋아하는 사람',
  '주말마다 어딘가로 떠나는 중',
  '맛집 지도를 만드는 중입니다',
  '고양이 집사 · 일상 기록',
  '러닝 3년차, 기록은 느리지만 꾸준히',
  '책 읽고 전시 보러 다녀요',
  '작은 것에서 행복을 찾는 중 ✨',
  '베이킹과 홈카페 취미',
  '풍경 사진 위주로 올려요',
  '퇴근 후 취미 부자',
  '여행 사진 아카이브',
];

const TOPICS = [
  { lines: ['성수동 카페에서 여유로운 오후', '새로 생긴 동네 카페 발견', '라떼아트가 예쁜 카페에 다녀왔어요', '창가 자리에서 즐기는 아메리카노'], tags: ['#카페', '#커피'] },
  { lines: ['한강 산책하다 만난 노을', '퇴근길 하늘이 너무 예뻐서 멈춰 섰어요', '해 질 녘 골목 풍경', '노을 맛집은 역시 여기'], tags: ['#노을', '#산책'] },
  { lines: ['제주도 3박 4일 여행 기록', '기차 타고 떠난 당일치기 여행', '바다가 보이는 숙소에서 하루', '여행 첫날, 설레는 마음으로'], tags: ['#여행', '#바다'] },
  { lines: ['줄 서서 먹은 보람이 있는 맛집', '오늘 점심은 수제 버거', '직접 만든 파스타 완성', '디저트는 별도의 배라는 말 공감'], tags: ['#맛집', '#먹스타그램'] },
  { lines: ['아침 러닝 5km 완료', '헬스장 출석 30일 달성', '요가 클래스 첫 수강 후기', '주말 등산으로 체력 충전'], tags: ['#운동', '#러닝'] },
  { lines: ['요즘 읽고 있는 책 한 권', '서점에서 발견한 보물 같은 에세이', '독서 모임 후기', '밑줄 긋고 싶은 문장들'], tags: ['#독서', '#책스타그램'] },
  { lines: ['우리 집 고양이 낮잠 시간', '산책 나온 강아지가 너무 귀여워서', '고양이가 박스를 또 차지했어요', '반려견과 함께한 주말'], tags: ['#고양이', '#반려동물'] },
  { lines: ['전시회 다녀온 날의 기록', '미술관 데이트', '사진전에서 오래 머문 작품', '작은 갤러리의 따뜻한 전시'], tags: ['#전시', '#미술관'] },
  { lines: ['출근길 풍경 한 컷', '비 오는 날 우산 아래 풍경', '벚꽃이 흩날리던 거리', '가을 단풍이 절정이에요'], tags: ['#일상', '#풍경'] },
  { lines: ['홈카페 세팅 완료', '직접 구운 쿠키 레시피 공유', '주말 브런치 플레이팅', '오늘의 베이킹 성공!'], tags: ['#홈카페', '#베이킹'] },
];
const MOODS = ['정말 만족스러웠어요.', '다들 어떻게 생각하세요?', '기록해 두고 싶은 순간.', '오래 기억에 남을 것 같아요.', '추천하고 싶은 곳!', '기분 좋은 하루였습니다.', '다음에 또 가고 싶어요.', '사진으로 다 담기지 않네요.'];
const COMMENTS = [
  '사진 너무 예뻐요!', '와 여기 어디예요?', '분위기 최고네요 😍', '저도 가보고 싶어요', '색감이 정말 좋아요',
  '오늘도 좋은 하루 보내세요', '공감합니다 ㅎㅎ', '다음 게시물도 기대할게요', '구도가 멋져요', '이거 완전 제 취향이에요',
  '저장해 두고 갈게요', '맛있겠다…', '힐링되는 사진이에요', '여기 저도 다녀왔어요!', '정보 감사합니다',
  '너무 귀여워요 🥹', '멋진 기록이네요', '주말에 따라가 봐야겠어요', '감성 가득이네요', '좋은 하루였겠어요',
];

function mulberry32(a) {
  return function rnd() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function countRows(db) {
  const n = (t) => db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n;
  return {
    users: n('users'),
    posts: n('posts'),
    comments: n('comments'),
    likes: n('likes'),
    follows: n('follows'),
    saves: n('saves'),
    notifications: n('notifications'),
    activity_logs: n('activity_logs'),
  };
}

function seedDatabase(db) {
  const rnd = mulberry32(SEED);
  const int = (n) => Math.floor(rnd() * n);
  const pick = (arr) => arr[int(arr.length)];
  const iso = (ms) => new Date(ms).toISOString();

  const run = db.transaction(() => {
    // ---- users ----
    const insUser = db.prepare('INSERT INTO users (id, username, display_name, bio, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, ?)');
    insUser.run(1, 'mingle_me', '민글 유저', '사진과 일상을 기록하는 Mingle 계정입니다.', '/img/avatar-1', iso(BASE_TIME - 300 * DAY));
    const userNames = { 1: '민글 유저' };
    for (let i = 0; i < USER_COUNT - 1; i += 1) {
      const id = i + 2;
      const [ko, roman] = GIVEN[i % GIVEN.length];
      const display = `${SURNAMES[i % SURNAMES.length]}${ko}`;
      userNames[id] = display;
      insUser.run(id, `${roman}_${String(id).padStart(2, '0')}`, display, BIOS[i % BIOS.length], `/img/avatar-${id}`, iso(BASE_TIME - (30 + int(250)) * DAY));
    }
    const randomOtherUser = () => 2 + int(USER_COUNT - 1);

    // ---- posts ----
    const insPost = db.prepare('INSERT INTO posts (user_id, caption, image_url, created_at) VALUES (?, ?, ?, ?)');
    const postTime = [0];
    const myPostIds = [];
    for (let n = 1; n <= POST_COUNT; n += 1) {
      const uid = n % 14 === 0 ? 1 : randomOtherUser();
      const topic = pick(TOPICS);
      const caption = `${pick(topic.lines)} ${pick(MOODS)}\n${topic.tags.join(' ')}`;
      const t = BASE_TIME - (POST_COUNT - n) * 7 * HOUR - int(2 * HOUR);
      postTime.push(t);
      insPost.run(uid, caption, `/img/post-${n}`, iso(t));
      if (uid === 1) myPostIds.push(n);
    }
    const isMine = (pid) => myPostIds.includes(pid);

    // ---- likes ----
    const insLike = db.prepare('INSERT INTO likes (post_id, user_id, created_at) VALUES (?, ?, ?)');
    const likeKeys = new Set();
    const addLike = (pid, uid) => {
      const key = `${pid}-${uid}`;
      if (likeKeys.has(key)) return false;
      likeKeys.add(key);
      insLike.run(pid, uid, iso(Math.min(BASE_TIME, postTime[pid] + (1 + int(72)) * HOUR)));
      return true;
    };
    let myLikes = 0;
    while (myLikes < 35) {
      const pid = 1 + int(POST_COUNT);
      if (!isMine(pid) && addLike(pid, 1)) myLikes += 1;
    }
    let likeTotal = myLikes;
    while (likeTotal < LIKE_COUNT) {
      if (addLike(1 + int(POST_COUNT), randomOtherUser())) likeTotal += 1;
    }

    // ---- comments ----
    const insComment = db.prepare('INSERT INTO comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, ?)');
    for (let i = 0; i < COMMENT_COUNT; i += 1) {
      const pid = 1 + int(POST_COUNT);
      const uid = i % 9 === 0 ? 1 : randomOtherUser();
      insComment.run(pid, uid, pick(COMMENTS), iso(Math.min(BASE_TIME, postTime[pid] + (1 + int(96)) * HOUR)));
    }

    // ---- follows ----
    const insFollow = db.prepare('INSERT INTO follows (follower_id, following_id, created_at) VALUES (?, ?, ?)');
    const followKeys = new Set();
    const addFollow = (a, b) => {
      const key = `${a}-${b}`;
      if (a === b || followKeys.has(key)) return false;
      followKeys.add(key);
      insFollow.run(a, b, iso(BASE_TIME - (1 + int(200)) * DAY));
      return true;
    };
    let c = 0;
    while (c < 24) if (addFollow(1, randomOtherUser())) c += 1;
    c = 0;
    while (c < 16) if (addFollow(randomOtherUser(), 1)) c += 1;
    c = 0;
    while (c < 190) if (addFollow(randomOtherUser(), randomOtherUser())) c += 1;

    // ---- saves ----
    const insSave = db.prepare('INSERT INTO saves (post_id, user_id, created_at) VALUES (?, ?, ?)');
    const saveKeys = new Set();
    const addSave = (pid, uid) => {
      const key = `${pid}-${uid}`;
      if (saveKeys.has(key)) return false;
      saveKeys.add(key);
      insSave.run(pid, uid, iso(Math.min(BASE_TIME, postTime[pid] + (1 + int(120)) * HOUR)));
      return true;
    };
    c = 0;
    while (c < 28) {
      const pid = 1 + int(POST_COUNT);
      if (!isMine(pid) && addSave(pid, 1)) c += 1;
    }
    let saveTotal = c;
    while (saveTotal < SAVE_COUNT) {
      if (addSave(1 + int(POST_COUNT), randomOtherUser())) saveTotal += 1;
    }

    // ---- notifications (모두 기본 계정 수신) ----
    const insNoti = db.prepare('INSERT INTO notifications (user_id, type, actor_id, post_id, message, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const NOTI_TYPES = ['like', 'like', 'comment', 'follow', 'save'];
    for (let i = 0; i < NOTIFICATION_COUNT; i += 1) {
      const type = pick(NOTI_TYPES);
      const actor = randomOtherUser();
      const name = userNames[actor];
      const pid = type === 'follow' ? null : pick(myPostIds);
      const message = {
        like: `${name}님이 회원님의 게시물을 좋아합니다.`,
        comment: `${name}님이 회원님의 게시물에 댓글을 남겼습니다.`,
        follow: `${name}님이 회원님을 팔로우하기 시작했습니다.`,
        save: `${name}님이 회원님의 게시물을 저장했습니다.`,
      }[type];
      const read = i >= NOTIFICATION_COUNT - 30 ? (rnd() < 0.2 ? 1 : 0) : (rnd() < 0.9 ? 1 : 0);
      insNoti.run(1, type, actor, pid, message, read, iso(BASE_TIME - (NOTIFICATION_COUNT - 1 - i) * 10 * HOUR));
    }

    // ---- activity logs ----
    const insLog = db.prepare('INSERT INTO activity_logs (user_id, action, target_type, target_id, detail, created_at) VALUES (?, ?, ?, ?, ?, ?)');
    const ACTIONS = [
      ['like', 'post', (id) => `게시물 #${id}에 좋아요를 눌렀습니다.`],
      ['comment_create', 'post', (id) => `게시물 #${id}에 댓글을 작성했습니다.`],
      ['follow', 'user', (id) => `${userNames[id] || '사용자'}님을 팔로우했습니다.`],
      ['save', 'post', (id) => `게시물 #${id}을(를) 저장했습니다.`],
      ['post_create', 'post', (id) => `게시물 #${id}을(를) 작성했습니다.`],
      ['unlike', 'post', (id) => `게시물 #${id}의 좋아요를 취소했습니다.`],
      ['post_update', 'post', (id) => `게시물 #${id}을(를) 수정했습니다.`],
    ];
    for (let i = 0; i < ACTIVITY_COUNT; i += 1) {
      const [action, targetType, text] = pick(ACTIONS);
      const targetId = targetType === 'user' ? randomOtherUser() : (action === 'post_create' || action === 'post_update' ? pick(myPostIds) : 1 + int(POST_COUNT));
      const uid = i % 14 < 11 ? 1 : randomOtherUser();
      insLog.run(uid, action, targetType, targetId, text(targetId), iso(BASE_TIME - (ACTIVITY_COUNT - 1 - i) * 8 * HOUR));
    }
  });

  run();
  return countRows(db);
}

module.exports = { seedDatabase, countRows };
