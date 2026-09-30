import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9949;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// In-Memory Database
let users = [
  {
    id: 1,
    name: "김민지",
    email: "minji@tablenote.kr",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bio: "건강하고 따뜻한 집밥을 사랑하는 홈쿡러 🍳",
    recipeCount: 5,
    favoriteCount: 4
  },
  {
    id: 2,
    name: "이주원",
    email: "juwon@tablenote.kr",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "자취 3년차 초간단 원팬 요리 전문 🥘",
    recipeCount: 4,
    favoriteCount: 3
  },
  {
    id: 3,
    name: "박서준",
    email: "seojun@tablenote.kr",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    bio: "주말마다 베이킹과 브런치를 즐겨요 🥐",
    recipeCount: 3,
    favoriteCount: 2
  }
];

let currentUser = users[0];

let recipes = [
  {
    id: 101,
    title: "토마토 바질 파스타",
    category: "양식",
    difficulty: "쉬움",
    cookingTime: 25,
    authorId: 1,
    authorName: "김민지",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80",
    description: "신선한 완숙 토마토와 향긋한 생바질을 듬뿍 넣어 본연의 감칠맛을 살린 정통 이탈리안 오일 파스타입니다.",
    ingredients: [
      "스파게티 면 160g",
      "완숙 토마토 2개",
      "생바질 10잎",
      "엑스트라 버진 올리브오일 4큰술",
      "마늘 5쪽",
      "파마산 치즈가루 약간",
      "소금 및 통후추 약간"
    ],
    steps: [
      "냄비에 물 2L와 소금 1큰술을 넣고 끓으면 스파게티 면을 넣어 8분간 알덴테로 삶아 건져냅니다.",
      "마늘은 얇게 편 썰고, 토마토는 한 입 크기로 깍둑썰기합니다.",
      "달군 팬에 올리브오일을 넉넉히 두르고 마늘을 중약불에서 노릇하게 볶아 향을 냅니다.",
      "마늘 향이 올라오면 썰어둔 토마토를 넣고 살짝 으깨듯이 3분간 볶아줍니다.",
      "삶은 면과 면수 1/2컵을 팬에 넣고 소스와 함께 센 불에서 1분간 빠르게 유화시킵니다.",
      "불을 끄고 생바질과 통후추, 파마산 치즈가루를 뿌려 완성합니다."
    ],
    likes: 42,
    views: 310,
    createdAt: "2026-09-18 11:20"
  },
  {
    id: 102,
    title: "소고기 듬뿍 뚝배기 된장찌개",
    category: "한식",
    difficulty: "보통",
    cookingTime: 30,
    authorId: 1,
    authorName: "김민지",
    image: "https://images.unsplash.com/photo-1547496502-affa22d38842?w=600&auto=format&fit=crop&q=80",
    description: "차돌박이의 고소한 육즙과 구수한 재래된장이 어우러진 한국인의 영원한 소울푸드 된장찌개입니다.",
    ingredients: [
      "차돌박이(또는 우삼겹) 120g",
      "재래식 된장 2.5큰술",
      "두부 1/2모",
      "애호박 1/3개",
      "감자 1개",
      "청양고추 1개, 대파 1/2대",
      "멸치 다시마 육수 500ml"
    ],
    steps: [
      "감자, 애호박, 두부는 한 입 크기로 깍둑썰기하고, 대파와 청양고추는 송송 썹니다.",
      "뚝배기에 차돌박이를 넣고 중불에서 핏기가 사라질 때까지 고소하게 볶아줍니다.",
      "고기 기름이 나오면 멸치육수를 붓고 된장을 체에 걸러 곱게 풀어줍니다.",
      "감자와 애호박을 넣고 센 불에서 끓어오르면 중불로 줄여 10분간 보글보글 끓입니다.",
      "두부와 대파, 청양고추를 넣고 3분간 더 끓여 마무리합니다."
    ],
    likes: 58,
    views: 450,
    createdAt: "2026-09-19 14:30"
  },
  {
    id: 103,
    title: "연어 아보카도 포케 샐러드볼",
    category: "샐러드",
    difficulty: "쉬움",
    cookingTime: 15,
    authorId: 2,
    authorName: "이주원",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    description: "생연어와 부드러운 아보카도, 신선한 야채에 오리엔탈 스리라차 드레싱을 곁들인 건강 다이어트 한 그릇입니다.",
    ingredients: [
      "횟감용 생연어 150g",
      "아보카도 1/2개",
      "어린잎 채소 & 로메인 1줌",
      "방울토마토 4알",
      "현미귀리밥 1/2공기",
      "간장 1.5큰술, 참기름 1큰술, 레몬즙 1작은술, 깨"
    ],
    steps: [
      "생연어는 깍둑썰기하여 간장, 참기름, 레몬즙에 5분간 가볍게 버무려 밑간합니다.",
      "아보카도는 껍질을 벗겨 먹기 좋은 크기로 슬라이스합니다.",
      "볼에 현미귀리밥을 깔고 깨끗이 씻은 어린잎 채소와 토마토를 얹습니다.",
      "양념한 연어와 아보카도를 올린 후 볶음 통깨를 솔솔 뿌려 냅니다."
    ],
    likes: 36,
    views: 290,
    createdAt: "2026-09-20 09:15"
  },
  {
    id: 104,
    title: "에어프라이어 겉바속촉 닭봉 버팔로윙",
    category: "간단요리",
    difficulty: "쉬움",
    cookingTime: 20,
    authorId: 2,
    authorName: "이주원",
    image: "https://images.unsplash.com/photo-1527477321055-436158a2b0a5?w=600&auto=format&fit=crop&q=80",
    description: "불 앞에서 기름 튈 걱정 없이 에어프라이어로 바삭하게 구워내는 맥주 안주 & 홈파티 인기 닭봉 구이!",
    ingredients: [
      "닭봉 & 닭날개 400g",
      "올리브유 1큰술",
      "허브솔트 1작은술",
      "스위트 칠리소스 2큰술",
      "진간장 1큰술, 다진마늘 1/2큰술"
    ],
    steps: [
      "닭봉은 키친타월로 핏물을 닦고 칼집을 2~3군데 냅니다.",
      "올리브유, 허브솔트, 다진마늘을 넣고 조물조물 버무려 10분간 재웁니다.",
      "에어프라이어 190도에서 12분간 구운 뒤 뒤집어서 8분간 노릇하게 굽습니다.",
      "구워진 닭봉에 스위트 칠리소스를 얇게 발라 1분간 더 구워줍니다."
    ],
    likes: 49,
    views: 380,
    createdAt: "2026-09-21 17:40"
  },
  {
    id: 105,
    title: "바질 페스토 수제 포카치아",
    category: "베이킹",
    difficulty: "어려움",
    cookingTime: 50,
    authorId: 3,
    authorName: "박서준",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
    description: "올리브오일의 풍미와 푹신푹신한 기공이 매력적인 이탈리아 전통 빵, 홈베이킹으로 완성하는 바질 포카치아입니다.",
    ingredients: [
      "강력분 300g",
      "물 240ml (수분율 80%)",
      "인스턴트 드라이이스트 4g",
      "소금 5g",
      "올리브오일 30ml",
      "바질페스토 2큰술, 블랙올리브, 로즈마리"
    ],
    steps: [
      "볼에 강력분, 물, 이스트, 소금을 넣고 주걱으로 날가루가 없을 때까지 섞은 후 30분간 오토리즈합니다.",
      "올리브오일을 넣고 사방에서 반죽을 끌어당겨 접는 폴딩 작업을 30분 간격으로 3회 반복합니다.",
      "발효된 반죽을 사각 틀에 넣고 손가락으로 깊숙이 찔러 기포를 살려줍니다.",
      "위에 바질페스토, 슬라이스 올리브, 로즈마리를 토핑하고 올리브유를 듬뿍 뿌립니다.",
      "220도로 예열된 오븐에서 20~25분간 겉이 골든브라운이 될 때까지 구워냅니다."
    ],
    likes: 64,
    views: 520,
    createdAt: "2026-09-22 10:00"
  },
  {
    id: 106,
    title: "촉촉한 일본식 차슈 덮밥 (부타동)",
    category: "일식",
    difficulty: "보통",
    cookingTime: 35,
    authorId: 3,
    authorName: "박서준",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80",
    description: "달콤 짭조름한 특제 간장 타레 소스에 졸여 입안에서 사르르 녹는 부드러운 통삼겹 차슈 덮밥입니다.",
    ingredients: [
      "통삼겹살 300g",
      "진간장 4큰술, 맛술 3큰술, 설탕 2큰술, 물 150ml",
      "생강 슬라이스 3조각, 대파 1대",
      "따뜻한 밥 1공기",
      "계란 노른자 1개, 와사비 약간"
    ],
    steps: [
      "달군 팬에 통삼겹살의 모든 겉면을 센 불에서 바삭하게 시어링합니다.",
      "냄비에 간장, 맛술, 설탕, 물, 생강, 대파를 넣고 끓기 시작하면 구운 삼겹살을 넣습니다.",
      "뚜껑을 덮고 약불에서 소스가 윤기 나게 졸아들 때까지 25분간 뒤집어가며 조립니다.",
      "차슈를 건져 얇게 썬 뒤 그릇의 밥 위에 둥글게 둘러 얹습니다.",
      "가운데 계란 노른자를 올리고 남은 타레 소스를 뿌려 와사비와 함께 냅니다."
    ],
    likes: 52,
    views: 410,
    createdAt: "2026-09-22 15:30"
  },
  {
    id: 107,
    title: "매콤달콤 밥도둑 오징어 볶음",
    category: "한식",
    difficulty: "보통",
    cookingTime: 20,
    authorId: 1,
    authorName: "김민지",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80",
    description: "불맛 가득 센 불에서 빠르게 볶아내 질기지 않고 쫄깃쫄깃한 매콤 오징어 볶음입니다.",
    ingredients: [
      "물오징어 1마리",
      "양배추 1줌, 양파 1/2개, 당근 1/4개, 대파 1대",
      "고추장 1큰술, 고춧가루 2큰술, 진간장 2큰술",
      "올리고당 1.5큰술, 다진마늘 1큰술, 참기름 1큰술"
    ],
    steps: [
      "오징어는 안쪽에 사선 칼집을 넣고 먹기 좋은 크기로 썹니다.",
      "분량의 고추장, 고춧가루, 간장, 올리고당, 마늘을 섞어 양념장을 만듭니다.",
      "팬에 식용유를 두르고 파기름을 낸 뒤 썰어둔 야채를 센 불에서 1분간 볶습니다.",
      "오징어와 양념장을 넣고 센 불에서 수분이 생기기 전 2분 이내로 재빠르게 볶아냅니다.",
      "불을 끄고 참기름과 통깨를 둘러 완성합니다."
    ],
    likes: 41,
    views: 330,
    createdAt: "2026-09-23 18:10"
  },
  {
    id: 108,
    title: "홈메이드 바닐라빈 에그타르트",
    category: "베이킹",
    difficulty: "보통",
    cookingTime: 40,
    authorId: 3,
    authorName: "박서준",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
    description: "페이스트리의 바삭함과 천연 바닐라빈이 콕콕 박힌 푸딩 커스터드 필링의 환상적인 조화!",
    ingredients: [
      "냉동 페이스트리 생지 6장",
      "계란 노른자 3개",
      "생크림 150ml, 우유 100ml",
      "설탕 50g, 바닐라빈 페이스트 1작은술, 옥수수전분 8g"
    ],
    steps: [
      "냄비에 우유, 생크림, 설탕, 바닐라빈을 넣고 설탕이 녹을 정도로만 따뜻하게 데웁니다.",
      "볼에 계란 노른자와 옥수수전분을 잘 섞은 뒤 데운 우유물을 조금씩 부어가며 섞어 체에 거릅니다.",
      "타르트 틀에 페이스트리 생지를 밀착시키고 필링을 85% 정도 채웁니다.",
      "200도로 예열된 오븐에서 25분간 윗면이 먹음직스럽게 캐러멜라이징될 때까지 굽습니다."
    ],
    likes: 71,
    views: 610,
    createdAt: "2026-09-24 11:45"
  },
  {
    id: 109,
    title: "담백 고소한 들깨 버섯 순두부탕",
    category: "한식",
    difficulty: "쉬움",
    cookingTime: 15,
    authorId: 1,
    authorName: "김민지",
    image: "https://images.unsplash.com/photo-1547496502-affa22d38842?w=600&auto=format&fit=crop&q=80",
    description: "자극적이지 않고 속 편안한 아침 식사로 최고인 고소한 들깨가루와 순두부의 담백한 만남.",
    ingredients: [
      "순두부 1봉",
      "표고버섯 2개, 팽이버섯 1/2봉",
      "껍질 벗긴 들깨가루 3큰술",
      "멸치 다시마 육수 400ml",
      "국간장 1큰술, 다진마늘 1/2큰술, 대파 약간"
    ],
    steps: [
      "표고버섯은 채 썰고 팽이버섯은 밑동을 잘라 가닥가닥 뜯어놓습니다.",
      "냄비에 멸치육수를 붓고 끓으면 국간장과 다진마늘로 밑간을 맞춥니다.",
      "표고버섯을 넣고 2분간 끓이다가 순두부를 큼직하게 숟가락으로 떠 넣습니다.",
      "들깨가루를 듬뿍 풀고 팽이버섯과 대파를 올려 1분간 더 끓여 냅니다."
    ],
    likes: 33,
    views: 240,
    createdAt: "2026-09-24 16:20"
  },
  {
    id: 110,
    title: "그릭 요거트 무화과 그래놀라볼",
    category: "샐러드",
    difficulty: "쉬움",
    cookingTime: 10,
    authorId: 2,
    authorName: "이주원",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80",
    description: "꾸덕꾸덕한 그릭 요거트 위에 생무화과와 바삭한 수제 그래놀라, 천연 꿀을 얹은 상큼한 브런치입니다.",
    ingredients: [
      "꾸덕한 그릭 요거트 150g",
      "생무화과 2개",
      "오트 그래놀라 3큰술",
      "천연 아카시아 꿀 1큰술",
      "치아씨드 또는 아몬드 슬라이스 약간"
    ],
    steps: [
      "예쁜 요거트 볼에 그릭 요거트를 도톰하게 담습니다.",
      "생무화과는 깨끗이 씻어 4등분 웨지로 썹니다.",
      "요거트 위에 무화과와 바삭한 그래놀라를 보기 좋게 플레이팅합니다.",
      "취향에 맞게 꿀을 드리즐하고 견과류를 곁들여 완성합니다."
    ],
    likes: 47,
    views: 360,
    createdAt: "2026-09-25 08:30"
  },
  {
    id: 111,
    title: "10분 완성 명란 아보카도 덮밥",
    category: "간단요리",
    difficulty: "쉬움",
    cookingTime: 10,
    authorId: 2,
    authorName: "이주원",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    description: "반찬 없을 때 10분이면 뚝딱! 짭조름한 저염 백명란과 고소한 아보카도, 반숙 프라이의 실패 없는 조합.",
    ingredients: [
      "저염 백명란 1줄",
      "잘 익은 아보카도 1/2개",
      "계란 1개",
      "따뜻한 흰쌀밥 1공기",
      "조미김 3장, 참기름 1큰술, 통깨"
    ],
    steps: [
      "명란은 겉 껍질을 칼로 갈라 속의 알만 숟가락으로 긁어냅니다.",
      "아보카도는 씨를 빼고 얇게 반달 모양으로 슬라이스합니다.",
      "팬에 식용유를 두르고 계란을 반숙(써니사이드업)으로 부쳐냅니다.",
      "그릇에 밥을 담고 아보카도, 명란, 잘게 부순 조미김, 반숙 프라이를 올립니다.",
      "참기름과 통깨를 둘러 슥슥 비벼 먹습니다."
    ],
    likes: 62,
    views: 490,
    createdAt: "2026-09-25 12:10"
  },
  {
    id: 112,
    title: "바삭 촉촉 일식 수제 안심 돈카츠",
    category: "일식",
    difficulty: "보통",
    cookingTime: 30,
    authorId: 3,
    authorName: "박서준",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80",
    description: "두툼한 돼지 안심을 저온과 고온으로 2번 튀겨내 육즙이 가득하고 겉은 파삭한 프리미엄 돈카츠입니다.",
    ingredients: [
      "돼지고기 안심 300g",
      "밀가루 1/2컵, 계란 2개, 습식 빵가루 2컵",
      "소금 및 후추 약간",
      "양배추 1/4통, 참깨 돈카츠 소스"
    ],
    steps: [
      "안심은 두께 2.5cm로 도톰하게 썰어 소금과 후추로 밑간해 10분간 둡니다.",
      "안심에 밀가루 -> 계란물 -> 습식 빵가루 순으로 꼼꼼히 튀김옷을 입힙니다.",
      "160도 기름에서 5분간 1차 튀긴 후 건져내 3분간 레스팅합니다.",
      "180도로 온도를 올려 1분간 바삭하게 2차 튀겨 냅니다.",
      "먹기 좋은 크기로 썰어 얇게 채 썬 양배추와 함께 곁들입니다."
    ],
    likes: 55,
    views: 430,
    createdAt: "2026-09-26 14:00"
  }
];

