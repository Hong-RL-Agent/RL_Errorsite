// TripNest API Client with Bug Detection Dispatcher

export function getCurrentUser() {
  const saved = localStorage.getItem('tripnest_current_user');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
  }
  return {
    id: "user-001",
    name: "이지우",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  };
}

export function setCurrentUser(user) {
  localStorage.setItem('tripnest_current_user', JSON.stringify(user));
  window.dispatchEvent(new CustomEvent('tripnest-user-changed', { detail: user }));
}

export async function fetchApi(url, options = {}) {
  const currentUser = getCurrentUser();
  const headers = {
    'Content-Type': 'application/json',
    'X-User-Id': currentUser.id,
    ...options.headers
  };

  const res = await fetch(url, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));
  const bugHeader = res.headers.get('X-Bug-Triggered');

  // Check if backend returned bug detection info
  if (data._bug || bugHeader) {
    const bugInfo = data._bug || {
      bugId: bugHeader,
      secId: bugHeader ? bugHeader.split('-').pop() : 'SEC-BUG',
      name: '로직/보안 검증 이상 감지',
      description: '요청 처리 중 의도된 비정상 비즈니스 로직 플로우가 발생했습니다.'
    };

    window.dispatchEvent(
      new CustomEvent('tripnest-bug-detected', {
        detail: bugInfo
      })
    );
  }

  if (!res.ok) {
    throw new Error(data.error || '요청 처리 중 문제가 발생했습니다.');
  }

  return data;
}
