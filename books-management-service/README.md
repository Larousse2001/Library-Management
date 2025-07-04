# Books Management Service

This is the Books Management microservice for the Library Management System. It handles all book-related operations including CRUD operations, search functionality, and inventory management.

## Features

- **Book Management**: Create, read, update, and delete books
- **Search Functionality**: Search books by title, author, genre, or ISBN
- **Inventory Management**: Track available copies and manage book borrowing/returning
- **MongoDB Integration**: Uses MongoDB for data persistence
- **Eureka Integration**: Registers with Eureka service discovery
- **REST API**: Provides comprehensive REST endpoints for book operations

## Technology Stack

- **Java 17**
- **Spring Boot 2.7.14**
- **Spring Data MongoDB**
- **Spring Cloud Netflix Eureka Client**
- **Spring Security**
- **JWT Authentication**
- **Maven**
- **Docker**

## API Endpoints

### Book Operations
- `GET /api/books` - Get all active books
- `GET /api/books/paginated` - Get paginated list of books
- `GET /api/books/{id}` - Get book by ID
- `GET /api/books/isbn/{isbn}` - Get book by ISBN
- `POST /api/books` - Create new book
- `PUT /api/books/{id}` - Update book
- `DELETE /api/books/{id}` - Delete book (soft delete)

### Search Operations
- `GET /api/books/search?query={query}` - Search books by title, author, genre, or ISBN
- `GET /api/books/search/title?title={title}` - Search by title
- `GET /api/books/search/author?author={author}` - Search by author
- `GET /api/books/search/genre?genre={genre}` - Search by genre
- `GET /api/books/genre/{genre}` - Get books by specific genre

### Inventory Operations
- `GET /api/books/available` - Get available books
- `GET /api/books/out-of-stock` - Get out-of-stock books
- `PUT /api/books/{id}/availability?availableCopies={copies}` - Update book availability
- `PUT /api/books/{id}/borrow` - Borrow a book (decreases available copies)
- `PUT /api/books/{id}/return` - Return a book (increases available copies)

### Statistics
- `GET /api/books/stats/total` - Get total books count
- `GET /api/books/stats/available` - Get available books count
- `GET /api/books/stats/genre/{genre}` - Get books count by genre

## Configuration

### MongoDB Configuration
```properties
spring.data.mongodb.uri=mongodb://localhost:27017/books_db
spring.data.mongodb.database=books_db
```

### Eureka Configuration
```properties
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
```

## Running the Service

### Using Docker
```bash
docker build -t books-management-service .
docker run -p 8085:8085 books-management-service
```

### Using Maven
```bash
./mvnw spring-boot:run
```

### Using Docker Compose
```bash
docker-compose up books-management-service
```

## Database Schema

The service uses MongoDB with the following document structure:

```json
{
  "id": "string",
  "title": "string",
  "author": "string",
  "isbn": "string",
  "description": "string",
  "publicationYear": "number",
  "genre": "string",
  "publisher": "string",
  "availableCopies": "number",
  "totalCopies": "number",
  "coverImageUrl": "string",
  "tags": ["string"],
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "isActive": "boolean"
}
```

## Integration

This service integrates with:
- **Eureka Server**: For service discovery
- **API Gateway**: For routing and load balancing
- **Loan Service**: For book borrowing/returning operations
- **Search Service**: For advanced search capabilities
- **User Service**: For user authentication and authorization

## Health Check

The service includes actuator endpoints for monitoring:
- Health: http://localhost:8085/actuator/health
- Info: http://localhost:8085/actuator/info
- Metrics: http://localhost:8085/actuator/metrics