let favorites = [101, 103, 105];

let mealPlans = [
  {
    id: 1,
    day: "월",
    slot: "아침",
    recipeId: 110,
    recipeTitle: "그릭 요거트 무화과 그래놀라볼",
    recipeImage: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 2,
    day: "월",
    slot: "점심",
    recipeId: 101,
    recipeTitle: "토마토 바질 파스타",
    recipeImage: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 3,
    day: "화",
    slot: "저녁",
    recipeId: 102,
    recipeTitle: "소고기 듬뿍 뚝배기 된장찌개",
    recipeImage: "https://images.unsplash.com/photo-1547496502-affa22d38842?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 4,
    day: "수",
    slot: "점심",
    recipeId: 103,
    recipeTitle: "연어 아보카도 포케 샐러드볼",
    recipeImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 5,
    day: "목",
    slot: "저녁",
    recipeId: 106,
    recipeTitle: "촉촉한 일본식 차슈 덮밥 (부타동)",
    recipeImage: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80"
  }
];

let posts = [
  {
    id: 1,
    title: "주말에 토마토 바질 파스타 만들어봤어요! 🍝 생바질 향이 대박이네요",
    content: "TableNote에 올라온 레시피 보고 완숙 토마토 사다가 오일 파스타 만들었는데, 면수 에멀젼이 제대로 되어서 레스토랑 안 부러운 맛이 났어요! 주말 홈스토랑 메뉴로 완전 강추합니다.",
    category: "요리자랑",
    authorId: 1,
    authorName: "김민지",
    likes: 24,
    views: 180,
    commentsCount: 3,
    imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80",
    createdAt: "2026-09-24 13:00"
  },
  {
    id: 2,
    title: "자취생 원팬 요리할 때 파스타면 1인분 계량 꿀팁 공유 💡",
    content: "파스타 1인분(약 80~100g) 맞추기 어려우실 때는 500원짜리 동전 크기만큼 쥐어주시면 딱 성인 1인분 정량이 나옵니다! 그리고 면 삶을 때 소금은 물 1L당 밥숟가락 반스푼 꼭 넣어주세요.",
    category: "꿀팁",
    authorId: 2,
    authorName: "이주원",
    likes: 38,
    views: 290,
    commentsCount: 4,
    imageUrl: null,
    createdAt: "2026-09-25 10:20"
  },
  {
    id: 3,
    title: "홈베이킹 무반죽 포카치아 발효 성공 후기 🥐",
    content: "오븐 있으신 분들은 바질 포카치아 꼭 해보세요. 손반죽 없이 폴딩만 세 번 해줬는데도 기공이 퐁퐁 살아나서 겉바속촉 끝판왕입니다!",
    category: "요리자랑",
    authorId: 3,
    authorName: "박서준",
    likes: 45,
    views: 320,
    commentsCount: 2,
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
    createdAt: "2026-09-25 18:30"
  }
];

