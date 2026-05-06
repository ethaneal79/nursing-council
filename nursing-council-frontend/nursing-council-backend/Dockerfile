# ── Build stage ─────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

# ── Runtime stage ────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S msnc && adduser -S msnc -G msnc
COPY --from=build /app/target/nursing-council-*.jar app.jar
RUN mkdir -p /app/uploads && chown -R msnc:msnc /app
USER msnc
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
