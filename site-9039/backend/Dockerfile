# 1단계: 빌드 스테이지
FROM maven:3.8.4-eclipse-temurin-17 AS build
WORKDIR /app

# pom.xml만 먼저 복사하여 종속성 캐싱 시도 (선택 사항)
COPY pom.xml .

# 소스 코드 복사 및 바로 빌드 (네트워크 에러 방지를 위해 go-offline 제거)
COPY src ./src
RUN mvn clean package -DskipTests

# 2단계: 실행 스테이지
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# 빌드 스테이지에서 생성된 jar 복사
COPY --from=build /app/target/billing-service-0.0.1-SNAPSHOT.jar app.jar

# 9029 포트 노출
EXPOSE 9039
ENTRYPOINT ["java", "-jar", "app.jar"]