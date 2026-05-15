FROM gradle:8.10.2-jdk17-alpine AS build
WORKDIR /workspace
COPY settings.gradle ./
COPY backend ./backend
RUN gradle :backend:bootJar --no-daemon

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /workspace/backend/build/libs/*.jar app.jar
EXPOSE 9094
ENTRYPOINT ["java", "-jar", "app.jar"]
