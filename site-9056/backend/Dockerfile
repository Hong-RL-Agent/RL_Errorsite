FROM gradle:8.10.2-jdk21 AS build
WORKDIR /workspace
COPY settings.gradle build.gradle ./
COPY src ./src
RUN gradle test bootJar --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN mkdir -p /var/lib/deepsea
COPY --from=build /workspace/build/libs/*.jar /app/deepsea-core.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/deepsea-core.jar"]
