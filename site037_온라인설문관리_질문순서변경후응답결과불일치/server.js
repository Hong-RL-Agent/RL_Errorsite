import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5037;

app.use(cors());
app.use(express.json());

// Surveys Database
let surveys = [
  {
    id: "srv-01",
    title: "2026 신제품 소비자 만족도 조사",
    deadline: "2026-12-31",
    closed: false,
    responsesCount: 5,
    questions: [
      { id: "q-1", type: "text", title: "본인의 이름 혹은 닉네임을 적어주세요.", options: [], required: false, deletedOptions: [] },
      { id: "q-2", type: "radio", title: "신제품의 외관 디자인에 얼마나 만족하십니까?", options: ["매우 만족", "만족", "보통", "불만족"], required: true, deletedOptions: [] },
      { id: "q-3", type: "checkbox", title: "주요 단점으로 보완이 필요한 항목을 골라주세요 (중복 선택 가능)", options: ["성능 속도", "배터리 수명", "기기 발열", "가격 경쟁력"], required: false, deletedOptions: [] },
      { id: "q-4", type: "star", title: "제품의 전체적인 종합 평점을 매겨주세요.", options: [], required: true, deletedOptions: [] },
      { id: "q-5", type: "paragraph", title: "그 외 개선 바라는 상세 건의사항을 적어주세요.", options: [], required: false, deletedOptions: [] },
      { id: "q-6", type: "date", title: "제품을 구매하신 일자를 선택해주세요.", options: [], required: false, deletedOptions: [] }
    ]
  },
  {
    id: "srv-02",
    title: "사내 카페테리아 이용 선호도 설문",
    deadline: "2026-09-30",
    closed: false,
    responsesCount: 0,
    questions: [
      { id: "q-21", type: "radio", title: "가장 만족스러운 카페 메뉴는 무엇인가요?", options: ["에스프레소류", "콜드브루", "스무디/에이드", "제과 베이커리"], required: true, deletedOptions: [] },
      { id: "q-22", type: "star", title: "카페테리아 청결도 평점을 매겨주세요.", options: [], required: true, deletedOptions: [] }
    ]
  }
];

// Preseeded Responses for Survey 1
let responses = [
  {
    id: "res-1",
    surveyId: "srv-01",
    email: "user1@naver.com",
    answers: { "q-1": "홍길동", "q-2": "매우 만족", "q-3": ["가격 경쟁력"], "q-4": 5, "q-5": "가격이 저렴해지면 좋겠어요.", "q-6": "2026-07-01" },
    date: "2026-07-10 14:15"
  },
  {
    id: "res-2",
    surveyId: "srv-01",
    email: "user2@daum.net",
    answers: { "q-1": "이영희", "q-2": "만족", "q-3": ["기기 발열", "배터리 수명"], "q-4": 4, "q-5": "발열이 조금 심하네요.", "q-6": "2026-07-02" },
    date: "2026-07-11 09:30"
  },
  {
    id: "res-3",
    surveyId: "srv-01",
    email: "user3@gmail.com",
    answers: { "q-1": "김철수", "q-2": "보통", "q-3": ["성능 속도"], "q-4": 3, "q-5": "로딩이 가끔 걸려요.", "q-6": "2026-07-03" },
    date: "2026-07-12 11:22"
  },
  {
    id: "res-4",
    surveyId: "srv-01",
    email: "user4@gmail.com",
    answers: { "q-1": "박민수", "q-2": "만족", "q-3": ["배터리 수명"], "q-4": 4, "q-5": "그럭저럭 쓸만합니다.", "q-6": "2026-07-05" },
    date: "2026-07-12 15:45"
  },
  {
    id: "res-5",
    surveyId: "srv-01",
    email: "user5@kakao.com",
    answers: { "q-1": "최재우", "q-2": "불만족", "q-3": ["가격 경쟁력", "기기 발열"], "q-4": 2, "q-5": "실망이 큰 제품입니다.", "q-6": "2026-07-07" },
    date: "2026-07-13 10:05"
  }
];

