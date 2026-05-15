# Build Stage (Maven 이미지 사용)
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
# pom.xml만 먼저 복사해서 의존성 캐싱 (빌드 속도 최적화)
COPY pom.xml .
RUN mvn dependency:go-offline

# 소스 코드 복사 후 빌드
COPY src ./src
RUN mvn clean package -DskipTests

# Run Stage
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
# Maven 빌드 결과물은 target 폴더에 생성됨
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENV TZ=UTC
ENTRYPOINT ["java", "-jar", "app.jar"]