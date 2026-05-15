FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
COPY src ./src
COPY vault ./vault
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/art-appraiser-0.0.1-SNAPSHOT.jar app.jar
COPY --from=build /app/vault ./vault
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
