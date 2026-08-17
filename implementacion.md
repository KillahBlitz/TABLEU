# Plan de Implementación: Tablero Kanban (TABLEU)

Documento de Requerimientos de Producto (PRD) y Plan de Arquitectura e Implementación Técnica para el sistema de gestión ágil con Tablero Kanban, Backlog, Épicas, Sprints, KPIs avanzados y Control de Acceso Basado en Roles (RBAC).

---

## 1. Documento de Requerimientos de Producto (PRD Blueprint - Requirements Analyst)

### 1.1 Executive Summary
- **Feature/Module Name:** TABLEU - Enterprise Agile Kanban & KPI Platform
- **Primary Goal:** Proveer un sistema de gestión ágil visual, intuitivo y minimalista que permita gestionar el flujo completo de desarrollo (Backlog, Épicas, Sprints, Tablero Kanban de 4 columnas) con métricas de desempeño (KPIs) por horas, dificultad, usuario y épica, gobernado por un sistema estricto de roles.
- **Target Users:** 
  - **Administradores:** Líderes técnicos, Project Managers y Scrum Masters con control total del sistema, gestión de épicas, creación/eliminación de historias, inicio/cierre de sprints y visualización de KPIs.
  - **Desarrolladores:** Miembros del equipo de desarrollo que consultan el backlog y operan las historias en el tablero Kanban (transiciones de estado y edición) sin permisos de eliminación ni acceso a KPIs.

---

### 1.2 Functional Requirements (Para Desarrollador y Arquitecto)

- **F1: Autenticación y Autorización (RBAC):**
  - Registro de usuarios con asignación automática del rol `developer`.
  - Inicio de sesión con generación de tokens JWT.
  - Creación inicial (Seed/Migration) de 3 cuentas con rol `admin`:
    1. Jacobo Monroy
    2. Christopher Figueroa
    3. Lizbeth Loza
  - Middleware de protección de rutas y permisos granulares en backend y frontend.
- **F2: Gestión de Épicas (CRUD - Solo Admin):**
  - Creación, lectura, actualización y eliminación de Épicas con título, descripción, color identificador, fechas estimadas y estado.
- **F3: Gestión de Backlog e Historias de Usuario:**
  - CRUD completo de Historias en Backlog (Crear, Editar, Eliminar historias solo por Admin; Desarrollador puede ver y editar).
  - Campos de Historia: Título, descripción, Épica asociada, Sprint asignado, Desarrollador asignado, Estado, Horas estimadas, Horas registradas/invertidas, Dificultad (Story Points: 1, 2, 3, 5, 8, 13), Prioridad y Estado de Bloqueo.
- **F4: Tablero Kanban de 4 Columnas:**
  - Columnas fijas de flujo de trabajo:
    1. `ToDo` (Color acento `#00E5FF`)
    2. `Development` (Color acento `#FFEA00`)
    3. `To Be Tested` (Color acento intermedio)
    4. `Ready QA` (Color acento `#00FFCC`)
  - Movimiento e interacción fluida de tarjetas entre columnas (Drag & Drop / Selectores de estado).
  - Admins y Developers pueden mover historias en el tablero. Los Developers no pueden eliminar tarjetas.
- **F5: Gestión de Sprints:**
  - Creación, inicio y finalización de Sprints con fechas específicas (Fecha Inicio, Fecha Fin, Meta del Sprint).
  - Solo los administradores pueden iniciar o finalizar sprints.
  - Filtrado del tablero por sprint activo o histórico.
- **F6: Módulo de KPIs y Reportes (Solo Admin):**
  - **KPIs por Usuario:** Porcentaje de avance de desarrollo por horas invertidas vs estimadas, porcentaje por dificultad (story points completados vs totales), conteo de historias completadas/en progreso/bloqueadas.
  - **KPIs por Épica:** Porcentaje de avance global de cada épica (horas y puntos), distribución de historias por estado.
  - **Reportes por Sprint:** Resumen de velocidad, cumplimiento de sprint, horas totales estimadas vs reales.
- **F7: Interfaz Gráfica y Experiencia Visual:**
  - Diseño minimalista e intuitivo con fondo interactivo mediante `particles.js` / `@tsparticles`.
  - Aplicación estricta de la paleta de colores corporativa:
    - Fondo de aplicación: `#121212`
    - Columnas: `#1E1E1E`
    - Tarjetas: `#2D2D2D`
    - Texto principal: `#E0E0E0`
    - Texto secundario: `#A0A0A0`
    - Estados: Done (`#00FFCC`), To Do (`#00E5FF`), Blocked (`#FF007F`), In Progress (`#FFEA00`).

