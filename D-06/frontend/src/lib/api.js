const API_BASE = '/api';

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('통계 데이터를 불러오지 못했습니다.');
  return res.json();
}

export async function fetchCustomers() {
  const res = await fetch(`${API_BASE}/customers`);
  if (!res.ok) throw new Error('고객 목록을 불러오지 못했습니다.');
  return res.json();
}

export async function fetchOrders(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/orders?${qs}`);
  if (!res.ok) throw new Error('주문 목록을 불러오지 못했습니다.');
  return res.json();
}

export async function fetchOrderDetail(id) {
  const res = await fetch(`${API_BASE}/orders/${id}`);
  if (!res.ok) throw new Error('주문 상세 정보를 불러오지 못했습니다.');
  return res.json();
}

export async function updateDelivery(id, data, filterContext = {}) {
  const res = await fetch(`${API_BASE}/orders/${id}/delivery`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, filterContext })
  });
  if (!res.ok) throw new Error('배송 상태 변경에 실패했습니다.');
  return res.json();
}

export async function updateItemQuantity(id, itemId, quantity, filterContext = {}) {
  const res = await fetch(`${API_BASE}/orders/${id}/items`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId, quantity, filterContext })
  });
  if (!res.ok) throw new Error('품목 수량 변경에 실패했습니다.');
  return res.json();
}

export async function cancelOrder(id, reason, filterContext = {}) {
  const res = await fetch(`${API_BASE}/orders/${id}/cancel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason, filterContext })
  });
  if (!res.ok) throw new Error('주문 취소 처리에 실패했습니다.');
  return res.json();
}

export async function approveRefund(id, filterContext = {}) {
  const res = await fetch(`${API_BASE}/orders/${id}/refund-approve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filterContext })
  });
  if (!res.ok) throw new Error('환불 승인 처리에 실패했습니다.');
  return res.json();
}

export async function resetDatabase() {
  const res = await fetch(`${API_BASE}/test/reset`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('데이터 초기화에 실패했습니다.');
  return res.json();
}
