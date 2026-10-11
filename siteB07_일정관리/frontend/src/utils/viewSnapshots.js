// 캘린더 화면별로 마지막에 표시한 일정 목록을 보관해 두는 메모리 저장소 (새로고침 시 초기화)
const store = new Map();

export const viewSnapshots = {
  get: (key) => store.get(key),
  set: (key, value) => { store.set(key, value); },
  clear: () => store.clear(),
};
