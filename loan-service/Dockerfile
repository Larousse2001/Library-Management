# Use official OpenJDK 17 image
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml first for dependency caching
COPY mvnw ./
COPY mvnw.cmd ./
COPY .mvn .mvn
COPY pom.xml ./

# Make mvnw executable
RUN chmod +x ./mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Expose port
EXPOSE 8083

# Run the application
CMD ["java", "-jar", "target/loanservice-0.0.1-SNAPSHOT.jar"]
