# 1단계: 빌드 환경
FROM maven:3.8.4-eclipse-temurin-17 AS build
COPY . /app
WORKDIR /app
RUN mvn clean package -DskipTests

# 2단계: 실행 환경
FROM eclipse-temurin:17-jdk-alpine
# 9023번 inventory가 아닌 9026번 finance 파일을 가져옵니다.
COPY --from=build /app/target/finance-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]s