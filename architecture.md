# Architectural Blueprint: TABLEU - Enterprise Agile Kanban & KPI Platform

### 1. High-Level Architecture & Stack
- **Architecture Style:** Client-Server Single Page Application (SPA) with RESTful Backend API and Role-Based Access Control (RBAC).
- **Frontend Layer:** React 18+ (Vite), React Router v6, Lucide React (minimalist iconography), `@tsparticles/react` + `@tsparticles/slim` (interactive dynamic particle background canvas), Vanilla CSS with design token variables (`:root`).
- **Backend Layer:** Node.js + Express REST API, Stateless JWT authentication (`jsonwebtoken`), password hashing with `bcryptjs`, CORS middleware, Mongoose ODM.
- **Database Layer:** MongoDB 7.0+ on port 27017 with structured collections for users, epics, sprints, and stories.

```
+-------------------------------------------------------------------+
|                        React Frontend (SPA)                       |
|  +-------------------------------------------------------------+  |
|  | Particle Background Canvas (#121212)                        |  |
|  | Navigation Bar (User info, Role badge, View Tabs, Logout)  |  |
|  +-------------------------------------------------------------+  |
|  | Views:                                                      |  |
|  |  - Auth View (Login / Register)                             |  |
|  |  - Kanban Board (4 Columns: ToDo, Dev, Tested, Ready QA)    |  |
|  |  - Backlog & Epics View (CRUD, Prioritization, Assignment)  |  |
|  |  - Sprint Management Modal / Selector                       |  |
|  |  - KPI Dashboard (Admin Only: Progress by User & Epic)      |  |
|  +-------------------------------------------------------------+  |
+---------------------------------+---------------------------------+
                                  | REST API (JSON / JWT Bearer)
                                  v
+-------------------------------------------------------------------+
|                        Node.js / Express API                      |
|  +-------------------------------------------------------------+  |
|  | Middlewares: authMiddleware (JWT), roleMiddleware (Admin)   |  |
|  +-------------------------------------------------------------+  |
|  | Controllers:                                                |  |
|  |  - /api/auth    (Register, Login, Me)                       |  |
|  |  - /api/users   (List developers for assignment)            |  |
|  |  - /api/epics   (CRUD - Admin)                              |  |
|  |  - /api/sprints (CRUD, Start, Finish - Admin)               |  |
|  |  - /api/stories (CRUD Backlog & Board Status Updates)       |  |
|  |  - /api/kpis    (Summary, By User, By Epic, By Sprint)      |  |
|  +-------------------------------------------------------------+  |
+---------------------------------+---------------------------------+
                                  | Mongoose ODM
                                  v
+-------------------------------------------------------------------+
|                            MongoDB                                |
|  Collections: users, epics, sprints, stories                      |
+-------------------------------------------------------------------+
```

---

### 2. Database Schema Design (Data Models)

- **Collection Name:** `users`
  - `_id` (ObjectId): Primary key.
  - `name` (String): Required, trimmed full name.
  - `email` (String): Required, unique, lowercase, trimmed. Indexed.
  - `password` (String): Required, bcrypt-hashed password (excluded in standard JSON outputs).
  - `role` (String): Required, Enum `['admin', 'developer']`, default `'developer'`.
  - `avatarColor` (String): Hex string for UI avatar badges, default `'#00E5FF'`.
  - `createdAt` (Date): Auto-generated timestamp.
  - `updatedAt` (Date): Auto-generated timestamp.

- **Collection Name:** `epics`
  - `_id` (ObjectId): Primary key.
  - `title` (String): Required, trimmed epic title.
  - `description` (String): Optional text description.
  - `color` (String): Hex color identifier, default `'#00E5FF'`.
  - `status` (String): Enum `['planning', 'in_progress', 'completed']`, default `'planning'`.
  - `startDate` (Date): Optional target start date.
  - `targetDate` (Date): Optional target delivery date.
  - `createdBy` (ObjectId): Reference to `users._id`.
  - `createdAt` (Date): Auto-generated timestamp.
  - `updatedAt` (Date): Auto-generated timestamp.

