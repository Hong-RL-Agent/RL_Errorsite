const C = require('../data/catalog');
const { DEMO_TODAY, pad, addDay } = require('../services/clock');
const { calcQuote } = require('../services/quoteMath');

const SEED = 20261014;

function mulberry32(a) {
  return function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const iso = (dt) => `${dt}:00.000Z`;
const GLYPH = '가나다라마바사아자하';

// 고정 ID 예약 (1~12): 1·2·3 예약확정 / 4·5·12 취소 / 6 예약대기 / 7 픽업완료 / 8 반납완료 / 9·10 대여종료 / 11 예약확정
const FIXED = [
  { status: 'confirmed', start: '2026-10-20T09:00', end: '2026-10-23T09:00', p: 1, r: 1, v: 1, prot: 0, add: [7] },
  { status: 'confirmed', start: '2026-10-25T10:00', end: '2026-10-28T10:00', p: 3, r: 3, v: 2, prot: 0, add: [] },
  { status: 'confirmed', start: '2026-11-02T09:00', end: '2026-11-05T09:00', p: 2, r: 2, v: 3, prot: 3, add: [] },
  { status: 'cancelled', start: '2026-10-18T09:00', end: '2026-10-20T09:00', p: 1, r: 1, v: 4, prot: 0, add: [] },
  { status: 'cancelled', start: '2026-10-10T09:00', end: '2026-10-12T09:00', p: 4, r: 4, v: 7, prot: 2, add: [] },
  { status: 'pending', start: '2026-11-10T11:00', end: '2026-11-12T11:00', p: 5, r: 5, v: 8, prot: 0, add: [] },
  { status: 'picked_up', start: '2026-10-12T10:00', end: '2026-10-16T10:00', p: 6, r: 6, v: 9, prot: 2, add: [10] },
  { status: 'returned', start: '2026-10-05T09:00', end: '2026-10-08T09:00', p: 7, r: 7, v: 10, prot: 0, add: [] },
  { status: 'closed', start: '2026-09-20T09:00', end: '2026-09-23T09:00', p: 8, r: 8, v: 11, prot: 4, add: [] },
  { status: 'closed', start: '2026-09-01T09:00', end: '2026-09-04T09:00', p: 9, r: 9, v: 12, prot: 0, add: [8] },
  { status: 'confirmed', start: '2026-12-01T09:00', end: '2026-12-03T09:00', p: 10, r: 10, v: 13, prot: 0, add: [] },
  { status: 'cancelled', start: '2026-09-28T09:00', end: '2026-09-30T09:00', p: 11, r: 11, v: 14, prot: 0, add: [] },
];

function buildPolicies() {
  const rows = [];
  const push = (r) => rows.push({ id: rows.length + 1, startDate: null, endDate: null, minDays: null, ...r });
  C.CATEGORIES.forEach((c) => C.SEASONS.forEach(([name, s, e, v]) => push({ kind: 'season', category: c.key, name, startDate: s, endDate: e, value: v })));
  C.CATEGORIES.forEach((c) => [[3, 5], [7, 10], [14, 15]].forEach(([d, v]) => push({ kind: 'duration', category: c.key, name: `${d}일 이상 장기 할인`, minDays: d, value: v })));
  [['same_city', '동일 도시 편도 반납', 15000], ['cross_city', '타 도시 편도 반납', 60000], ['airport_pickup', '공항 픽업 수수료', 0],
    ['night_pickup', '야간 픽업 수수료', 0], ['holiday_pickup', '공휴일 픽업 수수료', 0], ['long_distance', '장거리 편도 안내', 0]]
    .forEach(([cat, name, v]) => push({ kind: 'oneway', category: cat, name, value: v }));
  C.CATEGORIES.forEach((c) => push({ kind: 'weekend', category: c.key, name: '주말 요금 안내', value: 1.05 }));
  for (let i = 0; i < 18; i += 1) push({ kind: 'promo', category: C.CATEGORIES[i % 7].key, name: `프로모션 ${i + 1}`, value: 3 + (i % 8) });
  return rows;
}

// 순수 데이터 생성 (고정 seed → 항상 동일)
function generateData() {
  const rand = mulberry32(SEED);
  const int = (n) => Math.floor(rand() * n);

  const depots = [];
  C.CITY_DEPOTS.forEach(([city, names]) => names.forEach((name) => {
    depots.push({ id: depots.length + 1, name, city, address: `${city} ${name} 인근 주차장`, hours: '08:00-22:00' });
  }));

  const drivers = [];
  for (let i = 1; i <= 120; i += 1) {
    drivers.push({
      id: i, name: i === 1 ? '데모 고객' : `${C.LAST[i % 10]}${C.FIRST[(i * 3) % 10]}`, email: `driver${i}@roamdrive.test`,
      phone: `010-${1000 + ((i * 7) % 9000)}-${1000 + ((i * 13) % 9000)}`,
      license: `11-${pad(10 + (i % 90))}-${String(100000 + i * 37).slice(-6)}-${pad(i % 99)}`, tier: ['일반', '실버', '골드'][i % 3],
    });
  }

  const models = [];
  C.CATEGORIES.forEach((cat) => cat.models.forEach((name, idx) => {
    const id = models.length + 1;
    const span = Math.max(1, cat.models.length - 1);
    const manual = (cat.key === 'mini' || cat.key === 'compact') && idx % 4 === 3;
    models.push({
      id, make: C.MAKES[id % C.MAKES.length], name, category: cat.key, seats: cat.seats[idx % cat.seats.length], fuel: cat.fuels[idx % cat.fuels.length],
      transmission: manual ? 'manual' : 'auto',
      baseDaily: cat.price[0] + Math.round(((cat.price[1] - cat.price[0]) * (idx / span)) / 1000) * 1000,
      specs: JSON.stringify({ horsepower: 90 + ((id * 17) % 200), trunkLiters: 200 + ((id * 41) % 600), drive: id % 4 === 0 ? '4WD' : '2WD', doors: cat.key === 'van' ? 5 : 4, efficiency: cat.key === 'ev' ? '5.2km/kWh' : `${(9 + (id % 9)).toFixed(1)}km/L`, features: ['블루투스', '후방 카메라', id % 2 ? '크루즈 컨트롤' : '스마트키', id % 3 ? 'USB 충전' : '무선 충전'] }),
      imageCount: 4 + (id % 3 === 0 ? 2 : 0), color: cat.color,
    });
  }));

  const vehicles = [];
  for (let i = 0; i < 160; i += 1) {
    const m = models[i % models.length];
    vehicles.push({
      id: i + 1, modelId: m.id, plate: `${10 + (i % 90)}${GLYPH[i % 10]} ${1000 + ((i * 37) % 9000)}`, depotId: ((i * 7) % 30) + 1,
      odometer: 5000 + ((i * 977) % 80000), status: i % 13 === 5 ? 'maintenance' : 'available', dailyRate: m.baseDaily + (i % 5) * 1000,
    });
  }

  const extras = C.EXTRAS.map(([code, kind, name, description, price, unit, recommended, included], i) => ({ id: i + 1, code, kind, name, description, price, unit, recommended, included }));
  const policies = buildPolicies();

  // ----- 예약 -----
  const busy = Array.from({ length: 161 }, () => []);
  const ms = (s) => Date.parse(`${s}:00Z`);
  const place = (hint, start, end, block) => {
    for (let k = 0; k < 160; k += 1) {
      const vid = ((hint - 1 + k) % 160) + 1;
      if (block) {
        if (vehicles[vid - 1].status === 'maintenance') continue;
        if (busy[vid].some((r) => r.s < ms(end) && r.e > ms(start))) continue;
        busy[vid].push({ s: ms(start), e: ms(end) });
      }
      return vid;
    }
    throw new Error('no vehicle');
  };

  const itineraries = [];
  const options = [];
  const pickups = [];
  const returns = [];
  const BLOCKING = ['pending', 'confirmed', 'picked_up'];

  const add = (spec) => {
    const id = itineraries.length + 1;
    const vid = place(spec.v, spec.start, spec.end, BLOCKING.includes(spec.status));
    const veh = vehicles[vid - 1];
    const model = models[veh.modelId - 1];
    const drv = drivers[spec.driver - 1];
    const picks = [];
    if (spec.prot) picks.push({ extraId: spec.prot, qty: 1 });
    spec.add.forEach((a) => picks.push({ extraId: a, qty: a === 8 || a === 9 ? 1 + (id % 2) : 1 }));
    const q = calcQuote({
      dailyRate: veh.dailyRate, category: model.category, startAt: spec.start, endAt: spec.end,
      pickupDepot: depots[spec.p - 1], returnDepot: depots[spec.r - 1], policies,
      extras: picks.map((p) => ({ ...extras[p.extraId - 1], qty: p.qty })),
    });
    picks.forEach((p) => options.push({ itineraryId: id, extraId: p.extraId, qty: p.qty }));
    const created = `${addDay(spec.start.slice(0, 10), -6)}T09:00:00.000Z`;
    const pickedAt = ['picked_up', 'returned', 'closed'].includes(spec.status) ? iso(spec.start) : null;
    const returnedAt = ['returned', 'closed'].includes(spec.status) ? iso(spec.end) : null;
    itineraries.push({
      id, code: `RD-${String(id).padStart(6, '0')}`, driverId: drv.id, vehicleId: vid, pickupDepotId: spec.p, returnDepotId: spec.r,
      startAt: spec.start, endAt: spec.end, status: spec.status, total: q.total, name: drv.name, phone: drv.phone, email: drv.email, license: drv.license,
      cancelReason: spec.status === 'cancelled' ? '일정 변경으로 인한 취소' : null, pickedAt, returnedAt, createdAt: created, updatedAt: returnedAt || pickedAt || created,
    });
    if (pickedAt) {
      pickups.push({ itineraryId: id, vehicleId: vid, odometer: veh.odometer + 50, fuel: 80 + (id % 21), at: pickedAt });
      if (spec.status === 'picked_up') veh.status = 'rented';
    }
    if (returnedAt) returns.push({ itineraryId: id, vehicleId: vid, odometer: veh.odometer + 50 + 120 * q.days, fuel: 40 + (id % 50), note: id % 9 === 0 ? '경미한 스크래치 확인' : '이상 없음', at: returnedAt });
  };

  FIXED.forEach((f, i) => add({ ...f, driver: 1, v: f.v + i * 0 }));

  let n = 12;
  const gen = (status, count, startOffset) => {
    for (let k = 0; k < count; k += 1) {
      n += 1;
      const days = status === 'returned' ? 2 : status === 'picked_up' ? 4 + (k % 3) : 2 + ((n * 3) % 5);
      const startDate = addDay(DEMO_TODAY, startOffset(k));
      const hh = pad(8 + (n % 10));
      const pickup = ((n * 5) % 30) + 1;
      add({
        status, driver: n % 25 === 0 ? 1 : 2 + ((n * 7) % 119), start: `${startDate}T${hh}:00`, end: `${addDay(startDate, days)}T${hh}:00`,
        p: pickup, r: n % 4 === 0 ? ((n * 11) % 30) + 1 : pickup, v: ((n * 37) % 160) + 1,
        prot: n % 2 === 0 ? 2 + (n % 5) : 0, add: [...(n % 3 === 0 ? [7 + (n % 14)] : []), ...(n % 7 === 0 ? [7 + ((n + 5) % 14)] : [])].filter((x, i, a) => a.indexOf(x) === i),
      });
    }
  };
  gen('closed', 68, (k) => -75 + ((k * 5) % 60));
  gen('returned', 29, (k) => -13 + (k % 11));
  gen('picked_up', 19, (k) => -3 + (k % 3));
  gen('confirmed', 36, (k) => 2 + ((k * 2) % 50));
  gen('pending', 9, (k) => 10 + ((k * 3) % 40));
  gen('cancelled', 27, (k) => -20 + ((k * 4) % 70));

  const maintenance = [];
  for (let i = 0; i < 120; i += 1) {
    maintenance.push({
      vehicleId: ((i * 3) % 160) + 1, kind: C.MAINT_KINDS[i % 6], at: `${addDay(DEMO_TODAY, -(5 + ((i * 7) % 150)))}T10:00:00.000Z`,
      cost: 20000 + ((i * 7300) % 180000), note: i % 5 === 0 ? '부품 교체 포함' : '이상 없음',
    });
  }

  const activity = [];
  for (let i = 0; i < 150; i += 1) {
    const action = C.ACTIVITY_ACTIONS[i % 7];
    activity.push({ driverId: i < 20 ? 1 : 2 + ((i * 5) % 119), action, detail: `${action} 처리 #${i + 1}`, at: new Date(Date.UTC(2026, 9, 13, 9, 0, 0) - i * 3600000 * 3).toISOString() });
  }

  return { depots, drivers, models, vehicles, extras, policies, itineraries, options, pickups, returns, maintenance, activity };
}

function seedAll(db) {
  const d = generateData();
  db.transaction(() => {
    const run = (sql, rows, map) => { const st = db.prepare(sql); rows.forEach((r) => st.run(...map(r))); };
    run('INSERT INTO depots (id,name,city,address,hours) VALUES (?,?,?,?,?)', d.depots, (r) => [r.id, r.name, r.city, r.address, r.hours]);
    run('INSERT INTO drivers (id,name,email,phone,license_no,tier) VALUES (?,?,?,?,?,?)', d.drivers, (r) => [r.id, r.name, r.email, r.phone, r.license, r.tier]);
    run('INSERT INTO vehicle_models (id,make,name,category,seats,fuel,transmission,base_daily,specs,image_count,color) VALUES (?,?,?,?,?,?,?,?,?,?,?)', d.models,
      (r) => [r.id, r.make, r.name, r.category, r.seats, r.fuel, r.transmission, r.baseDaily, r.specs, r.imageCount, r.color]);
    run('INSERT INTO vehicles (id,model_id,plate,depot_id,odometer,status,daily_rate) VALUES (?,?,?,?,?,?,?)', d.vehicles, (r) => [r.id, r.modelId, r.plate, r.depotId, r.odometer, r.status, r.dailyRate]);
    run('INSERT INTO extras (id,code,kind,name,description,price,unit,recommended,included) VALUES (?,?,?,?,?,?,?,?,?)', d.extras, (r) => [r.id, r.code, r.kind, r.name, r.description, r.price, r.unit, r.recommended, r.included]);
    run('INSERT INTO rate_policies (id,kind,category,name,start_date,end_date,min_days,value) VALUES (?,?,?,?,?,?,?,?)', d.policies, (r) => [r.id, r.kind, r.category, r.name, r.startDate, r.endDate, r.minDays, r.value]);
    run(`INSERT INTO itineraries (id,code,driver_id,vehicle_id,pickup_depot_id,return_depot_id,start_at,end_at,status,total_amount,renter_name,renter_phone,renter_email,renter_license,cancel_reason,picked_up_at,returned_at,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, d.itineraries,
    (r) => [r.id, r.code, r.driverId, r.vehicleId, r.pickupDepotId, r.returnDepotId, r.startAt, r.endAt, r.status, r.total, r.name, r.phone, r.email, r.license, r.cancelReason, r.pickedAt, r.returnedAt, r.createdAt, r.updatedAt]);
    run('INSERT INTO itinerary_options (itinerary_id,extra_id,qty) VALUES (?,?,?)', d.options, (r) => [r.itineraryId, r.extraId, r.qty]);
    run('INSERT INTO pickup_records (itinerary_id,vehicle_id,odometer,fuel_level,picked_up_at) VALUES (?,?,?,?,?)', d.pickups, (r) => [r.itineraryId, r.vehicleId, r.odometer, r.fuel, r.at]);
    run('INSERT INTO return_records (itinerary_id,vehicle_id,odometer,fuel_level,damage_note,returned_at) VALUES (?,?,?,?,?,?)', d.returns, (r) => [r.itineraryId, r.vehicleId, r.odometer, r.fuel, r.note, r.at]);
    run('INSERT INTO maintenance_records (vehicle_id,kind,performed_at,cost,note) VALUES (?,?,?,?,?)', d.maintenance, (r) => [r.vehicleId, r.kind, r.at, r.cost, r.note]);
    run('INSERT INTO activity_log (driver_id,action,detail,created_at) VALUES (?,?,?,?)', d.activity, (r) => [r.driverId, r.action, r.detail, r.at]);
  })();
}

module.exports = { generateData, seedAll };
