# AI-RECIPE

AI-RECIPE is a gastronomy-tech security training dashboard for simulated memory-safety and system-risk patterns.

All browser traffic is intended to use:

```text
http://localhost:9079
```

The training endpoints are inert simulations. They do not execute real backdoors, exploit payloads, shell commands, or memory corruption.

## Run

```bash
docker compose up --build
```

Then open:

```text
http://localhost:9079
```

## Local Development

Backend:

```bash
cd backend
mvn spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```