- **Collection Name:** `sprints`
  - `_id` (ObjectId): Primary key.
  - `name` (String): Required, e.g. "Sprint 1 - Core MVP".
  - `goal` (String): Optional sprint goal statement.
  - `startDate` (Date): Required sprint start date.
  - `endDate` (Date): Required sprint target end date.
  - `status` (String): Enum `['planned', 'active', 'completed']`, default `'planned'`.
  - `startedAt` (Date): Actual timestamp when admin started the sprint.
  - `completedAt` (Date): Actual timestamp when admin finished the sprint.
  - `createdBy` (ObjectId): Reference to `users._id`.
  - `createdAt` (Date): Auto-generated timestamp.
  - `updatedAt` (Date): Auto-generated timestamp.

- **Collection Name:** `stories`
  - `_id` (ObjectId): Primary key.
  - `title` (String): Required, task/story title.
  - `description` (String): Optional detailed description.
  - `epicId` (ObjectId): Reference to `epics._id`, optional/nullable. Indexed.
  - `sprintId` (ObjectId): Reference to `sprints._id`, optional/nullable for backlog items. Indexed.
  - `assignedTo` (ObjectId): Reference to `users._id`, optional. Indexed.
  - `status` (String): Enum `['backlog', 'todo', 'in_progress', 'to_be_tested', 'ready_qa']`, default `'backlog'`. Indexed.
  - `estimatedHours` (Number): Default `0`, estimated hours of effort.
  - `loggedHours` (Number): Default `0`, actual hours invested.
  - `difficulty` (Number): Story points enum/range `[1, 2, 3, 5, 8, 13]`, default `1`.
  - `priority` (String): Enum `['low', 'medium', 'high', 'urgent']`, default `'medium'`.
  - `isBlocked` (Boolean): Default `false`, flag for impediments.
  - `blockedReason` (String): Description of the impediment if `isBlocked` is true.
  - `order` (Number): Sequential float/integer for card ordering within column, default `0`.
  - `createdBy` (ObjectId): Reference to `users._id`.
  - `createdAt` (Date): Auto-generated timestamp.
  - `updatedAt` (Date): Auto-generated timestamp.

---

### 3. API Contracts (Backend Endpoints)

#### 3.1 Authentication & User Management
- `POST /api/auth/register`
  - **Purpose:** Public registration for new team members (assigns role `'developer'`).
  - **Auth Required:** No.
  - **Request Payload:** `{ "name": "...", "email": "...", "password": "..." }`
  - **Response Payload:** `{ "token": "...", "user": { "_id": "...", "name": "...", "email": "...", "role": "developer", "avatarColor": "..." } }`

- `POST /api/auth/login`
  - **Purpose:** Authenticate users and issue JWT.
  - **Auth Required:** No.
  - **Request Payload:** `{ "email": "...", "password": "..." }`
  - **Response Payload:** `{ "token": "...", "user": { "_id": "...", "name": "...", "email": "...", "role": "admin|developer", "avatarColor": "..." } }`

- `GET /api/auth/me`
  - **Purpose:** Return current authenticated user profile.
  - **Auth Required:** Yes (Bearer Token).
  - **Response Payload:** `{ "user": { "_id": "...", "name": "...", "email": "...", "role": "...", "avatarColor": "..." } }`

- `GET /api/users`
  - **Purpose:** Return list of developers/users for task assignment.
  - **Auth Required:** Yes (Bearer Token).
  - **Response Payload:** `[ { "_id": "...", "name": "...", "email": "...", "role": "...", "avatarColor": "..." } ]`

#### 3.2 Epics Management
- `GET /api/epics`
  - **Purpose:** List all epics with calculated story count summary.
  - **Auth Required:** Yes.
  - **Response Payload:** `[ { "_id": "...", "title": "...", "description": "...", "color": "...", "status": "...", "startDate": "...", "targetDate": "..." } ]`

- `POST /api/epics`
  - **Purpose:** Create new epic.
  - **Auth Required:** Yes (Admin Only).
  - **Request Payload:** `{ "title": "...", "description": "...", "color": "#00E5FF", "startDate": "...", "targetDate": "..." }`
  - **Response Payload:** `{ "_id": "...", "title": "...", ... }`