---

### 1.3 Non-Functional Requirements (Para el Arquitecto)

- **Seguridad:** 
  - Hash de contraseñas con `bcryptjs`.
  - Autenticación Stateless basada en JWT con expiración configurada.
  - Validación en backend de permisos por rol (`admin` vs `developer`) en cada endpoint crítico (DELETE de historias, endpoints de KPIs, inicio/cierre de sprints).
- **Rendimiento:**
  - Índices en MongoDB para búsquedas rápidas por `sprintId`, `epicId`, `assignedTo` y `status`.
  - Animación de partículas optimizada (baja carga de CPU/GPU en background).
- **Escalabilidad y Modularidad:**
  - Arquitectura desacoplada en backend (Controladores, Servicios, Modelos, Middlewares, Rutas).
  - Frontend modularizado con React (Hooks personalizados, Context API para estado global de autenticación, componentes atómicos y vistas dedicadas).

---

### 1.4 User Stories & Acceptance Criteria

- **Story 1: Registro e Inicio de Sesión**
  - *Como* usuario nuevo, *quiero* registrarme en la plataforma *para* acceder a las herramientas de desarrollo.
  - *Criterio de Aceptación 1.1:* Todo usuario registrado mediante el formulario público adquiere automáticamente el rol `developer`.
  - *Criterio de Aceptación 1.2:* El sistema valida correo único y contraseña segura, retornando un JWT al iniciar sesión exitosamente.
- **Story 2: Cuentas Preconfiguradas de Administrador**
  - *Como* administrador del sistema, *quiero* que existan las cuentas iniciales de Jacobo Monroy, Christopher Figueroa y Lizbeth Loza *para* gestionar la plataforma desde el despliegue inicial.
  - *Criterio de Aceptación 2.1:* Un script de inicialización/seed genera estas 3 cuentas con rol `admin` si no existen previamente en la base de datos.
- **Story 3: Administración de Épicas y Backlog**
  - *Como* administrador, *quiero* crear épicas e historias en el backlog *para* planificar el trabajo del equipo.
  - *Criterio de Aceptación 3.1:* El admin puede crear, editar y eliminar épicas.
  - *Criterio de Aceptación 3.2:* El admin puede crear, editar y eliminar historias en el backlog con horas estimadas y dificultad en story points.
  - *Criterio de Aceptación 3.3:* El desarrollador puede ver el backlog y editar datos de sus tareas asignadas, pero la opción de eliminar historias no está visible ni permitida por API.
- **Story 4: Operación del Tablero Kanban**
  - *Como* desarrollador o administrador, *quiero* visualizar y mover tarjetas a través de las 4 columnas (ToDo, Development, To Be Tested, Ready QA) *para* actualizar el estado del trabajo diario.
  - *Criterio de Aceptación 4.1:* El tablero presenta visualmente las 4 columnas con sus respectivos colores temáticos.
  - *Criterio de Aceptación 4.2:* Arrastrar o cambiar de estado una tarjeta actualiza en tiempo real el registro en MongoDB.
- **Story 5: Control de Ciclo de Vida de Sprints**
  - *Como* administrador, *quiero* definir fechas de inicio y fin de sprints e iniciar/finalizar formalmente un sprint *para* delimitar los ciclos de entrega.
  - *Criterio de Aceptación 5.1:* Solo usuarios con rol `admin` pueden presionar "Iniciar Sprint" y "Finalizar Sprint".
  - *Criterio de Aceptación 5.2:* Al finalizar un sprint, las historias no concluidas permanecen o retornan al backlog según elección del admin.
- **Story 6: Visualización de KPIs y Estadísticas**
  - *Como* administrador, *quiero* ver métricas de progreso porcentual por horas y dificultad agrupadas por usuario y por épica *para* evaluar el rendimiento y desvíos.
  - *Criterio de Aceptación 6.1:* Dashboard con tarjetas y gráficos de avance: `% Horas = (Horas Invertidas / Horas Estimadas) * 100` y `% Dificultad = (Puntos Completados / Puntos Totales) * 100`.
  - *Criterio de Aceptación 6.2:* Métricas desglosadas por cada desarrollador y por cada épica activa.
  - *Criterio de Aceptación 6.3:* Si un desarrollador intenta acceder a la ruta de KPIs, es redirigido o bloqueado con código 403.

