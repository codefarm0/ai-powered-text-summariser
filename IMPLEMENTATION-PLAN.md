# Implementation Plan — AI-Powered Text Summarizer

## Part 1: Core AI Text Summarizer

> Based on the Software Design Document (SDD) in `initial-requirement.md`.  
> This plan covers **Part 1 only**: Guest Users, Project Management, and AI Text Summarization with history.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   Frontend (React)              │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐ │
│  │Dashboard  │  │ Project  │  │Mock Services  │ │
│  │Page       │  │Workspace │  │(Phase 1)      │ │
│  └──────────┘  └──────────┘  └───────┬───────┘ │
│                                      │         │
│  ┌────────────────────────────────────┘         │
│  │ Phase 3: Swap to Axios → Backend API         │
│  └──────────────────────────────────────────────┘
│                   │
├───────────────────┼─────────────────────────────┤
│            HTTP REST (Phase 3)                   │
├───────────────────┼─────────────────────────────┤
│                   ▼                              │
│              Backend (Spring Boot)               │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐ │
│  │Controller │  │ Service  │  │   AI Module   │ │
│  │ (REST)    │→ │(Business)│→ │ (Spring AI)   │ │
│  └──────────┘  └──────────┘  └───────┬───────┘ │
│                   │                   │         │
│                   ▼                   ▼         │
│  ┌──────────┐           ┌────────────────────┐  │
│  │Repository│           │   Ollama (Local)   │  │
│  │ (JPA)    │           │  Mistral/Llama/Qwen│  │
│  └────┬─────┘           └────────────────────┘  │
│       │                                          │
│       ▼                                          │
│  ┌──────────┐                                    │
│  │  MySQL   │ (Docker Container)                 │
│  └──────────┘                                    │
└─────────────────────────────────────────────────┘
```

---

## Phased Approach

| Phase | What | Duration (est.) |
|-------|------|----------------|
| 1 | Frontend with Mock Data | Build first |
| 2 | Backend Service | Then implement |
| 3 | Integration & E2E Testing | Finally |

---

## Phase 1: Frontend with Mock Data

### 1.1 — Scaffold Project

```bash
npm create vite@latest frontend-react -- --template react-ts
cd frontend-react
npm install
npm install react-router-dom axios tailwindcss @tailwindcss/vite react-markdown uuid
npm install -D @types/uuid
```

Configure Tailwind in `vite.config.ts`.

### 1.2 — Folder Structure

```
frontend-react/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── SummaryEditor.tsx
│   │   ├── SummaryViewer.tsx
│   │   ├── MarkdownViewer.tsx
│   │   ├── ModelSelector.tsx
│   │   ├── SummaryTypeSelector.tsx
│   │   ├── LoadingIndicator.tsx
│   │   ├── StreamingMessage.tsx
│   │   └── ConfirmationDialog.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── ProjectWorkspace.tsx
│   │   └── NotFound.tsx
│   ├── services/
│   │   ├── mock/
│   │   │   ├── mockData.ts
│   │   │   ├── userService.ts
│   │   │   ├── projectService.ts
│   │   │   └── summaryService.ts
│   │   └── api.ts            # Axios instance (Phase 3)
│   ├── types/
│   │   └── index.ts
│   ├── context/
│   │   └── UserContext.tsx
│   ├── hooks/
│   │   └── useMockApi.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

### 1.3 — Types (`src/types/index.ts`)

Define all TypeScript interfaces matching the API contract:

```typescript
export interface User {
  publicId: string;
  displayName: string;
  preferredModel?: string;
  preferredSummaryType?: SummaryType;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type SummaryType = 'SHORT' | 'DETAILED' | 'EXECUTIVE' | 'BULLET_POINTS';

export interface Summary {
  id: number;
  projectId: number;
  originalText: string;
  summary: string;
  summaryType: SummaryType;
  model: string;
  inputTokens: number;
  outputTokens: number;
  responseTimeMs: number;
  createdAt: string;
}

export interface GenerateSummaryRequest {
  text: string;
  summaryType: SummaryType;
  model: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
```

