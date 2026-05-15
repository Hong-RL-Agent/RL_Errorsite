let frame = 0;
let syntheticQueue = [1, 2, 3, 4, 5];
let tokenState: 'SYNCED' | 'STALE_AFTER_BFCACHE' | 'REJECTING_COMMANDS' = 'SYNCED';

self.onmessage = (event: MessageEvent<{ type: string; issuedAt: number }>) => {
  if (event.data.type !== 'tick') return;
  frame += 1;

  if (frame % 7 === 0) {
    syntheticQueue = syntheticQueue.reverse();
  } else {
    syntheticQueue.push(frame);
    syntheticQueue = syntheticQueue.slice(-6);
  }

  if (frame % 17 === 0) tokenState = 'STALE_AFTER_BFCACHE';
  if (frame % 23 === 0) tokenState = 'REJECTING_COMMANDS';
  if (frame % 29 === 0) tokenState = 'SYNCED';

  const queueSkew = syntheticQueue[syntheticQueue.length - 1] - syntheticQueue[0];
  self.postMessage({ frame, queueSkew, tokenState });
};

export {};