let comments = [
  {
    id: 1,
    postId: 1,
    authorId: 2,
    authorName: "이주원",
    content: "사진 너무 먹음직스러워요! 바질 생잎 쓰니까 비주얼도 확실히 사네요.",
    createdAt: "2026-09-24 13:40"
  },
  {
    id: 2,
    postId: 1,
    authorId: 3,
    authorName: "박서준",
    content: "마늘 향 오일에 파마산 치즈까지 완벽한 조합이네요!",
    createdAt: "2026-09-24 14:15"
  },
  {
    id: 3,
    postId: 1,
    authorId: 1,
    authorName: "김민지",
    content: "감사합니다 :) 면수 섞을 때 센 불에서 빠르게 젓는 게 포인트였어요!",
    createdAt: "2026-09-24 15:00"
  },
  {
    id: 4,
    postId: 2,
    authorId: 1,
    authorName: "김민지",
    content: "500원 동전 팁 너무 유용하네요! 매번 양 조절 실패했었는데 감사합니다.",
    createdAt: "2026-09-25 11:00"
  }
];

// Helper to get request user
const getRequestUser = (req) => {
  const userId = req.headers['x-user-id'];
  if (userId) {
    const found = users.find(u => u.id === parseInt(userId, 10));
    if (found) return found;
  }
  return currentUser;
};

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: "ok",
    service: "tablenote"
  });
});

