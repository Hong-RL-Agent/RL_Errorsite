# 1단계: 빌드 환경
FROM maven:3.8.4-eclipse-temurin-17 AS build
WORKDIR /app

# 의존성 복사 및 캐싱
COPY pom.xml .
RUN mvn dependency:go-offline

# 소스 복사 및 빌드
COPY src ./src
RUN mvn clean package -DskipTests

# 2단계: 실행 환경
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

# pom.xml의 artifactId인 'infra'와 일치하도록 수정됨
COPY --from=build /app/target/infra-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]