// API: Get Surveys
app.get('/api/surveys', (req, res) => {
  res.json(surveys);
});

// API: Create Survey (Error 3)
app.post('/api/surveys', (req, res) => {
  const { title, deadline, questions } = req.body;

  if (!title) {
    return res.status(400).json({ error: "설문 제목은 필수입니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 생성하려는 설문의 제목 글자 수가 공백을 포함해 정확히 25자인 경우, 
  // 스키마 컬럼 길이 한계 제한 예외 상황을 연출하여 HTTP 500 에러를 반환합니다.
  if (title.length === 25) {
    return res.status(500).json({
      error: "Internal Server Error: SurveyTitleLengthLimitException - Survey title cannot be exactly 25 characters due to schema mapping safety checks."
    });
  }

  const newSurvey = {
    id: `srv-${Date.now()}`,
    title,
    deadline: deadline || "2026-12-31",
    closed: false,
    responsesCount: 0,
    questions: questions || []
  };

  surveys.push(newSurvey);
  res.status(201).json(newSurvey);
});

// API: Update Survey (deadline / close status)
app.put('/api/surveys/:id', (req, res) => {
  const { id } = req.params;
  const { deadline, closed } = req.body;

  const survey = surveys.find(s => s.id === id);
  if (!survey) return res.status(404).json({ error: "설문을 찾을 수 없습니다." });

  if (deadline !== undefined) survey.deadline = deadline;
  if (closed !== undefined) survey.closed = closed;

  res.json({ success: true, survey });
});

// API: Duplicate Survey (Error 4)
app.post('/api/surveys/:id/duplicate', (req, res) => {
  const { id } = req.params;
  const original = surveys.find(s => s.id === id);
  if (!original) return res.status(404).json({ error: "설문을 찾을 수 없습니다." });

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 설문 복제 시 질문 컬랙션은 정상 복제하지만, 
  // 필수 질문 지정 필드(required)를 전부 false로 누락(초기화)시켜 데이터베이스에 삽입합니다.
  const duplicatedQuestions = original.questions.map(q => ({
    ...q,
    required: false // Dropping required constraint!
  }));

  const copy = {
    id: `srv-${Date.now()}`,
    title: `${original.title} (복제본)`,
    deadline: original.deadline,
    closed: original.closed,
    responsesCount: 0,
    questions: duplicatedQuestions
  };

  surveys.push(copy);
  res.json({ success: true, surveys });
});

// API: Submit Survey Response (Error 6)
app.post('/api/surveys/:id/responses', (req, res) => {
  const { id } = req.params;
  const { email, answers } = req.body;

  if (!email || !answers) {
    return res.status(400).json({ error: "이메일 주소와 답변 데이터가 필요합니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 프론트엔드에서는 동일 이메일당 1회 제출 제한 설문이라고 알리지만, 
  // 백엔드 제출 처리 시 동일 이메일 중복 응답 검증 구문을 통째로 생략(주석 처리)하여 
  // 데이터베이스에 무한 중복 응답 적재를 허용하게 방치합니다.
  // 원래 들어가야 할 중복 차단문 고의 생략:
  // const alreadySubmitted = responses.some(r => r.surveyId === id && r.email === email);
  // if (alreadySubmitted) { return res.status(400).json({ error: "이미 이메일 중복 응답이 등록되었습니다." }); }

  const newRes = {
    id: `res-${Date.now()}`,
    surveyId: id,
    email,
    answers,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };
  responses.push(newRes);

  // Increment response counter
  const survey = surveys.find(s => s.id === id);
  if (survey) survey.responsesCount += 1;

  res.status(201).json({ success: true });
});

// API: Get Responses
app.get('/api/responses', (req, res) => {
  res.json(responses);
});

// API: Reset Sandbox
app.post('/api/reset', (req, res) => {
  surveys = [
    {
      id: "srv-01",
      title: "2026 신제품 소비자 만족도 조사",
      deadline: "2026-12-31",
      closed: false,
      responsesCount: 5,
      questions: [
        { id: "q-1", type: "text", title: "본인의 이름 혹은 닉네임을 적어주세요.", options: [], required: false, deletedOptions: [] },
        { id: "q-2", type: "radio", title: "신제품의 외관 디자인에 얼마나 만족하십니까?", options: ["매우 만족", "만족", "보통", "불만족"], required: true, deletedOptions: [] },
        { id: "q-3", type: "checkbox", title: "주요 단점으로 보완이 필요한 항목을 골라주세요 (중복 선택 가능)", options: ["성능 속도", "배터리 수명", "기기 발열", "가격 경쟁력"], required: false, deletedOptions: [] },
        { id: "q-4", type: "star", title: "제품의 전체적인 종합 평점을 매겨주세요.", options: [], required: true, deletedOptions: [] },
        { id: "q-5", type: "paragraph", title: "그 외 개선 바라는 상세 건의사항을 적어주세요.", options: [], required: false, deletedOptions: [] },
        { id: "q-6", type: "date", title: "제품을 구매하신 일자를 선택해주세요.", options: [], required: false, deletedOptions: [] }
      ]
    },
    {
      id: "srv-02",
      title: "사내 카페테리아 이용 선호도 설문",
      deadline: "2026-09-30",
      closed: false,
      responsesCount: 0,
      questions: [
        { id: "q-21", type: "radio", title: "가장 만족스러운 카페 메뉴는 무엇인가요?", options: ["에스프레소류", "콜드브루", "스무디/에이드", "제과 베이커리"], required: true, deletedOptions: [] },
        { id: "q-22", type: "star", title: "카페테리아 청결도 평점을 매겨주세요.", options: [], required: true, deletedOptions: [] }
      ]
    }
  ];

  responses = [
    {
      id: "res-1",
      surveyId: "srv-01",
      email: "user1@naver.com",
      answers: { "q-1": "홍길동", "q-2": "매우 만족", "q-3": ["가격 경쟁력"], "q-4": 5, "q-5": "가격이 저렴해지면 좋겠어요.", "q-6": "2026-07-01" },
      date: "2026-07-10 14:15"
    },
    {
      id: "res-2",
      surveyId: "srv-01",
      email: "user2@daum.net",
      answers: { "q-1": "이영희", "q-2": "만족", "q-3": ["기기 발열", "배터리 수명"], "q-4": 4, "q-5": "발열이 조금 심하네요.", "q-6": "2026-07-02" },
      date: "2026-07-11 09:30"
    },
    {
      id: "res-3",
      surveyId: "srv-01",
      email: "user3@gmail.com",
      answers: { "q-1": "김철수", "q-2": "보통", "q-3": ["성능 속도"], "q-4": 3, "q-5": "로딩이 가끔 걸려요.", "q-6": "2026-07-03" },
      date: "2026-07-12 11:22"
    },
    {
      id: "res-4",
      surveyId: "srv-01",
      email: "user4@gmail.com",
      answers: { "q-1": "박민수", "q-2": "만족", "q-3": ["배터리 수명"], "q-4": 4, "q-5": "그럭저럭 쓸만합니다.", "q-6": "2026-07-05" },
      date: "2026-07-12 15:45"
    },
    {
      id: "res-5",
      surveyId: "srv-01",
      email: "user5@kakao.com",
      answers: { "q-1": "최재우", "q-2": "불만족", "q-3": ["가격 경쟁력", "기기 발열"], "q-4": 2, "q-5": "실망이 큰 제품입니다.", "q-6": "2026-07-07" },
      date: "2026-07-13 10:05"
    }
  ];

  res.json({ success: true, surveys, responses });
});

app.listen(PORT, () => {
  console.log(`[FormWave Backend] Express server running on http://localhost:${PORT}`);
});
