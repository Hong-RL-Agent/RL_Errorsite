# 1단계: 빌드 스테이지
# maven 이미지도 가급적 eclipse-temurin 기반을 사용합니다.
FROM maven:3.8.4-eclipse-temurin-17 AS build
COPY . /app
WORKDIR /app
RUN mvn clean package -DskipTests

# 2단계: 실행 스테이지
# 에러가 났던 openjdk 대신 eclipse-temurin을 사용합니다.
FROM eclipse-temurin:17-jdk-alpine
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]