### 1.4 — Mock Data Layer

**`src/services/mock/mockData.ts`** — Seed data:

- 1 guest user (auto-generated UUID on first visit)
- 3 sample projects (e.g., "Spring AI Learning", "System Design Prep", "Research Notes")
- 8-10 sample summaries distributed across projects with various types/models/dates

**`src/services/mock/userService.ts`**:

| Function | Returns |
|----------|---------|
| `createGuestUser()` | Creates & stores UUID in localStorage, returns `User` |
| `getUserProfile(publicId)` | Returns user object |
| `updatePreferences(publicId, prefs)` | Updates user preferences |

**`src/services/mock/projectService.ts`**:

| Function | Returns |
|----------|---------|
| `getProjects(publicId, page, size)` | `PaginatedResponse<Project>` |
| `getProject(publicId, projectId)` | `Project` |
| `createProject(publicId, name, description?)` | `Project` |
| `updateProject(publicId, projectId, name, description?)` | `Project` |
| `deleteProject(publicId, projectId)` | void |

**`src/services/mock/summaryService.ts`**:

| Function | Returns |
|----------|---------|
| `generateSummary(publicId, projectId, request)` | `Summary` (with AI-like mock text) |
| `getSummaries(publicId, projectId, page, size, filters?)` | `PaginatedResponse<Summary>` |
| `getSummary(publicId, projectId, summaryId)` | `Summary` |
| `deleteSummary(publicId, projectId, summaryId)` | void |
| `streamSummary(publicId, projectId, request)` | `AsyncGenerator<string>` (mocked word-by-word stream) |

Mock `streamSummary` simulates SSE by yielding words with 50ms delays to mimic streaming.

### 1.5 — User Context (`src/context/UserContext.tsx`)

- On app mount: check localStorage for existing `publicId`
- If none: call `createGuestUser()` from mock service, store result
- Provide `user`, `isLoading`, `refreshUser` to entire app
- Every mock service function reads `publicId` from context

### 1.6 — Pages

#### Dashboard (`/`)
- **Header:** App title, user display name
- **Projects section:** Grid of project cards with name, description, date
  - "Create Project" button → inline form or modal
  - Click card → navigate to `/projects/:id`
- **Recent summaries section:** Latest 5 summaries across all projects
- **Loading state:** Skeleton cards while "loading"
- **Empty state:** Illustration + "Create your first project" CTA

#### Project Workspace (`/projects/:id`)
- **Top bar:** Project name (editable), breadcrumb back to Dashboard
- **Left sidebar/Tabs:**
  - Summary (default)
  - History
- **Summary Tab:**
  - `SummaryEditor` — large textarea for pasting content
  - `SummaryTypeSelector` — dropdown: Short, Detailed, Executive, Bullet Points
  - `ModelSelector` — dropdown with mock model list (defaults to first)
  - "Generate Summary" button
  - `SummaryViewer` — displays generated summary with Markdown rendering
  - Loading spinner during generation, streaming text animation
- **History Tab:**
  - Filter bar (Summary Type, Model, Date range)
  - Table/list of summaries with: date, type, model, tokens, truncated preview
  - Click row → view full summary
  - Delete action with confirmation dialog

### 1.7 — Key Components

| Component | Purpose |
|-----------|---------|
| `Navbar` | Top navigation with app name and user info |
| `SummaryEditor` | Large textarea with word/char count |
| `SummaryViewer` | Displays summary text, copy button, metadata |
| `MarkdownViewer` | Wraps `react-markdown` for rendering |
| `ModelSelector` | Dropdown of available models |
| `SummaryTypeSelector` | Dropdown of summary types |
| `LoadingIndicator` | Animated spinner/skeleton |
| `StreamingMessage` | Word-by-word text reveal animation |
| `ConfirmationDialog` | Modal for delete confirmations |

