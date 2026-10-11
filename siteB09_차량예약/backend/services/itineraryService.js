const { getDb } = require('../db/init');
const { CATEGORIES } = require('../data/catalog');
const { isDateTime, DEMO_TODAY } = require('./clock');
const { calcQuote, daysBetween } = require('./quoteMath');
const { HttpError, toInt, nowIso, logActivity, loadPolicies } = require('./common');
const { validateWindow } = require('./fleetService');

const CATEGORY_NAME = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.name]));
const BLOCKING = "('pending','confirmed','picked_up')";
const PHONE_RE = /^0\d{1,2}-?\d{3,4}-?\d{4}$/;
const LICENSE_RE = /^[0-9A-Za-z-]{8,20}$/;

// ---------- 공통 조회 ----------
function depotOf(id) {
  const d = getDb().prepare('SELECT * FROM depots WHERE id = ?').get(toInt(id, 0));
  if (!d) throw new HttpError(400, 'INVALID_DEPOT', '존재하지 않는 지점입니다.');
  return { id: d.id, name: d.name, city: d.city };
}

function vehicleRow(id) {
  const v = getDb().prepare(`SELECT v.*, m.make, m.name AS model_name, m.category FROM vehicles v JOIN vehicle_models m ON m.id = v.model_id WHERE v.id = ?`).get(toInt(id, 0));
  if (!v) throw new HttpError(404, 'VEHICLE_NOT_FOUND', '차량을 찾을 수 없습니다.');
  return v;
}

function busyExcluding(vehicleId, startAt, endAt, excludeId) {
  return !!getDb().prepare(`SELECT 1 FROM itineraries WHERE vehicle_id = ? AND id <> ? AND status IN ${BLOCKING} AND start_at < ? AND end_at > ? LIMIT 1`)
    .get(vehicleId, excludeId || 0, endAt, startAt);
}

// 선택한 보험/옵션만 검증하고 계산용 행으로 변환한다. (선택하지 않은 항목은 포함하지 않음)
function resolveExtras(body) {
  const db = getDb();
  const out = [];
  const plan = body.protectionPlanId;
  if (plan !== undefined && plan !== null && toInt(plan, 0) > 1) {
    const x = db.prepare("SELECT * FROM extras WHERE id = ? AND kind = 'protection' AND included = 0").get(toInt(plan, 0));
    if (!x) throw new HttpError(400, 'INVALID_PROTECTION', '선택할 수 없는 보험입니다.');
    out.push({ id: x.id, name: x.name, kind: x.kind, price: x.price, unit: x.unit, qty: 1 });
  } else if (plan !== undefined && plan !== null && toInt(plan, -1) < 0) {
    throw new HttpError(400, 'INVALID_PROTECTION', '선택할 수 없는 보험입니다.');
  }
  const seen = new Set();
  (Array.isArray(body.addOns) ? body.addOns : []).forEach((a) => {
    const id = toInt(a && a.id !== undefined ? a.id : a, 0);
    const qty = toInt(a && a.qty !== undefined ? a.qty : 1, 1);
    const x = db.prepare("SELECT * FROM extras WHERE id = ? AND kind = 'addon'").get(id);
    if (!x) throw new HttpError(400, 'INVALID_ADDON', `선택할 수 없는 옵션입니다. (${id})`);
    if (qty < 1 || qty > 4) throw new HttpError(400, 'INVALID_ADDON', '옵션 수량은 1~4개입니다.');
    if (seen.has(id)) throw new HttpError(400, 'INVALID_ADDON', '중복된 옵션이 있습니다.');
    seen.add(id);
    out.push({ id: x.id, name: x.name, kind: x.kind, price: x.price, unit: x.unit, qty });
  });
  return out;
}

function buildQuote(body) {
  const v = vehicleRow(body.vehicleId);
  const pickup = depotOf(body.pickupDepotId);
  const ret = depotOf(body.returnDepotId !== undefined && body.returnDepotId !== null ? body.returnDepotId : body.pickupDepotId);
  validateWindow(body.startAt, body.endAt);
  const extras = resolveExtras(body);
  const q = calcQuote({ dailyRate: v.daily_rate, category: v.category, startAt: body.startAt, endAt: body.endAt, pickupDepot: pickup, returnDepot: ret, policies: loadPolicies(), extras });
  return {
    ...q,
    vehicle: { id: v.id, name: `${v.make} ${v.model_name}`, category: v.category, categoryName: CATEGORY_NAME[v.category], plate: v.plate },
    pickupDepot: pickup, returnDepot: ret, startAt: body.startAt, endAt: body.endAt,
    available: v.status !== 'maintenance' && !busyExcluding(v.id, body.startAt, body.endAt, 0),
  };
}

