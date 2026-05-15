FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /app
COPY backend/pom.xml backend/pom.xml
COPY backend/src backend/src
COPY --from=frontend-build /app/frontend/dist backend/src/main/resources/static
WORKDIR /app/backend
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
ENV SERVER_PORT=9075
ENV AI_THERAPY_BASE_URL=http://localhost:9075
ENV AI_THERAPY_TRUSTED_ORIGIN=http://localhost:9075
ENV AI_THERAPY_LAB_MODE=true
ENV AI_THERAPY_COUNSELING_ROOT=/app/lab-files/counseling
COPY --from=backend-build /app/backend/target/ai-therapy-security-lab-0.0.1-SNAPSHOT.jar app.jar
COPY lab-files ./lab-files
EXPOSE 9075
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
