// 가상의 테스트 카탈로그 정의 (실제 브랜드/가격/상품과 무관)

const BRANDS = [
  'Novatek', 'Aerion', 'Lumio', 'Kestrel', 'Orbix', 'Zephra', 'Quanta', 'Vireo', 'Helion', 'Mirae Tech',
  'Solara', 'Tandem', 'Nimbus', 'Cobalt Works', 'Ardent', 'Pixelon', 'Verdant', 'Skylark', 'Ironleaf', 'Auralis',
  'Bytewave', 'Cinder', 'Dorian', 'Eclipse Lab', 'Fjord', 'Glimmer', 'Halcyon', 'Ionic', 'Juniper', 'Krypto',
  'Lynx', 'Meridian', 'Nuvola', 'Onyx', 'Paragon', 'Quill', 'Raven', 'Sable', 'Tessera', 'Umbra',
  'Vantage', 'Wisp', 'Xenon', 'Yonder', 'Zenith',
];

const SELLERS = ['스펙마켓', '디지털온', '테크스토어', '홈앤몰', '버드마트', '플러그샵'];

// specs: 카테고리별 필터/비교 스펙. options 는 필터 선택지(= 값 후보)
const CATEGORIES = [
  {
    slug: 'laptop', name: '노트북', icon: '💻', noun: '노트북', price: [600000, 2800000],
    series: ['Slim', 'Pro', 'Air', 'Studio', 'Edge', 'Flex'],
    specs: [
      { key: 'cpu', label: 'CPU', options: ['Core i5', 'Core i7', 'Ryzen 5', 'Ryzen 7', 'M-class'] },
      { key: 'ram', label: 'RAM', options: ['8GB', '16GB', '32GB'] },
      { key: 'storage', label: '저장 공간', options: ['256GB', '512GB', '1TB'] },
      { key: 'screen', label: '화면 크기', options: ['13인치', '14인치', '15.6인치', '16인치'] },
      { key: 'weight', label: '무게', options: ['1.2kg', '1.4kg', '1.6kg', '1.9kg', '2.2kg'] },
    ],
  },
  {
    slug: 'monitor', name: '모니터', icon: '🖥️', noun: '모니터', price: [150000, 1200000],
    series: ['Vision', 'Crest', 'View', 'Ultra', 'Arc', 'Prime'],
    specs: [
      { key: 'screen', label: '화면 크기', options: ['24인치', '27인치', '32인치', '34인치'] },
      { key: 'resolution', label: '해상도', options: ['FHD', 'QHD', '4K', 'UWQHD'] },
      { key: 'refresh', label: '주사율', options: ['60Hz', '75Hz', '144Hz', '165Hz', '240Hz'] },
      { key: 'panel', label: '패널', options: ['IPS', 'VA', 'OLED', 'TN'] },
      { key: 'response', label: '응답속도', options: ['1ms', '4ms', '5ms'] },
    ],
  },
  {
    slug: 'smartphone', name: '스마트폰', icon: '📱', noun: '스마트폰', price: [400000, 1800000],
    series: ['Neo', 'Max', 'Lite', 'Ultra', 'One', 'Fold'],
    specs: [
      { key: 'storage', label: '저장 공간', options: ['128GB', '256GB', '512GB', '1TB'] },
      { key: 'battery', label: '배터리', options: ['4000mAh', '4500mAh', '5000mAh', '5500mAh'] },
      { key: 'camera', label: '카메라', options: ['12MP', '48MP', '50MP', '108MP', '200MP'] },
      { key: 'screen', label: '화면 크기', options: ['6.1인치', '6.4인치', '6.7인치'] },
      { key: 'weight', label: '무게', options: ['165g', '185g', '200g', '225g'] },
    ],
  },
  {
    slug: 'tablet', name: '태블릿', icon: '📲', noun: '태블릿', price: [250000, 1600000],
    series: ['Tab', 'Pad', 'Slate', 'Note', 'Canvas', 'Air'],
    specs: [
      { key: 'storage', label: '저장 공간', options: ['64GB', '128GB', '256GB', '512GB'] },
      { key: 'screen', label: '화면 크기', options: ['8.3인치', '10.9인치', '11인치', '12.9인치'] },
      { key: 'battery', label: '배터리', options: ['7000mAh', '8000mAh', '9000mAh', '10000mAh'] },
      { key: 'weight', label: '무게', options: ['300g', '460g', '500g', '640g'] },
      { key: 'network', label: '네트워크', options: ['Wi-Fi', 'LTE'] },
    ],
  },
  {
    slug: 'earbuds', name: '무선이어폰', icon: '🎧', noun: '무선이어폰', price: [40000, 350000],
    series: ['Buds', 'Pods', 'Drop', 'Note', 'Beat', 'Wave'],
    specs: [
      { key: 'connection', label: '무선 연결', options: ['Bluetooth 5.0', 'Bluetooth 5.2', 'Bluetooth 5.3', 'Bluetooth 5.4'] },
      { key: 'battery', label: '배터리 사용시간', options: ['5시간', '6시간', '8시간', '10시간'] },
      { key: 'weight', label: '무게', options: ['4g', '5g', '6g', '7g'] },
      { key: 'noise', label: '노이즈 캔슬링', options: ['지원', '미지원'] },
      { key: 'waterproof', label: '방수 등급', options: ['IPX4', 'IPX5', 'IPX7'] },
    ],
  },
  {
    slug: 'headset', name: '헤드셋', icon: '🎮', noun: '헤드셋', price: [40000, 400000],
    series: ['Core', 'Echo', 'Pulse', 'Stage', 'Rift', 'Tone'],
    specs: [
      { key: 'connection', label: '연결 방식', options: ['유선', '2.4GHz 무선', 'Bluetooth'] },
      { key: 'battery', label: '배터리 사용시간', options: ['20시간', '30시간', '40시간', '60시간'] },
      { key: 'weight', label: '무게', options: ['250g', '300g', '350g', '400g'] },
      { key: 'type', label: '착용 형태', options: ['오버이어', '온이어'] },
      { key: 'mic', label: '마이크', options: ['붐마이크', '내장마이크'] },
    ],
  },
  {
    slug: 'keyboard', name: '키보드', icon: '⌨️', noun: '키보드', price: [30000, 300000],
    series: ['Type', 'Key', 'Forge', 'Loft', 'Click', 'Mono'],
    specs: [
      { key: 'switch', label: '스위치', options: ['적축', '갈축', '청축', '저소음적축', '멤브레인'] },
      { key: 'layout', label: '배열', options: ['풀배열', '텐키리스', '75%', '60%'] },
      { key: 'connection', label: '연결 방식', options: ['유선', 'Bluetooth', '2.4GHz'] },
      { key: 'backlight', label: '백라이트', options: ['RGB', '단색', '없음'] },
      { key: 'weight', label: '무게', options: ['450g', '650g', '850g', '1000g'] },
    ],
  },
  {
    slug: 'mouse', name: '마우스', icon: '🖱️', noun: '마우스', price: [20000, 180000],
    series: ['Glide', 'Swift', 'Dash', 'Grip', 'Orb', 'Zip'],
    specs: [
      { key: 'dpi', label: '센서 DPI', options: ['8000DPI', '16000DPI', '26000DPI', '30000DPI'] },
      { key: 'connection', label: '연결 방식', options: ['유선', '무선', 'Bluetooth'] },
      { key: 'buttons', label: '버튼 수', options: ['3버튼', '6버튼', '8버튼'] },
      { key: 'weight', label: '무게', options: ['60g', '80g', '100g', '120g'] },
    ],
  },
  {
    slug: 'camera', name: '카메라', icon: '📷', noun: '카메라', price: [500000, 3500000],
    series: ['Lens', 'Frame', 'Focus', 'Shot', 'Vista', 'Zoom'],
    specs: [
      { key: 'sensor', label: '센서', options: ['APS-C', '풀프레임', '마이크로포서스', '1인치'] },
      { key: 'pixels', label: '유효 화소', options: ['20MP', '24MP', '26MP', '33MP', '45MP'] },
      { key: 'video', label: '동영상', options: ['4K 30p', '4K 60p', '6K', '8K'] },
      { key: 'weight', label: '무게', options: ['400g', '520g', '650g', '750g'] },
      { key: 'stabilization', label: '손떨림 보정', options: ['지원', '미지원'] },
    ],
  },
  {
    slug: 'vacuum', name: '청소기', icon: '🧹', noun: '청소기', price: [100000, 1500000],
    series: ['Clean', 'Sweep', 'Swirl', 'Dust', 'Zoom', 'Pure'],
    specs: [
      { key: 'suction', label: '흡입력', options: ['100AW', '150AW', '200AW', '250AW'] },
      { key: 'runtime', label: '사용시간', options: ['30분', '45분', '60분', '90분'] },
      { key: 'weight', label: '무게', options: ['1.3kg', '1.6kg', '2.0kg', '2.5kg'] },
      { key: 'type', label: '유형', options: ['무선스틱', '로봇', '유선캐니스터'] },
      { key: 'dustbin', label: '먼지통 용량', options: ['0.3L', '0.5L', '0.8L', '1.2L'] },
    ],
  },
  {
    slug: 'purifier', name: '공기청정기', icon: '🌀', noun: '공기청정기', price: [150000, 900000],
    series: ['Air', 'Breeze', 'Fresh', 'Mist', 'Halo', 'Calm'],
    specs: [
      { key: 'area', label: '적용 면적', options: ['20평', '30평', '40평', '60평'] },
      { key: 'filter', label: '필터', options: ['HEPA H13', 'HEPA H14', '헤파+탈취'] },
      { key: 'noise', label: '소음', options: ['20dB', '25dB', '30dB', '35dB'] },
      { key: 'weight', label: '무게', options: ['4kg', '6kg', '8kg', '10kg'] },
      { key: 'power', label: '소비전력', options: ['30W', '45W', '60W', '80W'] },
    ],
  },
  {
    slug: 'appliance', name: '생활가전', icon: '🏠', noun: '생활가전', price: [30000, 400000],
    series: ['Home', 'Easy', 'Daily', 'Cook', 'Warm', 'Smart'],
    specs: [
      { key: 'type', label: '제품 유형', options: ['에어프라이어', '전기포트', '토스터', '가습기'] },
      { key: 'capacity', label: '용량', options: ['1.7L', '3L', '5L', '8L'] },
      { key: 'power', label: '소비전력', options: ['800W', '1200W', '1500W', '1800W'] },
      { key: 'weight', label: '무게', options: ['1.2kg', '2.5kg', '4kg', '6kg'] },
      { key: 'energy', label: '에너지 효율', options: ['1등급', '2등급', '3등급'] },
    ],
  },
];

