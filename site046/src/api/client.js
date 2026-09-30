// API client helper with unified toast / bug detection dispatcher

export async function fetchApi(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await res.json().catch(() => ({}));
    const bugHeader = res.headers.get('X-Bug-Triggered');

    // Check if backend flagged an intentional bug in header or response payload
    if (bugHeader || data._bug) {
      const bugInfo = data._bug || {
        bugId: bugHeader,
        secId: bugHeader ? bugHeader.split('-').pop() : 'SEC-BUG',
        type: '비즈니스 로직 오류 감지',
        message: '잠재적 데이터 불일치 또는 비정상 로직이 감지되었습니다.'
      };

      // Dispatch custom event for global toast and interactive feedback
      window.dispatchEvent(
        new CustomEvent('freshcart-bug-detected', {
          detail: bugInfo
        })
      );
    }

    if (!res.ok) {
      throw new Error(data.error || '요청 처리 중 오류가 발생했습니다.');
    }

    return data;
  } catch (err) {
    throw err;
  }
}
