import type { EscrowSnapshot } from './types';

export async function getSnapshot(): Promise<EscrowSnapshot> {
  const response = await fetch('/api/escrow/snapshot', { credentials: 'include' });
  if (!response.ok) throw new Error(`snapshot failed: ${response.status}`);
  return response.json();
}

export async function postSignal(type: string, payload: Record<string, unknown>, route = location.pathname) {
  await fetch('/api/browser/signal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      type,
      route,
      payload,
      permission: Notification.permission,
      clientTime: new Date().toISOString()
    })
  });
}

export async function uploadEvidence(file: File) {
  const form = new FormData();
  form.append('file', file);
  const response = await fetch('/api/escrow/upload', {
    method: 'POST',
    body: form,
    credentials: 'include'
  });
  if (!response.ok) throw new Error(`upload failed: ${response.status}`);
  return response.json();
}
