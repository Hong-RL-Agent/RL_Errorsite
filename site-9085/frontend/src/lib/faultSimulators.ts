export function simulateQuotaFailure() {
  try {
    const chunk = 'x'.repeat(1024 * 1024);
    for (let i = 0; i < 20; i += 1) {
      localStorage.setItem(`health-pill-quota-${i}`, chunk);
    }
  } catch (error) {
    console.warn('[training] QuotaExceededError storage paralysis simulated', error);
  }
}

export function simulateOfflineSyncLoss() {
  const pending = JSON.parse(localStorage.getItem('offline-medication-queue') || '[]');
  window.addEventListener('online', () => {
    localStorage.removeItem('offline-medication-queue');
    console.warn('[training] pending offline records dropped instead of replayed', pending.length);
  });
}

export function simulateIndexedDbLock() {
  const request = indexedDB.open('health-pill-training-db', 1);
  request.onupgradeneeded = () => {
    request.result.createObjectStore('medicationEvents', { keyPath: 'id' });
  };
  request.onsuccess = () => {
    const db = request.result;
    const tx = db.transaction('medicationEvents', 'readwrite');
    const store = tx.objectStore('medicationEvents');
    for (let i = 0; i < 5000; i += 1) {
      store.put({ id: `lock-${Date.now()}-${i}`, payload: 'large-lock-window'.repeat(50) });
    }
  };
}

export function simulateWorkerPressure() {
  const blob = new Blob([
    `setInterval(() => {
      for (let i = 0; i < 400; i++) postMessage({ type: 'burst', at: Date.now(), value: i });
    }, 120);`
  ], { type: 'text/javascript' });
  const worker = new Worker(URL.createObjectURL(blob));
  worker.onmessage = () => {
    window.dispatchEvent(new CustomEvent('health-pill-worker-burst'));
  };
}
