FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM maven:3.9-eclipse-temurin-21 AS backend-build
WORKDIR /app/backend
COPY backend/pom.xml ./
RUN mvn -q -DskipTests dependency:go-offline
COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /opt/deep-sea-data
RUN apk add --no-cache wget
COPY --from=backend-build /app/backend/target/deep-sea-data-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 9095
ENTRYPOINT ["java", "-jar", "app.jar"]