### 1.8 — Routing (`App.tsx`)

```tsx
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/projects/:projectId" element={<ProjectWorkspace />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

### 1.9 — Styling

- Tailwind CSS throughout
- Dark/light theme via `prefers-color-scheme` or toggle (optional for Part 1)
- Responsive design: sidebar collapses on mobile
- Consistent color scheme using Tailwind config

### 1.10 — Verification Checklist

- [ ] Guest UUID generated on first visit and persisted
- [ ] Dashboard shows mock projects and recent summaries
- [ ] Create new project works (persisted in localStorage/mock array)
- [ ] Click project → workspace loads with correct project
- [ ] Summary tab: paste text, select type, click generate → mock summary appears
- [ ] Streaming: words appear one by one
- [ ] Markdown rendered correctly (headings, lists, code blocks)
- [ ] History tab shows summaries with filters working
- [ ] Delete summary shows confirmation and removes it
- [ ] Rename project works
- [ ] Delete project works
- [ ] 404 page for unknown routes
- [ ] Responsive layout works on mobile viewports

---

## Phase 2: Backend Service

### 2.1 — Prerequisites

- Java 21+ installed
- Docker Desktop running
- Ollama running locally
- Gradle 8.x (or use Gradle wrapper)

### 2.2 — Scaffold Spring Boot Project

Using [Spring Initializr](https://start.spring.io/) or manually:

```
ai-text-summariser-service/
├── build.gradle
├── settings.gradle
├── gradlew
├── gradlew.bat
├── gradle/
│   └── wrapper/
├── src/
│   ├── main/
│   │   ├── java/com/codefarm/ai/
│   │   │   ├── AiApplication.java
│   │   │   ├── config/
│   │   │   ├── common/
│   │   │   ├── controller/
│   │   │   ├── dto/
│   │   │   ├── entity/
│   │   │   ├── repository/
│   │   │   ├── service/
│   │   │   ├── mapper/
│   │   │   ├── exception/
│   │   │   ├── validation/
│   │   │   ├── ai/
│   │   │   │   ├── prompt/
│   │   │   │   ├── advisor/
│   │   │   │   ├── client/
│   │   │   │   ├── parser/
│   │   │   │   ├── model/
│   │   │   │   └── util/
│   │   │   └── util/
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       └── prompts/
│   │           └── summary-templates.st
│   └── test/
│       └── java/com/codefarm/ai/
├── docker/
│   └── mysql/
│       └── init.sql
└── Dockerfile
```

### 2.3 — Dependencies (`build.gradle`)

```groovy
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.4.1'
    id 'io.spring.dependency-management' version '1.1.7'
}

group = 'com.codefarm'
version = '0.0.1-SNAPSHOT'

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

dependencies {
    // Spring Boot
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-validation'

    // Spring AI
    implementation 'org.springframework.ai:spring-ai-ollama-spring-boot-starter:1.0.0-M6'

    // Database
    runtimeOnly 'com.mysql:mysql-connector-j'

    // Lombok
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'

    // Testing
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'com.h2database:h2'
}
```

### 2.4 — Docker Compose (Root `docker-compose.yml`)

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.4
    container_name: ai-summarizer-mysql
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: ai_summarizer
      MYSQL_USER: appuser
      MYSQL_PASSWORD: apppass
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend/docker/mysql/init.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  mysql_data:
```

### 2.5 — Configuration (`application.yml`)

```yaml
spring:
  application:
    name: ai-text-summariser

  datasource:
    url: jdbc:mysql://localhost:3306/ai_summarizer
    username: appuser
    password: apppass
    driver-class-name: com.mysql.cj.jdbc.Driver

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.MySQLDialect

  ai:
    ollama:
      base-url: http://localhost:11434
      chat:
        options:
          model: mistral
          temperature: 0.7

server:
  port: 8080

app:
  ai:
    max-input-length: 10000
    available-models: mistral,llama3,qwen
    default-model: mistral
```

