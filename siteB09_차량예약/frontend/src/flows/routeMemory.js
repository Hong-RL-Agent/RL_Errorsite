// 화면 이동 사이에 직전 화면 정보를 임시로 보관하는 메모리 저장소 (새로고침 시 초기화)
const store = new Map();

export const routeMemory = {
  get: (key) => store.get(key),
  set: (key, value) => { store.set(key, value); },
  delete: (key) => store.delete(key),
  clear: () => store.clear(),
};
