# Eureka Server

This is the Service Discovery server for the Library Management System using Netflix Eureka.

## Purpose

The Eureka Server acts as a service registry where all microservices register themselves. It enables:
- Service discovery
- Load balancing
- Service health monitoring
- Fault tolerance

## Configuration

The server runs on port 8761 by default and is configured to:
- Not register itself with Eureka (eureka.client.register-with-eureka=false)
- Not fetch registry from other Eureka servers (eureka.client.fetch-registry=false)
- Disable self-preservation mode for development

## Running the Server

### Using Docker
```bash
docker build -t library-eureka-server .
docker run -p 8761:8761 library-eureka-server
```

### Using Maven
```bash
./mvnw spring-boot:run
```

## Access

Once running, you can access the Eureka Dashboard at:
http://localhost:8761

## Health Check

The server includes actuator endpoints for monitoring:
- Health: http://localhost:8761/actuator/health
- Info: http://localhost:8761/actuator/info
- Metrics: http://localhost:8761/actuator/metrics

## Integration with Other Services

All microservices in the Library Management System should include the Eureka Client dependency and configure their `application.properties` with:

```properties
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
```

Or when running with Docker:
```properties
eureka.client.service-url.defaultZone=http://eureka-server:8761/eureka/
```