### 2.6 — Entities (JPA)

| Entity | Table | Key Fields |
|--------|-------|------------|
| `UserEntity` | `users` | id, publicId (UUID), displayName, guestUser, preferredModel, preferredSummaryType, createdAt, lastActiveAt |
| `ProjectEntity` | `projects` | id, user (ManyToOne), name, description, defaultModel, createdAt, updatedAt |
| `SummaryEntity` | `summaries` | id, project (ManyToOne), originalText, summary, summaryType, model, inputTokens, outputTokens, responseTimeMs, createdAt |

All entities use:
- `@Entity`, `@Table`, `@Id`, `@GeneratedValue(IDENTITY)` for IDs
- `@CreationTimestamp` / `@UpdateTimestamp` for timestamps
- Lombok `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder`

### 2.7 — Repositories

| Repository | Key Methods |
|------------|-------------|
| `UserRepository` | `findByPublicId(String)` |
| `ProjectRepository` | `findByUserPublicId(String, Pageable)`, `findByIdAndUserPublicId(Long, String)` |
| `SummaryRepository` | `findByProjectIdAndProjectUserPublicId(Long, String, Pageable)`, `findByIdAndProjectIdAndProjectUserPublicId(Long, Long, String)` |

### 2.8 — DTOs

| DTO | Fields |
|-----|--------|
| `CreateProjectRequest` | name (not blank, max 100), description |
| `UpdateProjectRequest` | name, description |
| `GenerateSummaryRequest` | text (not blank), summaryType (enum), model (not blank) |
| `UserResponse` | publicId, displayName, preferredModel, preferredSummaryType |
| `ProjectResponse` | id, name, description, createdAt, updatedAt |
| `SummaryResponse` | id, projectId, summary, summaryType, model, inputTokens, outputTokens, responseTimeMs, createdAt |
| `ApiResponse<T>` | success (boolean), data (T), timestamp |
| `PagedResponse<T>` | content (List<T>), page, size, totalElements, totalPages |
| `ErrorResponse` | success (false), message, errorCode, timestamp |

### 2.9 — Controllers

**UserController** (`/api/v1/users`):

| Method | Path | Description |
|--------|------|-------------|
| POST | `/guest` | Create guest user |
| GET | `/me` | Get user profile (X-User-Id header) |
| PUT | `/preferences` | Update preferences |

**ProjectController** (`/api/v1/projects`):

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create project |
| GET | `/` | List projects (paginated, filtered by X-User-Id) |
| GET | `/{projectId}` | Get project details |
| PUT | `/{projectId}` | Update project |
| DELETE | `/{projectId}` | Delete project |

**SummaryController** (`/api/v1/projects/{projectId}/summaries`):

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Generate summary |
| GET | `/stream` | Stream summary (SSE, query params for text/type/model) |
| GET | `/` | List summaries (paginated, filterable) |
| GET | `/{summaryId}` | Get summary details |
| DELETE | `/{summaryId}` | Delete summary |

**ModelController** (`/api/v1/models`):

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List available models |
| GET | `/status` | Check Ollama connectivity |

### 2.10 — Service Layer

| Service | Responsibilities |
|---------|-----------------|
| `UserService` | Guest user creation, profile retrieval, preference updates |
| `ProjectService` | CRUD, ownership validation via X-User-Id |
| `SummaryService` | Generate summary via AI module, persist result, list with filters, delete |
| `AIService` | Build prompts via templates, call ChatClient, handle streaming, structured output parsing |

### 2.11 — AI Module

**Prompt Templates** (`src/main/resources/prompts/summary-templates.st`):

```text
Summarize the following text according to the specified type.

Summary Type: {summaryType}

Text:
{text}

Provide the response in the following JSON format:
{
  "title": "A brief title for this summary",
  "summary": "The full summary text in markdown format",
  "keywords": ["keyword1", "keyword2"]
}
```

**AIService**:

