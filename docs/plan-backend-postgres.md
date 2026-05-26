# Plan: Reemplazar Firebase por PostgreSQL + Node.js API en Docker

## Contexto

El proyecto usa Firebase (Auth + Firestore) pero genera OOM en Turbopack por el tamaño del SDK cliente. La solución es mover toda la persistencia y autenticación a una API propia en Node.js + PostgreSQL corriendo en Docker, y dejar el frontend Next.js completamente libre de Firebase.

---

## Arquitectura objetivo

```
┌─────────────────────┐        ┌──────────────────────────────────────┐
│   Next.js (3000)    │ ──────▶│  Docker Compose                      │
│   - Sin Firebase    │  REST  │  ├── api (Node/Express) :4000        │
│   - Zustand stores  │        │  └── db  (PostgreSQL 16) :5432       │
│   - fetch() / SWR   │        └──────────────────────────────────────┘
└─────────────────────┘
```

**Auth**: Google Identity Services (script liviano) → ID token → verificado en API con `google-auth-library` → JWT propio en cookie HttpOnly.

---

## Archivos a crear

### Docker
- `docker/docker-compose.yml` — servicios `db` y `api`
- `docker/api/Dockerfile`
- `docker/api/package.json`
- `docker/api/src/index.ts` — entrypoint Express
- `docker/api/src/db.ts` — pool de conexión PostgreSQL (`pg`)
- `docker/api/src/schema.sql` — DDL de tablas
- `docker/api/src/routes/auth.ts` — POST /auth/google
- `docker/api/src/routes/matches.ts` — GET /matches
- `docker/api/src/routes/predictions.ts` — GET + POST /predictions
- `docker/api/src/routes/standings.ts` — GET /standings
- `docker/api/src/middleware/auth.ts` — verifica JWT en cookie

### Frontend (modificar)
- `src/lib/api.ts` — cliente HTTP con fetch (reemplaza `src/lib/firebase/`)
- `src/store/ui.ts` — auth vía cookie JWT
- `src/store/prode.ts` — datos vía fetch a API
- `src/components/Navbar.tsx` — botón logout llama DELETE /auth/session
- `src/app/login/page.tsx` — Google Identity Services + POST /auth/google
- `src/app/api/auth/session/route.ts` — verificar JWT propio
- `src/app/api/picks/route.ts` — llamada a API interna
- `src/proxy.ts` — habilitar guard de sesión con JWT

### Archivos a eliminar
- `src/lib/firebase/` (carpeta completa)
- Desinstalar `firebase` y `firebase-admin` de package.json

---

## Schema PostgreSQL

```sql
CREATE TABLE users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id    TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  email        TEXT NOT NULL,
  photo_url    TEXT,
  is_admin     BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE matches (
  id        TEXT PRIMARY KEY,
  home_team JSONB NOT NULL,
  away_team JSONB NOT NULL,
  kickoff   TIMESTAMPTZ NOT NULL,
  lock_at   TIMESTAMPTZ NOT NULL,
  stage     TEXT NOT NULL,
  "group"   TEXT,
  status    TEXT NOT NULL DEFAULT 'SCHEDULED',
  score     JSONB,
  result    TEXT
);

CREATE TABLE predictions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id),
  match_id   TEXT REFERENCES matches(id),
  pick       TEXT NOT NULL,
  points     INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, match_id)
);

CREATE VIEW standings AS
  SELECT
    u.id AS uid, u.display_name, u.photo_url,
    COUNT(p.id) FILTER (WHERE m.status = 'FINISHED') AS total_picks,
    COUNT(p.id) FILTER (WHERE p.pick = m.result)     AS correct_picks,
    COALESCE(SUM(p.points), 0)                       AS total_points
  FROM users u
  LEFT JOIN predictions p ON p.user_id = u.id
  LEFT JOIN matches m     ON m.id = p.match_id
  GROUP BY u.id
  ORDER BY total_points DESC;
```

---

## Flujo de autenticación

1. Login page carga **Google Identity Services** (script de Google, ~30KB, sin Firebase)
2. Usuario hace click → Google devuelve `credential` (ID token JWT de Google)
3. Frontend POST `/api/auth/google` con el ID token
4. Next.js route handler llama `POST http://api:4000/auth/google`
5. API verifica con `google-auth-library`, upsert en `users`, devuelve JWT propio
6. Next.js setea cookie `session` HttpOnly con el JWT
7. `proxy.ts` lee esa cookie en cada request

---

## Endpoints de la API Node.js

| Método | Path | Auth | Descripción |
|--------|------|------|-------------|
| POST | /auth/google | ❌ | Verifica Google ID token, devuelve JWT |
| GET | /matches | ❌ | Lista todos los partidos |
| GET | /predictions/:userId | ✅ | Predicciones del usuario |
| POST | /predictions | ✅ | Guardar pick (valida lockAt) |
| GET | /standings | ❌ | Tabla de posiciones |

---

## Variables de entorno

**.env.local** (Next.js):
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
API_URL=http://localhost:4000
JWT_SECRET=
```

**docker/api/.env**:
```
DATABASE_URL=postgresql://prode:prode@db:5432/prode
GOOGLE_CLIENT_ID=
JWT_SECRET=
```

---

## Pasos de implementación (en orden)

1. Docker: `docker-compose.yml` + `Dockerfile` + `schema.sql`
2. API Express: entrypoint, rutas, middleware JWT
3. Seed: insertar datos mock en PostgreSQL
4. Frontend `src/lib/api.ts`: wrapper fetch para todos los endpoints
5. Frontend stores: conectar `prode.ts` y `ui.ts` a la API
6. Frontend login: Google Identity Services + `/auth/google`
7. Frontend proxy: guard de sesión con JWT
8. Limpiar: borrar `src/lib/firebase/`, desinstalar Firebase

---

## Verificación

```bash
docker compose -f docker/docker-compose.yml up --build
curl http://localhost:4000/matches
curl http://localhost:4000/standings
pnpm dev
# → localhost:3000, login con Google, fixture desde Postgres, picks persisten
```
