# Use Maven 3.9 with OpenJDK 17 as builder
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

# Set working directory
WORKDIR /app

# Copy pom.xml first for dependency caching
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Production stage
FROM eclipse-temurin:17-jre-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S spring && adduser -u 1001 -S spring -G spring

# Copy the built JAR file from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Change ownership of the app directory
RUN chown -R spring:spring /app
USER spring

# Expose port
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8081/actuator/health || exit 1

# Start the application
ENTRYPOINT ["java", "-jar", "app.jar"]
