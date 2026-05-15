FROM gradle:8.11.1-jdk21-alpine AS build
WORKDIR /workspace
COPY settings.gradle build.gradle ./
COPY src ./src
RUN gradle clean bootJar --no-daemon

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /workspace/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
