# Backend Setup Progress

## Overview
This document tracks the implementation of the PostgreSQL + Node.js/Express backend to replace Firebase.

## Completed ✓

### Phase 1: Docker Infrastructure
- [x] `docker-compose.yml` - Compose configuration with PostgreSQL and Node.js API services
- [x] `docker/db/schema.sql` - Database schema with users, matches, predictions tables + standings view
- [x] `docker/api/Dockerfile` - Multi-stage Docker image for Node.js API
- [x] `docker/api/tsconfig.json` - TypeScript configuration

### Phase 2: Express API Server
- [x] `docker/api/src/index.ts` - Express server with CORS, middleware setup
- [x] `docker/api/src/db.ts` - PostgreSQL connection pool
- [x] `docker/api/src/middleware/auth.ts` - JWT verification middleware
- [x] `docker/api/src/routes/auth.ts` - Google OAuth endpoint
- [x] `docker/api/src/routes/matches.ts` - Match listing and filtering
- [x] `docker/api/src/routes/predictions.ts` - User predictions CRUD
- [x] `docker/api/src/routes/standings.ts` - Rankings view
- [x] `docker/api/package.json` - Dependencies and scripts

### Phase 3: Database Seeding
- [x] `docker/api/src/seed-data.ts` - Match data (72 group stage matches, 48 teams)
- [x] `docker/api/src/seed.ts` - Seed script (runs on container startup)
- [x] Database auto-seeding on container initialization

### Phase 4: Frontend Integration
- [x] `src/lib/api.ts` - HTTP client wrapper for all API endpoints
- [x] `.env.local` - Updated with API_URL and Google OAuth client ID
- [x] `.env.local.example` - Template for environment variables

### Phase 5: Documentation
- [x] `docker/README.md` - Docker setup and deployment guide
- [x] `docker/api/.env.example` - API environment template
- [x] `BACKEND_SETUP.md` - This progress document

## Next Steps

### Phase 6: Frontend Store Connections (IN PROGRESS)
- [ ] Update `src/store/ui.ts` to:
  - Remove MOCK_USER
  - Load user from localStorage after Google auth
  - Call `api.googleAuth()` on login
  
- [ ] Update `src/store/prode.ts` to:
  - Remove MOCK_MATCHES, MOCK_PREDICTIONS, MOCK_STANDINGS
  - Load matches from `api.getMatches()`
  - Load user predictions from `api.getPredictions(userId)`
  - Save predictions with `api.setPrediction()`
  - Load standings from `api.getStandings()`

- [ ] Update `src/app/login/page.tsx` to:
  - Implement Google Identity Services integration
  - Call `api.googleAuth(token)` with Google token
  - Store JWT in localStorage
  - Redirect to /picks on success

- [ ] Update `src/app/api/auth/session/route.ts` to:
  - Remove Firebase Admin references
  - Verify JWT from cookie instead

- [ ] Update `src/proxy.ts` to:
  - Re-enable session guard
  - Verify JWT from localStorage

### Phase 7: Cleanup
- [ ] Remove all Firebase imports from codebase
- [ ] Remove `firebase` and `firebase-admin` from package.json
- [ ] Remove `src/lib/firebase/` directory

## Running the Backend

### Start Services
```bash
cd docker
docker compose up --build
```

### API Endpoints
- Health: `GET http://localhost:4000/health`
- Matches: `GET http://localhost:4000/matches`
- Auth: `POST http://localhost:4000/auth/google`
- Predictions: `GET/POST http://localhost:4000/predictions`
- Standings: `GET http://localhost:4000/standings`

### Database Access
```bash
docker compose exec db psql -U prode -d prode
```

### View Logs
```bash
docker compose logs -f api
docker compose logs -f db
```

## Architecture Notes

### Authentication Flow
1. Frontend loads Google Identity Services script
2. User clicks login → Google returns ID token
3. Frontend sends token to `POST /auth/google`
4. API verifies token with Google, creates/updates user in DB
5. API returns JWT (30-day expiry)
6. Frontend stores JWT in localStorage
7. Frontend includes JWT in Authorization header for protected requests

### Data Flow
- All match data seeded at container startup (72 group matches)
- Standings view aggregates predictions per user
- Lock times prevent predictions after match kickoff
- User predictions stored per match with points tracking

## Security Considerations

- [ ] JWT_SECRET should be changed before production (currently "your-secret-key-change-in-production")
- [ ] Google OAuth credentials must be verified on API side
- [ ] Database has no backups configured yet
- [ ] No rate limiting on API endpoints
- [ ] No request validation/sanitization yet
- [ ] Consider adding request logging for audit trail

## Database Migrations

Current schema is created via `docker/db/schema.sql` during container initialization.

For future migrations:
1. Create versioned SQL files in `docker/db/migrations/`
2. Create migration runner in API startup
3. Track applied migrations in database table