- `PUT /api/epics/:id`
  - **Purpose:** Update existing epic.
  - **Auth Required:** Yes (Admin Only).
  - **Request Payload:** `{ "title": "...", "description": "...", "color": "...", "status": "..." }`
  - **Response Payload:** `{ "_id": "...", ... }`

- `DELETE /api/epics/:id`
  - **Purpose:** Delete epic and decouple associated stories.
  - **Auth Required:** Yes (Admin Only - Developer receives 403 Forbidden).
  - **Response Payload:** `{ "message": "Epic deleted successfully" }`

#### 3.3 Sprints Management
- `GET /api/sprints`
  - **Purpose:** Retrieve all sprints (planned, active, completed).
  - **Auth Required:** Yes.
  - **Response Payload:** `[ { "_id": "...", "name": "...", "goal": "...", "startDate": "...", "endDate": "...", "status": "...", "startedAt": "...", "completedAt": "..." } ]`

- `POST /api/sprints`
  - **Purpose:** Create a planned sprint.
  - **Auth Required:** Yes (Admin Only).
  - **Request Payload:** `{ "name": "Sprint 1", "goal": "Deliver MVP", "startDate": "2026-08-17", "endDate": "2026-08-31" }`
  - **Response Payload:** `{ "_id": "...", "name": "...", "status": "planned", ... }`

- `PUT /api/sprints/:id/start`
  - **Purpose:** Activate a sprint and set start timestamp.
  - **Auth Required:** Yes (Admin Only).
  - **Request Payload:** `{}`
  - **Response Payload:** `{ "_id": "...", "status": "active", "startedAt": "..." }`

- `PUT /api/sprints/:id/finish`
  - **Purpose:** Complete a sprint and set completion timestamp.
  - **Auth Required:** Yes (Admin Only).
  - **Request Payload:** `{ "moveIncompleteToBacklog": true }`
  - **Response Payload:** `{ "_id": "...", "status": "completed", "completedAt": "..." }`

#### 3.4 User Stories & Kanban Management
- `GET /api/stories`
  - **Purpose:** Retrieve stories filtered by `sprintId`, `status`, `epicId`, or `backlog=true`.
  - **Auth Required:** Yes.
  - **Query Params:** `?sprintId=...&epicId=...&status=...&backlog=true`
  - **Response Payload:** `[ { "_id": "...", "title": "...", "epicId": {...}, "sprintId": {...}, "assignedTo": {...}, "status": "todo", "estimatedHours": 8, "loggedHours": 2, "difficulty": 3, "priority": "high", "isBlocked": false, "order": 0 } ]`

- `POST /api/stories`
  - **Purpose:** Create story in backlog or sprint.
  - **Auth Required:** Yes (Admin Only - Developer receives 403 Forbidden).
  - **Request Payload:** `{ "title": "...", "description": "...", "epicId": "...", "sprintId": "...", "assignedTo": "...", "estimatedHours": 8, "difficulty": 5, "priority": "high" }`
  - **Response Payload:** `{ "_id": "...", "title": "...", ... }`

- `PUT /api/stories/:id`
  - **Purpose:** Update story details, hours, assignment or impediment status.
  - **Auth Required:** Yes (Admin & Developer).
  - **Request Payload:** `{ "title": "...", "description": "...", "loggedHours": 4, "isBlocked": true, "blockedReason": "Pending API key", ... }`
  - **Response Payload:** `{ "_id": "...", ... }`

- `PUT /api/stories/:id/status`
  - **Purpose:** Transition story between Kanban columns (`todo` <-> `in_progress` <-> `to_be_tested` <-> `ready_qa`).
  - **Auth Required:** Yes (Admin & Developer).
  - **Request Payload:** `{ "status": "in_progress", "order": 1 }`
  - **Response Payload:** `{ "_id": "...", "status": "in_progress", ... }`

- `DELETE /api/stories/:id`
  - **Purpose:** Delete a story.
  - **Auth Required:** Yes (Admin Only - Developer receives 403 Forbidden).
  - **Response Payload:** `{ "message": "Story deleted successfully" }`

