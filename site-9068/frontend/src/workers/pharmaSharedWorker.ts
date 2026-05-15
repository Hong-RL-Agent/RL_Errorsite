type WorkerMessage =
  | { type: 'connect'; sessionId: string; mfe: string }
  | { type: 'heartbeat'; sessionId: string; candidateId: string }
  | { type: 'switch-mfe'; sessionId: string; mfe: string }
  | { type: 'force-terminate'; sessionId: string };

const ports: MessagePort[] = [];
const retainedSessions = new Map<string, { mfe: string; candidateId?: string; contaminated: boolean }>();
const memoryBuffer =
  typeof SharedArrayBuffer === 'undefined' ? new ArrayBuffer(16) : new SharedArrayBuffer(16);
const sharedMemory = new Int32Array(memoryBuffer);
const atomicsEnabled = memoryBuffer instanceof SharedArrayBuffer;
const workerScope = self as unknown as { onconnect: (event: MessageEvent) => void };

function broadcast(payload: unknown) {
  ports.forEach((port) => port.postMessage(payload));
}

workerScope.onconnect = (event: MessageEvent) => {
  const port = event.ports[0];
  ports.push(port);

  port.onmessage = ({ data }: MessageEvent<WorkerMessage>) => {
    if (data.type === 'connect') {
      const previous = retainedSessions.get(data.sessionId);
      retainedSessions.set(data.sessionId, {
        mfe: previous?.mfe ?? data.mfe,
        candidateId: previous?.candidateId,
        contaminated: Boolean(previous),
      });
    }

    if (data.type === 'heartbeat') {
      const session = retainedSessions.get(data.sessionId);
      retainedSessions.set(data.sessionId, {
        mfe: session?.mfe ?? 'unknown-mfe',
        candidateId: data.candidateId,
        contaminated: Boolean(session?.contaminated),
      });
      if (atomicsEnabled) {
        Atomics.add(sharedMemory, 0, 1);
      } else {
        sharedMemory[0] += 1;
      }
    }

    if (data.type === 'switch-mfe') {
      const session = retainedSessions.get(data.sessionId);
      retainedSessions.set(data.sessionId, {
        mfe: data.mfe,
        candidateId: session?.candidateId,
        contaminated: true,
      });
    }

    if (data.type === 'force-terminate') {
      sharedMemory[1] = 0xdead;
      retainedSessions.set(data.sessionId, {
        mfe: 'terminated-worker-residue',
        candidateId: 'PAI-1042',
        contaminated: true,
      });
    }

    broadcast({
      type: 'worker-state',
      ports: ports.length,
      leakedPorts: Math.max(0, ports.length - 1),
      zombieSessions: Array.from(retainedSessions.values()).filter((session) => session.contaminated).length,
      sharedMemoryChecksum: sharedMemory[0] + sharedMemory[1],
      sessions: Array.from(retainedSessions.entries()),
    });
  };

  port.start();
};

export {};