function calculateQuote(body) {
  return { data: buildQuote(body || {}) };
}

// ---------- 직렬화 ----------
function hydrate(rows) {
  if (!rows.length) return [];
  const db = getDb();
  const ids = rows.map((r) => r.id);
  const ph = ids.map(() => '?').join(',');
  const opts = db.prepare(`SELECT o.itinerary_id, o.qty, e.id, e.name, e.kind, e.price, e.unit FROM itinerary_options o JOIN extras e ON e.id = o.extra_id WHERE o.itinerary_id IN (${ph}) ORDER BY e.id`).all(...ids);
  const byItin = new Map();
  opts.forEach((o) => { if (!byItin.has(o.itinerary_id)) byItin.set(o.itinerary_id, []); byItin.get(o.itinerary_id).push(o); });
  const depots = new Map(db.prepare('SELECT * FROM depots').all().map((d) => [d.id, { id: d.id, name: d.name, city: d.city }]));
  return rows.map((r) => {
    const list = byItin.get(r.id) || [];
    const prot = list.find((o) => o.kind === 'protection');
    const s = r.status;
    return {
      id: r.id, code: r.code, status: s, driverId: r.driver_id,
      vehicle: { id: r.vehicle_id, name: `${r.make} ${r.model_name}`, plate: r.plate, category: r.category, categoryName: CATEGORY_NAME[r.category], thumbnailUrl: `/api/media/models/${r.model_id}/1.svg` },
      pickupDepot: depots.get(r.pickup_depot_id), returnDepot: depots.get(r.return_depot_id),
      startAt: r.start_at, endAt: r.end_at, days: daysBetween(r.start_at, r.end_at), total: r.total_amount,
      protection: prot ? { id: prot.id, name: prot.name, price: prot.price } : null,
      addons: list.filter((o) => o.kind === 'addon').map((o) => ({ id: o.id, name: o.name, qty: o.qty, price: o.price, unit: o.unit })),
      renter: { name: r.renter_name, phone: r.renter_phone, email: r.renter_email, licenseNo: r.renter_license },
      cancelReason: r.cancel_reason, pickedUpAt: r.picked_up_at, returnedAt: r.returned_at, createdAt: r.created_at, updatedAt: r.updated_at,
      actions: {
        canEdit: s === 'pending' || s === 'confirmed', canExtend: s === 'picked_up', canCancel: s === 'pending' || s === 'confirmed',
        canPickup: s === 'confirmed', canReturn: s === 'picked_up', canClose: s === 'returned', canClear: s === 'cancelled' || s === 'closed',
      },
    };
  });
}

const TRIP_SELECT = `SELECT i.*, v.plate, v.model_id, m.make, m.name AS model_name, m.category
  FROM itineraries i JOIN vehicles v ON v.id = i.vehicle_id JOIN vehicle_models m ON m.id = v.model_id`;

function loadTrip(id) {
  const row = getDb().prepare(`${TRIP_SELECT} WHERE i.id = ?`).get(id);
  if (!row) throw new HttpError(404, 'ITINERARY_NOT_FOUND', '예약을 찾을 수 없습니다.');
  return hydrate([row])[0];
}

function list(q) {
  const where = ['i.driver_id = ?'];
  const args = [toInt(q.driverId, 1)];
  if (q.status) { where.push('i.status = ?'); args.push(q.status); }
  const rows = getDb().prepare(`${TRIP_SELECT} WHERE ${where.join(' AND ')} ORDER BY i.start_at DESC, i.id DESC LIMIT ?`).all(...args, Math.min(200, toInt(q.limit, 100)));
  const data = hydrate(rows);
  return { data, meta: { total: data.length } };
}

function get(id) {
  return { data: loadTrip(id) };
}

// ---------- 예약자 정보 ----------
function checkRenter(r) {
  if (!r || typeof r.name !== 'string' || !r.name.trim() || r.name.trim().length > 40) throw new HttpError(400, 'INVALID_RENTER', '운전자 이름을 확인해 주세요.');
  if (!PHONE_RE.test(r.phone || '')) throw new HttpError(400, 'INVALID_RENTER', '연락처 형식이 올바르지 않습니다.');
  if (typeof r.email !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r.email)) throw new HttpError(400, 'INVALID_RENTER', '이메일 형식이 올바르지 않습니다.');
  if (!LICENSE_RE.test(r.licenseNo || '')) throw new HttpError(400, 'INVALID_RENTER', '면허번호 형식이 올바르지 않습니다.');
}

