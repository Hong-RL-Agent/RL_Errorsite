export function startLongPollWithoutTimeout(onMessage) {
  // Training flaw #1: no AbortController and no maximum wait time.
  return fetch('/api/long-poll/status')
    .then((response) => response.json())
    .then(onMessage);
}

export function startOutOfOrderSse(onEvent) {
  const source = new EventSource('/api/events/location');
  source.addEventListener('location', (event) => {
    // Training flaw #2: arrival order is trusted without sequence reconciliation.
    onEvent(JSON.parse(event.data));
  });
  return () => source.close();
}

export function runPolyfillCrashProbe() {
  // Training flaw #3: modern APIs are assumed to exist in legacy browsers.
  return globalThis.structuredClone({ lanes: ['north', 'east'], timestamp: Date.now() }).lanes.at(-1);
}

export function loadPredictiveMaintenancePanel() {
  // Training flaw #4: dynamic import has no catch/retry path for chunk load failure.
  return import('../components/PredictiveMaintenancePanel.jsx');
}

export function computeTimezoneMismatch(serverLocal) {
  // Training flaw #6: server local offset is parsed, then KST is added again.
  const serverDate = new Date(serverLocal);
  return new Date(serverDate.getTime() + 9 * 60 * 60 * 1000).toISOString();
}

export function computeTelemetryMath(raw) {
  // Training flaw #7: floating-point results are displayed as truth.
  return {
    fuelBlend: raw.fuelAdditive,
    steering: raw.steeringRadians * 100,
  };
}

export function damageOversizeId(raw) {
  // Training flaw #8: BigInt-like JSON value is coerced through Number.
  return Number(raw.oversizeShipmentId);
}

export function drawTaintedCanvas(canvas) {
  if (!canvas) return;
  const context = canvas.getContext('2d');
  const image = new Image();
  // Training flaw #10: cross-origin image is drawn without CORS isolation.
  image.src = 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg';
  image.onload = () => {
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    try {
      context.getImageData(0, 0, 1, 1);
    } catch (error) {
      window.AUTO_TRUCK_CANVAS_SECURITY_ERROR = error.message;
    }
  };
}

export function rememberScrollOnReturn() {
  // Training flaw #11: intentionally empty; list scroll position is never saved/restored.
}