// Profile APIs
app.get('/api/profile', (req, res) => {
  const user = getRequestUser(req);
  res.json(user);
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/auth/login', (req, res) => {
  const { userId } = req.body;
  const found = users.find(u => u.id === parseInt(userId, 10));
  if (found) {
    currentUser = found;
  }
  res.json({ success: true, user: currentUser });
});

// Recipes APIs
// INTENTIONAL BACKEND BUG: site050-SEC-427 (Sorting mismatch)
// INTENTIONAL BACKEND BUG: site050-SEC-430 (Special char search query handling)
app.get('/api/recipes', (req, res) => {
  let { category, difficulty, sort = 'popular', search } = req.query;

  let filtered = [...recipes];

  // INTENTIONAL BACKEND BUG: site050-SEC-430
  // Special characters like & in query string are mishandled or split if unencoded
  let isBug430 = false;
  if (search && (search.includes('&') || req.url.includes('&') && !search.includes('&'))) {
    // If user searched with special character & like "토마토 & 바질"
    isBug430 = true;
    res.setHeader('X-Bug-Triggered', 'SEC-430');
    // Mimic query splitting bug where query string parsed only part before &
    const firstPart = search.split('&')[0].trim().toLowerCase();
    filtered = filtered.filter(r => r.title.toLowerCase().includes(firstPart));
  } else if (search && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.ingredients.some(ing => ing.toLowerCase().includes(q))
    );
  }

  if (category && category !== 'all' && category !== '전체') {
    filtered = filtered.filter(r => r.category === category);
  }
  if (difficulty && difficulty !== 'all' && difficulty !== '전체') {
    filtered = filtered.filter(r => r.difficulty === difficulty);
  }

  // INTENTIONAL BACKEND BUG: site050-SEC-427
  // Sorting state mismatch: when user requests 'cookingTime' or 'name' or 'latest',
  // the server re-applies previous/popular order or fails to sort properly
  let isBug427 = false;
  if (sort === 'cookingTime' || sort === 'title' || sort === 'latest') {
    isBug427 = true;
    res.setHeader('X-Bug-Triggered', 'SEC-427');
    // Stale sorting: returns popular sort order regardless of requested sort
    filtered.sort((a, b) => b.likes - a.likes);
  } else {
    // Default popular
    filtered.sort((a, b) => b.likes - a.likes);
  }

  res.json({
    recipes: filtered,
    total: filtered.length,
    activeSort: sort,
    ...(isBug427 ? {
      _bug: {
        id: "SEC-427",
        category: "sorting",
        family: "sort-state-mismatch",
        message: `정렬 기준 불일치: UI에서 '${sort}'(으)로 정렬을 요청했으나 실제 목록은 인기순(likes)으로 반환됨`
      }
    } : {}),
    ...(isBug430 ? {
      _bug: {
        id: "SEC-430",
        category: "input-handling",
        family: "query-encoding",
        message: "특수문자 검색어 처리 오류: 검색어 내 특수문자(&)가 URL 인코딩 없이 전달되어 쿼리 파라미터가 분리 해석됨"
      }
    } : {})
  });
});