- Injects `ChatClient.Builder` (configured via Spring AI auto-configuration)
- `generateSummary(text, summaryType, model)` → loads template, fills parameters, calls `ChatClient`, parses structured output
- `streamSummary(text, summaryType, model)` → returns `Flux<String>` for SSE streaming
- Model switching: dynamically sets the model in `ChatClient` options per request

### 2.12 — Exception Handling

**`GlobalExceptionHandler`** (`@RestControllerAdvice`):

| Exception | HTTP Status | Error Code |
|-----------|-------------|------------|
| `UserNotFoundException` | 404 | USER_NOT_FOUND |
| `ProjectNotFoundException` | 404 | PROJECT_NOT_FOUND |
| `SummaryNotFoundException` | 404 | SUMMARY_NOT_FOUND |
| `InvalidModelException` | 400 | INVALID_MODEL |
| `AIServiceException` | 500 | AI_SERVICE_ERROR |
| `ValidationException` | 400 | VALIDATION_ERROR |
| `MethodArgumentNotValidException` | 400 | VALIDATION_ERROR |

### 2.13 — Database Initialization (`docker/mysql/init.sql`)

Schema is auto-created via JPA `ddl-auto: update`.  
Optional: pre-seed reference data (e.g., supported models table if needed).

### 2.14 — Verification Checklist

- [ ] `docker-compose up` starts MySQL successfully
- [ ] Spring Boot app starts and connects to MySQL
- [ ] Tables auto-created (users, projects, summaries)
- [ ] `POST /api/v1/users/guest` returns a new guest user
- [ ] `GET /api/v1/users/me` with X-User-Id returns user profile
- [ ] `POST /api/v1/projects` creates a project for the user
- [ ] `GET /api/v1/projects` returns paginated projects
- [ ] `POST /api/v1/projects/{id}/summaries` generates and persists a summary
- [ ] `GET /api/v1/projects/{id}/summaries?page=0&size=10` returns paginated summaries with filters
- [ ] Streaming endpoint returns `text/event-stream` with word-by-word chunks
- [ ] `GET /api/v1/models` returns configured models
- [ ] `GET /api/v1/models/status` returns Ollama health
- [ ] Global exception handler returns consistent error JSON
- [ ] Validation errors return 400 with field-level messages

---

## Phase 3: Integration (Frontend + Backend)

### 3.1 — Swap Mock Services for Real API Calls

No architectural changes needed. Create a parallel service layer:

**`src/services/api/userService.ts`** — Real Axios calls:

```typescript
import api from './api';

export const createGuestUser = async (): Promise<User> => {
  const response = await api.post('/api/v1/users/guest');
  return response.data.data;
};
```

Then in the app, switch imports:

```typescript
// Before (mock):
// import { createGuestUser } from '../services/mock/userService';
// After (real):
import { createGuestUser } from '../services/api/userService';
```

The components remain unchanged — only the service layer changes.

### 3.2 — Configure Axios

**`src/services/api.ts`**:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach X-User-Id
api.interceptors.request.use((config) => {
  const publicId = localStorage.getItem('publicId');
  if (publicId) {
    config.headers['X-User-Id'] = publicId;
  }
  return config;
});

// Response interceptor: unwrap ApiResponse wrapper
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401, 404, 500 consistently
    return Promise.reject(error);
  }
);

export default api;
```

### 3.3 — Streaming Integration

For the streaming summary endpoint:

- Frontend uses `EventSource` or `fetch` with `ReadableStream`
- `StreamingMessage` component receives chunks and renders incrementally
- On complete, the full summary is saved to state/history

### 3.4 — Verification Checklist

- [ ] All mock services replaced; no mock data in production build
- [ ] Guest user created on first visit via real API
- [ ] Project CRUD working end-to-end
- [ ] Summary generation + streaming working end-to-end with Ollama
- [ ] History page loading real data from backend
- [ ] Filters working against real API
- [ ] Error states handled gracefully (network error, 404, 500)
- [ ] Loading states on all API calls
- [ ] Streaming: smooth word-by-word display, no stutter

---

## Infrastructure Setup Guide

### Docker — MySQL

```bash
# Start MySQL
docker compose up -d mysql