---

## 2. Blueprint de Arquitectura Técnica

### 2.1 Stack Tecnológico
- **Base de Datos:** MongoDB (utilizando ODM `mongoose` con esquemas tipados y validaciones).
- **Backend:** Node.js con Express, arquitectura REST, `bcryptjs` para cifrado, `jsonwebtoken` para autenticación y `cors`.
- **Frontend:** React 18+ (Vite), React Router v6, Lucide React (iconografía minimalista), `@tsparticles/react` + `@tsparticles/slim` (fondo dinámico de partículas), Vanilla CSS puro modular estructurado en variables de diseño.

```
+-------------------------------------------------------------------+
|                        React Frontend (SPA)                       |
|  +-------------------------------------------------------------+  |
|  | Particle.js Animated Canvas Background (#121212)            |  |
|  | Top Navigation (User Profile, Role Badge, View Switcher)    |  |
|  +-------------------------------------------------------------+  |
|  | Views:                                                      |  |
|  |  - Auth (Login / Register)                                  |  |
|  |  - Kanban Board (4 Columns: ToDo, Dev, Tested, Ready QA)    |  |
|  |  - Backlog & Epic Manager (CRUD & Filters)                  |  |
|  |  - Sprint Management Modal / View                           |  |
|  |  - KPI Dashboard (Admin Only: Metrics by User & Epic)       |  |
|  +-------------------------------------------------------------+  |
+---------------------------------+---------------------------------+
                                  | REST API (JSON / JWT)
                                  v
+-------------------------------------------------------------------+
|                        Node.js / Express API                      |
|  +-------------------------------------------------------------+  |
|  | Middlewares: Auth Guard (JWT), Role Guard (Admin vs Dev)    |  |
|  +-------------------------------------------------------------+  |
|  | Controllers & Services:                                     |  |
|  |  - /api/auth    (Login, Register, Me)                       |  |
|  |  - /api/epics   (CRUD - Admin)                              |  |
|  |  - /api/sprints (CRUD, Start, Finish - Admin)               |  |
|  |  - /api/stories (CRUD Backlog & Board Transitions)          |  |
|  |  - /api/kpis    (Calculations by User & Epic - Admin)       |  |
|  |  - /api/users   (Developer lists for assignment)            |  |
|  +-------------------------------------------------------------+  |
+---------------------------------+---------------------------------+
                                  | Mongoose ODM
                                  v
+-------------------------------------------------------------------+
|                           MongoDB                                 |
|  Collections: users, epics, sprints, stories, activity_logs      |
+-------------------------------------------------------------------+
```

---

### 2.2 Modelos de Datos en MongoDB (Mongoose Schemas)

