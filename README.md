# Empleabilidad API

Backend NestJS que centraliza vacantes, postulaciones y autenticación por roles. Este README está pensado para que cualquier desarrollador/a frontend pueda entender rápidamente el alcance, cómo correr el proyecto y cómo consumir cada endpoint.

---

## 🔍 Visión general

- **Vacantes**: CRUD completo administrado por usuarios con rol `MANAGER`.
- **Postulaciones**: usuarios `CODER` aplican a vacantes con control de cupos y conteo automático.
- **Autenticación**: registro/login + JWT (Bearer). Incluye guards por rol.
- **Métricas**: agregados básicos de postulaciones para dashboards rápidos.

Stack principal: Node 20, NestJS 11, TypeORM, PostgreSQL, JWT, Swagger (`/docs`) para exploración interactiva.

---

## 🚀 Puesta en marcha

### Requisitos

- Node.js 20+
- npm 10+
- PostgreSQL 13+ (o usa el compose incluido)

### Pasos rápidos (sin Docker)

```bash
cp .env.example .env   # si aún no tienes uno (usa .env existente como referencia)
npm install
npm run start:dev
```

La API queda disponible en `http://localhost:3000`. Swagger: `http://localhost:3000/docs`.

### Con Docker

```bash
./scripts/docker.sh up:detached
# cuando termines
./scripts/docker.sh down
```

Esto levanta la API + PostgreSQL (datos persistentes en el volumen `db-data`). El script acepta los mismos flags que `docker compose`.

### Usuarios de ejemplo (seed)

```bash
npm run seed
```

Esto crea (si no existen):

- MANAGER — `manager@empleabilidad.local` / `Manager123!`
- CODER — `coder@empleabilidad.local` / `Coder123!`

Úsalos para loguearte rápido desde Postman o tu app.

---

## ⚙️ Variables de entorno relevantes

| Variable          | Descripción                                        | Ejemplo                           |
|-------------------|----------------------------------------------------|-----------------------------------|
| `PORT`            | Puerto HTTP del API                                | `3000`                            |
| `DATABASE_URL`    | URL completa (útil para despliegues)               | `postgresql://...`                |
| `DB_HOST`/`DB_*`  | Config manual de Postgres (host, puerto, user, etc)| `localhost`, `5432`, `postgres`   |
| `DB_SCHEMA`       | Esquema usado por TypeORM                          | `empleabilidad`                   |
| `DB_SYNCHRONIZE`  | Si `true`, sincroniza entidades automáticamente    | `true`                            |
| `JWT_SECRET`      | Clave para firmar tokens                           | `super-secret`                    |
| `JWT_EXPIRES_IN`  | TTL del token                                      | `1d`                              |

---

## 🔐 Flujo de autenticación

1. **Registro** (`POST /auth/register`): Crea un usuario rol `CODER`. Los MANAGER se crean manualmente (seed/base de datos).
2. **Login** (`POST /auth/login`): Responde `{ "access_token": "..." }`. Usa este token como `Authorization: Bearer <token>`.
3. **Roles**: Los endpoints protegidos validan el rol (`RolesGuard`).  
   - `CODER`: aplicar y listar sus postulaciones.  
   - `MANAGER`: CRUD de vacantes y métricas.

---

## 📡 Endpoints clave

> Todos los ejemplos están listos para pegar en herramientas como ThunderClient, Postman o fetch desde el frontend.

### Auth

```http
POST /auth/register
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "Secret123"
}
```

```http
POST /auth/login
{
  "email": "ada@example.com",
  "password": "Secret123"
}
→ { "access_token": "..." }
```

### Vacantes

`GET /vacancies` soporta filtros opcionales:

```
/vacancies?technology=NestJS,PostgreSQL&seniority=Mid
```

- `technology`: acepta múltiples valores separados por coma; aplica `ILIKE` (coincidencia parcial, case-insensitive).
- `seniority`: texto libre (idealmente `Junior`, `Mid`, `Senior`).

Operaciones de manager (necesitan Bearer token):

```http
POST /vacancies
{
  "title": "Backend NestJS",
  "description": "API + TypeORM",
  "technologies": ["NestJS","TypeORM","PostgreSQL"],
  "seniority": "Mid",
  "softSkills": ["Teamwork"],
  "location": "Latam",
  "mode": "Remoto",
  "salaryRange": "USD 4k-5k",
  "company": "Acme Inc",
  "maxApplicants": 10
}
```

Otras rutas: `GET /vacancies/:id`, `PATCH /vacancies/:id`, `DELETE /vacancies/:id`.

### Postulaciones

- `POST /vacancies/:id/apply` (rol `CODER`): registra la postulación si hay cupo disponible.
- `GET /me/applications`: listado del coder autenticado (incluye la vacante en la respuesta).
- `GET /vacancies/:id/applications` (rol `MANAGER`): lista postulantes de una vacante.
- `GET /applications/metrics` (rol `MANAGER`): métrica global + conteo por vacante.

Ejemplo de respuesta de métricas:

```json
{
  "message": "Métricas de postulaciones",
  "data": {
    "totalApplications": 18,
    "byVacancy": [
      { "vacancyId": "c7c2...", "title": "Backend NestJS", "applications": 10 },
      { "vacancyId": "8f31...", "title": "Frontend React", "applications": 8 }
    ]
  }
}
```

---

## 🧪 Pruebas y cobertura

```bash
npm run test          # unit tests
npm run test -- --coverage
```

Hoy tenemos ~47% de cobertura (superior al 40% sugerido) con foco en `VacanciesService` y `ApplicationsService` (creación y postulación).

---

## 🧱 Cómo puede usarlo el frontend

- Consumir los endpoints vía fetch/axios usando los ejemplos anteriores.
- Usar el payload de respuesta estándar `{ message, data }` para mostrar notificaciones globales.
- Mostrar filtros dinámicos en la UI basados en las query params soportadas.
- Construir dashboards simples con `/applications/metrics` sin tocar la base de datos.
- Si necesitas seeders o fixtures adicionales para desarrollo visual, puedes extender `src/seed.ts` y ejecutar `npm run seed`.

Cualquier duda adicional durante la integración, revisa `/docs` o abre una issue en este repo. ¡Feliz construcción! 💪
