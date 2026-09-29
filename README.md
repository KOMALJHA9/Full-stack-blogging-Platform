# RQ Blog Redux with Java Backend

This is a separate copy of the RQ Blog Redux project. The React/TypeScript frontend is unchanged; its API is implemented by a Spring Boot Java backend instead of Express/Prisma. The original `rq-blog-redux` folder is not part of this download and was not modified.

## Requirements

- Java 17 or newer
- Maven 3.6+ (or use an IDE with Maven support)
- Node.js 18+ and npm
- Docker Desktop for the included PostgreSQL service, or a local PostgreSQL 14+ server
- Ollama and the `qwen2.5:3b` model for AI drafting, summaries, and chat

## Run locally

1. Start PostgreSQL from this project folder:

   ```sh
   docker compose up -d database
   ```

   The default connection is `jdbc:postgresql://localhost:5432/rq_blog`, user `postgres`, password `postgres`. Override with `DATABASE_URL`, `DATABASE_USERNAME`, and `DATABASE_PASSWORD` if needed.

2. Start the API in another terminal:

   ```sh
   cd backend
   mvn spring-boot:run
   ```

   It listens on `http://localhost:5001`, which matches the unchanged frontend proxy.

3. To enable AI actions, start Ollama and fetch the configured model:

   ```sh
   ollama pull qwen2.5:3b
   ```

   Set `AI_BASE_URL` or `AI_MODEL` to use another Ollama endpoint/model.

4. Start the frontend in another terminal:

   ```sh
   cd frontend
   npm install
   npm start
   ```

   Open `http://localhost:3000`.

The database schema is created/updated by Hibernate on startup. For production, replace `spring.jpa.hibernate.ddl-auto=update` with versioned database migrations and use a managed PostgreSQL instance.

## API compatibility

The Java API keeps the routes and JSON response shapes used by the frontend:

- `GET /api/posts` supports `tag`, `author`, `search`, `ids`, `sort`, `page`, and `pageSize`.
- `GET /api/posts/{id}`, `POST /api/posts`, `PUT /api/posts/{id}`, `DELETE /api/posts/{id}`.
- `PATCH /api/posts/{id}/publish` toggles publication; `PATCH /api/posts/{id}/like` sets a client-specific like.
- `GET/POST /api/posts/{postId}/comments` and `DELETE /api/comments/{id}`.
- `POST /api/ai/draft`, `/api/ai/summary`, and `/api/ai/chat` use Ollama.

## Backend differences: Node/Express vs Java/Spring

| Area | Existing backend | This project |
| --- | --- | --- |
| Runtime and language | Node.js, JavaScript, Express | Java 17+, Spring Boot |
| HTTP routing | Express routers and middleware | Spring MVC controllers and advice |
| Database access | Prisma Client and Prisma schema | Spring Data JPA/Hibernate entities and repositories |
| Database | PostgreSQL via Prisma | PostgreSQL via JDBC; Hibernate creates/updates tables |
| Request validation | Handwritten checks in controllers | Jakarta Bean Validation on request DTOs |
| Errors | Express error middleware | Central `@RestControllerAdvice` JSON responses |
| Configuration | `backend/.env` loaded by dotenv | Spring properties with environment-variable overrides |
| AI integration | Node `fetch` to Ollama | Java `HttpClient` to the same Ollama chat API |
| Frontend | React/TypeScript; proxy targets port 5001 | Identical React/TypeScript files; API listens on port 5001 |

The browser-facing behavior and API contract are intended to stay the same. Internally, database models, validation, startup, dependency management, and error handling use Java/Spring conventions. The frontend is copied as source; `node_modules` is intentionally excluded and installed with `npm install`.
