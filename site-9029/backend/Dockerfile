# 1단계: 빌드
FROM maven:3.8.4-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# 2단계: 실행
FROM eclipse-temurin:17-jdk-alpine
# pom.xml의 artifactId가 infra-complex이므로 파일명이 아래와 같습니다.
COPY --from=build /app/target/infra-complex-0.0.1-SNAPSHOT.jar /app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]