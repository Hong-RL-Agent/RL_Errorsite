FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN mkdir -p /var/lib/genome-x
COPY --from=build /workspace/target/genome-x-backend-0.1.0.jar /app/genome-x-backend.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/genome-x-backend.jar"]
