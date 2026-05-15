FROM gradle:8.10.2-jdk17 AS build
WORKDIR /workspace
COPY settings.gradle build.gradle ./
COPY src ./src
RUN gradle clean bootJar --no-daemon

FROM eclipse-temurin:17-jre
WORKDIR /app
ENV SERVER_PORT=8080
COPY --from=build /workspace/build/libs/*.jar /app/climate-ai.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/climate-ai.jar"]

