// API client with unified bug detection & toast event dispatching

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

    if (bugHeader || data._bug) {
      const bugInfo = data._bug || {
        bugId: bugHeader,
        secId: bugHeader ? bugHeader.split('-').pop() : 'SEC-BUG',
        type: '비동기 처리 상태 알림',
        message: '요청이 진행되었으나 처리 상태가 지연되었습니다.'
      };

      window.dispatchEvent(
        new CustomEvent('pawmate-bug-detected', {
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
