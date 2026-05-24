(function () {
  const originalFetch = window.fetch.bind(window);
  const siteMatch = window.location.pathname.match(/site\d{3}/);
  const siteId = siteMatch ? siteMatch[0] : 'site001';

  function response(data, init = {}) {
    return Promise.resolve(new Response(JSON.stringify(data), {
      status: init.status || 200,
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  function body(init) {
    if (!init || !init.body) return {};
    try { return JSON.parse(init.body); } catch { return {}; }
  }

  const img = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400&h=300';
  const state = { saved: ['r1'], bookmarks: [], expenses: [] };

  const data = {
    site002: { books: [{ id: 'b1', title: 'Database Systems', author: 'R. Kim', genre: 'IT', rating: 4.8, available: true, image: img, description: 'Campus library copy.' }, { id: 'b2', title: 'Network Basics', author: 'J. Park', genre: 'IT', rating: 4.2, available: false, image: img, description: 'Currently unavailable.' }], user: { name: 'Demo User', email: 'demo@example.com', memberLevel: 'Gold', activeRentals: 2 } },
    site003: { workouts: [{ id: 'w1', name: 'Morning Run', type: '유산소', duration: 30, calories: 220, completed: false }, { id: 'w2', name: 'Push Up Set', type: '근력', duration: 20, calories: 120, completed: false }], stats: { totalWorkouts: 12, totalMinutes: 430, caloriesBurned: 2100, streak: 5 }, profile: { name: 'Demo Athlete', level: 'Intermediate', statusMsg: 'On track' } },
    site004: { pets: [{ id: 'pet1', name: 'Coco', type: 'Dog', age: 3, image: img }], vaccines: [{ id: 'v1', petId: 'pet1', name: 'Rabies', date: '2026-06-01', hospital: 'Campus Vet' }], records: [{ id: 'rec1', petId: 'pet1', date: '2026-05-01', note: 'Healthy check complete' }], appointments: [{ id: 'apt1', hospital: 'Campus Vet', date: '2026-06-03', time: '10:00' }] },
    site005: { destinations: [{ id: 'd1', name: 'Jeju', region: '제주', image: img, desc: 'Island trip' }, { id: 'd2', name: 'Busan', region: '부산', image: img, desc: 'Sea trip' }], itinerary: [{ id: 'it1', date: '2026-06-01', place: 'Jeju Airport', memo: 'Arrival' }], budget: { amount: 800000 } },
    site006: { menus: [{ id: 'm1', name: 'Chicken Box', type: '고단백', price: 8500, stock: 3, cal: 520 }, { id: 'm2', name: 'Veggie Box', type: '샐러드', price: 7500, stock: 12, cal: 380 }], orders: [], reviews: [{ id: 'rv1', menuId: 'm1', user: 'demo', rating: 5, content: 'Fresh and fast.' }] },
    site007: { rooms: [{ id: 'r1', name: 'A Room', type: '스터디룸', capacity: 4 }, { id: 'r2', name: 'B Room', type: '회의실', capacity: 8 }], slots: [{ time: '10:00', available: true }, { time: '11:00', available: true }, { time: '12:00', available: false }], bookings: [{ id: 'bk1', roomId: 'r1', date: '2026-06-01', time: '10:00', user: 'user123', status: 'confirmed' }], notices: [{ title: 'Maintenance notice', date: '2026-05-24' }] },
    site008: { movies: [{ id: 'mv1', title: 'Campus Night', genre: 'Drama', rating: 4.5, poster: img }, { id: 'mv2', title: 'Debug Hero', genre: 'Action', rating: 4.0, poster: img }], reviews: [{ id: 'mr1', movieId: 'mv1', user: 'demo', content: 'Great.', rating: 5 }], preferences: { genre: 'Drama', notifications: true } },
    site009: { items: [{ id: 'i1', name: 'Green Tea', category: 'drink', price: 4500, image: img }, { id: 'i2', name: 'Eco Bag', category: 'goods', price: 12000, image: img }], orders: [] },
    site010: { songs: [{ id: 's1', title: 'Loop One', artist: 'DJ Demo', album: 'Campus', duration: '3:14' }, { id: 's2', title: 'Popular Track', artist: 'Band', album: 'Top', duration: '2:58' }], playlists: [{ id: 'pl1', name: 'Study Mix', isPrivate: false }, { id: 'pl2', name: 'Private Mix', isPrivate: true }], recent: [{ id: 's2', title: 'Popular Track', artist: 'Band' }], artists: [{ id: 'a1', name: 'DJ Demo', followers: 1200 }] },
    site011: { plants: [{ id: 'p1', name: 'Basil', type: 'Herb', image: img, lastWatered: '2026-05-20' }], tips: [{ id: 't1', title: 'Water lightly', content: 'Keep soil moist.' }], growth: [{ date: '2026-05-01', height: 12, note: 'Sprout' }] },
    site012: { menu: [{ id: 'c1', name: 'Americano', price: 3500, category: 'coffee' }, { id: 'c2', name: 'Sandwich', price: 6500, category: 'food' }], queue: [{ id: 'q1', orderNo: 12, status: 'preparing' }], membership: { id: 'mem1', name: 'Demo Member', points: 1200, grade: 'Silver' } },
    site013: { classes: [{ id: 'cl1', title: 'Watercolor Basic', teacher: 'Kim', date: '2026-06-02', seats: 5, image: img }], reservations: [{ id: 'rs1', classId: 'cl1', user: 'demo', status: 'confirmed' }], reviews: [{ id: 're1', user: 'demo', content: 'Helpful class.', rating: 5 }] },
    site014: { produce: [{ id: 'pr1', name: 'Tomato Box', region: '강원', price: 15000, stock: 4, image: img }, { id: 'pr2', name: 'Apple Box', region: '경북', price: 22000, stock: 10, image: img }], groups: [{ id: 'g1', produceId: 'pr1', title: 'Tomato group buy', remaining: 4 }], orders: [] },
    site015: { events: [{ id: 'ev1', title: 'Campus Talk', category: 'talk', location: 'Hall A', date: '2026-06-05', remainingSeats: 8, image: img }], notices: [{ title: 'Entry opens soon', content: 'Please arrive early.' }], applications: [] },
    site016: { expenses: [{ id: 'ex1', category: 'Food', title: 'Lunch', amount: 9000, date: '2026-05-24' }, { id: 'ex2', category: 'Book', title: 'Textbook', amount: 30000, date: '2026-05-23' }], budget: { limit: 300000 }, report: { count: 2, totalSpent: 39000, timestamp: '2026-05-24 12:00' } },
    site017: { recipes: [{ id: 'r1', title: 'Tomato Pasta', image: img, time: '20 min', difficulty: 'Easy', ingredients: ['tomato', 'pasta'] }, { id: 'r2', title: 'Egg Rice', image: img, time: '10 min', difficulty: 'Easy', ingredients: ['egg', 'rice'] }], reviews: [{ user: 'demo', content: 'Nice recipe.', rating: 5 }] },
    site018: { jobs: [{ id: 'j1', company: 'Demo Labs', title: 'Frontend Intern', position: 'Frontend', location: 'Seoul', tags: ['React', 'JS'], salary: 'Negotiable' }, { id: 'j2', company: 'API Works', title: 'Backend Intern', position: 'Backend', location: 'Remote', tags: ['Node', 'API'], salary: 'Negotiable' }], applications: { app1: { id: 'app1', user: 'demo', status: 'Submitted', appliedAt: '2026-05-24' }, app999: { id: 'app999', user: 'other-user', status: 'Accepted', appliedAt: '2026-05-01', secretNote: 'Internal reviewer note' } } },
    site019: { departments: ['내과', '정형외과', '피부과'], doctors: [{ id: 'doc1', name: 'Dr. Kim', dept: '내과', image: img, desc: 'General care' }, { id: 'doc2', name: 'Dr. Lee', dept: '피부과', image: img, desc: 'Skin care' }], appointments: [{ id: 'ap1', doctorId: 'doc1', date: '2026-06-01', time: '10:00', user: '홍길동' }] },
    site020: { news: [{ id: 'n1', title: 'Campus Network Update', category: 'Tech', date: '2026-05-24', read: false }, { id: 'n2', title: 'Security Notice', category: 'Security', date: '2026-05-23', read: false }], trends: { keywords: ['database', 'network', 'security'], date: '2026-05-20' }, subscriptions: { 'sub-999': { userId: 'other-user', email: 'other@example.com', categories: ['Security'], secretNote: 'Private subscription exposed' } } }
  };

  function handle(site, url, init) {
    const d = data[site] || {};
    const path = url.pathname;
    const method = ((init && init.method) || 'GET').toUpperCase();

    if (site === 'site002') { if (path === '/api/books') return response(d.books); if (path.startsWith('/api/books/')) return response(d.books.find(x => x.id === path.split('/').pop()) || d.books[0]); if (path === '/api/rentals') return response({ success: true, message: 'Rental request accepted' }); if (path === '/api/user') return response(d.user); }
    if (site === 'site003') { if (path === '/api/workouts' && method === 'GET') return response(d.workouts); if (path === '/api/workouts' && method === 'POST') return response({ success: true, workout: { id: 'w-new', name: 'New Workout', type: '근력' } }); if (path.includes('/complete')) return response({ success: true, message: 'Workout completed' }); if (path === '/api/stats') return response(d.stats); if (path === '/api/profile') return response(d.profile); }
    if (site === 'site004') { if (path === '/api/pets') return response(d.pets); if (path === '/api/vaccines') return response(d.vaccines); if (path === '/api/records' && method === 'GET') return response(d.records); if (path === '/api/records') return response({ success: true, message: 'Record saved' }); if (path === '/api/appointments' && method === 'GET') return response(d.appointments); if (path === '/api/appointments') return response({ success: true, message: 'Appointment created' }); }
    if (site === 'site005') { if (path === '/api/destinations') return response(d.destinations); if (path === '/api/itinerary' && method === 'GET') return response(d.itinerary); if (path === '/api/itinerary') return response({ success: true, item: body(init) }); if (path.startsWith('/api/itinerary/')) return response(d.itinerary); if (path === '/api/budget' && method === 'GET') return response(d.budget); if (path === '/api/budget') return response({ amount: body(init).amount || d.budget.amount }); }
    if (site === 'site006') { if (path === '/api/menus') return response(d.menus); if (path === '/api/orders' && method === 'GET') return response(d.orders); if (path === '/api/orders') return response({ success: true, order: { id: 'o1', totalPrice: body(init).totalPrice || 1000, createdAt: '2026-05-24' } }); if (path === '/api/reviews' && method === 'GET') return response(d.reviews); if (path === '/api/reviews') return response({ success: true }); }
    if (site === 'site007') { if (path === '/api/rooms') return response(d.rooms); if (path === '/api/timeslots') return response(d.slots); if (path === '/api/bookings' && method === 'POST') return response({ success: true }); if (path === '/api/bookings/my' || path === '/api/bookings/all') return response(d.bookings); if (/^\/api\/bookings\/[^/]+\/cancel$/.test(path)) return response({ success: true }); if (path === '/api/notices') return response(d.notices); }
    if (site === 'site008') { if (path === '/api/movies') return response(d.movies); if (path === '/api/favorites' && method === 'GET') return response(d.movies.slice(0, 1)); if (path === '/api/favorites') return response({ success: true }); if (path === '/api/reviews') return response(method === 'GET' ? d.reviews : { success: true }); if (path === '/api/preferences') return response(method === 'GET' ? d.preferences : { success: true }); }
    if (site === 'site009') { if (path === '/api/items') return response(d.items); if (path === '/api/coupons/apply') return response({ success: true, discount: 1000, message: 'Coupon applied' }); if (path === '/api/orders' && method === 'GET') return response(d.orders); if (path === '/api/orders') return response({ success: true, orderId: 'ord-1' }); }
    if (site === 'site010') { if (path === '/api/songs') return response(d.songs); if (path === '/api/playlists') return response(d.playlists); if (path === '/api/recent') return response(d.recent); if (path === '/api/artists') return response(d.artists); if (/^\/api\/playlists\/[^/]+\/songs$/.test(path)) return response(d.recent); if (/^\/api\/playlists\/[^/]+$/.test(path)) return response(d.playlists.find(x => x.id === path.split('/').pop()) || d.playlists[0]); }
    if (site === 'site011') { if (path === '/api/plants') return response(d.plants); if (path === '/api/tips') return response(d.tips); if (path.startsWith('/api/growth/') || path === '/api/growth') return response(d.growth); if (path.startsWith('/api/watering/')) return response({ success: true, message: 'Watered' }); }
    if (site === 'site012') { if (path === '/api/menu') return response(d.menu); if (path === '/api/orders') return response({ success: true, orderNo: 13 }); if (path === '/api/queue') return response(d.queue); if (path.startsWith('/api/membership/')) return response(d.membership); }
    if (site === 'site013') { if (path === '/api/classes') return response(d.classes); if (path === '/api/reservations') return response(method === 'GET' ? d.reservations : { success: true }); if (path === '/api/reviews') return response(method === 'GET' ? d.reviews : { success: true }); if (path.startsWith('/api/reviews/delete/')) return response({ success: true }); }
    if (site === 'site014') { if (path === '/api/produce') return response(d.produce); if (path === '/api/group-orders') return response(d.groups); if (path === '/api/group-orders/join') return response({ success: true, remaining: 3 }); if (path === '/api/orders') return response({ success: true }); if (path === '/api/produce/error-test') return response({ error: 'Debug info leaked', internalPath: '/var/app/data/produce.json', dataSource: 'produceData' }); }
    if (site === 'site015') { if (path === '/api/events') return response(d.events); if (path === '/api/applications' && method === 'GET') return response({ data: d.applications }); if (path === '/api/applications') return response({ success: true }); if (path === '/api/notices') return response(d.notices); }
    if (site === 'site016') { if (path === '/api/expenses' && method === 'GET') return response(d.expenses.concat(state.expenses)); if (path === '/api/expenses') { state.expenses.push(body(init)); return response({ success: true }); } if (path.startsWith('/api/budget/')) return response(d.budget); if (path === '/api/report') return response(d.report); }
    if (site === 'site017') { if (path === '/api/recipes') return response(d.recipes); if (path === '/api/saved' && method === 'GET') return response(state.saved); if (path === '/api/saved') return response({ success: true, message: 'Saved' }); if (path === '/api/reviews') return response(method === 'GET' ? d.reviews : { success: true }); }
    if (site === 'site018') { if (path === '/api/jobs') return response({ data: d.jobs, page: Number(url.searchParams.get('page') || 1) }); if (path === '/api/saved-jobs' && method === 'GET') return response(['j1']); if (path === '/api/saved-jobs') return response({ success: true }); if (path.startsWith('/api/applications/')) return response(d.applications[path.split('/').pop()] || { error: 'Not found' }); }
    if (site === 'site019') { if (path === '/api/departments') return response(d.departments); if (path === '/api/doctors') return response(d.doctors); if (path === '/api/appointments' && method === 'POST') return response({ success: true }); if (path === '/api/my-appointments') return response(d.appointments); }
    if (site === 'site020') { if (path === '/api/news') return response(d.news); if (path === '/api/trends') return response(d.trends); if (path === '/api/bookmarks' && method === 'GET') return response(state.bookmarks); if (path === '/api/bookmarks') { const articleId = body(init).articleId; if (!state.bookmarks.includes(articleId)) state.bookmarks.push(articleId); return response({ success: true }); } if (path === '/api/news/read') return response({ success: true }); if (path.startsWith('/api/subscriptions/')) return response(d.subscriptions[path.split('/').pop()] || { error: 'Subscription not found' }); }

    if (method === 'GET') return response([]);
    return response({ success: true, message: 'Mock response' });
  }

  window.fetch = function (input, init) {
    const rawUrl = typeof input === 'string' ? input : input.url;
    const url = new URL(rawUrl, window.location.href);
    if (!url.pathname.startsWith('/api/')) return originalFetch(input, init);
    return handle(siteId, url, init);
  };
})();
