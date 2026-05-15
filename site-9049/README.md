# VITA-LINK Telemedicine Performance Lab

VITA-LINK is a sandbox telemedicine research platform for training anomaly-detection agents against kernel and memory-management style regressions. It includes a Spring Boot 3 backend, React/Vite/Tailwind v4 frontend, Docker Compose, and Nginx reverse proxy.

## Structure

```text
.
├── backend
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main
│       ├── java/lab/vitalink
│       │   ├── VitaLinkApplication.java
│       │   ├── anomaly
│       │   │   ├── AnomalyProperties.java
│       │   │   └── SystemAnomalyService.java
│       │   ├── consultation
│       │   │   ├── ConsultationController.java
│       │   │   └── dto
│       │   │       ├── MedicalRecordRequest.java
│       │   │       └── PatientNodeRequest.java
│       │   └── telemetry
│       │       ├── TelemetryController.java
│       │       └── TelemetrySnapshot.java
│       └── resources/application.yml
├── frontend
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
├── nginx
│   └── nginx.conf
├── .env.example
└── docker-compose.yml
```

## Run

```bash
docker compose --env-file .env.example up --build
```

Open `http://localhost:9049`.

## Lab Controls

The backend exposes anomaly triggers under `/api/consultation/*` and telemetry under `/api/telemetry`. The frontend dashboard calls these endpoints from the control panel.

All anomaly intensities are configured with `VITA_*` environment variables in `.env.example`.
