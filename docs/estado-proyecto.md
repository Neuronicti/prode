# Estado del Proyecto — Prode Mundial 2026

**Última actualización:** 2026-05-26  
**Dev server:** `http://localhost:3000` (correr con `npm run dev` en `c:\dev\prode`)

---

## Resumen

App de prode para el Mundial 2026, pensada para empleados + colaboradores externos de Neuronic. Predicciones tipo 1X2 (Local / Empate / Visitante), login con Google, ranking en tiempo real.

**Estado actual: Frontend completo. Firebase Auth + Firestore integrados. Pendiente: configurar proyecto Firebase y poblar datos.**

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript |
| Estilos | Tailwind CSS v4 |
| Estado UI | Zustand |
| Auth | Firebase Auth — Google provider ✅ |
| Base de datos | Firestore ✅ |
| Hosting | Vercel (cuenta dev de Neuronic) |
| API resultados (pendiente) | football-data.org (free tier, token requerido) |
| Crons (pendiente) | Vercel Cron Jobs |

---

## Estructura de archivos

```
c:\dev\prode\
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Navbar + AuthProvider + layout raíz
│   │   ├── page.tsx                      # Redirige a /fixture
│   │   ├── login/page.tsx               # Pantalla de login con Google
│   │   ├── fixture/page.tsx             # Lista de partidos por etapa
│   │   ├── mis-picks/page.tsx           # Picks del usuario con puntos
│   │   ├── ranking/page.tsx             # Leaderboard
│   │   └── api/
│   │       ├── picks/route.ts           # POST /api/picks — valida lockAt server-side
│   │       └── auth/session/route.ts    # POST/DELETE /api/auth/session — cookie HttpOnly
│   ├── components/
│   │   ├── AuthProvider.tsx             # Conecta onAuthStateChanged con store de prode
│   │   ├── LiveBadge.tsx
│   │   ├── MatchCard.tsx
│   │   ├── Navbar.tsx                   # Navbar con avatar + botón Salir
│   │   ├── PickButtons.tsx
│   │   └── StandingsTable.tsx
│   ├── lib/
│   │   ├── types.ts                     # Tipos TypeScript
│   │   ├── mock-data.ts                 # Datos mock (solo referencia, ya no se usan en prod)
│   │   └── firebase/
│   │       ├── client.ts               # init Firebase Web SDK (auth + db)
│   │       ├── admin.ts                # init Firebase Admin SDK (server-side)
│   │       ├── auth.ts                 # signInWithGoogle, signOut
│   │       └── firestore.ts            # subscribeToMatches/Predictions/Standings, savePick
│   └── store/
│       ├── ui.ts                        # Zustand: usuario actual via onAuthStateChanged
│       └── prode.ts                     # Zustand: matches, predictions, standings via onSnapshot
├── docs/
│   └── estado-proyecto.md
├── .env.local.example                   # Variables de entorno requeridas
└── vercel.json                          # (pendiente de crear con cron config)
```

---

## Modelo de datos (Firestore)

```
users/{uid}
  displayName, email, photoURL, updatedAt

matches/{matchId}               # matchId = id de football-data.org
  homeTeam: { name, flag, code }
  awayTeam: { name, flag, code }
  kickoff: Timestamp
  stage: 'group' | 'r16' | 'qf' | 'sf' | 'third' | 'final'
  group?: string
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED'
  score: { home: number, away: number } | null
  result: 'H' | 'D' | 'A' | null
  lockAt: Timestamp             # = kickoff

predictions/{uid}_{matchId}
  uid, matchId, pick: 'H' | 'D' | 'A'
  updatedAt, points: number

standings/{uid}
  displayName, photoURL
  totalPoints, correctPicks, totalPicks
  lastUpdated
```

---

## Sistema de puntos

- Acierto de resultado 1X2 → **3 puntos**
- Fallo → 0 puntos
- Sistema de bonus desactivado por ahora

---

## Flujo de autenticación