#### 3.5 KPI Engine & Analytics (Admin Only)
- `GET /api/kpis/summary`
  - **Purpose:** Global platform progress, total estimated vs logged hours, overall difficulty points completed.
  - **Auth Required:** Yes (Admin Only - Developer receives 403 Forbidden).
  - **Response Payload:** `{ "totalStories": 15, "completedStories": 8, "totalEstimatedHours": 120, "totalLoggedHours": 95, "hoursProgressPercentage": 79.16, "totalPoints": 55, "completedPoints": 34, "pointsProgressPercentage": 61.81, "blockedStoriesCount": 2 }`

- `GET /api/kpis/by-user`
  - **Purpose:** Per-developer metrics (hours logged vs estimated, story points completed, breakdown of stories by status).
  - **Auth Required:** Yes (Admin Only).
  - **Response Payload:** `[ { "userId": "...", "userName": "...", "email": "...", "avatarColor": "...", "totalAssigned": 5, "completed": 3, "estimatedHours": 40, "loggedHours": 32, "hoursProgress": 80.0, "totalPoints": 18, "completedPoints": 13, "pointsProgress": 72.22, "blockedCount": 1 } ]`

- `GET /api/kpis/by-epic`
  - **Purpose:** Progress percentage per epic in hours and difficulty points.
  - **Auth Required:** Yes (Admin Only).
  - **Response Payload:** `[ { "epicId": "...", "title": "...", "color": "...", "totalStories": 6, "completedStories": 4, "estimatedHours": 50, "loggedHours": 42, "hoursProgress": 84.0, "totalPoints": 21, "completedPoints": 16, "pointsProgress": 76.19 } ]`

- `GET /api/kpis/sprint/:id`
  - **Purpose:** Sprint health metrics, velocity, and column distributions.
  - **Auth Required:** Yes (Admin Only).
  - **Response Payload:** `{ "sprintId": "...", "name": "...", "status": "...", "columnCounts": { "todo": 2, "in_progress": 3, "to_be_tested": 1, "ready_qa": 4 }, "hoursEstimated": 60, "hoursLogged": 48, "pointsCompleted": 16, "pointsTotal": 26 }`

---

### 4. File Structure Modifications

```text
TABLEU/
├── architecture.md
├── implementacion.md
├── .agents/
│   ├── memory/
│   │   └── memory.md
│   ├── rules/
│   │   └── code-coments.md
│   └── skills/
│       ├── fullstack-developer.md
│       ├── requirements-analyst.md
│       └── software-architect.md
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── config/
│       │   ├── db.js
│       │   └── seeder.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── epicController.js
│       │   ├── kpiController.js
│       │   ├── sprintController.js
│       │   ├── storyController.js
│       │   └── userController.js
│       ├── middlewares/
│       │   ├── authMiddleware.js
│       │   └── roleMiddleware.js
│       ├── models/
│       │   ├── Epic.js
│       │   ├── Sprint.js
│       │   ├── Story.js
│       │   └── User.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── epicRoutes.js
│       │   ├── kpiRoutes.js
│       │   ├── sprintRoutes.js
│       │   ├── storyRoutes.js
│       │   └── userRoutes.js
│       └── server.js
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── components/
        │   ├── backlog/
        │   │   ├── BacklogView.jsx
        │   │   └── StoryFormModal.jsx
        │   ├── common/
        │   │   ├── Navbar.jsx
        │   │   ├── ParticleBackground.jsx
        │   │   ├── ProtectedRoute.jsx
        │   │   └── RoleBadge.jsx
        │   ├── epics/
        │   │   └── EpicManagerModal.jsx
        │   ├── kanban/
        │   │   ├── KanbanBoard.jsx
        │   │   ├── KanbanColumn.jsx
        │   │   ├── StoryCard.jsx
        │   │   └── StoryModal.jsx
        │   ├── kpis/
        │   │   ├── EpicProgressChart.jsx
        │   │   ├── KpiDashboard.jsx
        │   │   ├── MetricCard.jsx
        │   │   └── UserPerformanceTable.jsx
        │   └── sprints/
        │       └── SprintControlModal.jsx
        ├── context/
        │   └── AuthContext.jsx
        ├── services/
        │   ├── api.js
        │   ├── authService.js
        │   ├── boardService.js
        │   ├── epicService.js
        │   ├── kpiService.js
        │   └── sprintService.js
        └── styles/
            ├── auth.css
            ├── kanban.css
            ├── kpi.css
            └── main.css
```