# Verify
docker ps
docker logs ai-summarizer-mysql

# Stop
docker compose down
```

### Ollama Setup

Ollama is already running on your machine. Verify:

```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Pull required models (run once)
ollama pull mistral
ollama pull llama3
ollama pull qwen

# Test a model
curl http://localhost:11434/api/generate -d '{
  "model": "mistral",
  "prompt": "Hello in 5 words",
  "stream": false
}'
```

### Application Properties for Local Dev

```yaml
# application-dev.yml (default profile)
spring:
  ai:
    ollama:
      base-url: http://localhost:11434
```

---

## Development Workflow

```
1. docker compose up -d mysql        # Start infra
2. cd frontend-react && npm run dev   # Frontend (mock data)
3. Develop features independently
4. cd ai-text-summariser-service && ./gradlew bootRun  # Backend
5. Switch frontend to real API        # Phase 3
```

---

## Verification Scripts

### Backend Smoke Test (Bruno/curl):

```bash
# 1. Create guest user
curl -X POST http://localhost:8080/api/v1/users/guest

# 2. Create project (replace USER_ID)
curl -X POST http://localhost:8080/api/v1/projects \
  -H "X-User-Id: <USER_ID>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project", "description": "Testing"}'

# 3. Generate summary (replace PROJECT_ID and USER_ID)
curl -X POST http://localhost:8080/api/v1/projects/<PROJECT_ID>/summaries \
  -H "X-User-Id: <USER_ID>" \
  -H "Content-Type: application/json" \
  -d '{"text": "Artificial intelligence is transforming...", "summaryType": "SHORT", "model": "mistral"}'

# 4. List summaries
curl -X GET "http://localhost:8080/api/v1/projects/<PROJECT_ID>/summaries?page=0&size=10" \
  -H "X-User-Id: <USER_ID>"

# 5. Available models
curl http://localhost:8080/api/v1/models
```

---

## File Creation Order (Optimized)

### Frontend (Phase 1):
1. Scaffold with Vite + install dependencies
2. `src/types/index.ts`
3. `src/services/mock/mockData.ts`
4. `src/context/UserContext.tsx`
5. `src/services/mock/userService.ts`, `projectService.ts`, `summaryService.ts`
6. `src/components/` (all components)
7. `src/pages/Dashboard.tsx`, `src/pages/ProjectWorkspace.tsx`, `src/pages/NotFound.tsx`
8. `src/App.tsx` (routing), `src/main.tsx`
9. Tailwind CSS setup and global styles

### Backend (Phase 2):
1. Scaffold via Spring Initializr or manually
2. `build.gradle` / `settings.gradle`
3. `application.yml` / `application-dev.yml`
4. Entity classes
5. Repository interfaces
6. DTOs
7. Mapper (Entity ↔ DTO)
8. Service classes
9. AI module (prompt templates, AIService)
10. Controllers
11. GlobalExceptionHandler
12. `docker-compose.yml` (root level)
13. `docker/mysql/init.sql`

### Integration (Phase 3):
1. `src/services/api.ts` (Axios instance)
2. `src/services/api/*.ts` (real service implementations)
3. Switch imports in components/context
4. Configure CORS in backend

---

## Future Roadmap (Parts 2 & 3)

Once Part 1 is stable:

- **Part 2 — Document Intelligence:** Document module (PDF/DOCX/TXT upload & text extraction), Conversations (chat UI, Chat Memory), RAG pipeline (embeddings, vector store)
- **Part 3 — Production Readiness:** Multi-model switching, AI guardrails, Redis caching, Micrometer metrics, Docker Compose for full stack, token usage dashboards

The architecture supports all of these without major refactoring.