1. Usuario hace click en "Continuar con Google" en `/login`
2. Firebase popup → `signInWithGoogle()` en `auth.ts`
3. Se upsertea el usuario en `users/{uid}` en Firestore
4. Se obtiene `idToken` y se llama `POST /api/auth/session` → Admin SDK crea cookie HttpOnly `firebase-session`
5. `proxy.ts` verifica esa cookie en cada request — redirige a `/login` si no existe
6. `onAuthStateChanged` en `store/ui.ts` actualiza el store del usuario
7. `AuthProvider` llama a `subscribe(uid)` → activa `onSnapshot` de matches/predictions/standings
8. Al hacer un pick: actualización optimista en store + `POST /api/picks` con idToken Bearer → Admin verifica lockAt server-side

---

## Pantallas implementadas

### `/login`
- Botón "Continuar con Google" con popup de Firebase

### `/fixture` (pantalla principal)
- Partidos agrupados por etapa (EN VIVO → Grupos → Octavos → etc.)
- `MatchCard` muestra: banderas emoji, hora local, estado
- Si SCHEDULED y no bloqueado: botones H/E/V para hacer pick
- Si LIVE: badge animado rojo
- Si FINISHED: score + ✓/✗ según acierto

### `/mis-picks`
- Resumen arriba: total picks / aciertos / puntos
- Grid de todos los partidos con pick del usuario y resultado

### `/ranking`
- Tabla de posiciones con posición, nombre, puntos, aciertos/total
- Fila del usuario actual resaltada en verde esmeralda

---

## Cómo retomar el trabajo

### Para desarrollar localmente

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com):
   - Authentication → Google provider → habilitar
   - Firestore → crear base de datos (modo producción)
   - Project Settings → "Tu app" → copiar `firebaseConfig`
   - Project Settings → Service Accounts → generar nueva clave privada

2. Copiar `.env.local.example` a `.env.local` y completar las variables

3. Configurar Firestore rules (`firestore.rules`):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /matches/{id} { allow read: if true; }
       match /standings/{id} { allow read: if true; }
       match /users/{uid} {
         allow read: if true;
         allow write: if request.auth.uid == uid;
       }
       match /predictions/{docId} {
         allow read: if request.auth != null;
         allow write: if false; // solo via route handler server-side
       }
     }
   }
   ```

4. Correr el servidor:
   ```bash
   cd c:\dev\prode
   npm run dev   # http://localhost:3000
   ```

---

## Próximos pasos

### Fase 3 — Resultados automáticos

1. **football-data.org**: registrar en https://www.football-data.org/client/register → obtener API key
   - Competición: `WC` (FIFA World Cup)
   - Endpoint fixture: `GET /v4/competitions/WC/matches`

2. **Poblar matches inicialmente**: script o endpoint admin que lee football-data.org y escribe en Firestore

3. **Cron endpoints:**
   - `GET /api/cron/sync-fixture` — diario 6am, pobla `matches`
   - `GET /api/cron/sync-results` — cada 15 min, actualiza scores y recalcula standings

4. **`vercel.json`:**
   ```json
   {
     "crons": [
       { "path": "/api/cron/sync-fixture", "schedule": "0 6 * * *" },
       { "path": "/api/cron/sync-results", "schedule": "*/15 * * * *" }
     ]
   }
   ```

### Fase 4 — Admin y pulido

5. Pantalla `/admin` (solo `isAdmin`): resync manual, override de resultado
6. Empty states, loading skeletons, toasts de confirmación
7. Compartir invitación por link

---

## Decisiones de diseño

- **Acceso abierto**: cualquier cuenta Google puede entrar
- **Picks se bloquean al kickoff** — validado server-side en `POST /api/picks` (Admin SDK)
- **Cookie HttpOnly para proxy**: Firebase Auth usa localStorage en el cliente; la sesión del proxy se maneja con una session cookie creada via Admin SDK
- **Cron en Vercel** (no Cloud Functions) — más simple, misma consola que el deploy
- **standings desnormalizado** — para que el ranking sea una sola query, sin joins
- **football-data.org nunca se llama desde el cliente** — solo desde cron server-side
