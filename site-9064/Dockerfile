FROM node:20-alpine AS frontend-build
WORKDIR /workspace/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /workspace/backend
COPY backend/pom.xml ./
RUN mvn -q -DskipTests dependency:go-offline
COPY backend/ ./
COPY --from=frontend-build /workspace/backend/src/main/resources/static ./src/main/resources/static
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend-build /workspace/backend/target/biopay-dashboard-0.1.0.jar /app/biopay-dashboard.jar
EXPOSE 9064
ENV SERVER_PORT=9064
ENTRYPOINT ["java", "-jar", "/app/biopay-dashboard.jar"]