function saveOptions(id, extras) {
  const db = getDb();
  db.prepare('DELETE FROM itinerary_options WHERE itinerary_id = ?').run(id);
  const ins = db.prepare('INSERT INTO itinerary_options (itinerary_id,extra_id,qty) VALUES (?,?,?)');
  extras.forEach((x) => ins.run(id, x.id, x.qty));
}

// ---------- 생성 ----------
function create(body) {
  const db = getDb();
  const driverId = toInt(body.driverId, 1);
  if (!db.prepare('SELECT id FROM drivers WHERE id = ?').get(driverId)) throw new HttpError(400, 'INVALID_DRIVER', '존재하지 않는 고객입니다.');
  const renter = body.renter || {};
  checkRenter(renter);
  const q = buildQuote(body);
  if (!q.available) throw new HttpError(409, 'VEHICLE_UNAVAILABLE', '선택한 기간에 이용할 수 없는 차량입니다.');
  const extras = resolveExtras(body);
  let id;
  db.transaction(() => {
    if (busyExcluding(q.vehicle.id, body.startAt, body.endAt, 0)) throw new HttpError(409, 'DOUBLE_BOOKING', '같은 차량·기간에 이미 예약이 있습니다.');
    const now = nowIso();
    const status = body.confirm === false ? 'pending' : 'confirmed';
    id = db.prepare(`INSERT INTO itineraries (code,driver_id,vehicle_id,pickup_depot_id,return_depot_id,start_at,end_at,status,total_amount,renter_name,renter_phone,renter_email,renter_license,created_at,updated_at)
      VALUES ('',?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(driverId, q.vehicle.id, q.pickupDepot.id, q.returnDepot.id, body.startAt, body.endAt, status, q.total,
      renter.name.trim(), renter.phone, renter.email, renter.licenseNo, now, now).lastInsertRowid;
    db.prepare('UPDATE itineraries SET code = ? WHERE id = ?').run(`RD-${String(id).padStart(6, '0')}`, id);
    saveOptions(id, extras);
  })();
  logActivity(driverId, 'booking_create', `예약 생성 RD-${String(id).padStart(6, '0')} (${q.vehicle.name})`);
  return { data: loadTrip(id) };
}

// ---------- 수정 ----------
function update(id, body) {
  const db = getDb();
  const cur = db.prepare('SELECT * FROM itineraries WHERE id = ?').get(id);
  if (!cur) throw new HttpError(404, 'ITINERARY_NOT_FOUND', '예약을 찾을 수 없습니다.');
  const now = nowIso();

  if (body.confirm === true) {
    if (cur.status !== 'pending') throw new HttpError(409, 'INVALID_TRANSITION', '예약대기 상태에서만 확정할 수 있습니다.');
    db.prepare("UPDATE itineraries SET status = 'confirmed', updated_at = ? WHERE id = ?").run(now, id);
    logActivity(cur.driver_id, 'booking_update', `예약 확정 ${cur.code}`);
    return { data: loadTrip(id) };
  }
  if (body.close === true) {
    if (cur.status !== 'returned') throw new HttpError(409, 'INVALID_TRANSITION', '반납완료 상태에서만 대여를 종료할 수 있습니다.');
    db.prepare("UPDATE itineraries SET status = 'closed', updated_at = ? WHERE id = ?").run(now, id);
    logActivity(cur.driver_id, 'booking_update', `대여 종료 ${cur.code}`);
    return { data: loadTrip(id) };
  }

  const editable = cur.status === 'pending' || cur.status === 'confirmed';
  const extendOnly = cur.status === 'picked_up';
  if (!editable && !extendOnly) throw new HttpError(409, 'INVALID_TRANSITION', '현재 상태에서는 예약을 변경할 수 없습니다.');
  if (extendOnly) {
    const touched = ['startAt', 'pickupDepotId', 'returnDepotId', 'protectionPlanId', 'addOns', 'renter'].some((k) => body[k] !== undefined);
    if (touched) throw new HttpError(409, 'INVALID_TRANSITION', '픽업 후에는 반납 일시만 변경할 수 있습니다.');
  }

  const next = {
    vehicleId: cur.vehicle_id,
    startAt: body.startAt !== undefined ? body.startAt : cur.start_at,
    endAt: body.endAt !== undefined ? body.endAt : cur.end_at,
    pickupDepotId: body.pickupDepotId !== undefined ? body.pickupDepotId : cur.pickup_depot_id,
    returnDepotId: body.returnDepotId !== undefined ? body.returnDepotId : cur.return_depot_id,
  };
  if (!isDateTime(next.startAt) || !isDateTime(next.endAt)) throw new HttpError(400, 'INVALID_PERIOD', '대여 일시 형식이 올바르지 않습니다.');
  if (next.endAt <= next.startAt) throw new HttpError(400, 'INVALID_PERIOD', '반납 일시는 픽업 일시보다 늦어야 합니다.');
  if (daysBetween(next.startAt, next.endAt) > 30) throw new HttpError(400, 'INVALID_PERIOD', '대여 기간은 최대 30일입니다.');
  if (body.startAt !== undefined && body.startAt !== cur.start_at && body.startAt.slice(0, 10) < DEMO_TODAY) throw new HttpError(400, 'INVALID_PERIOD', '지난 날짜로는 변경할 수 없습니다.');
  if (busyExcluding(cur.vehicle_id, next.startAt, next.endAt, id)) throw new HttpError(409, 'DOUBLE_BOOKING', '변경하려는 기간에 같은 차량의 다른 예약이 있습니다.');

  // 보험/옵션: 전달된 경우에만 교체, 아니면 기존 선택 유지
  const existing = db.prepare('SELECT o.qty, e.* FROM itinerary_options o JOIN extras e ON e.id = o.extra_id WHERE o.itinerary_id = ?').all(id)
    .map((x) => ({ id: x.id, name: x.name, kind: x.kind, price: x.price, unit: x.unit, qty: x.qty }));
  let extras = existing;
  if (body.protectionPlanId !== undefined || body.addOns !== undefined) {
    const chosen = resolveExtras({
      protectionPlanId: body.protectionPlanId !== undefined ? body.protectionPlanId : (existing.find((e) => e.kind === 'protection') || {}).id || null,
      addOns: body.addOns !== undefined ? body.addOns : existing.filter((e) => e.kind === 'addon').map((e) => ({ id: e.id, qty: e.qty })),
    });
    extras = chosen;
  }
  const v = vehicleRow(cur.vehicle_id);
  const q = calcQuote({
    dailyRate: v.daily_rate, category: v.category, startAt: next.startAt, endAt: next.endAt, pickupDepot: depotOf(next.pickupDepotId), returnDepot: depotOf(next.returnDepotId),
    policies: loadPolicies(), extras,
  });
  const renter = body.renter ? { name: cur.renter_name, phone: cur.renter_phone, email: cur.renter_email, licenseNo: cur.renter_license, ...body.renter } : null;
  if (renter) checkRenter(renter);

  db.transaction(() => {
    db.prepare(`UPDATE itineraries SET start_at=?, end_at=?, pickup_depot_id=?, return_depot_id=?, total_amount=?, renter_name=?, renter_phone=?, renter_email=?, renter_license=?, updated_at=? WHERE id=?`)
      .run(next.startAt, next.endAt, next.pickupDepotId, next.returnDepotId, q.total, renter ? renter.name.trim() : cur.renter_name, renter ? renter.phone : cur.renter_phone,
        renter ? renter.email : cur.renter_email, renter ? renter.licenseNo : cur.renter_license, now, id);
    if (extras !== existing) saveOptions(id, extras);
  })();
  logActivity(cur.driver_id, 'booking_update', `예약 변경 ${cur.code}`);
  return { data: loadTrip(id) };
}

// ---------- 상태 전이 ----------
function cancel(id, body) {
  const db = getDb();
  const cur = db.prepare('SELECT * FROM itineraries WHERE id = ?').get(id);
  if (!cur) throw new HttpError(404, 'ITINERARY_NOT_FOUND', '예약을 찾을 수 없습니다.');
  if (cur.status !== 'pending' && cur.status !== 'confirmed') throw new HttpError(409, 'INVALID_TRANSITION', '취소할 수 없는 상태입니다.');
  db.prepare("UPDATE itineraries SET status = 'cancelled', cancel_reason = ?, updated_at = ? WHERE id = ?")
    .run(String((body && body.reason) || '고객 요청으로 취소').slice(0, 100), nowIso(), id);
  logActivity(cur.driver_id, 'booking_cancel', `예약 취소 ${cur.code}`);
  return { data: loadTrip(id) };
}

function pickup(id, body) {
  const db = getDb();
  const cur = db.prepare('SELECT * FROM itineraries WHERE id = ?').get(id);
  if (!cur) throw new HttpError(404, 'ITINERARY_NOT_FOUND', '예약을 찾을 수 없습니다.');
  if (cur.status !== 'confirmed') throw new HttpError(409, 'INVALID_TRANSITION', '예약확정 상태에서만 픽업 처리할 수 있습니다.');
  const veh = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(cur.vehicle_id);
  if (veh.status !== 'available') throw new HttpError(409, 'VEHICLE_UNAVAILABLE', '차량이 현재 출고 가능한 상태가 아닙니다.');
  const now = nowIso();
  db.transaction(() => {
    db.prepare("UPDATE itineraries SET status = 'picked_up', picked_up_at = ?, updated_at = ? WHERE id = ?").run(now, now, id);
    db.prepare("UPDATE vehicles SET status = 'rented' WHERE id = ?").run(veh.id);
    db.prepare('INSERT INTO pickup_records (itinerary_id,vehicle_id,odometer,fuel_level,picked_up_at) VALUES (?,?,?,?,?)')
      .run(id, veh.id, toInt(body && body.odometer, veh.odometer), Math.min(100, Math.max(0, toInt(body && body.fuelLevel, 100))), now);
  })();
  logActivity(cur.driver_id, 'pickup', `차량 픽업 ${cur.code}`);
  return { data: loadTrip(id) };
}

function returnTrip(id, body) {
  const db = getDb();
  const cur = db.prepare('SELECT * FROM itineraries WHERE id = ?').get(id);
  if (!cur) throw new HttpError(404, 'ITINERARY_NOT_FOUND', '예약을 찾을 수 없습니다.');
  if (cur.status !== 'picked_up') throw new HttpError(409, 'INVALID_TRANSITION', '픽업 완료 후에만 반납 처리할 수 있습니다.');
  const veh = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(cur.vehicle_id);
  const now = nowIso();
  const odo = Math.max(veh.odometer, toInt(body && body.odometer, veh.odometer + 100));
  db.transaction(() => {
    db.prepare("UPDATE itineraries SET status = 'returned', returned_at = ?, updated_at = ? WHERE id = ?").run(now, now, id);
    db.prepare("UPDATE vehicles SET status = 'available', odometer = ?, depot_id = ? WHERE id = ?").run(odo, cur.return_depot_id, veh.id);
    db.prepare('INSERT INTO return_records (itinerary_id,vehicle_id,odometer,fuel_level,damage_note,returned_at) VALUES (?,?,?,?,?,?)')
      .run(id, veh.id, odo, Math.min(100, Math.max(0, toInt(body && body.fuelLevel, 60))), String((body && body.damageNote) || '이상 없음').slice(0, 100), now);
  })();
  logActivity(cur.driver_id, 'return', `차량 반납 ${cur.code}`);
  return { data: loadTrip(id) };
}

function clearHistory(id) {
  const db = getDb();
  const cur = db.prepare('SELECT * FROM itineraries WHERE id = ?').get(id);
  if (!cur) throw new HttpError(404, 'ITINERARY_NOT_FOUND', '예약을 찾을 수 없습니다.');
  if (cur.status !== 'cancelled' && cur.status !== 'closed') throw new HttpError(409, 'INVALID_TRANSITION', '취소되었거나 종료된 예약 내역만 정리할 수 있습니다.');
  db.transaction(() => {
    db.prepare('DELETE FROM itineraries WHERE id = ?').run(id);
  })();
  logActivity(cur.driver_id, 'booking_update', `내역 정리 ${cur.code}`);
  return { data: { id, removed: true } };
}

function operationsHistory(q) {
  const db = getDb();
  const driverId = toInt(q.driverId, 1);
  const rows = db.prepare(`${TRIP_SELECT} WHERE i.driver_id = ? AND i.status IN ('returned','closed') ORDER BY i.end_at DESC LIMIT 50`).all(driverId);
  const rentals = hydrate(rows).map((t) => {
    const ret = db.prepare('SELECT odometer, fuel_level, damage_note, returned_at FROM return_records WHERE itinerary_id = ?').get(t.id);
    return { ...t, returnRecord: ret ? { odometer: ret.odometer, fuelLevel: ret.fuel_level, damageNote: ret.damage_note, returnedAt: ret.returned_at } : null };
  });
  const activity = db.prepare('SELECT id, action, detail, created_at FROM activity_log WHERE driver_id = ? ORDER BY id DESC LIMIT ?').all(driverId, Math.min(100, toInt(q.limit, 40)))
    .map((a) => ({ id: a.id, action: a.action, detail: a.detail, createdAt: a.created_at }));
  return { data: { rentals, activity } };
}

module.exports = { calculateQuote, list, get, create, update, cancel, pickup, returnTrip, clearHistory, operationsHistory };
