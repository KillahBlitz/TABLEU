# Memory Log - TABLEU

## Project State & Movement Tracker
- **Status:** Auth Hardened & Quick Demo Login Vulnerability Removed
- **Date:** 2026-08-17
- **Current Phase:** Security Hardening - Authentication

### Movement Log
1. **[2026-08-17] Requirement Analysis & Inspection:**
   - Examined `implementacion.md`, `.agents/skills/software-architect.md`, `.agents/skills/fullstack-developer.md`, `.agents/rules/code-coments.md`.
   - Local runtime verified: Node.js v24.15.0, npm 11.12.1, MongoDB v7.0.10 running on port 27017.
   - Enforced strict no-comment policy across 100% of code files.
2. **[2026-08-17] Architecture Blueprint:**
   - Formulated full architecture blueprint in `architecture.md` according to `software-architect.md`.
   - Prepared implementation plan in `implementation_plan.md`.
3. **[2026-08-17] Database Reset & Cleanup:**
   - Executed `clean_db.js` to wipe all previous test sprints, test epics, and test stories.
   - Maintained clean database state with the 3 default Admin users seeded.
4. **[2026-08-17] Sprint Lifecycle & UX Overhaul:**
   - **Sprint Creation with Dates:** Form with Start Date (`Fecha Inicio`), End Date (`Fecha Fin`), Name, and Goal in `SprintControlModal.jsx`.
   - **Tabbed Modal Interface:** Allows easy switching between list of Sprints (Active, Planned, Finished) and the creation form.
   - **Start & Finish Triggers:** Quick buttons to Iniciar Sprint (`status: active`) and Finalizar Sprint (`status: completed`).
   - **Universal Sprints Access:** Added Sprints and Epics buttons across Kanban Board, Backlog View, and Navbar for seamless admin control.
5. **[2026-08-17] Epics vs Sprints Independence & KPI Separation:**
   - Clarified and decoupled Epics (Categories / Initiatives) from Sprints (Timeboxes).
   - KPI Dashboard presents:
     - **Reportes por Sprint:** Rendimiento por desarrollador (historias, horas, puntos) en el Sprint seleccionado.
     - **Progreso Global por Épica:** Avance global por categoría a lo largo de todo el proyecto.
6. **[2026-08-17] Developer Histograms & Sprint Statistics:**
   - Added interactive developer histogram cards to `UserPerformanceTable.jsx` and `kpi.css`.
   - **Dual-Bar Hours Histogram:** Direct comparison of Planned Hours vs Logged Hours with variance badges (`+Xh` deviation or on-time).
   - **Story Points Histogram:** Planned Story Points vs Completed Story Points with completion rate.
   - **Segmented Status Bar:** Visual distribution of developer tasks across Ready QA, Dev/Test, ToDo, and Blocked.
   - **Summary Chips:** Delivery success %, Hours Progress %, and Blocked tasks indicator.
   - **View Toggle:** Seamlessly toggle between "Histogramas" and "Tabla Detallada".
7. **[2026-08-17] Production Deployment & CI/CD Pipeline Setup:**
   - Created `backend/Dockerfile` (Node 20-alpine container).
   - Created `backend/.dockerignore`.
   - Created `frontend/Dockerfile` (Multi-stage build with Nginx Alpine).
   - Created `frontend/nginx.conf` (SPA fallback routing, reverse proxy `/api/`, gzip compression, and cache headers).
   - Created `frontend/.dockerignore`.
   - Created `docker-compose.yml` configured for ports:
     - Frontend on port `3030` (`3030:80`)
     - Backend on port `3031` (`3031:5001`)
   - Created `.github/workflows/deploy.yml` with self-hosted runner automation.
   - Created comprehensive `.gitignore`.
8. **[2026-08-17] Authentication Hardening:**
   - Removed all quick-demo auto-fill buttons from `AuthView.jsx`.
   - Strictly enforced manual email and password entry with bcrypt password validation.
9. **[2026-08-18] Attendance Management Module (Admin Only):**
   - Created `Attendance` Mongoose model with unique compound index `{ userId, date }` and 3 statuses: `present`, `absent`, `unregistered`.
   - Created `attendanceController.js` with 4 operations: `getAttendance` (with virtual unregistered filling), `markAttendance` (upsert), `bulkMarkAttendance` (bulkWrite), `getAttendanceSummary` (attendance rate calculation).
   - Created `attendanceRoutes.js` protected by `protect` + `requireAdmin` middleware.
   - Registered `/api/attendance` routes in `server.js`.
   - Created `attendanceService.js` frontend API wrapper.
   - Created `AttendanceDashboard.jsx` with two views:
     - **Daily View:** Date navigation (← / →), team member table with 3-state selectors (Asistencia/Falta/Sin Registro), inline notes, summary counters, and bulk save.
     - **Summary View:** Date range selector with per-user totals (present/absent/unregistered) and attendance rate progress bars.
   - Created `attendance.css` with full dark palette integration (design tokens from `main.css`).
   - Added "Asistencias" tab in `Navbar.jsx` (admin-only, `ClipboardCheck` icon).
   - Added `/attendance` route in `App.jsx` protected with `adminOnly={true}`.
