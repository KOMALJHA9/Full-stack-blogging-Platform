# Blogpilot AI

Blogpilot AI is a full-stack blogging platform that brings AI into the writing workflow. Create and edit Markdown posts, discover content with search and filters, and interact through likes and comments. Use the Ollama-powered assistant to generate drafts, summarize articles, and answer questions using published blog content.

## Project Overview

The application combines a React and TypeScript frontend with a Java and Spring Boot REST API. Spring Data JPA and Hibernate persist posts, comments, and likes in PostgreSQL. AI features connect to an Ollama model, so drafting, summaries, and chat can run against a local Ollama service.

## Tech Stack

### Frontend

- React 18 and TypeScript
- Redux Toolkit for shared filters and toast state
- TanStack React Query for API data, caching, and mutations
- React Router for page navigation
- React Markdown and `remark-gfm` for Markdown rendering
- Axios for API requests

### Backend

- Java 17 and Spring Boot 3
- Spring MVC for REST endpoints
- Spring Data JPA and Hibernate for persistence
- Jakarta Bean Validation for request validation
- Maven for dependency and build management

### Database and AI

- PostgreSQL 16, available through Docker Compose
- Ollama with the `qwen2.5:3b` model by default
- Java `HttpClient` for requests to the Ollama chat API

## Features

### Blog Management

- Create, edit, view, delete, publish, and unpublish posts
- Write and render posts with Markdown
- Browse posts with title and content search, tag and author filters, sorting, and pagination
- See reading-time estimates and post excerpts

### Community and Saved Posts

- Add and delete comments on posts
- Like and unlike posts
- Bookmark posts and filter the list to saved posts; bookmarks are stored in browser local storage

### AI Writing Assistant

- Generate a title, body, and tag for a post from a prompt
- Generate concise summaries of posts
- Chat with an assistant that can use excerpts from recently published posts as context

### Draft Recovery and Application State

- Automatically save post and comment drafts in the browser and restore them later
- Cache and refresh server data with TanStack React Query
- Preserve listing filters and display app-wide notifications with Redux Toolkit

## Project Structure

```text
.
├── backend/
│   ├── src/main/java/com/rqblog/api/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── exception/
│   │   ├── model/
│   │   ├── repository/
│   │   └── service/
│   ├── src/main/resources/application.properties
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── store/
│   │   └── utils/
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites

- Java 17 or later
- Maven 3.6 or later
- Node.js 18 or later and npm
- Docker Desktop, or a local PostgreSQL 14+ instance
- Ollama and the `qwen2.5:3b` model for AI features

### 1. Clone the repository

```sh
git clone <repository-url>
cd <repository-directory>
```

### 2. Start PostgreSQL

From the project root, start the included database service:

```sh
docker compose up -d database
```

The default database is `rq_blog`, with username `postgres` and password `postgres`.

### 3. Start the backend

In a new terminal, from the project root:

```sh
cd backend
mvn spring-boot:run
```

The API runs at `http://localhost:5001`.

### 4. Start Ollama for AI features

Make sure Ollama is installed and running, then download the default model:

```sh
ollama pull qwen2.5:3b
```

AI endpoints use the values in the configuration table below. The blog can be used without Ollama, but its AI features will be unavailable.

### 5. Start the frontend

In another terminal, from the project root:

```sh
cd frontend
npm install
npm start
```

Open `http://localhost:3000` in your browser.

## Configuration

The backend reads configuration from environment variables and falls back to these defaults:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5001` | Backend HTTP port |
| `DATABASE_URL` | `jdbc:postgresql://localhost:5432/rq_blog` | PostgreSQL JDBC URL |
| `DATABASE_USERNAME` | `postgres` | Database username |
| `DATABASE_PASSWORD` | `postgres` | Database password |
| `FRONTEND_ORIGIN` | `http://localhost:3000` | Allowed frontend origin for CORS |
| `AI_BASE_URL` | `http://localhost:11434` | Ollama base URL |
| `AI_MODEL` | `qwen2.5:3b` | Ollama model name |

Hibernate creates or updates the schema when the backend starts. For production deployments, use a managed database and versioned schema migrations.

## API Endpoints

### Posts

- `GET /api/posts` - List posts. Supports `tag`, `author`, `search`, `ids`, `sort`, `page`, and `pageSize` query parameters.
- `GET /api/posts/{id}` - Get a post.
- `POST /api/posts` - Create a post.
- `PUT /api/posts/{id}` - Update a post.
- `PATCH /api/posts/{id}/publish` - Toggle a post's published status.
- `PATCH /api/posts/{id}/like` - Set the current client's like state.
- `DELETE /api/posts/{id}` - Delete a post.

### Comments

- `GET /api/posts/{postId}/comments` - List a post's comments.
- `POST /api/posts/{postId}/comments` - Add a comment.
- `DELETE /api/comments/{id}` - Delete a comment.

### AI

- `POST /api/ai/draft` - Generate a blog post draft.
- `POST /api/ai/summary` - Summarize post content.
- `POST /api/ai/chat` - Chat with the blog assistant.

## Notes

- Bookmarks and recoverable drafts are stored in browser local storage.
- The default AI integration expects a running local Ollama service; `AI_BASE_URL` and `AI_MODEL` can be changed for another compatible Ollama endpoint or model.
