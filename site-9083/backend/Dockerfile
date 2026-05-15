FROM gradle:8.10.2-jdk17 AS build
WORKDIR /workspace
COPY settings.gradle build.gradle ./
COPY backend ./backend
RUN gradle :backend:bootJar --no-daemon

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /workspace/backend/build/libs/*.jar /app/patent-ai-backend.jar
EXPOSE 9083
ENTRYPOINT ["java", "-jar", "/app/patent-ai-backend.jar"]
