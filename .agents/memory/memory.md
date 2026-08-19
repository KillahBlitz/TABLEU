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
10. **[2026-08-19] Story Categories & File Attachments:**
    - **Story Categories:** Added `category` field to Story model with 5 types: `tarea` (🔧 Wrench, cyan), `historia` (📖 BookOpen, purple), `hito` (🏁 Flag, mint), `bug` (🐛 Bug, pink), `mejora` (✨ Sparkles, yellow).
    - Created shared `CategoryConfig.jsx` with `CATEGORY_CONFIG`, `CATEGORY_OPTIONS`, and reusable `CategoryBadge` component.
    - Added interactive category selector (color-coded buttons) to both `StoryFormModal.jsx` (create) and `StoryModal.jsx` (edit/detail).
    - Category icon pill visible on `StoryCard.jsx` in Kanban board.
    - Category column with icon and category filter dropdown added to `BacklogView.jsx` table.
    - **File Attachments:** Added `attachments` array (embedded subdocument) to Story model with fields: `filename`, `originalName`, `mimetype`, `size`, `url`, `isImage`, `uploadedAt`.
    - Installed `multer` and created `uploadMiddleware.js` (disk storage in `backend/uploads/`, 10 files max, 10MB each, image + doc mimetypes).
    - Added `uploadAttachments` and `deleteAttachment` endpoints in `storyController.js`.
    - Routes: `POST /stories/:id/attachments` and `DELETE /stories/:id/attachments/:attachId` in `storyRoutes.js`.
    - Served `/uploads` as static directory in `server.js`.
    - Added `upload` method (FormData) and `UPLOAD_BASE` helper to `api.js`.
    - Added `uploadAttachments` and `deleteAttachment` to `boardService.js`.
    - **Image Preview Grid:** Thumbnail grid with hover overlay (zoom + delete buttons) in `StoryModal.jsx`.
    - **Lightbox:** Full-screen image viewer with prev/next navigation arrows and counter.
    - **File List:** Non-image attachments shown as clickable file items with size badge and delete button.
    - **Attachment Badge:** `📎 N` badge shown on `StoryCard.jsx` and `BacklogView.jsx` when attachments exist.
    - Added `/uploads` proxy in `vite.config.js` for dev server.
    - Added `backend/uploads/*` to `.gitignore` with `.gitkeep`.
    - Full CSS added to `kanban.css`: `.category-pill`, `.category-selector`, `.category-option`, `.attach-badge`, `.attachments-section`, `.attachment-grid`, `.attachment-thumb`, `.attachment-lightbox`, `.lightbox-nav`, etc.
11. **[2026-08-19] KPIs Category Distribution Histograms per User:**
    - **Backend:** Updated `getKpisByUser` in `kpiController.js` to compute and return `categoryBreakdown` (`tarea`, `historia`, `hito`, `bug`, `mejora`) for every registered user.
    - **Histogram Visualization:** Created `CategoryDistributionChart.jsx` rendering statistical histograms with "Frecuencia" on the Y-axis, axis tick marks, coordinate grid, contiguous colored category bars (`#00E5FF`, `#B388FF`, `#00FFCC`, `#FF007F`, `#FFEA00`), floating value bubbles, inner count badges, and "Categorías" on the X-axis with icons and pills.
    - **Filter & Responsive Layout:** Added developer filter dropdown to view all users or inspect a specific user's histogram individually.
    - **Integrated into Dashboard:** Rendered `CategoryDistributionChart` in `KpiDashboard.jsx`.
    - **CSS:** Added complete histogram styles to `kpi.css`.
12. **[2026-08-19] Bugfix: Document Downloads & Image Preview Reliability:**
    - **Backend:** Broadened upload filter in `uploadMiddleware.js` (accepts all image formats and document types, rejects only unsafe executables, increased size limit to 25MB). Added `handleUpload` error wrapper returning 400 JSON instead of crashing.
    - **Download & File Endpoints:** Added `GET /api/stories/:id/attachments/:attachId/download` (`res.download(...)` preserving original filename) and `GET /api/stories/:id/attachments/:attachId/file` (`res.sendFile(...)` for direct inline rendering) in `storyController.js` and `storyRoutes.js`. Removed `protect` middleware from these GET routes so standard browser `<img>` tags and download requests load with HTTP 200 without requiring Bearer headers.
    - **Static Serving:** Served `/api/uploads` and `/uploads` in `server.js` for universal compatibility with frontend proxy.
    - **Frontend:** Added `downloadAttachment` (blob-based direct download with auth token without blank tabs) in `boardService.js`.
    - **UI Enhancements (`StoryModal.jsx`):**
      - Dedicated "Descargar" buttons with `Download` icon for both documents and images.
      - Click on file info triggers direct download.
      - Image grid with thumbnail rendering, `onError` fallback, zoom, download, and delete actions.
      - Fullscreen Lightbox with top bar containing filename, filesize, and download button.
    - **CSS:** Added styles in `kanban.css` for `.attachment-group-container`, `.attachment-error-banner`, `.attachment-action-btn.download`, `.lightbox-top-bar`, and `.spin-animation`.
