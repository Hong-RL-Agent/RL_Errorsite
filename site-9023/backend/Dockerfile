FROM maven:3.8.4-eclipse-temurin-17 AS build
COPY . /app
WORKDIR /app
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jdk-alpine
# 애매한 *.jar 대신 정확히 erp 프로젝트의 jar 파일을 복사합니다.
COPY --from=build /app/target/inventory-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]