app.get('/api/recipes/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) {
    return res.status(404).json({ error: "레시피를 찾을 수 없습니다." });
  }
  recipe.views += 1;
  res.json(recipe);
});

// INTENTIONAL BACKEND BUG: site050-SEC-426
// 클라이언트 검증만 존재하고 서버 측 필수 필드(제목, 카테고리, 재료, 순서) 검증이 누락되어 빈 값도 생성됨
app.post('/api/recipes', (req, res) => {
  const user = getRequestUser(req);
  const { title, category, difficulty, cookingTime, ingredients, steps, description, image } = req.body;

  // INTENTIONAL BACKEND BUG: site050-SEC-426
  // Server does NOT validate if title, ingredients, or steps are empty!
  let isBug426 = false;
  if (!title || title.trim() === '' || !ingredients || ingredients.length === 0 || !steps || steps.length === 0) {
    isBug426 = true;
    res.setHeader('X-Bug-Triggered', 'SEC-426');
  }

  const newRecipe = {
    id: Date.now(),
    title: title || "(제목 없는 레시피)",
    category: category || "기타",
    difficulty: difficulty || "쉬움",
    cookingTime: parseInt(cookingTime, 10) || 10,
    authorId: user ? user.id : 1,
    authorName: user ? user.name : "김민지",
    image: image || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&auto=format&fit=crop&q=80",
    description: description || "맛있게 만드는 나만의 비밀 레시피입니다.",
    ingredients: Array.isArray(ingredients) && ingredients.length > 0 ? ingredients : ["기본 재료 1"],
    steps: Array.isArray(steps) && steps.length > 0 ? steps : ["맛있게 조리합니다."],
    likes: 0,
    views: 1,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  recipes.unshift(newRecipe);

  res.status(201).json({
    success: true,
    recipe: newRecipe,
    ...(isBug426 ? {
      _bug: {
        id: "SEC-426",
        category: "validation",
        family: "server-validation-mismatch",
        message: "서버 입력 검증 부재: 필수 항목(제목, 재료, 조리순서)이 비어있음에도 백엔드 검증 없이 레시피가 생성됨"
      }
    } : {})
  });
});

// INTENTIONAL BACKEND BUG: site050-SEC-428
// 레시피 편집 자동저장 시 빠른 연속 수정 과정에서 마지막 변경 내용이 누락/손실될 수 있음
app.patch('/api/recipes/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) {
    return res.status(404).json({ error: "레시피를 찾을 수 없습니다." });
  }

  // INTENTIONAL BACKEND BUG: site050-SEC-428
  // If autosave request or rapid edit header/flag is detected, drop the last modified chunk
  const isAutosave = req.headers['x-autosave'] === 'true' || req.body._autosave;
  let isBug428 = false;

  if (isAutosave) {
    isBug428 = true;
    res.setHeader('X-Bug-Triggered', 'SEC-428');
    // Intentional bug: Stale save or save without latest trailing changes
    const payload = { ...req.body };
    delete payload._autosave;
    Object.assign(recipe, payload);
  } else {
    Object.assign(recipe, req.body);
  }

  res.json({
    success: true,
    recipe,
    ...(isBug428 ? {
      _bug: {
        id: "SEC-428",
        category: "autosave",
        family: "debounce-save-loss",
        message: "자동저장 데이터 손실: 디바운스 및 자동저장 처리 중 마지막 변경 내용이 서버에 온전히 반영되지 않음"
      }
    } : {})
  });
});