#### 1. Colección `users`
```json
{
  "_id": "ObjectId",
  "name": "String (Required)",
  "email": "String (Required, Unique, Lowercase)",
  "password": "String (Required, Hashed)",
  "role": "String (Enum: ['admin', 'developer'], Default: 'developer')",
  "avatarColor": "String (Default: Hex color)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

#### 2. Colección `epics`
```json
{
  "_id": "ObjectId",
  "title": "String (Required)",
  "description": "String",
  "color": "String (Default: '#00E5FF')",
  "status": "String (Enum: ['planning', 'in_progress', 'completed'], Default: 'planning')",
  "startDate": "Date",
  "targetDate": "Date",
  "createdBy": "ObjectId (Ref: users)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

#### 3. Colección `sprints`
```json
{
  "_id": "ObjectId",
  "name": "String (Required)",
  "goal": "String",
  "startDate": "Date (Required)",
  "endDate": "Date (Required)",
  "status": "String (Enum: ['planned', 'active', 'completed'], Default: 'planned')",
  "startedAt": "Date",
  "completedAt": "Date",
  "createdBy": "ObjectId (Ref: users)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

#### 4. Colección `stories`
```json
{
  "_id": "ObjectId",
  "title": "String (Required)",
  "description": "String",
  "epicId": "ObjectId (Ref: epics, Optional)",
  "sprintId": "ObjectId (Ref: sprints, Optional, Nullable for pure backlog)",
  "assignedTo": "ObjectId (Ref: users, Optional)",
  "status": "String (Enum: ['backlog', 'todo', 'in_progress', 'to_be_tested', 'ready_qa'], Default: 'backlog')",
  "estimatedHours": "Number (Default: 0)",
  "loggedHours": "Number (Default: 0)",
  "difficulty": "Number (Story points: 1, 2, 3, 5, 8, 13, Default: 1)",
  "priority": "String (Enum: ['low', 'medium', 'high', 'urgent'], Default: 'medium')",
  "isBlocked": "Boolean (Default: false)",
  "blockedReason": "String",
  "order": "Number (For column positioning)",
  "createdBy": "ObjectId (Ref: users)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

### 2.3 Matriz de Roles y Permisos (RBAC)

| Acción / Módulo | Administrador (`admin`) | Desarrollador (`developer`) |
| :--- | :---: | :---: |
| **Iniciar Sesión / Ver Perfil** | ✅ Permitido | ✅ Permitido |
| **Ver Tablero Kanban de 4 Columnas** | ✅ Permitido | ✅ Permitido |
| **Mover Tarjetas en el Tablero** | ✅ Permitido | ✅ Permitido |
| **Editar Horas / Estado de Historias** | ✅ Permitido | ✅ Permitido |
| **Ver Backlog General** | ✅ Permitido | ✅ Permitido |
| **Crear Historias de Usuario** | ✅ Permitido | ❌ Denegado |
| **Eliminar Historias de Usuario** | ✅ Permitido | ❌ Denegado |
| **CRUD de Épicas** | ✅ Permitido | ❌ Denegado |
| **Iniciar / Finalizar Sprints** | ✅ Permitido | ❌ Denegado |
| **Acceso al Dashboard de KPIs** | ✅ Permitido | ❌ Denegado (Ruta y API bloqueadas) |

---

### 2.4 Fórmulas y Métricas del Módulo de KPIs

1. **Avance por Horas (Por Usuario y Por Épica):**
   $$\text{Progreso Horas (\%)} = \left(\frac{\sum \text{loggedHours}}{\sum \text{estimatedHours}}\right) \times 100$$
   *(Si `estimatedHours` es 0, se calcula en función del ratio de tareas completadas).*
2. **Avance por Dificultad / Puntos de Historia (Por Usuario y Por Épica):**
   $$\text{Progreso Puntos (\%)} = \left(\frac{\sum \text{difficulty (historias en 'ready\_qa')}}{\sum \text{difficulty (total de historias)}}\right) \times 100$$
3. **Eficiencia / Ratio de Desvío:**
   $$\text{Desvío de Horas} = \sum \text{loggedHours} - \sum \text{estimatedHours}$$
4. **Métricas de Salud del Sprint:**
   - Total de historias en cada columna (`ToDo`, `Development`, `To Be Tested`, `Ready QA`).
   - Porcentaje de historias bloqueadas (`isBlocked == true`).

---

### 2.5 Contratos de API (Endpoints REST)

#### Auth & Usuarios
- `POST /api/auth/register` $\rightarrow$ Registra nuevo usuario (rol: `developer`).
- `POST /api/auth/login` $\rightarrow$ Valida credenciales y retorna `{ token, user }`.
- `GET /api/auth/me` $\rightarrow$ Obtiene perfil del usuario logueado.
- `GET /api/users` $\rightarrow$ Lista usuarios para asignación de tareas (requiere auth).

#### Épicas (Solo Admin para escritura)
- `GET /api/epics` $\rightarrow$ Lista todas las épicas con resumen de historias.
- `POST /api/epics` $\rightarrow$ [Admin] Crea nueva épica.
- `PUT /api/epics/:id` $\rightarrow$ [Admin] Actualiza épica.
- `DELETE /api/epics/:id` $\rightarrow$ [Admin] Elimina épica.

#### Sprints (Solo Admin para escritura y control)
- `GET /api/sprints` $\rightarrow$ Lista sprints (activos, planificados y finalizados).
- `POST /api/sprints` $\rightarrow$ [Admin] Crea nuevo sprint.
- `PUT /api/sprints/:id/start` $\rightarrow$ [Admin] Inicia el sprint con fechas.
- `PUT /api/sprints/:id/finish` $\rightarrow$ [Admin] Finaliza el sprint.

#### Historias & Tablero
- `GET /api/stories` $\rightarrow$ Lista historias filtradas por `sprintId`, `status`, `epicId` o `backlog`.
- `POST /api/stories` $\rightarrow$ [Admin] Crea nueva historia.
- `PUT /api/stories/:id` $\rightarrow$ [Admin & Dev] Actualiza historia (título, descripción, horas, estado, asignación).
- `PUT /api/stories/:id/status` $\rightarrow$ [Admin & Dev] Mueve de columna en Kanban.
- `DELETE /api/stories/:id` $\rightarrow$ [Admin] Elimina historia (Dev recibe 403).

#### KPIs & Reportes (Solo Admin)
- `GET /api/kpis/summary` $\rightarrow$ [Admin] Resumen global de avance en horas, puntos y sprints.
- `GET /api/kpis/by-user` $\rightarrow$ [Admin] Desglose porcentual y métricas individuales por desarrollador.
- `GET /api/kpis/by-epic` $\rightarrow$ [Admin] Desglose de avance y dificultad por cada épica.
- `GET /api/kpis/sprint/:id` $\rightarrow$ [Admin] Reporte de rendimiento de un sprint específico.

---

### 2.6 Sistema de Diseño y Tokens CSS (Dark Palette Minimalista)

```css
:root {
  /* Estructura y Fondos */
  --bg-main-app: #121212;
  --bg-columns: #1E1E1E;
  --bg-cards: #2D2D2D;
  --bg-cards-hover: #383838;
  
  /* Textos */
  --text-primary: #E0E0E0;
  --text-secondary: #A0A0A0;
  --text-muted: #6E6E6E;
  
  /* Estados y Acentos */
  --accent-done: #00FFCC;         /* Ready QA */
  --accent-todo: #00E5FF;         /* ToDo */
  --accent-in-progress: #FFEA00;  /* Development */
  --accent-to-test: #9D00FF;      /* To Be Tested */
  --accent-blocked: #FF007F;      /* Bloqueado */
  
  /* Bordes y Sombras */
  --border-color: rgba(255, 255, 255, 0.08);
  --border-focus: rgba(0, 229, 255, 0.4);
  --shadow-card: 0 4px 12px rgba(0, 0, 0, 0.35);
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
}
```

---

## 3. Estructura del Proyecto

```text
TABLEU/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── seeder.js              # Siembra las 3 cuentas de administrador iniciales
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── epicController.js
│   │   │   ├── sprintController.js
│   │   │   ├── storyController.js
│   │   │   └── kpiController.js
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js      # Verificación de JWT
│   │   │   └── roleMiddleware.js      # Verificación de roles (admin vs developer)
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Epic.js
│   │   │   ├── Sprint.js
│   │   │   └── Story.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── epicRoutes.js
│   │   │   ├── sprintRoutes.js
│   │   │   ├── storyRoutes.js
│   │   │   └── kpiRoutes.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── public/
    │   └── favicon.ico
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Navbar.jsx
    │   │   │   ├── ParticleBackground.jsx  # Configuración ParticleJS
    │   │   │   ├── ProtectedRoute.jsx
    │   │   │   └── RoleBadge.jsx
    │   │   ├── kanban/
    │   │   │   ├── KanbanBoard.jsx         # Tablero con las 4 columnas
    │   │   │   ├── KanbanColumn.jsx
    │   │   │   ├── StoryCard.jsx
    │   │   │   └── StoryModal.jsx
    │   │   ├── backlog/
    │   │   │   ├── BacklogView.jsx
    │   │   │   └── StoryFormModal.jsx
    │   │   ├── epics/
    │   │   │   └── EpicManagerModal.jsx
    │   │   ├── sprints/
    │   │   │   └── SprintControlModal.jsx
    │   │   └── kpis/
    │   │       ├── KpiDashboard.jsx        # Panel métricas por usuario y épica
    │   │       ├── MetricCard.jsx
    │   │       ├── UserPerformanceTable.jsx
    │   │       └── EpicProgressChart.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── services/
    │   │   ├── api.js                      # Instancia Axios / Fetch con interceptor JWT
    │   │   ├── authService.js
    │   │   ├── boardService.js
    │   │   └── kpiService.js
    │   ├── styles/
    │   │   ├── main.css                    # Tokens, reset y layout global
    │   │   ├── kanban.css
    │   │   ├── kpi.css
    │   │   └── auth.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 4. Estrategia de Cuentas Iniciales (Database Seeder)

Al iniciar el backend por primera vez (o al ejecutar `npm run seed`), el sistema verifica y genera automáticamente las 3 cuentas de Administrador requeridas con contraseñas seguras por defecto (que el usuario puede personalizar vía variables de entorno):

1. **Jacobo Monroy:** `jacobo.monroy@tableu.io` (Rol: `admin`)
2. **Christopher Figueroa:** `christopher.figueroa@tableu.io` (Rol: `admin`)
3. **Lizbeth Loza:** `lizbeth.loza@tableu.io` (Rol: `admin`)

---

## 5. Fases de Ejecución

- **Fase 1: Backend Base y Persistencia**
  - Inicialización del proyecto backend en Node.js/Express.
  - Conexión a MongoDB con Mongoose.
  - Modelos de datos: `User`, `Epic`, `Sprint`, `Story`.
  - Script de inicialización y seeder de las 3 cuentas de administrador.
- **Fase 2: Autenticación, RBAC y APIs de Negocio**
  - Implementación de controladores y rutas de Auth (Login, Register).
  - Middlewares de autorización y validación de rol.
  - Endpoints CRUD de Épicas, Sprints y Backlog/Historias.
  - Motor de cálculo y agregación para endpoints de KPIs (por usuario, por épica y por sprint).
- **Fase 3: Frontend Base, Estilos y Fondo Particle.js**
  - Inicialización de React con Vite.
  - Configuración del sistema de diseño (tokens de paleta minimalista en CSS).
  - Implementación del canvas interactivo de `particles.js`.
  - Módulo de autenticación (Login, Registro) y AuthContext con persistencia de sesión.
- **Fase 4: Tablero Kanban (4 Columnas), Backlog y Épicas**
  - Construcción del tablero Kanban interactivo con las 4 columnas solicitadas (`ToDo`, `Development`, `To Be Tested`, `Ready QA`).
  - Modal de edición/movimiento de historias y control de permisos (ocultar botón eliminar a desarrolladores).
  - Vista de Backlog y modal de gestión de Épicas.
  - Controles de inicio/cierre de Sprints con selectores de fechas.
- **Fase 5: Módulo de KPIs y Reportes (Admin Only)**
  - Panel visual de métricas de progreso porcentual por horas y dificultad.
  - Tablas y gráficos de desempeño por Desarrollador y por Épica.
  - Protección de rutas en frontend para evitar acceso no autorizado a desarrolladores.
- **Fase 6: Verificación, Pruebas y Validación**
  - Pruebas de flujo de roles (verificación de restricciones de Desarrollador vs permisos de Admin).
  - Validación de cálculos de KPIs ante cambios de estado y registro de horas.
  - Verificación visual de la paleta y fondo dinámico.

---

## 6. Plan de Verificación

### Pruebas Automatizadas y de API
- Verificación de endpoints con pruebas de integración:
  - Registro devuelve rol `developer`.
  - Login de las 3 cuentas de Admin devuelve rol `admin`.
  - Endpoint `DELETE /api/stories/:id` retorna `403 Forbidden` con token de desarrollador y `200 OK` con token de admin.
  - Endpoint `GET /api/kpis/by-user` retorna `403 Forbidden` para desarrolladores.

### Verificación Manual de Flujo de Usuario
1. **Flujo de Administrador:**
   - Iniciar sesión como Jacobo Monroy, Christopher Figueroa o Lizbeth Loza.
   - Crear una Épica ("Core Architecture").
   - Crear un Sprint ("Sprint 1 - MVP") con fechas específicas e iniciarlo.
   - Crear 3 historias con horas estimadas y puntos de dificultad en el Backlog.
   - Mover una historia a `Development`, registrar horas, luego moverla a `To Be Tested` y finalmente a `Ready QA`.
   - Ingresar a la sección de KPIs y comprobar que los porcentajes por horas y dificultad reflejan el avance exacto tanto para el usuario como para la épica.
2. **Flujo de Desarrollador:**
   - Registrar una nueva cuenta de usuario (se le asigna rol `developer`).
   - Iniciar sesión: comprobar que el menú de KPIs y los botones de eliminar historias o crear épicas no están visibles.
   - Mover historias en las columnas del tablero y actualizar sus horas invertidas.
3. **Flujo Visual:**
   - Comprobar la correcta renderización del fondo de partículas en `#121212` y las columnas en `#1E1E1E` con tarjetas en `#2D2D2D`.
