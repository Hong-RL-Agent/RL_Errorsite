const categories = ['전체', '치킨', '피자/양식', '중식', '한식', '분식', '디저트']

const restaurants = [
  {
    id: 1,
    name: '황금올리브 치킨',
    category: '치킨',
    rating: 4.8,
    deliveryTime: '30~40분',
    minOrder: 18000,
    menus: [
      { id: 101, name: '후라이드 치킨', price: 20000, desc: '바삭하고 고소한 후라이드' },
      { id: 102, name: '양념 치킨', price: 21500, desc: '달콤 매콤 양념 치킨' }
    ]
  },
  {
    id: 2,
    name: '도미노 피자',
    category: '피자/양식',
    rating: 4.5,
    deliveryTime: '40~50분',
    minOrder: 15000,
    menus: [
      { id: 201, name: '포테이토 피자 (L)', price: 27900, desc: '감자와 베이컨의 조화' },
      { id: 202, name: '블랙타이거 슈림프', price: 34900, desc: '새우와 스테이크의 만남' }
    ]
  },
  {
    id: 3,
    name: '홍콩반점',
    category: '중식',
    rating: 4.7,
    deliveryTime: '20~30분',
    minOrder: 12000,
    menus: [
      { id: 301, name: '짜장면', price: 6000, desc: '진한 불맛 짜장' },
      { id: 302, name: '탕수육 (소)', price: 14900, desc: '바삭 쫀득 탕수육' }
    ]
  }
]

function json(data) {
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
}

export function installMockApi() {
  const originalFetch = window.fetch.bind(window)

  window.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input?.url
    const parsed = new URL(url, window.location.href)

    if (!parsed.pathname.startsWith('/api/')) {
      return originalFetch(input, init)
    }

    if (parsed.pathname === '/api/categories') {
      return Promise.resolve(json({ success: true, data: categories }))
    }

    if (parsed.pathname === '/api/restaurants') {
      const category = parsed.searchParams.get('category')
      let filtered = restaurants
      if (category && category !== '전체') filtered = filtered.filter(restaurant => restaurant.category === category)
      return Promise.resolve(json({ success: true, data: filtered }))
    }

    return Promise.resolve(json({ success: false, data: null }))
  }
}