// INTENTIONAL BACKEND BUG: site050-SEC-429
// 레시피 삭제 시 식단 캘린더(mealPlans)의 참조 데이터를 정리하지 않아 dangling reference 발생
app.delete('/api/recipes/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = recipes.findIndex(r => r.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "레시피를 찾을 수 없습니다." });
  }

  recipes.splice(idx, 1);
  // Remove from favorites
  favorites = favorites.filter(favId => favId !== id);

  // INTENTIONAL BACKEND BUG: site050-SEC-429
  // Do NOT remove from mealPlans! Keep the dangling recipeId reference!
  const hasMealPlanReference = mealPlans.some(mp => mp.recipeId === id);
  let isBug429 = false;

  if (hasMealPlanReference) {
    isBug429 = true;
    res.setHeader('X-Bug-Triggered', 'SEC-429');
  }

  res.json({
    success: true,
    message: "레시피가 삭제되었습니다.",
    ...(isBug429 ? {
      _bug: {
        id: "SEC-429",
        category: "referential-integrity",
        family: "dangling-reference",
        message: `참조 무결성 오류: 레시피(ID: ${id})가 삭제되었으나 식단 캘린더에 여전히 참조 레코드가 잔존함`
      }
    } : {})
  });
});

// Favorites APIs
app.get('/api/favorites', (req, res) => {
  const favRecipes = recipes.filter(r => favorites.includes(r.id));
  res.json(favRecipes);
});

