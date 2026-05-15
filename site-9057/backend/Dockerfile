FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/crypto-core-backend-0.1.0.jar app.jar
EXPOSE 9058
ENTRYPOINT ["java", "-XX:ActiveProcessorCount=2", "-Xms256m", "-Xmx512m", "-jar", "app.jar"]