13. **[2026-08-19] MongoDB Roles Catalog & Role Assignment in KPIs:**
    - **MongoDB Model (`Role.js`):** Created `Role` schema (`name`, `label`, `color`, `description`).
    - **Seeder (`seeder.js`):** Added `seedInitialRoles` function seeding the 4 catalog roles: `devRH` (`#00E5FF`), `devCONTA` (`#00FFCC`), `TECHLEAD` (`#B388FF`), `PMO` (`#FFEA00`).
    - **Backend Endpoints:**
      - `GET /api/roles` & `POST /api/roles` in `roleRoutes.js` and `roleController.js`.
      - `PUT /api/users/:id/role` in `userRoutes.js` and `userController.js` to update user `jobRole` and system `role`.
      - `getKpisByUser` in `kpiController.js` includes `jobRole` for all user KPI records.
      - Mounted `/api/roles` and added `seedInitialRoles()` on startup in `server.js`.
    - **Frontend Service (`roleService.js` & `authService.js`):** Added `getRoles()` in `roleService.js` and `updateUserRole()` in `authService.js`.
    - **UI Components:**
      - Created `JobRoleBadge` in `RoleBadge.jsx`.
      - Added "Asignar Rol (Catálogo)" column with real-time dropdown selector in `UserPerformanceTable.jsx` (Table View).
      - Added role selector and `JobRoleBadge` to Developer Histogram Cards (`dev-histogram-card`).
    - **CSS:** Added styles in `kpi.css` for `.job-role-badge`, `.job-role-select-wrapper`, `.job-role-select`, and `.role-loader`.
14. **[2026-08-19] Covered Hours Module in Attendance (Horas Cubiertas):**
    - **Backend:**
      - Added `requiredHours` (default: 40) field to `User` schema in `User.js`.
      - Added `GET /api/attendance/covered-hours` in `attendanceController.js` and `attendanceRoutes.js` (computes total required hours, actual hours logged from stories, percentage covered, remaining/surplus hours, and goal completion status).
      - Added `PUT /api/attendance/required-hours` and updated `updateUserRole` in `userController.js` to modify `requiredHours`.
    - **Frontend:**
      - Added `getCoveredHours()` and `updateRequiredHours()` in `attendanceService.js`.
      - Added "Horas Cubiertas" view mode in `AttendanceDashboard.jsx` alongside "Diario" and "Resumen".
      - Added summary metrics cards: Total Horas Requeridas, Horas Cubiertas (Historias), Cobertura Global (%), y Metas Cumplidas.
      - Added detailed table with member info, job role, stories count, editable required hours input, actual covered hours, dynamic multi-colored progress bar, balance (surplus/remaining), and status badge (`Meta Cumplida`, `En Progreso`, `Sin Avance`).
      - Added sprint filter dropdown to analyze covered hours per sprint or globally.
    - **CSS:** Added styles in `attendance.css` for `.covered-hours-section`, `.covered-summary-metrics-grid`, `.covered-metric-card`, `.required-hours-input`, `.balance-pill`, and `.coverage-status-badge`.
15. **[2026-08-19] Kanban Task Scrolling & Hours Permission Restrictions:**
    - **Kanban Column Scrolling & Card Sizing:**
      - Set `flex-shrink: 0` on `.story-card` so cards maintain full height and comfortable layout without squishing/compressing.
      - Enabled smooth vertical scrolling on `.column-body` (`overflow-y: auto`, `min-height: 0`) with custom dark-themed scrollbars (`width: 6px`, thumb with hover state).
      - Set `height: 100%` on `.kanban-column` inside a viewport-aligned grid (`height: calc(100vh - 180px)`, `min-height: 520px`).
      - Added horizontal overflow protection on `.kanban-grid` (`minmax(280px, 1fr)`) so columns do not collapse on smaller screens.
    - **Role-Based Hours Permissions (Developer vs Admin):**
      - **Backend (`storyController.js`):** In `updateStory`, developers are restricted to editing `loggedHours`, `status`, `description`, `isBlocked`, and `blockedReason`. Any attempts to modify `estimatedHours`, `difficulty`, `priority`, or assignments by non-admins are filtered out and protected.
      - **Frontend (`StoryModal.jsx`):** `Horas Estimadas` is disabled for developers with a `(Solo Admin)` label and read-only style, while `Horas Registradas / Invertidas` remains fully editable for logging actual time worked.