const RECOMMENDED_KEYWORDS = ['가벼운 노트북', '게이밍 모니터', '노이즈 캔슬링', '무선 청소기', '가성비 태블릿', '미러리스 카메라'];

const POPULAR_SEED_KEYWORDS = [
  '노트북', '모니터', '스마트폰', '태블릿', '무선이어폰', '헤드셋', '키보드', '마우스', '카메라', '청소기',
  '공기청정기', '생활가전', 'Slim', 'Pro', 'Air', 'Novatek', 'Aerion', 'Lumio', 'Kestrel', 'Orbix',
  'Studio', 'Buds', 'Vision', 'Neo', 'Tab', 'Clean', 'Fresh', 'Forge', 'Glide', 'Lens',
];

const COLOR_PAIRS = [
  ['#1d4ed8', '#60a5fa'], ['#047857', '#34d399'], ['#0f172a', '#475569'], ['#7c3aed', '#c4b5fd'],
  ['#0e7490', '#67e8f9'], ['#b45309', '#fcd34d'], ['#be123c', '#fda4af'], ['#334155', '#94a3b8'],
];

const IMAGE_LABELS = ['정면', '측면', '후면', '상단', '포트', '구성품', '사용 예시', '패키지'];

const PROS_POOL = ['가성비가 뛰어남', '휴대성이 좋음', '마감 품질이 우수함', '배터리 효율이 높음', '작동 소음이 적음', '사용 설명이 쉬움', 'A/S 만족도가 높음', '화면·음질 균형이 좋음'];
const CONS_POOL = ['가격대가 다소 높음', '기본 구성품이 단출함', '초기 설정이 필요함', '색상 선택이 제한적', '일부 기능은 앱 설치 필요', '무게가 아쉬움'];

const REVIEW_TITLES = ['만족스러운 구매', '가격 대비 훌륭해요', '생각보다 괜찮아요', '아쉬운 점도 있어요', '재구매 의사 있습니다', '기대 이상입니다', '무난하게 쓰기 좋아요'];
const REVIEW_BODIES = [
  '한 달 정도 사용해 봤는데 전반적으로 만족합니다.',
  '사양 대비 가격이 합리적이고 마감도 깔끔합니다.',
  '설명서가 간단해서 바로 쓸 수 있었습니다.',
  '일부 기능은 아쉽지만 일상 사용에는 충분합니다.',
  '배송이 빨랐고 포장 상태도 좋았습니다.',
  '주변에 추천하고 싶은 제품입니다.',
];

const SURNAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임'];
const GIVEN = ['민준', '서연', '지호', '하은', '도윤', '수아', '예준', '지우', '시우', '채원'];

module.exports = {
  BRANDS, SELLERS, CATEGORIES, RECOMMENDED_KEYWORDS, POPULAR_SEED_KEYWORDS, COLOR_PAIRS, IMAGE_LABELS,
  PROS_POOL, CONS_POOL, REVIEW_TITLES, REVIEW_BODIES, SURNAMES, GIVEN,
};
