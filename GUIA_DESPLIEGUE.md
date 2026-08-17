# Guía de Despliegue y Ejecución: TABLEU

Plataforma empresarial de gestión ágil con Tablero Kanban (4 columnas), Backlog, Épicas, Sprints, métricas de rendimiento (KPIs) y Control de Acceso Basado en Roles (RBAC).

---

## 1. Requisitos Previos

- **Node.js:** v18+ (probado con v24.15.0)
- **npm:** v9+ (probado con v11.12.1)
- **MongoDB:** v6.0+ corriendo localmente en el puerto `27017` (o instancia remota/Atlas)

---

## 2. Variables de Entorno

El archivo [backend/.env](file:///Users/jmonroy/Documents/MyProjects/TABLEU/backend/.env) contiene la configuración activa:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/
MONGO_DB=tableu_db
JWT_SECRET=tableu_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d
DEFAULT_ADMIN_PASSWORD=Admin123!
```

---

## 3. Pasos para Levantar los Servicios

### Paso 1: Iniciar MongoDB
Asegúrate de que MongoDB esté activo en tu máquina:
```bash
# macOS con Homebrew
brew services start mongodb-community
# O verificar estado
mongosh --eval "db.adminCommand('ping')"
```

### Paso 2: Levantar el Backend (API REST)
Abre una terminal y ejecuta:
```bash
cd backend
npm install
npm run dev
```
> El servidor iniciará en `http://localhost:5001` y sembrará automáticamente las 3 cuentas de Administrador iniciales si no existen.

### Paso 3: Levantar el Frontend (React + Vite)
Abre una segunda terminal y ejecuta:
```bash
cd frontend
npm install
npm run dev
```
> La interfaz web estará disponible en `http://localhost:5173`.

---

## 4. Credenciales de Prueba Preconfiguradas

### Administradores Iniciales (Acceso Completo y KPIs)
| Usuario | Correo | Contraseña | Rol |
| :--- | :--- | :--- | :--- |
| **Jacobo Monroy** | `jacobo.monroy@tableu.io` | `Admin123!` | `admin` |
| **Christopher Figueroa** | `christopher.figueroa@tableu.io` | `Admin123!` | `admin` |
| **Lizbeth Loza** | `lizbeth.loza@tableu.io` | `Admin123!` | `admin` |

> *Tip:* En la pantalla de inicio de sesión (`http://localhost:5173/login`) existen botones de **Acceso Rápido** que rellenan automáticamente las credenciales de cada administrador.

### Desarrolladores (Operación de Tablero)
Para probar el rol `developer`:
1. Ve a la pestaña **"Registrarse"** en la pantalla de autenticación.
2. Ingresa un nombre, correo y contraseña.
3. El usuario adquiere automáticamente el rol `developer`, con permisos para mover tarjetas y editar horas, pero sin acceso a eliminación de historias ni al módulo de KPIs.

---

## 5. Pruebas Automatizadas y Validación

Para verificar todos los endpoints REST, reglas RBAC y fórmulas de KPIs de forma automática:
```bash
cd backend
node test_e2e_scenarios.js
```

---

## 6. URLs Principales

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Login:** [http://localhost:5173/login](http://localhost:5173/login)
- **Tablero Kanban:** [http://localhost:5173/kanban](http://localhost:5173/kanban)
- **Backlog:** [http://localhost:5173/backlog](http://localhost:5173/backlog)
- **KPIs & Métricas (Admin):** [http://localhost:5173/kpis](http://localhost:5173/kpis)
- **API Health Check:** [http://localhost:5001/api/health](http://localhost:5001/api/health)
