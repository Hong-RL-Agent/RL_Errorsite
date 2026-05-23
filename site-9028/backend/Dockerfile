# 1단계: 빌드 환경
FROM maven:3.8.4-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# 2단계: 실행 환경
FROM eclipse-temurin:17-jdk-alpine
# 경로를 /app.jar로 명확히 지정합니다.
COPY --from=build /app/target/collab-0.0.1-SNAPSHOT.jar /app.jar
EXPOSE 8080
# 실행 시에도 루트 경로(/)를 명시합니다.
ENTRYPOINT ["java", "-jar", "/app.jar"]