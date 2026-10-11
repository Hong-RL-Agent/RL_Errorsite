// 대여료 계산 순수 함수 (DB 의존성 없음 — seed 와 API 에서 공용)
const ms = (s) => Date.parse(`${s}:00Z`);

function daysBetween(startAt, endAt) {
  return Math.max(1, Math.ceil((ms(endAt) - ms(startAt)) / 86400000));
}

function seasonFor(policies, category, dateStr) {
  const row = policies.find((p) => p.kind === 'season' && p.category === category && p.startDate <= dateStr && p.endDate >= dateStr);
  return row ? { name: row.name, multiplier: row.value } : { name: '일반 시즌', multiplier: 1 };
}

function durationDiscount(policies, category, days) {
  return policies
    .filter((p) => p.kind === 'duration' && p.category === category && p.minDays <= days)
    .reduce((m, p) => Math.max(m, p.value), 0);
}

function oneWayFee(policies, pickupDepot, returnDepot) {
  if (pickupDepot.id === returnDepot.id) return 0;
  const scope = pickupDepot.city === returnDepot.city ? 'same_city' : 'cross_city';
  const row = policies.find((p) => p.kind === 'oneway' && p.category === scope);
  return row ? row.value : 0;
}

// extras: [{ id, name, kind, price, unit, qty }]
function calcQuote({ dailyRate, category, startAt, endAt, pickupDepot, returnDepot, policies, extras }) {
  const days = daysBetween(startAt, endAt);
  const season = seasonFor(policies, category, startAt.slice(0, 10));
  const discountPct = durationDiscount(policies, category, days);
  const rentalFee = Math.round((dailyRate * days * season.multiplier * (1 - discountPct / 100)) / 100) * 100;
  const oneWay = oneWayFee(policies, pickupDepot, returnDepot);
  const lines = extras.map((x) => ({
    id: x.id, name: x.name, kind: x.kind, qty: x.qty, unit: x.unit, price: x.price,
    amount: x.price * x.qty * (x.unit === 'day' ? days : 1),
  }));
  const extrasTotal = lines.reduce((s, l) => s + l.amount, 0);
  return {
    days, dailyRate, seasonName: season.name, seasonMultiplier: season.multiplier, durationDiscountPct: discountPct,
    rentalFee, oneWayFee: oneWay, protection: lines.filter((l) => l.kind === 'protection'), addons: lines.filter((l) => l.kind === 'addon'),
    extrasTotal, total: rentalFee + oneWay + extrasTotal,
  };
}

module.exports = { daysBetween, calcQuote };
