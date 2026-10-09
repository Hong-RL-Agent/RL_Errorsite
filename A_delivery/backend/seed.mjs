export function seed(id) {
  if(id==='A-01') return {items:[{id:1,title:'체크 노트',price:6800},{id:2,title:'젤펜 세트',price:12400},{id:3,title:'위클리 플래너',price:9300},{id:4,title:'점착 메모',price:4200},{id:5,title:'펜슬 파우치',price:15800}],cart:[{id:2,qty:1},{id:3,qty:1}],saved:[]};
  if(id==='A-02') return {posts:[{id:1,title:'주말 장터',content:'토요일 오전에 만나요.',likes:0},{id:2,title:'분실물 안내',content:'도서관에서 우산을 보관합니다.',likes:0},{id:3,title:'독서 모임',content:'금요일 저녁 모임입니다.',likes:0},{id:4,title:'운동 친구',content:'주말 산책을 함께해요.',likes:0},{id:5,title:'카페 추천',content:'동네 카페를 소개합니다.',likes:0}],nextId:6};
  if(id==='A-03') return {courses:[{id:1,title:'파이썬 기초',hours:12},{id:2,title:'사진 입문',hours:8},{id:3,title:'드로잉 시작',hours:6},{id:4,title:'웹 개발',hours:15},{id:5,title:'생활 영어',hours:10}],enrolled:[2]};
  if(id==='A-04') return {menus:[{id:1,title:'후라이드 치킨',price:20000},{id:2,title:'짜장면',price:6000},{id:3,title:'비빔밥',price:9000},{id:4,title:'김치찌개',price:8500},{id:5,title:'샌드위치',price:7000}],order:[{id:2,qty:1}],discount:0,total:6000,receipt:[]};
  if(id==='A-05') return {flow:{step:0,room:'standard',nights:1,guests:1,breakfast:false,dates:'2026-10-20',quote:0,history:[]},availability:{standard:3,deluxe:3,suite:3,garden:3},charged:0,reservations:[]};
  if(id==='A-06') return {city:'서울',transport:'기차',stage:'start',route:[],capacity:4,balance:100000,history:[]};
  if(id==='A-07') return {profile:{displayName:'김하늘',bio:'여행과 독서를 좋아합니다.',locale:'한국어',newsletter:false,phone:'010-1234-5678'}};
  if(id==='A-08') return {books:[{id:1,title:'달빛 서재',author:'이수아',year:2024},{id:2,title:'마음의 정원',author:'박지현',year:2023},{id:3,title:'우주의 시간',author:'박성훈',year:2022},{id:4,title:'파이썬으로 배우는 AI',author:'김현준',year:2024}],loans:[{id:2,due:'2026-10-25',fee:1000},{id:3,due:'2026-10-25',fee:0}],fee:1000,query:'',year:'전체',matches:[]};
  if(id==='A-09') return {seats:[{id:'B1',selected:false},{id:'B2',selected:false},{id:'B3',selected:false},{id:'B4',selected:false}],count:1,tier:'일반',parking:false,invoice:0,preference:'모바일',booking:null,capacity:4};
  return {qty:1,day:'2026-10-20',session:'저녁',reservation:null,balance:120000,note:'계단 이용 가능',guest:'',stage:'schedule'};
}