app.post('/api/favorites/:recipeId', (req, res) => {
  const recipeId = parseInt(req.params.recipeId, 10);
  if (!favorites.includes(recipeId)) {
    favorites.push(recipeId);
    const rec = recipes.find(r => r.id === recipeId);
    if (rec) rec.likes += 1;
  }
  res.json({ success: true, favorites });
});

app.delete('/api/favorites/:recipeId', (req, res) => {
  const recipeId = parseInt(req.params.recipeId, 10);
  favorites = favorites.filter(id => id !== recipeId);
  const rec = recipes.find(r => r.id === recipeId);
  if (rec && rec.likes > 0) rec.likes -= 1;
  res.json({ success: true, favorites });
});

// Meal Plans APIs
app.get('/api/meal-plans', (req, res) => {
  // Check if any meal plan references a deleted recipe
  const hasDangling = mealPlans.some(mp => !recipes.some(r => r.id === mp.recipeId));
  if (hasDangling) {
    res.setHeader('X-Bug-Triggered', 'SEC-429');
  }

  const enrichedPlans = mealPlans.map(mp => {
    const matchedRecipe = recipes.find(r => r.id === mp.recipeId);
    return {
      ...mp,
      isDangling: !matchedRecipe,
      recipeTitle: matchedRecipe ? matchedRecipe.title : `${mp.recipeTitle} (삭제된 레시피)`
    };
  });

  res.json(enrichedPlans);
});

