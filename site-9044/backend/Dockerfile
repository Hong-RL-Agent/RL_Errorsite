FROM maven:3.9.8-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q clean package -DskipTests

FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/*.jar app.jar
# 백엔드 내부 포트는 8080으로 고정 (Nginx에서 8080으로 찌르도록 설정했으므로)
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
