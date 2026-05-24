(function () {
  const originalFetch = window.fetch.bind(window);

  const products = [
    { id: 'p1', title: '깨끗한 전공서적 팝니다 (컴퓨터구조)', price: 15000, category: '도서', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400&h=300' },
    { id: 'p2', title: '거의 새것 무선 마우스', price: 20000, category: '전자기기', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=400&h=300' },
    { id: 'p3', title: '아이패드 프로 4세대', price: 700000, category: '전자기기', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=400&h=300' },
    { id: 'p4', title: '전자기기 입문용 키보드', price: 30000, category: '전자기기', image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=400&h=300' },
    { id: 'p5', title: '편한 자취방 의자', price: 40000, category: '가구', image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=400&h=300' },
    { id: 'p6', title: '자취 필수품 전자레인지', price: 50000, category: '가전', image: 'https://images.unsplash.com/photo-1585659722983-3a6750f2fd82?auto=format&fit=crop&q=80&w=400&h=300' }
  ];

  function json(data, init = {}) {
    return Promise.resolve(new Response(JSON.stringify(data), {
      status: init.status || 200,
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  function parseBody(init) {
    if (!init || !init.body) return {};
    try {
      return JSON.parse(init.body);
    } catch {
      return {};
    }
  }

  window.fetch = function (input, init) {
    const rawUrl = typeof input === 'string' ? input : input.url;
    const url = new URL(rawUrl, window.location.href);

    if (!url.pathname.startsWith('/api/')) {
      return originalFetch(input, init);
    }

    if (url.pathname === '/api/products') {
      let result = [...products];
      const category = url.searchParams.get('category');
      const sort = url.searchParams.get('sort');

      if (category && category !== '전체') {
        result = result.filter(product => product.title.includes(category));
      }

      if (sort === 'priceAsc') {
        result.sort((a, b) => a.price - b.price);
      } else if (sort === 'priceDesc') {
        result.sort((a, b) => b.price - a.price);
      }

      return json(result);
    }

    const productMatch = url.pathname.match(/^\/api\/products\/([^/]+)$/);
    if (productMatch) {
      const product = products.find(item => item.id === productMatch[1]);
      return product ? json(product) : json({ error: 'Product not found' }, { status: 404 });
    }

    if (url.pathname === '/api/favorites') {
      const body = parseBody(init);
      if (body.productId === 'p3') {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(new Response(JSON.stringify({ success: true, message: 'Added to favorites (delayed)' }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }));
          }, 30000);
        });
      }

      return json({ success: true, message: 'Added to favorites' });
    }

    if (url.pathname === '/api/mypage') {
      const headers = new Headers((init && init.headers) || {});
      const userId = headers.get('x-user-id');
      if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });

      return json({
        userId,
        name: '익명의 대학생',
        points: 1500,
        salesCount: 5,
        buyCount: 2
      });
    }

    return json({ error: 'Mock endpoint not found' }, { status: 404 });
  };
})();