app.post('/api/meal-plans', (req, res) => {
  const { day, slot, recipeId } = req.body;
  const rec = recipes.find(r => r.id === parseInt(recipeId, 10));

  const newPlan = {
    id: Date.now(),
    day: day || "월",
    slot: slot || "저녁",
    recipeId: rec ? rec.id : parseInt(recipeId, 10),
    recipeTitle: rec ? rec.title : "알 수 없는 레시피",
    recipeImage: rec ? rec.image : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"
  };

  mealPlans.push(newPlan);
  res.status(201).json(newPlan);
});

app.patch('/api/meal-plans/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const plan = mealPlans.find(p => p.id === id);
  if (!plan) return res.status(404).json({ error: "식단 항목을 찾을 수 없습니다." });

  Object.assign(plan, req.body);
  res.json(plan);
});

app.delete('/api/meal-plans/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  mealPlans = mealPlans.filter(p => p.id !== id);
  res.json({ success: true, message: "식단에서 삭제되었습니다." });
});

// Community APIs
app.get('/api/posts', (req, res) => {
  const { category } = req.query;
  let filtered = [...posts];
  if (category && category !== '전체') {
    filtered = filtered.filter(p => p.category === category);
  }
  res.json(filtered);
});

app.get('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const post = posts.find(p => p.id === id);
  if (!post) return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
  post.views += 1;
  res.json(post);
});

app.post('/api/posts', (req, res) => {
  const user = getRequestUser(req);
  const { title, content, category, imageUrl } = req.body;
  if (!title || !content) return res.status(400).json({ error: "제목과 내용을 입력해주세요." });

  const newPost = {
    id: Date.now(),
    title,
    content,
    category: category || "요리자랑",
    authorId: user ? user.id : 1,
    authorName: user ? user.name : "김민지",
    likes: 0,
    views: 1,
    commentsCount: 0,
    imageUrl: imageUrl || null,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  posts.unshift(newPost);
  res.status(201).json(newPost);
});

app.patch('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const post = posts.find(p => p.id === id);
  if (!post) return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
  Object.assign(post, req.body);
  res.json(post);
});

app.delete('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  posts = posts.filter(p => p.id !== id);
  comments = comments.filter(c => c.postId !== id);
  res.json({ success: true, message: "게시글이 삭제되었습니다." });
});

app.post('/api/posts/:id/like', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const post = posts.find(p => p.id === id);
  if (!post) return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
  post.likes += 1;
  res.json({ success: true, likes: post.likes });
});

// Comments APIs
app.get('/api/posts/:postId/comments', (req, res) => {
  const postId = parseInt(req.params.postId, 10);
  res.json(comments.filter(c => c.postId === postId));
});

app.post('/api/posts/:postId/comments', (req, res) => {
  const postId = parseInt(req.params.postId, 10);
  const post = posts.find(p => p.id === postId);
  if (!post) return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });

  const user = getRequestUser(req);
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: "댓글 내용을 입력해주세요." });

  const newComment = {
    id: Date.now(),
    postId,
    authorId: user ? user.id : 1,
    authorName: user ? user.name : "김민지",
    content: content.trim(),
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  comments.push(newComment);
  post.commentsCount += 1;
  res.status(201).json(newComment);
});

// Static assets & SPA fallback
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

app.listen(PORT, () => {
  console.log(`TableNote (site050) server running on http://localhost:${PORT}`);
});
