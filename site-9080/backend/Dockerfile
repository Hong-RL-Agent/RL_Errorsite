FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
RUN mkdir -p /app/logs
COPY --from=build /workspace/target/smart-port-control-0.1.0.jar /app/smart-port-control.jar
EXPOSE 9080
ENTRYPOINT ["java", "-jar", "/app/smart-port-control.jar"]
