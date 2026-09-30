// FreshLaundry Frontend API Client

const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.message || `요청 실패 (상태코드: ${response.status})`);
  }

  if (response.status === 204) return null;
  return await response.json();
}

export const api = {
  // 서비스
  getServices: async () => {
    return await request('/services');
  },
  getServiceById: async (id) => {
    return await request(`/services/${id}`);
  },

  // 품목
  getLaundryItems: async (serviceId = '') => {
    const q = serviceId ? `?serviceId=${serviceId}` : '';
    return await request(`/laundry-items${q}`);
  },

  // 주소
  getAddresses: async () => {
    return await request('/addresses');
  },
  createAddress: async (data) => {
    return await request('/addresses', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 수거/배송 슬롯
  getPickupSlots: async () => {
    return await request('/pickup-slots');
  },
  getDeliverySlots: async () => {
    return await request('/delivery-slots');
  },

  // 주문
  getOrders: async () => {
    return await request('/orders');
  },
  getOrderById: async (id) => {
    return await request(`/orders/${id}`);
  },
  createOrder: async (orderData) => {
    return await request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },
  updateOrderStatus: async (id, status) => {
    return await request(`/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  // 주문 하위 리소스
  getOrderItems: async (id) => {
    return await request(`/orders/${id}/items`);
  },
  getOrderDelivery: async (id) => {
    return await request(`/orders/${id}/delivery`);
  },

  // 주문 실시간 상태 (ETag 지원)
  getOrderStatus: async (id, cachedETag = null) => {
    const headers = {};
    if (cachedETag) {
      headers['If-None-Match'] = cachedETag;
    }
    const res = await fetch(`${BASE_URL}/orders/${id}/status`, { headers });
    if (res.status === 304) {
      return { notModified: true, etag: cachedETag };
    }
    if (!res.ok) throw new Error('상태 조회 실패');
    const data = await res.json();
    return { ...data, etag: res.headers.get('ETag') };
  },

  // INTENTIONAL BACKEND BUG: site058-SEC-466
  // Content-Type boundary가 없는 multipart 요청 처리 오류:
  // FormData를 전송할 때 브라우저가 boundary를 자동으로 생성하도록 Content-Type 헤더 지정을 생략해야 하지만,
  // 명시적으로 'Content-Type': 'multipart/form-data'를 지정하여 boundary가 누락되고 서버에서 400 에러 발생.
  uploadItemPhoto: async (orderId, formData) => {
    const url = `${BASE_URL}/orders/${orderId}/items/photo`;
    const res = await fetch(url, {
      method: 'POST',
      // Intentional bug: Manually setting Content-Type without boundary parameter
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || '사진 업로드에 실패했습니다.');
    }
    return await res.json();
  },

  // 영수증 Range 요청 미리보기
  getReceiptRange: async (id, range = 'bytes=0-99') => {
    const url = `${BASE_URL}/orders/${id}/receipt`;
    const res = await fetch(url, {
      headers: {
        'Range': range
      }
    });
    const text = await res.text();
    return {
      status: res.status,
      contentRange: res.headers.get('Content-Range'),
      acceptRanges: res.headers.get('Accept-Ranges'),
      text
    };
  }
};
