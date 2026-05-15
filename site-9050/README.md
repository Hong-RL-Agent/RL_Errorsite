# META-MART

Cyber-neon metaverse shopping mall sandbox for PPO telemetry research. The backend intentionally injects hardware-linked latency patterns, while the frontend exposes a futuristic retail dashboard and live telemetry console.

## File Structure

```text
META-MART
├─ backend
│  ├─ Dockerfile
│  ├─ pom.xml
│  └─ src/main
│     ├─ java/com/metamart
│     │  ├─ MetaMartApplication.java
│     │  ├─ config
│     │  │  ├─ MicroArchInterceptor.java
│     │  │  └─ WebConfig.java
│     │  ├─ controller/MetaMartController.java
│     │  └─ sim
│     │     ├─ MicroArchSimService.java
│     │     ├─ SimResult.java
│     │     ├─ TelemetryEvent.java
│     │     └─ TelemetrySnapshot.java
│     └─ resources/application.yml
├─ frontend
│  ├─ Dockerfile
│  ├─ index.html
│  ├─ package.json
│  └─ src
│     ├─ main.jsx
│     └─ styles.css
├─ nginx/default.conf
├─ docker-compose.yml
└─ README.md
```

## Run

```bash
docker compose up --build
```

Open `http://localhost:9050`.

## Regression Map

1. GPU unified memory over-swapping: `/api/simulate/render-asset`
2. PCIe bus bandwidth saturation: `/api/simulate/texture-sync`
3. Kernel RCU stall: `/api/simulate/rcu-stall`
4. Context switching cache flush: interceptor on `/api/**`
5. Process migration cold start: interceptor on new session
6. Memory bus refresh latency: interceptor random jitter
7. SSD steady state drop: `/api/simulate/transaction-log`
8. GPU kernel tail latency: `/api/simulate/shader`
9. Network softirq livelock: background pulse under request volume
10. Branch misprediction: `/api/simulate/discount`
11. Priority inversion: `/api/simulate/checkout`
