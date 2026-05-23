# 1. Maven 빌드 스테이지
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# 의존성 파일을 먼저 복사해서 캐시를 활용합니다.
COPY pom.xml ./
RUN mvn dependency:go-offline

# 소스 코드를 복사하고 빌드합니다. (테스트는 스킵)
COPY src ./src
RUN mvn clean package -DskipTests

# 2. 실행 스테이지
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Maven은 빌드 결과물을 target/ 폴더에 생성합니다.
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 9029
ENTRYPOINT ["java", "-jar", "app.jar"]